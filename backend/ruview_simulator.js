/**
 * RuView contactless sensor simulator (WebSocket server)
 * Running on port 6000
 */

const WebSocket = require('ws');

const PORT = 6000;
const wss = new WebSocket.Server({ port: PORT });

console.log(`RuView Simulator WebSocket Server started on ws://127.0.0.1:${PORT}`);

wss.on('connection', (ws) => {
  console.log('RuView client connected.');
  
  let streamInterval = null;
  let activeExercise = 'squats';
  let tick = 0;
  
  // Vitals state
  let currentHeartRate = 72;
  let currentBreathingRate = 16;
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('RuView received message:', data);
      
      if (data.action === 'startStream') {
        activeExercise = (data.exercise || 'squats').toLowerCase();
        tick = 0;
        
        // Reset vitals based on exercise base level
        if (activeExercise === 'running' || activeExercise === 'jumping-jacks') {
          currentHeartRate = 95;
          currentBreathingRate = 22;
        } else if (activeExercise === 'yoga' || activeExercise === 'plank') {
          currentHeartRate = 65;
          currentBreathingRate = 12;
        } else {
          currentHeartRate = 72;
          currentBreathingRate = 16;
        }
        
        // Clear existing interval if any
        if (streamInterval) clearInterval(streamInterval);
        
        // Start streaming frames every 500ms (2Hz)
        streamInterval = setInterval(() => {
          tick++;
          const frame = generateFrame(activeExercise, tick);
          ws.send(JSON.stringify(frame));
        }, 500);
        
        console.log(`Streaming simulator data started for: ${activeExercise}`);
      }
      
      if (data.action === 'stopStream') {
        if (streamInterval) {
          clearInterval(streamInterval);
          streamInterval = null;
        }
        console.log('Streaming simulator data stopped.');
      }
    } catch (err) {
      console.error('Failed to parse simulator client message:', err.message);
    }
  });
  
  ws.on('close', () => {
    console.log('RuView client disconnected.');
    if (streamInterval) {
      clearInterval(streamInterval);
      streamInterval = null;
    }
  });

  // Simulator frames generator
  function generateFrame(exercise, t) {
    let poseState = '';
    let stability = 0.95;
    let motionIntensity = 0.5;
    
    // Elevate vitals over time for intense workouts
    if (['running', 'jumping-jacks', 'squats', 'pushups', 'lunges'].includes(exercise)) {
      const maxHr = exercise === 'running' ? 140 : 120;
      if (currentHeartRate < maxHr) {
        currentHeartRate += 0.4; // Slowly climb
      } else {
        currentHeartRate += (Math.random() - 0.5) * 2; // Fluctuate around peak
      }
      
      const maxBr = exercise === 'running' ? 28 : 22;
      if (currentBreathingRate < maxBr) {
        currentBreathingRate += 0.1;
      } else {
        currentBreathingRate += (Math.random() - 0.5) * 0.5;
      }
    } else { // Yoga / Plank
      // Slowly settle to resting values
      if (currentHeartRate > 62) currentHeartRate -= 0.1;
      if (currentBreathingRate > 11) currentBreathingRate -= 0.05;
      
      currentHeartRate += (Math.random() - 0.5) * 0.5;
      currentBreathingRate += (Math.random() - 0.5) * 0.1;
    }
    
    // Ensure vitals stay within physical bounds
    currentHeartRate = Math.max(50, Math.min(160, currentHeartRate));
    currentBreathingRate = Math.max(8, Math.min(40, currentBreathingRate));
    
    // Pose cycle simulators
    switch (exercise) {
      case 'squats':
        // 4 ticks standing, 4 ticks squatting
        const squatCycle = t % 8;
        if (squatCycle < 4) {
          poseState = 'standing';
          motionIntensity = 0.1 + Math.random() * 0.05;
        } else {
          poseState = 'squatting';
          motionIntensity = 0.4 + Math.random() * 0.1;
        }
        stability = 0.90 + Math.random() * 0.08;
        break;
        
      case 'pushups':
        // 3 ticks up, 3 ticks down
        const pushupCycle = t % 6;
        if (pushupCycle < 3) {
          poseState = 'up';
          motionIntensity = 0.1 + Math.random() * 0.05;
        } else {
          poseState = 'down';
          motionIntensity = 0.5 + Math.random() * 0.1;
        }
        stability = 0.88 + Math.random() * 0.1;
        break;
        
      case 'lunges':
        // 4 ticks neutral, 4 ticks lunge
        const lungeCycle = t % 8;
        if (lungeCycle < 4) {
          poseState = 'neutral';
          motionIntensity = 0.15;
        } else {
          poseState = 'lunge';
          motionIntensity = 0.45;
        }
        stability = 0.85 + Math.random() * 0.1;
        break;
        
      case 'jumping-jacks':
        // 2 ticks closed, 2 ticks open
        const jackCycle = t % 4;
        if (jackCycle < 2) {
          poseState = 'closed';
          motionIntensity = 0.2 + Math.random() * 0.1;
        } else {
          poseState = 'open';
          motionIntensity = 0.8 + Math.random() * 0.15;
        }
        stability = 0.82 + Math.random() * 0.12;
        break;
        
      case 'plank':
        poseState = 'stable';
        // Every 30 ticks, simulate brief muscle fatigue instability
        if (t % 30 >= 25) {
          stability = 0.60 + Math.random() * 0.08; // Fatigue
          motionIntensity = 0.25;
        } else {
          stability = 0.92 + Math.random() * 0.05;
          motionIntensity = 0.03 + Math.random() * 0.02;
        }
        break;
        
      case 'running':
        poseState = 'running';
        // Motion peaks and valleys based on strides
        const runCycle = t % 4;
        motionIntensity = runCycle < 2 ? 0.85 : 0.45;
        motionIntensity += Math.random() * 0.1;
        stability = 0.75 + Math.random() * 0.15;
        break;
        
      case 'walking':
        poseState = 'walking';
        const walkCycle = t % 4;
        motionIntensity = walkCycle < 2 ? 0.45 : 0.22;
        motionIntensity += Math.random() * 0.05;
        stability = 0.88 + Math.random() * 0.05;
        break;
        
      case 'yoga':
        poseState = 'yoga';
        // Occasional wobble
        if (t % 25 === 0) {
          stability = 0.72;
          motionIntensity = 0.15;
        } else {
          stability = 0.96 + Math.random() * 0.03;
          motionIntensity = 0.01 + Math.random() * 0.01;
        }
        break;
        
      default:
        poseState = 'standing';
        stability = 1.0;
        motionIntensity = 0.0;
    }
    
    return {
      timestamp: Date.now(),
      exercise,
      vitals: {
        heartRate: Math.round(currentHeartRate),
        breathingRate: Math.round(currentBreathingRate)
      },
      pose: {
        state: poseState,
        confidence: Number((0.92 + Math.random() * 0.07).toFixed(2)),
        stability: Number(stability.toFixed(2))
      },
      motion: {
        intensity: Number(motionIntensity.toFixed(2)),
        jerkiness: Number((Math.random() * 0.05).toFixed(2))
      }
    };
  }
});
