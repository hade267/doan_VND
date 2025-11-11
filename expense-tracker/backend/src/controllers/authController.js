const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const bcrypt = require('bcrypt');

const authController = {
  // Register a new user
  async register(req, res) {
    const { username, email, password, full_name } = req.body;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ message: 'User with this email already exists.' });
      }

      // Create new user
      const newUser = await User.create({
        username,
        email,
        password_hash: password, // The hook will hash this
        full_name,
      });

      // Generate tokens
      const accessToken = generateToken({ id: newUser.id, role: newUser.role });

      res.status(201).json({
        message: 'User registered successfully!',
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
        },
        accessToken,
      });
    } catch (error) {
      console.error('Registration Error:', error);
      res.status(500).json({ message: 'Server error during registration.' });
    }
  },

  // Login an existing user
  async login(req, res) {
    const { email, password } = req.body;

    try {
      // Find the user by email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      // Check password
      const isMatch = await user.isValidPassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      if (!user.is_active) {
        return res.status(403).json({ message: 'Account is deactivated.' });
      }

      // Generate tokens
      const accessToken = generateToken({ id: user.id, role: user.role });

      res.status(200).json({
        message: 'Logged in successfully!',
        accessToken,
      });
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({ message: 'Server error during login.' });
    }
  },
};

module.exports = authController;
