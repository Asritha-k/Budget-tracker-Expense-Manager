const express = require('express');
const expenseController = require('../controllers/expenseController');
const router = express.Router();

// Route to add an expense
router.post('/add', expenseController.addExpense);

// Route to get all expenses for the logged-in user
router.get('/', expenseController.getAllExpenses);

// Route to delete an expense
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
