const bcrypt = require('bcryptjs');
const { connectDB, isFallback } = require('../db');
const { Model: User } = require('../models/User');
const { Model: Workout } = require('../models/Workout');
const { Model: AIFeedback } = require('../models/AIFeedback');

const seedData = async () => {
  console.log('Starting FitSense database seeding...');
  
  await connectDB();
  
  try {
    // 1. Check/create default user
    let defaultUser = await User.findOne({ email: 'user@fitsense.ai' });
    if (!defaultUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      defaultUser = await User.create({
        name: 'Alex Rivera',
        email: 'user@fitsense.ai',
        password: hashedPassword,
        height: 178,
        weight: 74,
        age: 27,
        gender: 'male',
        fitnessGoal: 'weight-loss',
        role: 'user'
      });
      console.log('Seeded default user: user@fitsense.ai / password123');
    } else {
      console.log('Default user user@fitsense.ai already exists.');
    }
    
    // Check/create admin user
    let adminUser = await User.findOne({ email: 'admin@fitsense.ai' });
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      adminUser = await User.create({
        name: 'Chief Trainer',
        email: 'admin@fitsense.ai',
        password: hashedPassword,
        height: 182,
        weight: 80,
        age: 32,
        gender: 'male',
        fitnessGoal: 'muscle-gain',
        role: 'admin'
      });
      console.log('Seeded admin user: admin@fitsense.ai / admin123');
    } else {
      console.log('Admin user admin@fitsense.ai already exists.');
    }

    const userId = defaultUser._id;

    // 2. Seed workout history (15 workouts over the past week)
    const workoutsCount = await Workout.countDocuments({ userId });
    if (workoutsCount === 0) {
      const workoutTemplates = [
        { exercise: 'squats', duration: 480, reps: 60, goalReps: 50, calories: 120, avgHeartRate: 110, peakHeartRate: 125, avgBreathingRate: 19, daysAgo: 6 },
        { exercise: 'pushups', duration: 360, reps: 40, goalReps: 40, calories: 85, avgHeartRate: 105, peakHeartRate: 118, avgBreathingRate: 18, daysAgo: 6 },
        { exercise: 'running', duration: 1800, reps: 3200, goalReps: 3000, calories: 340, avgHeartRate: 135, peakHeartRate: 152, avgBreathingRate: 26, daysAgo: 5 },
        { exercise: 'plank', duration: 180, reps: 36, goalReps: 30, calories: 45, avgHeartRate: 92, peakHeartRate: 98, avgBreathingRate: 14, daysAgo: 5 },
        { exercise: 'yoga', duration: 1200, reps: 120, goalReps: 100, calories: 70, avgHeartRate: 68, peakHeartRate: 75, avgBreathingRate: 12, daysAgo: 4 },
        { exercise: 'lunges', duration: 400, reps: 40, goalReps: 30, calories: 80, avgHeartRate: 112, peakHeartRate: 124, avgBreathingRate: 18, daysAgo: 4 },
        { exercise: 'jumping-jacks', duration: 300, reps: 120, goalReps: 100, calories: 95, avgHeartRate: 125, peakHeartRate: 138, avgBreathingRate: 24, daysAgo: 3 },
        { exercise: 'running', duration: 1500, reps: 2800, goalReps: 3000, calories: 290, avgHeartRate: 132, peakHeartRate: 146, avgBreathingRate: 25, daysAgo: 3 },
        { exercise: 'squats', duration: 500, reps: 65, goalReps: 60, calories: 135, avgHeartRate: 115, peakHeartRate: 128, avgBreathingRate: 20, daysAgo: 2 },
        { exercise: 'pushups', duration: 400, reps: 45, goalReps: 45, calories: 95, avgHeartRate: 108, peakHeartRate: 120, avgBreathingRate: 19, daysAgo: 2 },
        { exercise: 'walking', duration: 2400, reps: 4500, goalReps: 4000, calories: 180, avgHeartRate: 95, peakHeartRate: 102, avgBreathingRate: 15, daysAgo: 1 },
        { exercise: 'yoga', duration: 900, reps: 90, goalReps: 90, calories: 55, avgHeartRate: 66, peakHeartRate: 70, avgBreathingRate: 11, daysAgo: 1 },
        { exercise: 'squats', duration: 450, reps: 50, goalReps: 60, calories: 110, avgHeartRate: 108, peakHeartRate: 120, avgBreathingRate: 19, daysAgo: 0 },
        { exercise: 'jumping-jacks', duration: 240, reps: 100, goalReps: 100, calories: 75, avgHeartRate: 122, peakHeartRate: 132, avgBreathingRate: 22, daysAgo: 0 },
        { exercise: 'plank', duration: 120, reps: 24, goalReps: 20, calories: 30, avgHeartRate: 90, peakHeartRate: 95, avgBreathingRate: 13, daysAgo: 0 }
      ];

      for (const t of workoutTemplates) {
        const date = new Date();
        date.setDate(date.getDate() - t.daysAgo);
        
        await Workout.create({
          userId,
          exercise: t.exercise,
          duration: t.duration,
          reps: t.reps,
          goalReps: t.goalReps,
          calories: t.calories,
          avgHeartRate: t.avgHeartRate,
          peakHeartRate: t.peakHeartRate,
          avgBreathingRate: t.avgBreathingRate,
          status: 'completed',
          createdAt: date
        });
      }
      console.log('Seeded 15 sample workouts for user Alex Rivera.');
    } else {
      console.log('User already has workouts in the database.');
    }

    // 3. Seed AI feedback
    const feedbackCount = await AIFeedback.countDocuments({ userId });
    if (feedbackCount === 0) {
      await AIFeedback.create({
        userId,
        type: 'workout-summary',
        promptUsed: '{"exercise":"squats","duration":450,"reps":50,"goalReps":60,"calories":110}',
        responseContent: `### 🏋️ FitSense Workout Report: SQUATS

Great effort on your squats! You completed 50 out of your 60 repetition goal.

#### 📊 Performance Insights
* **Adaptation**: Your average heart rate of 108 BPM indicates stable cardiovascular support in your aerobic zone.
* **Volume**: Drive through your heels is excellent, but we noticed slightly less stability during reps 30-40.

#### 💡 Coach Tips for Next Time
1. **Depth Consistency**: Focus on hitting parallel depth (hips level with knees) even when you begin to feel fatigue.
2. **Breathing Mechanics**: Exhale powerfully as you push up, inhale as you squat down.
3. **Pace**: Slow down the downward movement to 2 seconds for increased core activation.`
      });
      console.log('Seeded default AI feedback summary.');
    }

    console.log('FitSense Database Seeding Complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding process failed:', err.message);
    process.exit(1);
  }
};

seedData();
