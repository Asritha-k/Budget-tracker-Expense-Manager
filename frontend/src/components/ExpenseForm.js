import { useState, useEffect } from 'react';
import api from '../services/api';
import './ExpenseForm.css';

export function ExpenseForm({ onAdd, editingExpense, onDone, categories = [] }) {
  const defaultCategories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Health', 'Groceries', 'Education', 'Gas', 'Travel', 'Subscription', 'Other'];
  const availableCategories = categories.length > 0 ? categories : defaultCategories;
  
  const [formData, setFormData] = useState({
    amount: '',
    category: availableCategories[0],
    description: '',
    date: new Date().toISOString().slice(0, 10)
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // If editing an expense, populate the form
  useEffect(() => {
    if (editingExpense) {
      // Format date properly
      const formattedExpense = {
        ...editingExpense,
        date: new Date(editingExpense.date).toISOString().slice(0, 10)
      };
      setFormData(formattedExpense);
    } else {
      // Reset form when not editing
      setFormData({
        amount: '',
        category: availableCategories[0],
        description: '',
        date: new Date().toISOString().slice(0, 10)
      });
    }
    // Clear any previous messages/errors
    setFormMessage(null);
    setErrors({});
  }, [editingExpense, availableCategories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAmountChange = (e) => {
    // Only allow numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = value.split('.');
    const formattedValue = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : value;
    
    setFormData(prev => ({ ...prev, amount: formattedValue }));
    
    // Clear error when user starts typing
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: null }));
    }
  };

  const handleCategorySelect = (category) => {
    setFormData(prev => ({ ...prev, category }));
    setShowCategoryDropdown(false);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate amount
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(formData.amount) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    // Validate description
    if (!formData.description) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 3) {
      newErrors.description = 'Description must be at least 3 characters';
    }
    
    // Validate date
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Don't submit if already submitting
    if (isSubmitting) return;
    
    // Validate form
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setFormMessage(null);
    
    try {
      if (editingExpense) {
        // Update existing expense
        await api.updateExpense(editingExpense.id, formData);
        setFormMessage({
          type: 'success',
          text: 'Expense updated successfully!'
        });
      } else {
        // Create new expense
        await api.createExpense(formData);
        setFormMessage({
          type: 'success',
          text: 'Expense added successfully!'
        });
        
        // Reset form after successful creation
        setFormData({
          amount: '',
          category: availableCategories[0],
          description: '',
          date: new Date().toISOString().slice(0, 10)
        });
      }
      
      // Notify parent component
      if (editingExpense) {
        onDone();
      } else {
        onAdd();
      }
    } catch (err) {
      console.error('Error saving expense:', err);
      
      setFormMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to save expense. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
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
    <div className="expense-form-container">
      {formMessage && (
        <div className={`form-message ${formMessage.type}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {formMessage.type === 'success' ? (
              <>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </>
            ) : (
              <>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </>
            )}
          </svg>
          <span>{formMessage.text}</span>
          <button 
            type="button" 
            className="dismiss-message"
            onClick={() => setFormMessage(null)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="expense-form">
        <h2 className="form-title">{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h2>
        
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="amount">Amount ($)</label>
            <div className="input-wrapper amount-input">
              <span className="currency-symbol">$</span>
              <input
                type="text"
                id="amount"
                name="amount"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleAmountChange}
                className={errors.amount ? 'error' : ''}
              />
            </div>
            {errors.amount && <div className="error-message">{errors.amount}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <div className="input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={errors.date ? 'error' : ''}
              />
            </div>
            {errors.date && <div className="error-message">{errors.date}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <div className="category-select-wrapper">
              <div 
                className="category-display" 
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <div 
                  className="category-color" 
                  style={{ backgroundColor: getCategoryColor(formData.category) }}
                ></div>
                <span>{formData.category}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              
              {showCategoryDropdown && (
                <div className="category-dropdown">
                  {availableCategories.map((category, index) => (
                    <div 
                      key={index} 
                      className="category-option"
                      onClick={() => handleCategorySelect(category)}
                    >
                      <div 
                        className="category-color" 
                        style={{ backgroundColor: getCategoryColor(category) }}
                      ></div>
                      <span>{category}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="form-group full-width">
            <label htmlFor="description">Description</label>
            <div className="input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="21" y1="10" x2="3" y2="10"></line>
                <line x1="21" y1="6" x2="3" y2="6"></line>
                <line x1="21" y1="14" x2="3" y2="14"></line>
                <line x1="21" y1="18" x2="3" y2="18"></line>
              </svg>
              <input
                type="text"
                id="description"
                name="description"
                placeholder="What was this expense for?"
                value={formData.description}
                onChange={handleChange}
                className={errors.description ? 'error' : ''}
              />
            </div>
            {errors.description && <div className="error-message">{errors.description}</div>}
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="save-button" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="spinner" viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                </svg>
                <span>{editingExpense ? 'Updating...' : 'Saving...'}</span>
              </>
            ) : (
              <span>{editingExpense ? 'Update Expense' : 'Add Expense'}</span>
            )}
          </button>
          
          {editingExpense && (
            <button 
              type="button" 
              className="cancel-button"
              onClick={onDone}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}