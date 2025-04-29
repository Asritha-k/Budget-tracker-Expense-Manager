import axios from 'axios';

// Create API instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5001', // Make sure this matches your server port
  timeout: 15000, // Increased timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    console.error('API Error:', error.message);
    
    // Network error (server not responding)
    if (!error.response) {
      console.error('Network error - server may be unreachable');
    }
    
    // Handle expired tokens or auth errors
    if (error.response && error.response.status === 401) {
      // Clear token on 401 Unauthorized responses
      localStorage.removeItem('token');
      // If not already on the login page, redirect there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API service functions
const apiService = {
  // Auth endpoints
  login: (credentials) => api.post('/login', credentials),
  signup: (userData) => api.post('/signup', userData),
  
  // Expense endpoints
  getExpenses: (filters = {}) => api.get('/expenses', { params: filters }),
  createExpense: (expenseData) => api.post('/expenses', expenseData),
  updateExpense: (id, expenseData) => api.put(`/expenses/${id}`, expenseData),
  deleteExpense: (id) => api.delete(`/expenses/${id}`),
  
  // Categories
  getCategories: () => api.get('/categories'),
};

export default apiService;