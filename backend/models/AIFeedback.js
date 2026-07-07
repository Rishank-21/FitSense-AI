const mongoose = require('mongoose');
const { getFallbackModel, isFallback } = require('../db');

const AIFeedbackSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, enum: ['workout-summary', 'weekly-tip', 'training-plan', 'posture-advice'], required: true },
  promptUsed: { type: String },
  responseContent: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

let AIFeedbackModel;

try {
  AIFeedbackModel = mongoose.model('AIFeedback', AIFeedbackSchema);
} catch (e) {
  AIFeedbackModel = mongoose.model('AIFeedback');
}

module.exports = {
  get Model() {
    return isFallback() ? getFallbackModel('AIFeedback') : AIFeedbackModel;
  }
};
