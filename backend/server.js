const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Add this to load environment variables

const app = express();
const port = process.env.PORT || 5001;

// In server.js, replace the current CORS settings with:
app.use(cors({
  origin: '*',  // Allow all origins during development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Asritha6',
  database: process.env.DB_NAME || 'expense_manager'
});

// Define JWT_SECRET in one place for consistency
const JWT_SECRET = process.env.JWT_SECRET || 'expense_manager_secret_key_2024';

db.connect(err => {
  if (err) {
    console.error('DB connection failed:', err);
    process.exit(1);
  } else {
    console.log('Connected to MySQL DB');
  }
});

// ===== Authentication =====
// Signup
app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).send({ error: 'All fields are required' });
  }
  
  bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
    if (hashErr) {
      console.error('Hashing error:', hashErr);
      return res.status(500).send({ error: 'Error processing password' });
    }
    console.log('🔒 Signing up user:', username);
    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(sql, [username, email, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error inserting user:', err.sqlMessage || err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).send({ error: 'Username or email already exists' });
        }
        return res.status(500).send({ error: err.sqlMessage || 'Signup failed' });
      }
      return res.status(201).send({ message: 'User registered successfully' });
    });
  });
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).send({ error: 'Username and password are required' });
  }
  
  console.log(`Login attempt for user: ${username}`);
  
  const sql = 'SELECT * FROM users WHERE username = ?';
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error('Database error during login:', err);
      return res.status(500).send({ error: err.sqlMessage || 'Database error' });
    }
    
    if (results.length === 0) {
      console.log(`User not found: ${username}`);
      return res.status(400).send({ error: 'User not found' });
    }
    
    const user = results[0];
    console.log(`User found, verifying password for: ${username}`);
    
    bcrypt.compare(password, user.password, (bcryptErr, isMatch) => {
      if (bcryptErr) {
        console.error('Password comparison error:', bcryptErr);
        return res.status(500).send({ error: bcryptErr.message || 'Password verification error' });
      }
      
      if (!isMatch) {
        console.log(`Invalid password for user: ${username}`);
        return res.status(400).send({ error: 'Invalid credentials' });
      }
      
      console.log(`Password verified for: ${username}, generating token`);
      
      try {
        const token = jwt.sign(
          { id: user.id, username: user.username },
          JWT_SECRET,
          { expiresIn: '1h' }
        );
        console.log(`Token generated successfully for: ${username}`);
        res.send({ token });
      } catch (jwtErr) {
        console.error('JWT signing error:', jwtErr);
        return res.status(500).send({ error: 'Error generating token' });
      }
    });
  });
});

// ===== Middleware to protect routes =====
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ error: 'Missing authorization header' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).send({ error: 'Invalid authorization header' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    // TokenExpiredError is thrown when the token is valid but expired
    if (err.name === 'TokenExpiredError') {
      return res
        .status(401)
        .send({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).send({ error: 'Invalid token' });
  }
}

// ===== Expense CRUD =====
// Create an expense
app.post('/expenses', authMiddleware, (req, res) => {
  console.log("Calling expenses endpoint");

  const { amount, category, description, date } = req.body;
  
  if (!amount || !category || !description || !date) {
    return res.status(400).send({ error: 'All fields are required' });
  }
  
  const sql = `INSERT INTO expenses (user_id, amount, category, description, date) VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [req.userId, amount, category, description, date], (err, result) => {
    if (err) {
      console.error('Error creating expense:', err);
      return res.status(500).send({ error: err.sqlMessage || 'Failed to create expense' });
    }
    console.log("Expense saved successfully");
    res.status(201).send({ id: result.insertId });
  });
});

// Read all expenses for the user
app.get('/expenses', authMiddleware, (req, res) => {
  const { category, from, to } = req.query;
  let sql = `SELECT * FROM expenses WHERE user_id = ?`;
  const params = [req.userId];

  if (category && category !== 'All') {
    sql += ` AND category = ?`;
    params.push(category);
  }
  if (from) {
    sql += ` AND date >= ?`;
    params.push(from);
  }
  if (to) {
    sql += ` AND date <= ?`;
    params.push(to);
  }
  sql += ` ORDER BY date DESC`;

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching expenses:', err);
      return res.status(500).send({ error: err.sqlMessage || 'Failed to fetch expenses' });
    }
    res.send(results);
  });
});

// Update an expense
app.put('/expenses/:id', authMiddleware, (req, res) => {
  const { amount, category, description, date } = req.body;
  
  if (!amount || !category || !description || !date) {
    return res.status(400).send({ error: 'All fields are required' });
  }
  
  const sql = `UPDATE expenses SET amount = ?, category = ?, description = ?, date = ? WHERE id = ? AND user_id = ?`;
  db.query(sql, [amount, category, description, date, req.params.id, req.userId], (err, result) => {
    if (err) {
      console.error('Error updating expense:', err);
      return res.status(500).send({ error: err.sqlMessage || 'Failed to update expense' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).send({ error: 'Expense not found or not owned by user' });
    }
    
    res.send({ message: 'Expense updated successfully' });
  });
});

// Delete an expense
app.delete('/expenses/:id', authMiddleware, (req, res) => {
  const sql = 'DELETE FROM expenses WHERE id = ? AND user_id = ?';
  db.query(sql, [req.params.id, req.userId], (err, result) => {
    if (err) {
      console.error('Error deleting expense:', err);
      return res.status(500).send({ error: err.sqlMessage || 'Failed to delete expense' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).send({ error: 'Expense not found or not owned by user' });
    }
    
    res.send({ message: 'Expense deleted successfully' });
  });
});

// Get categories for the user
app.get('/categories', authMiddleware, (req, res) => {
  const sql = 'SELECT DISTINCT category FROM expenses WHERE user_id = ? ORDER BY category';
  db.query(sql, [req.userId], (err, results) => {
    if (err) {
      console.error('Error fetching categories:', err);
      return res.status(500).send({ error: err.sqlMessage || 'Failed to fetch categories' });
    }
    const categories = results.map(row => row.category);
    res.send(categories);
  });
});

// Health check
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).send({ error: 'Something went wrong on the server' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});