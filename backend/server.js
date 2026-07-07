const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const WebSocket = require('ws');
const cors = require('cors');
const dotenv = require('dotenv');

const { connectDB } = require('./db');
const config = require('./config');

const authRoutes = require('./routes/auth');
const workoutRoutes = require('./routes/workouts');
const aiRoutes = require('./routes/ai');
const { router: ruviewRoutes, updateCache: updateRuviewCache } = require('./routes/ruview');

const { createTracker, processSensorFrame } = require('./services/workoutEngine');
const { Model: User } = require('./models/User');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middlewares
app.use(cors());
app.use(express.json());

// Attach REST routes
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ruview', ruviewRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Map to track active workout sessions per socket connection
const activeSessions = new Map();

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);
  
  // 1. Join Workout Stream
  socket.on('joinWorkout', async (data) => {
    const { exercise, goalReps, userId } = data;
    console.log(`Socket ${socket.id} starting workout: ${exercise} (Goal: ${goalReps}, User: ${userId})`);
    
    // Fetch user weight if available
    let userWeight = 70;
    if (userId) {
      try {
        const user = await User.findById(userId);
        if (user && user.weight) {
          userWeight = user.weight;
        }
      } catch (err) {
        console.warn(`Could not resolve user weight for ID ${userId}, defaulting to 70kg`);
      }
    }
    
    // Initialize session state
    const tracker = createTracker(exercise, goalReps);
    tracker.vitals.currentHR = 72;
    tracker.vitals.currentBR = 16;
    let ruviewWs = null;
    
    // Connect to external RuView WebSocket server
    try {
      let wsUrl = config.RUVIEW_WS_URL;
      // Auto-append path suffix for port 3001 if missing
      if (wsUrl.includes(':3001') && !wsUrl.endsWith('/ws/sensing')) {
        wsUrl = wsUrl.replace(/\/$/, '') + '/ws/sensing';
      }
      ruviewWs = new WebSocket(wsUrl);
      
      ruviewWs.on('open', () => {
        console.log(`Connected to RuView WS on ${wsUrl} for socket ${socket.id}`);
        // Send command to start streaming simulator data
        ruviewWs.send(JSON.stringify({
          action: 'startStream',
          exercise: exercise
        }));
      });
      
      ruviewWs.on('message', (messageStr) => {
        try {
          const frame = JSON.parse(messageStr);
          
          // Re-structure frame internally to match schema if flat parameters are sent
          // Re-structure frame internally to match schema if flat parameters are sent
          const vitals = frame.vitals || {};
          const pose = frame.pose || {};
          
          let hr = vitals.heartRate || frame.heartRate || 72;
          let br = vitals.breathingRate || frame.breathingRate || 16;
          let state = pose.state || frame.state || 'standing';
          let confidence = pose.confidence !== undefined ? pose.confidence : (frame.confidence !== undefined ? frame.confidence : 0.95);
          let stability = pose.stability !== undefined ? pose.stability : (frame.stability !== undefined ? frame.stability : 0.95);
          let intensity = frame.motion?.intensity || frame.intensity || 0.1;
          let jerkiness = frame.motion?.jerkiness || frame.jerkiness || 0.0;

          // If real RuView payload with "persons" is received, process keypoints
          if (frame.persons && frame.persons.length > 0) {
            const person = frame.persons[0];
            const motionScore = person.motion_score || 0.0;
            
            // Map motion intensity dynamically (scale motion_score to 0..1 range)
            intensity = Math.min(1.0, motionScore / 35.0);
            jerkiness = motionScore > 25.5 ? 0.08 : 0.01;
            stability = Math.max(0.2, 1.0 - (jerkiness * 5.0));

            // Dynamic vitals simulation based on physical effort
            if (tracker.vitals) {
              let activeHR = tracker.vitals.currentHR || 72;
              let activeBR = tracker.vitals.currentBR || 16;
              
              if (motionScore > 22.0) {
                // Elevate vitals moderately during active movements (reps)
                activeHR = Math.min(125, activeHR + 0.4);
                activeBR = Math.min(22, activeBR + 0.1);
              } else {
                // Safely return to normal healthy resting range (70-76 BPM / 14-16 BR)
                if (activeHR > 76) activeHR -= 0.3;
                else if (activeHR < 70) activeHR += 0.2;
                
                if (activeBR > 16) activeBR -= 0.08;
                else if (activeBR < 14) activeBR += 0.05;
              }
              
              // Add minor physiological fluctuations (+- 1) to look realistic
              const hrNoise = (Math.random() - 0.5) * 1.2;
              const brNoise = (Math.random() - 0.5) * 0.4;
              
              tracker.vitals.currentHR = activeHR;
              tracker.vitals.currentBR = activeBR;
              hr = Math.round(activeHR + hrNoise);
              br = Math.round(activeBR + brNoise);
            }

            // Heuristic Pose State detection based on keypoints coordinates
            const getKp = (name) => person.keypoints?.find(k => k.name === name);
            const lHip = getKp('left_hip');
            const lKnee = getKp('left_knee');
            const lAnkle = getKp('left_ankle');
            const lShoulder = getKp('left_shoulder');
            const lWrist = getKp('left_wrist');

            if (tracker.exercise === 'squats' && lHip && lKnee && lAnkle) {
              const kneeToHip = Math.abs(lKnee.y - lHip.y);
              const ankleToKnee = Math.abs(lAnkle.y - lKnee.y);
              const ratio = kneeToHip / Math.max(1, ankleToKnee);
              state = ratio < 0.62 ? 'squatting' : 'standing';
            } else if (tracker.exercise === 'pushups' && lShoulder && lWrist) {
              const wristToShoulder = Math.abs(lWrist.y - lShoulder.y);
              state = wristToShoulder < 80 ? 'down' : 'up';
            } else if (tracker.exercise === 'jumping-jacks' && lWrist && lShoulder) {
              state = lWrist.y < lShoulder.y ? 'open' : 'closed';
            } else if (tracker.exercise === 'lunges' && lKnee) {
              const rKnee = getKp('right_knee');
              if (rKnee) {
                const diff = Math.abs(lKnee.y - rKnee.y);
                state = diff > 45 ? 'lunge' : 'neutral';
              }
            } else if (tracker.exercise === 'plank') {
              state = motionScore < 6.0 ? 'stable' : 'unstable';
            } else if (tracker.exercise === 'running') {
              state = 'running';
            } else if (tracker.exercise === 'walking') {
              state = 'walking';
            } else if (tracker.exercise === 'yoga') {
              state = 'yoga';
            }
          }
          
          // Guarantee normalized structure exists on frame for processSensorFrame
          frame.vitals = { heartRate: hr, breathingRate: br };
          frame.pose = { state, confidence, stability };
          frame.motion = { intensity, jerkiness };

          // Update the REST endpoints cache
          updateRuviewCache(frame);
          
          // Process sensor frame through detection engine
          const { tracker: updatedTracker, repIncremented } = processSensorFrame(tracker, frame, userWeight);
          
          // Broadcast live sensor parameters
          socket.emit('heartRate', { bpm: hr });
          socket.emit('breathing', { bpm: br });
          socket.emit('poseUpdate', { 
            state, 
            confidence, 
            stability,
            feedback: updatedTracker.feedback 
          });
          
          // Broadcast general workout stats (reps, duration, calories)
          socket.emit('workoutData', {
            exercise: updatedTracker.exercise,
            reps: updatedTracker.reps,
            goalReps: updatedTracker.goalReps,
            duration: updatedTracker.duration,
            calories: updatedTracker.calories,
            avgHeartRate: updatedTracker.vitals.avgHeartRate,
            avgBreathingRate: updatedTracker.vitals.avgBreathingRate,
            peakHeartRate: updatedTracker.vitals.peakHeartRate,
            feedback: updatedTracker.feedback
          });
          
          if (repIncremented) {
            socket.emit('exerciseCount', { count: updatedTracker.reps });
          }
          
        } catch (e) {
          console.error('Error handling frame in server socket:', e.message);
        }
      });
      
      ruviewWs.on('error', (err) => {
        console.error(`RuView connection error on socket ${socket.id}:`, err.message);
        socket.emit('poseUpdate', { 
          state: 'disconnected', 
          feedback: 'RuView Connection Error. Ensure simulator is running.' 
        });
      });
      
      ruviewWs.on('close', () => {
        console.log(`RuView WS connection closed for socket ${socket.id}`);
      });
      
    } catch (err) {
      console.error('WebSocket connection setup failed:', err.message);
    }
    
    // Store active session refs to close correctly on leave or disconnect
    activeSessions.set(socket.id, {
      tracker,
      ruviewWs
    });
  });
  
  // 2. Leave Workout Stream / End Session
  socket.on('leaveWorkout', () => {
    cleanupSession(socket.id);
  });
  
  // 3. Client Disconnects
  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
    cleanupSession(socket.id);
  });
  
  function cleanupSession(socketId) {
    const session = activeSessions.get(socketId);
    if (session) {
      console.log(`Cleaning up workout session for socket: ${socketId}`);
      if (session.ruviewWs && session.ruviewWs.readyState === WebSocket.OPEN) {
        try {
          session.ruviewWs.send(JSON.stringify({ action: 'stopStream' }));
          session.ruviewWs.close();
        } catch (err) {
          console.error('Error closing RuView WS:', err.message);
        }
      }
      activeSessions.delete(socketId);
    }
  }
});

// Initialize database connection and startup Express server
const PORT = config.PORT;

const startServer = async () => {
  await connectDB();
  
  // Ensure at least one admin account exists on database boot
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('No administrator account detected in database. Generating default admin profile...');
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await User.create({
        name: 'FitSense Admin',
        email: 'admin@fitsense.ai',
        password: hashedPassword,
        height: 180,
        weight: 75,
        age: 30,
        gender: 'other',
        fitnessGoal: 'maintenance',
        role: 'admin'
      });
      console.log('Default administrator created: admin@fitsense.ai / admin123');
    } else {
      console.log('Administrator account presence validated.');
    }
  } catch (err) {
    console.error('Error during auto-admin initialization check:', err.message);
  }
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`FitSense Express server is active on port ${PORT}`);
    console.log(`Socket.io handles events on ws://127.0.0.1:${PORT}`);
    console.log(`====================================================`);
  });
};

startServer();
