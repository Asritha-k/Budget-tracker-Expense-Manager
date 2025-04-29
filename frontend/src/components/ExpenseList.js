import { useState } from 'react';
import api from '../services/api';
import './ExpenseList.css';

export function ExpenseList({ expenses, onEdit, onDelete }) {
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Helper function to format dates
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Function to handle expense deletion
  const handleDelete = async (id) => {
    if (confirmDelete === id) {
      setDeletingId(id);
      try {
        await api.deleteExpense(id);
        // Notify parent component to refresh the list
        onDelete();
      } catch (err) {
        console.error('Error deleting expense:', err);
        alert('Failed to delete expense. Please try again.');
      } finally {
        setDeletingId(null);
        setConfirmDelete(null);
      }
    } else {
      // First click - ask for confirmation
      setConfirmDelete(id);
      // Auto-cancel after 3 seconds
      setTimeout(() => {
        setConfirmDelete(null);
      }, 3000);
    }
  };
  
  // Get category color based on name
  const getCategoryColor = (category) => {
    const colors = {
      food: '#ef4444',
      transport: '#10b981',
      entertainment: '#f59e0b',
      utilities: '#3b82f6',
      health: '#ec4899',
      groceries: '#8b5cf6',
      education: '#06b6d4',
      gas: '#14b8a6',
      travel: '#4f46e5',
      subscription: '#0ea5e9'
    };
    
    return colors[category.toLowerCase()] || '#64748b';
  };

  return (
    <div className="expense-list-container">
      {expenses.length === 0 ? (
        <div className="no-expenses">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
          </svg>
          <p>No expenses found</p>
          <span>Create your first expense to get started</span>
        </div>
      ) : (
        <div className="expense-table">
          <div className="expense-table-header">
            <div className="header-cell date-cell">Date</div>
            <div className="header-cell amount-cell">Amount</div>
            <div className="header-cell category-cell">Category</div>
            <div className="header-cell description-cell">Description</div>
            <div className="header-cell actions-cell">Actions</div>
          </div>
          
          <div className="expense-table-body">
            {expenses.map(expense => (
              <div key={expense.id} className="expense-row">
                <div className="expense-cell date-cell">
                  {formatDate(expense.date)}
                </div>
                
                <div className="expense-cell amount-cell">
                  {formatCurrency(expense.amount)}
                </div>
                
                <div className="expense-cell category-cell">
                  <div className="category-badge" style={{ backgroundColor: getCategoryColor(expense.category) }}>
                    {expense.category}
                  </div>
                </div>
                
                <div className="expense-cell description-cell">
                  {expense.description || 'No description'}
                </div>
                
                <div className="expense-cell actions-cell">
                  <button 
                    className="edit-button" 
                    onClick={() => onEdit(expense)}
                    title="Edit expense"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  
                  <button 
                    className={`delete-button ${confirmDelete === expense.id ? 'confirm' : ''}`}
                    onClick={() => handleDelete(expense.id)}
                    disabled={deletingId === expense.id}
                    title={confirmDelete === expense.id ? "Click again to confirm" : "Delete expense"}
                  >
                    {deletingId === expense.id ? (
                      <svg className="spinner" viewBox="0 0 50 50" width="16" height="16">
                        <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                      </svg>
                    ) : confirmDelete === expense.id ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}