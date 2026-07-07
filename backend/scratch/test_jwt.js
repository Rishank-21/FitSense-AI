const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const testObjectId = new mongoose.Types.ObjectId();
console.log('Original ObjectId object:', testObjectId);
console.log('Original ObjectId type:', typeof testObjectId);

const payload = {
  id: testObjectId,
  name: 'Test Admin',
  role: 'admin'
};

const secret = 'test_secret_123';
const token = jwt.sign(payload, secret);

const decoded = jwt.verify(token, secret);
console.log('Decoded Payload ID:', decoded.id);
console.log('Decoded Payload ID type:', typeof decoded.id);

const isValid = mongoose.Types.ObjectId.isValid(decoded.id);
console.log('Is Decoded ID a valid MongoDB ObjectId?:', isValid);
process.exit(0);
