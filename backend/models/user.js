const db = require('../config/db');

const User = function (user) {
  this.username = user.username;
  this.password = user.password;
};

// Find a user by username
User.findByUsername = (username, result) => {
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    result(null, res[0]); // Return the first matching user
  });
};

// Create a new user
User.create = (newUser, result) => {
  db.query('INSERT INTO users SET ?', newUser, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    result(null, res.insertId);
  });
};

module.exports = User;
