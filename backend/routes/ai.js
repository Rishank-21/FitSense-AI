const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const gemini = require('../services/gemini');
const { Model: User } = require('../models/User');
const { Model: AIFeedback } = require('../models/AIFeedback');

// POST /api/ai/recommend - Generate weekly plan based on user profile
router.post('/recommend', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    const trainingPlan = await gemini.getTrainingPlan(user);

    // Save plan to feedback history
    await AIFeedback.create({
      userId: user._id,
      type: 'training-plan',
      promptUsed: `Generate weekly routine for fitnessGoal: ${user.fitnessGoal}`,
      responseContent: trainingPlan
    });

    res.json({ plan: trainingPlan });
  } catch (err) {
    console.error('AI plan generation error:', err.message);
    res.status(500).json({ message: 'Server error generating AI recommended plan' });
  }
});

// POST /api/ai/posture - Form/posture coaching
router.post('/posture', auth, async (req, res) => {
  const { exercise, poseHistory } = req.body;

  if (!exercise || !poseHistory) {
    return res.status(400).json({ message: 'Missing exercise or pose history sequence' });
  }

  try {
    const advice = await gemini.getPostureAdvice(exercise, poseHistory);

    res.json({ advice });
  } catch (err) {
    console.error('AI posture feedback error:', err.message);
    res.status(500).json({ message: 'Server error generating posture analysis' });
  }
});

// POST /api/ai/summary - Summarize a workout session and store in history
router.post('/summary', auth, async (req, res) => {
  const { exercise, duration, reps, goalReps, calories, avgHeartRate, avgBreathingRate } = req.body;

  if (!exercise || duration === undefined || calories === undefined) {
    return res.status(400).json({ message: 'Missing workout session metadata' });
  }

  try {
    const sessionData = { exercise, duration, reps, goalReps, calories, avgHeartRate, avgBreathingRate };
    const summary = await gemini.getWorkoutSummary(sessionData);

    // Save summary in database feedback collection
    const storedFeedback = await AIFeedback.create({
      userId: req.user.id,
      type: 'workout-summary',
      promptUsed: JSON.stringify(sessionData),
      responseContent: summary
    });

    res.json({ summary, id: storedFeedback._id });
  } catch (err) {
    console.error('AI summary feedback error:', err.message);
    res.status(500).json({ message: 'Server error generating workout summary' });
  }
});

// GET /api/ai/latest-summary - Retrieve the last generated workout summary
router.get('/latest-summary', auth, async (req, res) => {
  try {
    const feedbackList = await AIFeedback.find({ 
      userId: req.user.id,
      type: 'workout-summary' 
    });
    
    // Sort descending by date
    feedbackList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const latest = feedbackList[0] || null;
    res.json(latest);
  } catch (err) {
    console.error('Fetch latest feedback error:', err.message);
    res.status(500).json({ message: 'Server error fetching latest feedback' });
  }
});

module.exports = router;
