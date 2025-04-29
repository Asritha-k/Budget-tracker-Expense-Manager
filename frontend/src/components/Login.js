import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [redirecting, setRedirecting] = useState(false);
  
  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);
  
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    // Clear error when user types
    if (error) setError(null);
  };
  
  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Attempting login with:', formData);
      const res = await api.login(formData);
      console.log('Login response received:', res);
      
      if (res.data && res.data.token) {
        // Store token in localStorage
        localStorage.setItem('token', res.data.token);
        console.log('Token stored in localStorage');
        
        // Set redirecting state
        setRedirecting(true);
        
        // Use window.location instead of navigate for a hard redirect
        window.location.href = '/dashboard';
      } else {
        throw new Error('No token received from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle different types of errors
      if (!err.response) {
        // Network error (server not responding)
        setError('Network Error: Could not connect to the server. Please check if the server is running.');
      } else {
        // Server responded with an error
        const errorResponse = err.response || {};
        const statusCode = errorResponse.status;
        const errorData = errorResponse.data || {};
        
        // Handle different error status codes
        if (statusCode === 400) {
          setError(errorData.error || 'Invalid username or password');
        } else if (statusCode === 500) {
          setError('Server error. Please try again later.');
        } else {
          const msg = errorData.error || errorData.message || err.message;
          setError(msg);
        }
      }
      
      setIsLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to access your account</p>
        </div>
        
        {error && (
          <div className="auth-alert error">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        {redirecting && (
          <div className="auth-alert success">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Login successful! Redirecting to dashboard...</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-field">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading || redirecting}
                required
              />
            </div>
          </div>
          
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading || redirecting}
                required
              />
            </div>
          </div>
          
          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
          </div>
          
          <button 
            type="submit" 
            className="auth-button" 
            disabled={isLoading || redirecting}
          >
            {isLoading || redirecting ? (
              <>
                <svg className="spinner" viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                </svg>
                <span>{redirecting ? 'Redirecting...' : 'Signing in...'}</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup">Create account</Link></p>
        </div>
      </div>
    </div>
  );
}