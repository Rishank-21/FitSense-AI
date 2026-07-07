import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import GlassCard from '../components/GlassCard';
import LiveVitalsCard from '../components/LiveVitalsCard';
import LiveWorkoutTimer from '../components/LiveWorkoutTimer';
import MotionGraph from '../components/MotionGraph';
import { 
  Play, 
  Square, 
  Award, 
  Dumbbell, 
  ChevronRight, 
  CheckCircle,
  HelpCircle,
  Brain
} from 'lucide-react';

const EXERCISES = [
  { id: 'squats', name: 'Squats', metric: 'reps', defaultGoal: 20, icon: '🏋️', intensity: 'Medium', desc: 'Standing ↔ squat transition. Focus on drive.' },
  { id: 'pushups', name: 'Push-ups', metric: 'reps', defaultGoal: 15, icon: '💪', intensity: 'High', desc: 'Body movement cycle. Brace core.' },
  { id: 'lunges', name: 'Lunges', metric: 'reps', defaultGoal: 20, icon: '🏃', intensity: 'Medium', desc: 'Leg position changes. Watch front knee.' },
  { id: 'jumping-jacks', name: 'Jumping Jacks', metric: 'reps', defaultGoal: 30, icon: '✨', intensity: 'High', desc: 'Arm and leg movements. Fast pace.' },
  { id: 'plank', name: 'Plank Hold', metric: 'seconds', defaultGoal: 60, icon: '🧘', intensity: 'Low-Medium', desc: 'Stable pose duration. Keep back flat.' },
  { id: 'running', name: 'Running (Sim)', metric: 'steps', defaultGoal: 100, icon: '👟', intensity: 'Very High', desc: 'Motion intensity cycle. Cardio focus.' },
  { id: 'walking', name: 'Walking (Sim)', metric: 'steps', defaultGoal: 155, icon: '🚶', intensity: 'Low', desc: 'Motion frequency. Ideal active recovery.' },
  { id: 'yoga', name: 'Yoga Stability', metric: 'seconds', defaultGoal: 90, icon: '🧘‍♀️', intensity: 'Low', desc: 'Pose stability indices. deep holds.' }
];

const WorkoutSession = () => {
  const { user } = useAuth();
  const [selectedEx, setSelectedEx] = useState(EXERCISES[0]);
  const [goal, setGoal] = useState(20);
  const [isActive, setIsActive] = useState(false);
  const [latestFrame, setLatestFrame] = useState(null);
  
  // Real-time telemetry values
  const [telemetry, setTelemetry] = useState({
    reps: 0,
    duration: 0,
    calories: 0,
    avgHeartRate: 72,
    avgBreathingRate: 16,
    peakHeartRate: 72
  });
  const [vitals, setVitals] = useState({ hr: 72, br: 16 });
  const [poseData, setPoseData] = useState({ state: 'standing', confidence: 0.95, stability: 0.95, feedback: 'Initializing sensors...' });
  
  // Post-workout state
  const [completedSession, setCompletedSession] = useState(null);
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  
  const socketRef = useRef(null);

  // Sync goal input when exercise changes
  useEffect(() => {
    setGoal(selectedEx.defaultGoal);
  }, [selectedEx]);

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleStartWorkout = () => {
    setCompletedSession(null);
    setAiSummary('');
    
    // Connect to Socket.io backend
    const socketUrl = import.meta.env.VITE_SOCKET_URL || API.defaults.baseURL.replace(/\/api$/, '') || 'http://127.0.0.1:5000';
    socketRef.current = io(socketUrl);
    
    socketRef.current.on('connect', () => {
      console.log('Connected to socket gateway');
      socketRef.current.emit('joinWorkout', {
        exercise: selectedEx.id,
        goalReps: goal,
        userId: user?.id
      });
      setIsActive(true);
    });

    // Listen to real-time events
    socketRef.current.on('heartRate', (data) => {
      setVitals(prev => ({ ...prev, hr: data.bpm }));
    });

    socketRef.current.on('breathing', (data) => {
      setVitals(prev => ({ ...prev, br: data.bpm }));
    });

    socketRef.current.on('poseUpdate', (data) => {
      setPoseData(data);
      // Reconstruct a frame to feed the graph
      setLatestFrame({
        timestamp: Date.now(),
        motion: { 
          intensity: data.state === 'standing' || data.state === 'neutral' || data.state === 'stable' ? 0.12 : 0.68 
        },
        pose: { stability: data.stability }
      });
    });

    socketRef.current.on('workoutData', (data) => {
      setTelemetry({
        reps: data.reps,
        duration: data.duration,
        calories: data.calories,
        avgHeartRate: data.avgHeartRate,
        avgBreathingRate: data.avgBreathingRate,
        peakHeartRate: data.peakHeartRate
      });
    });
  };

  const handleEndWorkout = async () => {
    if (!socketRef.current) return;
    
    // Disconnect stream
    socketRef.current.emit('leaveWorkout');
    socketRef.current.disconnect();
    socketRef.current = null;
    setIsActive(false);

    // Save workout logs to MongoDB
    try {
      const workoutLog = {
        exercise: selectedEx.name,
        duration: telemetry.duration,
        reps: telemetry.reps,
        goalReps: goal,
        calories: telemetry.calories,
        avgHeartRate: telemetry.avgHeartRate,
        peakHeartRate: telemetry.peakHeartRate,
        avgBreathingRate: telemetry.avgBreathingRate,
        status: telemetry.reps >= goal ? 'completed' : 'abandoned'
      };

      const saveRes = await API.post('/workouts/end', workoutLog);
      setCompletedSession(saveRes.data);

      // Trigger Gemini API summary report
      setAiLoading(true);
      const aiRes = await API.post('/ai/summary', {
        exercise: selectedEx.name,
        duration: telemetry.duration,
        reps: telemetry.reps,
        goalReps: goal,
        calories: telemetry.calories,
        avgHeartRate: telemetry.avgHeartRate,
        avgBreathingRate: telemetry.avgBreathingRate
      });
      setAiSummary(aiRes.data.summary);
    } catch (err) {
      console.error('Failed to commit workout logs:', err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      
      {!isActive && !completedSession && (
        /* Configuration Form */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Exercise Selector */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-indigo-400" />
              Select Your Contactless Workout
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {EXERCISES.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => setSelectedEx(ex)}
                  className={`glass-panel p-5 rounded-2xl text-left border transition-all duration-300 flex items-start gap-4 hover:border-indigo-500/30 cursor-pointer hover:bg-slate-900/30 ${
                    selectedEx.id === ex.id 
                      ? 'border-indigo-500 ring-2 ring-indigo-500/25 bg-slate-900/50' 
                      : 'border-slate-800'
                  }`}
                >
                  <span className="text-3xl p-2.5 bg-slate-800/60 rounded-xl">{ex.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-100">{ex.name}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                        ex.intensity === 'High' || ex.intensity === 'Very High' 
                          ? 'bg-rose-500/10 text-rose-450' 
                          : 'bg-cyan-500/10 text-cyan-400'
                      }`}>
                        {ex.intensity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-450 mt-1 truncate">{ex.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Goal Settings Box */}
          <GlassCard className="flex flex-col justify-between border-slate-850 h-fit">
            <div className="flex flex-col gap-6">
              <div>
                <h4 className="text-sm font-bold text-slate-200">Session Goal Settings</h4>
                <p className="text-xs text-slate-450 mt-1">Configure target repetition threshold</p>
              </div>

              <div className="flex flex-col gap-2 bg-slate-900/60 p-4.5 rounded-xl border border-slate-850">
                <span className="text-xs text-slate-400 font-semibold capitalize">
                  Target {selectedEx.metric}
                </span>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={goal}
                    onChange={(e) => setGoal(Number(e.target.value))}
                    className="w-full bg-slate-950 px-4 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500/50 text-sm font-bold text-slate-100"
                  />
                  <span className="text-xs text-slate-400 capitalize">{selectedEx.metric}</span>
                </div>
              </div>

              <div className="text-xs text-slate-450 bg-indigo-500/5 p-3 rounded-lg border border-indigo-500/15 leading-relaxed">
                🎯 **Contactless Calibration**: When you start, position yourself 2.5 meters back from your sensor array (RuView) so the stream isolates your pose.
              </div>
            </div>

            <button
              onClick={handleStartWorkout}
              className="w-full mt-8 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-dark-950 font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Play className="w-5 h-5 text-dark-950 fill-dark-950" />
              <span>Calibrate & Start Session</span>
            </button>
          </GlassCard>
        </div>
      )}

      {isActive && (
        /* Active Live stream screen */
        <div className="flex flex-col gap-6">
          
          {/* Active Title bar */}
          <div className="flex items-center justify-between bg-slate-900/50 border border-indigo-500/10 p-5 rounded-2xl">
            <div className="flex items-center gap-3">
              <span className="animate-ping w-2.5 h-2.5 rounded-full bg-rose-500" />
              <h3 className="text-sm font-bold text-slate-200 capitalize">
                Sensing {selectedEx.name} Stream...
              </h3>
            </div>
            
            <button
              onClick={handleEndWorkout}
              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-350 border border-rose-500/20 hover:border-rose-500/40 px-5 py-2 rounded-xl transition-all duration-200 text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-rose-400" />
              <span>Complete Workout</span>
            </button>
          </div>

          {/* Vitals overview row */}
          <LiveVitalsCard 
            heartRate={vitals.hr} 
            breathingRate={vitals.br} 
            poseStability={poseData.stability} 
          />

          {/* Core Counters Row */}
          <LiveWorkoutTimer 
            duration={telemetry.duration} 
            reps={telemetry.reps} 
            goalReps={goal} 
            calories={telemetry.calories} 
            exercise={selectedEx.id}
          />

          {/* Motion Graph and Posture Signatures */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MotionGraph activeFrame={latestFrame} />
            </div>

            <GlassCard className="flex flex-col gap-4 border-slate-800 justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Contactless Posture Feedback
                </h4>
                <div className="mt-4 p-4 rounded-xl bg-slate-900/50 border border-slate-850 min-h-[90px] flex items-center justify-center text-center">
                  <p className="text-xs font-medium text-indigo-350 leading-relaxed italic animate-pulse">
                    "{poseData.feedback}"
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 border-t border-slate-850 pt-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Pose State:</span>
                  <span className="font-bold text-slate-200 capitalize">{poseData.state}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Pose Confidence:</span>
                  <span className="font-bold text-emerald-400">{(poseData.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </GlassCard>
          </div>

        </div>
      )}

      {completedSession && (
        /* Workout Complete Summary Screen */
        <GlassCard className="max-w-2xl mx-auto border-indigo-500/20 p-8 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-3 text-center border-b border-slate-850 pb-6">
            <CheckCircle className="w-12 h-12 text-emerald-400" />
            <h3 className="text-2xl font-black text-slate-100">Workout Logged!</h3>
            <p className="text-xs text-slate-400">Your session metrics have been successfully committed to MongoDB</p>
          </div>

          {/* Quick Metrics grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Exercise</span>
              <p className="text-sm font-bold text-slate-200 capitalize mt-1">{completedSession.exercise}</p>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Reps Done</span>
              <p className="text-sm font-bold text-emerald-450 mt-1">{completedSession.reps} reps</p>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Duration</span>
              <p className="text-sm font-bold text-indigo-300 mt-1">{Math.round(completedSession.duration / 60)} min</p>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Energy Burn</span>
              <p className="text-sm font-bold text-rose-450 mt-1">{completedSession.calories} kcal</p>
            </div>
          </div>

          {/* AI Coach Summary panel */}
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-400" />
              <h4 className="text-sm font-bold text-slate-200">AI Coach Post-Session Report</h4>
            </div>

            <div className="bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-2xl min-h-[120px] text-xs leading-relaxed text-slate-300">
              {aiLoading ? (
                <div className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] text-slate-400">Prompting Gemini for posture analysis...</span>
                </div>
              ) : (
                <div className="space-y-2 markdown-content">
                  {aiSummary.split('\n').map((line, idx) => {
                    if (line.startsWith('###')) {
                      return <h5 key={idx} className="font-bold text-slate-100 mt-3 text-sm">{line.replace('###', '')}</h5>;
                    } else if (line.startsWith('*')) {
                      return <li key={idx} className="ml-3 list-disc mt-1">{line.replace('*', '').trim()}</li>;
                    } else if (line.startsWith('1.')) {
                      return <li key={idx} className="ml-3 list-decimal mt-1">{line.substring(2).trim()}</li>;
                    }
                    return <p key={idx} className="mt-1">{line}</p>;
                  })}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setCompletedSession(null)}
            className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-bold py-3 rounded-xl transition-all duration-200 mt-4 cursor-pointer text-xs"
          >
            Start Another Workout
          </button>
        </GlassCard>
      )}

    </div>
  );
};

export default WorkoutSession;
