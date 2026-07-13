const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const UserModel = require("../models/User");
const auth = require('../middleware/auth');

const getUserModel = () => UserModel.Model;

// GET /api/auth/admin-check - Check if an administrator exists
router.get('/admin-check', async (req, res) => {
  try {
    const User = getUserModel();
    const adminExists = await User.findOne({ role: 'admin' });
    res.json({ adminExists: !!adminExists });
  } catch (err) {
    console.error('Admin check error:', err.message);
    res.status(500).json({ message: 'Server error checking administrator status' });
  }
});

// Register User
router.post('/register', async (req, res) => {
  const { name, email, password, height, weight, age, gender, fitnessGoal, role } = req.body;

  try {
    const User = getUserModel();
    // Check if user exists
    let user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Determine role (only allow admin role if no admin exists)
    const adminExists = await User.findOne({ role: 'admin' });
    let assignedRole = 'user';
    if (!adminExists && role === 'admin') {
      assignedRole = 'admin';
    }

    // Create user object
    const newUserData = {
      name,
      email,
      password,
      height: height ? Number(height) : 175,
      weight: weight ? Number(weight) : 70,
      age: age ? Number(age) : 25,
      gender: gender || 'other',
      fitnessGoal: fitnessGoal || 'maintenance',
      role: assignedRole
    };

    // Hash password
    const salt = await bcrypt.genSalt(10);
    newUserData.password = await bcrypt.hash(password, salt);

    // Save user
    const savedUser = await User.create(newUserData);

    // Return JWT
    const payload = {
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role
    };

    const token = jwt.sign(
      payload,
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRY },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          token,
          user: {
            id: savedUser._id,
            name: savedUser.name,
            email: savedUser.email,
            height: savedUser.height,
            weight: savedUser.weight,
            age: savedUser.age,
            gender: savedUser.gender,
            fitnessGoal: savedUser.fitnessGoal,
            role: savedUser.role,
          },
        });
      },
    );
    console.log(token);
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const User = getUserModel();
    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Return JWT
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(
      payload,
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRY },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            height: user.height,
            weight: user.weight,
            age: user.age,
            gender: user.gender,
            fitnessGoal: user.fitnessGoal,
            role: user.role,
          },
        });
      },
    );
    console.log(token);
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});



// Get Logged-in User Profile
router.get('/profile', auth, async (req, res) => {
  try {
    const User = getUserModel();
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Remove password from returned data
    const userResponse = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete userResponse.password;
    res.json(userResponse);
  } catch (err) {
    console.error('Profile fetch error:', err.message);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Logout (stateless JWT)
router.post('/logout', auth, async (req, res) => {
  try {
    return res.json({ message: 'Logged out' });
  } catch (err) {
    console.error('Logout error:', err.message);
    return res.status(500).json({ message: 'Server error during logout' });
  }
});

// Update User Profile
router.post('/profile', auth, async (req, res) => {
  const { height, weight, age, gender, fitnessGoal } = req.body;

  try {
    const User = getUserModel();
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare updates
    const updates = {};
    if (height !== undefined) updates.height = Number(height);
    if (weight !== undefined) updates.weight = Number(weight);
    if (age !== undefined) updates.age = Number(age);
    if (gender !== undefined) updates.gender = gender;
    if (fitnessGoal !== undefined) updates.fitnessGoal = fitnessGoal;

    await User.updateOne({ _id: req.user.id }, { $set: updates });

    // Fetch updated user
    const updatedUser = await User.findById(req.user.id);
    const userResponse = typeof updatedUser.toObject === 'function' ? updatedUser.toObject() : { ...updatedUser };
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Get All Registered Users (Admin only)
router.get('/users', auth, async (req, res) => {
  try {
    const User = getUserModel();
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    const users = await User.find({});
    console.log(`Fetched ${users.length} users for admin dashboard.`);
    const cleanedUsers = users.map(u => {
      const uRes = typeof u.toObject === 'function' ? u.toObject() : { ...u };
      delete uRes.password;
      return uRes;
    });
    res.json(cleanedUsers);
  } catch (err) {
    console.error('Fetch users error:', err.message);
    res.status(500).json({ message: 'Server error retrieving user accounts list' });
  }
});



module.exports = router;
