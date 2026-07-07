const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');
const config = require('../config');

// Local cache fed by the WebSocket client
let latestSensorFrame = {
  timestamp: Date.now(),
  exercise: 'none',
  vitals: { heartRate: 72, breathingRate: 16 },
  pose: { state: 'standing', confidence: 0.95, stability: 0.95 },
  motion: { intensity: 0.0, jerkiness: 0.0 }
};

const updateCache = (frame) => {
  latestSensorFrame = frame;
};

// Help configuration setup for axios headers
const getRequestConfig = () => {
  const cfg = { timeout: 1200 };
  if (config.RUVIEW_API_TOKEN) {
    cfg.headers = {
      Authorization: `Bearer ${config.RUVIEW_API_TOKEN}`
    };
  }
  return cfg;
};

// GET /api/ruview/latest - Fetch last captured frame
router.get('/latest', auth, async (req, res) => {
  try {
    // Try querying the real RuView API endpoint matching the new v1 paths
    const response = await axios.get(`${config.RUVIEW_API_URL}/api/v1/sensing/latest`, getRequestConfig());
    return res.json(response.data);
  } catch (err) {
    try {
      // Try fallback paths in case
      const response2 = await axios.get(`${config.RUVIEW_API_URL}/api/ruview/latest`, getRequestConfig());
      return res.json(response2.data);
    } catch (err2) {
      try {
        const response3 = await axios.get(`${config.RUVIEW_API_URL}/latest`, getRequestConfig());
        return res.json(response3.data);
      } catch (err3) {
        // Fallback to our local streaming WebSocket cache
        return res.json(latestSensorFrame);
      }
    }
  }
});

// GET /api/ruview/vitals - Return average heart rate and breathing rate logs
router.get('/vitals', auth, async (req, res) => {
  try {
    const response = await axios.get(`${config.RUVIEW_API_URL}/api/v1/sensing/vitals`, getRequestConfig());
    return res.json(response.data);
  } catch (err) {
    try {
      const response2 = await axios.get(`${config.RUVIEW_API_URL}/api/ruview/vitals`, getRequestConfig());
      return res.json(response2.data);
    } catch (err2) {
      try {
        const response3 = await axios.get(`${config.RUVIEW_API_URL}/vitals`, getRequestConfig());
        return res.json(response3.data);
      } catch (err3) {
        return res.json({
          heartRate: latestSensorFrame.vitals.heartRate,
          breathingRate: latestSensorFrame.vitals.breathingRate,
          status: latestSensorFrame.vitals.heartRate > 100 ? 'Elevated' : 'Normal'
        });
      }
    }
  }
});

// GET /api/ruview/pose - Return active pose state
router.get('/pose', auth, async (req, res) => {
  try {
    const response = await axios.get(`${config.RUVIEW_API_URL}/api/v1/sensing/pose`, getRequestConfig());
    return res.json(response.data);
  } catch (err) {
    try {
      const response2 = await axios.get(`${config.RUVIEW_API_URL}/api/ruview/pose`, getRequestConfig());
      return res.json(response2.data);
    } catch (err2) {
      try {
        const response3 = await axios.get(`${config.RUVIEW_API_URL}/pose`, getRequestConfig());
        return res.json(response3.data);
      } catch (err3) {
        return res.json(latestSensorFrame.pose);
      }
    }
  }
});

module.exports = {
  router,
  updateCache
};
