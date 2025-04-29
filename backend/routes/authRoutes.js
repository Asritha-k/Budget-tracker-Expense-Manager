const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// Route to sign up a new user
router.post('/signup', authController.signup);

// Route to log in a user
router.post('/login', authController.login);

module.exports = router;
