const Expense = require('../models/expense');

// Add an expense
exports.addExpense = (req, res) => {
  const { userId, amount, category, description } = req.body;

  const newExpense = new Expense({ userId, amount, category, description });

  Expense.create(newExpense, (err, result) => {
    if (err) {
      return res.status(500).send('Error adding expense');
    }
    res.status(201).send('Expense added successfully');
  });
};

// Get all expenses for the logged-in user
exports.getAllExpenses = (req, res) => {
  const userId = req.user.id; // Assuming you verify the JWT and get user ID

  Expense.getByUserId(userId, (err, expenses) => {
    if (err) {
      return res.status(500).send('Error retrieving expenses');
    }
    res.json(expenses);
  });
};

// Delete an expense
exports.deleteExpense = (req, res) => {
  const expenseId = req.params.id;

  Expense.delete(expenseId, (err, result) => {
    if (err) {
      return res.status(500).send('Error deleting expense');
    }
    res.status(200).send('Expense deleted successfully');
  });
};
