import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Summary } from './Summary';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseList } from './ExpenseList';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // For mobile navigation
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState(['all', 'food', 'transport', 'entertainment', 'utilities']);
  const [refreshAnimation, setRefreshAnimation] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const triggerRefresh = () => {
    setRefreshAnimation(true);
    setTimeout(() => setRefreshAnimation(false), 1000);
    setRefreshFlag(prev => !prev);
  };
  
  // Handle logout - wrapped in useCallback to prevent dependency issues
  const handleLogout = useCallback(() => {
    // Clear token from localStorage
    localStorage.removeItem('token');
    // Redirect to login page
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch expenses
        const res = await api.getExpenses();
        setExpenses(res.data);
        
        // Extract unique categories from expenses
        if (res.data.length > 0) {
          const uniqueCategories = ['all', ...new Set(res.data.map(exp => exp.category))];
          setCategories(uniqueCategories);
        }
      } catch (err) {
        console.error('Fetch expenses error:', err.response || err);
        
        // If unauthorized (token expired or invalid), logout
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          handleLogout();
          return;
        }
        
        setError('Failed to load expenses. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [refreshFlag, navigate, handleLogout]);

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setActiveTab('form');
  };

  const handleDone = () => {
    setEditingExpense(null);
    triggerRefresh();
    setActiveTab('list');
  };

  // Filter expenses based on search term and category
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = searchTerm === '' || 
      expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Format date for display
  const formatDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString(undefined, options);
  };
  
  // Get username from token if available
  const getUsername = () => {
    const token = localStorage.getItem('token');
    if (!token) return 'User';
    
    try {
      // For JWT, the token is base64 encoded and the payload is in the middle part
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.username || 'User';
    } catch (e) {
      return 'User';
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h1 className="app-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            <span className={sidebarCollapsed ? 'hidden' : ''}>ExpenseTracker</span>
          </h1>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {sidebarCollapsed ? (
                <polyline points="13 17 18 12 13 7"></polyline>
              ) : (
                <polyline points="11 17 6 12 11 7"></polyline>
              )}
            </svg>
          </button>
        </div>
        
        <div className="sidebar-content">
          <div className="user-info">
            <div className="avatar">
              <img src="https://via.placeholder.com/36" alt="Profile" className="user-avatar" />
              <span className="status-indicator online"></span>
            </div>
            <div className={`user-details ${sidebarCollapsed ? 'hidden' : ''}`}>
              <p className="username">{getUsername()}</p>
              <p className="user-role">Member</p>
            </div>
          </div>
          
          <nav className="sidebar-nav">
            <ul>
              <li className={activeTab === 'dashboard' ? 'active' : ''}>
                <button onClick={() => setActiveTab('dashboard')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="9"></rect>
                    <rect x="14" y="3" width="7" height="5"></rect>
                    <rect x="14" y="12" width="7" height="9"></rect>
                    <rect x="3" y="16" width="7" height="5"></rect>
                  </svg>
                  <span className={sidebarCollapsed ? 'hidden' : ''}>Dashboard</span>
                </button>
              </li>
              <li className={activeTab === 'form' ? 'active' : ''}>
                <button onClick={() => setActiveTab('form')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                  <span className={sidebarCollapsed ? 'hidden' : ''}>{editingExpense ? 'Edit Expense' : 'Add Expense'}</span>
                </button>
              </li>
              <li className={activeTab === 'list' ? 'active' : ''}>
                <button onClick={() => setActiveTab('list')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                  <span className={sidebarCollapsed ? 'hidden' : ''}>Expenses</span>
                </button>
              </li>
            </ul>
          </nav>
          
          <div className="sidebar-footer">
            <button className="logout-button" onClick={handleLogout}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span className={sidebarCollapsed ? 'hidden' : ''}>Logout</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="main-content">
        <header className="dashboard-header">
          <div className="header-left">
            <h1 className="page-title">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'form' && (editingExpense ? 'Edit Expense' : 'Add Expense')}
              {activeTab === 'list' && 'Expense List'}
            </h1>
            <p className="date-display">{formatDate()}</p>
          </div>
          
          <div className="header-right">
            <button 
              className={`refresh-button ${refreshAnimation ? 'spin' : ''}`} 
              onClick={triggerRefresh} 
              disabled={isLoading}
              aria-label="Refresh data"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 4v6h-6"></path>
                <path d="M1 20v-6h6"></path>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
            </button>
            
            <div className="greeting-text">
              <p>{getGreeting()}, <span className="username-text">{getUsername()}</span></p>
            </div>
          </div>
        </header>
        
        {error && (
          <div className="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
            <button className="dismiss-error" onClick={() => setError(null)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}
        
        <div className="content-wrapper">
          {/* Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-content">
              {isLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading your expenses...</p>
                </div>
              ) : (
                <Summary expenses={expenses} />
              )}
            </div>
          )}
          
          {/* Add/Edit Expense Form */}
          {activeTab === 'form' && (
            <div className="form-content">
              <ExpenseForm
                onAdd={triggerRefresh}
                editingExpense={editingExpense}
                onDone={handleDone}
                categories={categories.filter(cat => cat !== 'all')}
              />
            </div>
          )}
          
          {/* Expense List */}
          {activeTab === 'list' && (
            <div className="list-content">
              <div className="list-header">
                <div className="search-container">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button className="clear-search" onClick={() => setSearchTerm('')}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  )}
                </div>
                
                <div className="filter-container">
                  <select 
                    className="category-filter"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {isLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading your expenses...</p>
                </div>
              ) : (
                <>
                  {filteredExpenses.length > 0 && (
                    <div className="expense-count">
                      Showing {filteredExpenses.length} of {expenses.length} expenses
                    </div>
                  )}
                  <ExpenseList
                    expenses={filteredExpenses}
                    onEdit={handleEdit}
                    onDelete={triggerRefresh}
                  />
                </>
              )}
              
              <div className="add-expense-floating-button">
                <button onClick={() => {
                  setEditingExpense(null);
                  setActiveTab('form');
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}