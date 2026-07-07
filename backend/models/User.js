const mongoose = require('mongoose');
const { getFallbackModel, isFallback } = require('../db');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  height: { type: Number, default: 175 },
  weight: { type: Number, default: 70 },
  age: { type: Number, default: 25 },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
  fitnessGoal: { type: String, enum: ['weight-loss', 'muscle-gain', 'endurance', 'flexibility', 'maintenance'], default: 'maintenance' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

let UserModel;

try {
  UserModel = mongoose.model('User', UserSchema);
} catch (e) {
  UserModel = mongoose.model('User');
}

module.exports = {
  get Model() {
    return isFallback() ? getFallbackModel('User') : UserModel;
  }
};
