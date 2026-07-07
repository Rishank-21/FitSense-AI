/**
 * Workout Engine - Repetition detection, MET calorie calculation, and live posture feedback
 */

const MET_VALUES = {
  'pushups': 8.0,
  'squats': 5.0,
  'lunges': 5.0,
  'jumping-jacks': 8.0,
  'plank': 3.0,
  'running': 10.0,
  'walking': 3.5,
  'yoga': 2.5
};

/**
 * Initialize a workout session tracker state
 */
function createTracker(exercise, goalReps = 40) {
  return {
    exercise: exercise.toLowerCase(),
    goalReps: Number(goalReps) || 40,
    startTime: Date.now(),
    duration: 0, // in seconds
    reps: 0,
    calories: 0,
    stateMachine: {
      lastState: null,
      phase: 0, // state-machine stage
      holdTimer: 0 // for planks/yoga
    },
    vitals: {
      heartRates: [],
      breathingRates: [],
      avgHeartRate: 72,
      peakHeartRate: 72,
      avgBreathingRate: 16
    },
    motionHistory: [],
    feedback: 'Initialize sensing connection...'
  };
}

/**
 * Process an incoming sensor frame from RuView
 * Returns updated tracker state and flags
 */
function processSensorFrame(tracker, frame, userWeightKg = 70) {
  const now = Date.now();
  tracker.duration = Math.round((now - tracker.startTime) / 1000);
  
  // 1. Process Vitals
  if (frame.vitals) {
    const hr = frame.vitals.heartRate || 72;
    const br = frame.vitals.breathingRate || 16;
    
    tracker.vitals.heartRates.push(hr);
    tracker.vitals.breathingRates.push(br);
    
    // Keep last 100 entries for averaging to prevent memory leak
    if (tracker.vitals.heartRates.length > 100) tracker.vitals.heartRates.shift();
    if (tracker.vitals.breathingRates.length > 100) tracker.vitals.breathingRates.shift();
    
    const sumHR = tracker.vitals.heartRates.reduce((a, b) => a + b, 0);
    const sumBR = tracker.vitals.breathingRates.reduce((a, b) => a + b, 0);
    
    tracker.vitals.avgHeartRate = Math.round(sumHR / tracker.vitals.heartRates.length);
    tracker.vitals.avgBreathingRate = Math.round(sumBR / tracker.vitals.breathingRates.length);
    
    if (hr > tracker.vitals.peakHeartRate) {
      tracker.vitals.peakHeartRate = hr;
    }
  }

  // 2. Calculate Calories Burned
  // Formula: Calories = MET * Weight(kg) * (duration_in_hours)
  // Since we run at 2Hz (every 500ms), we can calculate incremental calories per 0.5s:
  // incremental_cal = MET * Weight * (0.5 / 3600)
  const met = MET_VALUES[tracker.exercise] || 4.0;
  const timeFraction = 0.5 / 3600; // 0.5 seconds in hours
  const addedCalories = met * userWeightKg * timeFraction;
  tracker.calories = Number((tracker.calories + addedCalories).toFixed(2));

  // 3. Exercise Repetition Detection & Posture Feedback
  const poseState = frame.pose?.state || '';
  const stability = frame.pose?.stability || 1.0;
  const intensity = frame.motion?.intensity || 0.0;
  const sm = tracker.stateMachine;

  let repIncremented = false;

  switch (tracker.exercise) {
    case 'pushups':
      // State transition: up -> down -> up
      if (poseState === 'down' && sm.lastState !== 'down') {
        sm.lastState = 'down';
        tracker.feedback = 'Pushup down. Keep core tight!';
      } else if (poseState === 'up' && sm.lastState === 'down') {
        sm.lastState = 'up';
        tracker.reps += 1;
        repIncremented = true;
        tracker.feedback = `Rep ${tracker.reps}! Excellent form.`;
      }
      break;

    case 'squats':
      // State transition: standing -> squatting -> standing
      if (poseState === 'squatting' && sm.lastState !== 'squatting') {
        sm.lastState = 'squatting';
        tracker.feedback = 'Going low. Knees behind toes!';
      } else if (poseState === 'standing' && sm.lastState === 'squatting') {
        sm.lastState = 'standing';
        tracker.reps += 1;
        repIncremented = true;
        tracker.feedback = `Rep ${tracker.reps}! Drive through heels.`;
      }
      break;

    case 'lunges':
      // State transition: neutral -> lunge -> neutral
      if (poseState === 'lunge' && sm.lastState !== 'lunge') {
        sm.lastState = 'lunge';
        tracker.feedback = 'Lunge down. Watch front knee angle!';
      } else if (poseState === 'neutral' && sm.lastState === 'lunge') {
        sm.lastState = 'neutral';
        tracker.reps += 1;
        repIncremented = true;
        tracker.feedback = `Rep ${tracker.reps}! Keep trunk upright.`;
      }
      break;

    case 'jumping-jacks':
      // State transition: closed -> open -> closed
      if (poseState === 'open' && sm.lastState !== 'open') {
        sm.lastState = 'open';
        tracker.feedback = 'Hands high!';
      } else if (poseState === 'closed' && sm.lastState === 'open') {
        sm.lastState = 'closed';
        tracker.reps += 1;
        repIncremented = true;
        tracker.feedback = `Jack ${tracker.reps}! Maintain high pace.`;
      }
      break;

    case 'plank':
      // Planks track duration in stable hold.
      // We can output "reps" as number of 5-second intervals of good hold
      if (poseState === 'stable') {
        if (stability < 0.70) {
          tracker.feedback = 'Hip sag detected. Lift hips up!';
        } else {
          sm.holdTimer += 0.5;
          tracker.feedback = `Plank Hold: ${Math.round(sm.holdTimer)}s. Keep body in straight line.`;
          if (Math.floor(sm.holdTimer) > 0 && Math.floor(sm.holdTimer) % 5 === 0 && sm.holdTimer % 1 === 0) {
            tracker.reps = Math.floor(sm.holdTimer / 5);
            repIncremented = true;
          }
        }
      } else {
        tracker.feedback = 'Plank unstable. Regain balance!';
      }
      break;

    case 'running':
    case 'walking':
      // Running and walking track motion intensity cycles.
      // A rep is a stride cycle, triggered when intensity peaks (> 0.65 for run, > 0.35 for walk)
      // and returns down.
      const threshold = tracker.exercise === 'running' ? 0.65 : 0.35;
      if (intensity > threshold && sm.lastState !== 'peak') {
        sm.lastState = 'peak';
      } else if (intensity <= threshold && sm.lastState === 'peak') {
        sm.lastState = 'low';
        tracker.reps += 1;
        repIncremented = true;
        tracker.feedback = `${tracker.exercise === 'running' ? 'Running step' : 'Walking step'} ${tracker.reps}!`;
      }
      break;

    case 'yoga':
      // Yoga tracks pose stability. Rep represents held poses.
      if (stability > 0.85) {
        sm.holdTimer += 0.5;
        tracker.feedback = `Balanced pose hold: ${Math.round(sm.holdTimer)}s. Focus on deep breaths.`;
        if (Math.floor(sm.holdTimer) > 0 && Math.floor(sm.holdTimer) % 10 === 0 && sm.holdTimer % 1 === 0) {
          tracker.reps = Math.floor(sm.holdTimer / 10);
          repIncremented = true;
        }
      } else {
        tracker.feedback = 'Slight wobbling. Brace core and find focal point.';
      }
      break;

    default:
      tracker.feedback = 'Monitoring contactless stream...';
  }

  return { tracker, repIncremented };
}

module.exports = {
  createTracker,
  processSensorFrame
};
