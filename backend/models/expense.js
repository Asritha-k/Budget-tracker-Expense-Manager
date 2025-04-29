const db = require('../config/db');

const Expense = function (expense) {
  this.userId = expense.userId;
  this.amount = expense.amount;
  this.category = expense.category;
  this.description = expense.description;
};

// Create a new expense
Expense.create = (newExpense, result) => {
  db.query('INSERT INTO expenses SET ?', newExpense, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    result(null, res.insertId);
  });
};

// Get expenses by user ID
Expense.getByUserId = (userId, result) => {
  db.query('SELECT * FROM expenses WHERE user_id = ?', [userId], (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    result(null, res);
  });
};

// Delete an expense by ID
Expense.delete = (expenseId, result) => {
  db.query('DELETE FROM expenses WHERE id = ?', [expenseId], (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    result(null, res);
  });
};

module.exports = Expense;
