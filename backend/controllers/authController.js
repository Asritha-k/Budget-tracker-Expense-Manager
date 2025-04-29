const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Signup logic
exports.signup = (req, res) => {
  const { username, password } = req.body;

  // Check if username already exists
  User.findByUsername(username, (err, user) => {
    if (user) {
      return res.status(400).send('User already exists');
    }

    // Hash the password before saving
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).send('Error hashing password');
      }

      const newUser = new User({ username, password: hashedPassword });

      User.create(newUser, (err, result) => {
        if (err) {
          return res.status(500).send('Error creating user');
        }
        res.status(201).send('User created successfully');
      });
    });
  });
};

// Login logic
exports.login = (req, res) => {
  const { username, password } = req.body;

  User.findByUsername(username, (err, user) => {
    if (!user) {
      return res.status(400).send('User not found');
    }

    // Compare the provided password with the stored hash
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (!isMatch) {
        return res.status(400).send('Invalid credentials');
      }

      // Create and send JWT token
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
      res.json({ token });
    });
  });
};
