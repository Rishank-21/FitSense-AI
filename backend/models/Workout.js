const mongoose = require('mongoose');
const { getFallbackModel, isFallback } = require('../db');

const WorkoutSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Store as string so mock IDs match mongoose IDs easily
  exercise: { type: String, required: true },
  duration: { type: Number, required: true }, // in seconds
  reps: { type: Number, default: 0 },
  goalReps: { type: Number, default: 0 },
  calories: { type: Number, required: true },
  avgHeartRate: { type: Number, required: true },
  peakHeartRate: { type: Number },
  avgBreathingRate: { type: Number, required: true },
  status: { type: String, enum: ['completed', 'abandoned'], default: 'completed' },
  createdAt: { type: Date, default: Date.now }
});

let WorkoutModel;

try {
  WorkoutModel = mongoose.model('Workout', WorkoutSchema);
} catch (e) {
  WorkoutModel = mongoose.model('Workout');
}

module.exports = {
  get Model() {
    return isFallback() ? getFallbackModel('Workout') : WorkoutModel;
  }
};
