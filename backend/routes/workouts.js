const express = require('express');
const router = express.Router();
const { Model: Workout } = require('../models/Workout');
const auth = require('../middleware/auth');

// Get All Workouts for Logged-in User
router.get('/', auth, async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.user.id });
    // Sort workouts by date descending
    workouts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(workouts);
  } catch (err) {
    console.error('Fetch workouts error:', err.message);
    res.status(500).json({ message: 'Server error fetching workouts list' });
  }
});

// Create/Log Completed Workout Session
router.post('/end', auth, async (req, res) => {
  const { exercise, duration, reps, goalReps, calories, avgHeartRate, peakHeartRate, avgBreathingRate, status } = req.body;

  if (!exercise || duration === undefined || calories === undefined) {
    return res.status(400).json({ message: 'Please provide exercise type, duration, and calories burned.' });
  }

  try {
    const workoutData = {
      userId: req.user.id,
      exercise: exercise.toLowerCase(),
      duration: Number(duration),
      reps: reps ? Number(reps) : 0,
      goalReps: goalReps ? Number(goalReps) : 0,
      calories: Number(calories),
      avgHeartRate: avgHeartRate ? Number(avgHeartRate) : 72,
      peakHeartRate: peakHeartRate ? Number(peakHeartRate) : (avgHeartRate || 72),
      avgBreathingRate: avgBreathingRate ? Number(avgBreathingRate) : 16,
      status: status || 'completed'
    };

    const newWorkout = await Workout.create(workoutData);
    res.status(201).json(newWorkout);
  } catch (err) {
    console.error('Log workout error:', err.message);
    res.status(500).json({ message: 'Server error saving workout session' });
  }
});

// Fetch Detailed Aggregated Analytics
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const workouts = await Workout.find({ userId });

    // Aggregate general values
    let totalWorkouts = workouts.length;
    let totalCalories = 0;
    let totalDuration = 0; // seconds
    let totalReps = 0;
    let hrSum = 0;
    let brSum = 0;

    const exerciseCounts = {};
    const exerciseCalories = {};
    
    // Group values by exercise type and days
    workouts.forEach(w => {
      totalCalories += w.calories || 0;
      totalDuration += w.duration || 0;
      totalReps += w.reps || 0;
      hrSum += w.avgHeartRate || 72;
      brSum += w.avgBreathingRate || 16;

      const exercise = w.exercise || 'unknown';
      exerciseCounts[exercise] = (exerciseCounts[exercise] || 0) + 1;
      exerciseCalories[exercise] = (exerciseCalories[exercise] || 0) + (w.calories || 0);
    });

    const avgHeartRate = totalWorkouts > 0 ? Math.round(hrSum / totalWorkouts) : 72;
    const avgBreathingRate = totalWorkouts > 0 ? Math.round(brSum / totalWorkouts) : 16;

    // Daily breakdown for line graphs (last 7 workouts or last 7 calendar days)
    // For simplicity, sort workouts by date and map the last 7 sessions
    const sorted = [...workouts].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const recentActivity = sorted.slice(-7).map(w => {
      const dateLabel = new Date(w.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      return {
        date: dateLabel,
        calories: Math.round(w.calories),
        duration: Math.round(w.duration / 60), // minutes
        reps: w.reps,
        exercise: w.exercise
      };
    });

    // Format exercise breakdown for charts
    const exerciseBreakdown = Object.keys(exerciseCounts).map(name => ({
      name: name.toUpperCase(),
      count: exerciseCounts[name],
      calories: Math.round(exerciseCalories[name])
    }));

    res.json({
      summary: {
        totalWorkouts,
        totalCalories: Math.round(totalCalories),
        totalDurationMinutes: Math.round(totalDuration / 60),
        totalReps,
        avgHeartRate,
        avgBreathingRate
      },
      exerciseBreakdown,
      recentActivity
    });
  } catch (err) {
    console.error('Fetch history analytics error:', err.message);
    res.status(500).json({ message: 'Server error retrieving workout analytics' });
  }
});

// Get Platform Statistics (Admin only)
router.get('/platform-stats', auth, async (req, res) => {
  try {
    const { Model: User } = require('../models/User');
    
    // Verify admin
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    // 1. Gather Platform Overview
    const totalUsers = await User.countDocuments({});
    const workouts = await Workout.find({});
    
    let totalWorkouts = workouts.length;
    let totalCalories = 0;
    let hrSum = 0;
    const exerciseCounts = {};
    
    // Hour distribution dictionary
    const hourCounts = {};
    
    workouts.forEach(w => {
      totalCalories += w.calories || 0;
      hrSum += w.avgHeartRate || 72;
      
      const exercise = w.exercise || 'unknown';
      exerciseCounts[exercise] = (exerciseCounts[exercise] || 0) + 1;
      
      // Extract hour from createdAt timestamp
      const date = new Date(w.createdAt);
      const hourStr = String(date.getHours()).padStart(2, '0') + ':00';
      hourCounts[hourStr] = (hourCounts[hourStr] || 0) + 1;
    });
    
    const avgHeartRate = totalWorkouts > 0 ? Math.round(hrSum / totalWorkouts) : 72;
    
    // Find popular exercise
    let popularExercise = 'Squats';
    let maxCount = 0;
    for (let ex in exerciseCounts) {
      if (exerciseCounts[ex] > maxCount) {
        maxCount = exerciseCounts[ex];
        popularExercise = ex;
      }
    }
    
    // Map hourly distribution to the exact chart format needed:
    const defaultHours = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    const hourlyData = defaultHours.map(h => {
      const hrPrefix = parseInt(h.split(':')[0]);
      let count = 0;
      for (let logHr in hourCounts) {
        const val = parseInt(logHr.split(':')[0]);
        if (Math.abs(val - hrPrefix) <= 1) {
          count += hourCounts[logHr];
        }
      }
      return { hour: h, workouts: count };
    });
    
    res.json({
      metrics: {
        totalUsers,
        totalWorkouts,
        avgHeartRate,
        popularExercise: popularExercise.toUpperCase(),
        totalCalories: Math.round(totalCalories)
      },
      hourlyData
    });
  } catch (err) {
    console.error('Fetch platform stats error:', err.message);
    res.status(500).json({ message: 'Server error compiling platform stats' });
  }
});

module.exports = router;
