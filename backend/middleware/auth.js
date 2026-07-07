const jwt = require('jsonwebtoken');
const config = require('../config');
const mongoose = require('mongoose');
const { isFallback } = require('../db');

module.exports = function (req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Check if token follows Bearer pattern
  const parts = authHeader.split(' ');
  const token = parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : authHeader;

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    console.log(`[AUTH DEBUG] Token User ID: "${decoded?.id}"`);
    console.log(`[AUTH DEBUG] Database Fallback Active: ${isFallback()}`);
    console.log(`[AUTH DEBUG] Is ID a valid MongoDB ObjectId: ${mongoose.Types.ObjectId.isValid(decoded?.id)}`);
    
    // Safeguard: Reject tokens with invalid MongoDB ObjectIds if MongoDB is connected,
    // which forces the client to re-login and obtain a fresh valid token.
    if (decoded && decoded.id && !isFallback() && !mongoose.Types.ObjectId.isValid(decoded.id)) {
      console.warn(`[AUTH WARNING] Rejected stale non-ObjectId token: ${decoded.id}`);
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
