const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fitsense',
  JWT_SECRET: process.env.JWT_SECRET || 'fitsense_super_secret_key_12345',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  RUVIEW_WS_URL: process.env.RUVIEW_WS_URL || 'ws://127.0.0.1:6000',
  RUVIEW_API_URL: process.env.RUVIEW_API_URL || 'http://localhost:3000',
  RUVIEW_API_TOKEN: process.env.RUVIEW_API_TOKEN || '',
  JWT_EXPIRY: '7d'
};
