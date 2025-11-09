import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaBuilding, FaLock, FaCity } from 'react-icons/fa';
import './Login.css';
import dummyUsers from '../data/dummyUsers';

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4387';

const Login = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!name || !password) {
      setError('Please enter department name and password');
      setLoading(false);
      return;
    }

    try {
      // Try backend login first
      const response = await fetch(`${API_BASE_URL}/logindept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok && data && data.type) {
        // Successful backend login
        localStorage.setItem('authType', data.type);
        localStorage.setItem('departmentName', name);
        localStorage.setItem('isAuthenticated', 'true');
        
        // Save department ID if available (for API calls)
        if (data.id) {
          localStorage.setItem('departmentId', data.id);
        }

        const routes = {
          'ELEC': '/electricity',
          'WATER': '/water',
          'ROAD': '/roads',
          'GARB': '/garbage'
        };

        navigate(routes[data.type]);
        return;
      }

      // If backend returned non-ok or didn't provide expected data, fall through to local auth
      console.warn('Backend login not available or returned unexpected response, falling back to dummy users');

      // Local dummy auth
      const localUser = dummyUsers.find((u) => (u.username || u.name).toLowerCase() === name.toLowerCase() && u.password === password);

      if (localUser) {
        localStorage.setItem('authType', localUser.type);
        localStorage.setItem('departmentName', localUser.name);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('departmentId', localUser.id);

        const routes = {
          'ELEC': '/electricity',
          'WATER': '/water',
          'ROAD': '/roads',
          'GARB': '/garbage'
        };

        navigate(routes[localUser.type]);
        return;
      }

      // If we reach here, both backend and dummy auth failed
      const backendError = (data && data.error) ? data.error : 'Login failed';
      throw new Error(backendError);

    } catch (err) {
      console.warn('Backend login request failed:', err);

      // Try local dummy auth when backend request fails (network error / backend down)
      const localUserFallback = dummyUsers.find((u) => (u.username || u.name).toLowerCase() === name.toLowerCase() && u.password === password);
      if (localUserFallback) {
        localStorage.setItem('authType', localUserFallback.type);
        localStorage.setItem('departmentName', localUserFallback.name);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('departmentId', localUserFallback.id);

        const routes = {
          'ELEC': '/electricity',
          'WATER': '/water',
          'ROAD': '/roads',
          'GARB': '/garbage'
        };

        navigate(routes[localUserFallback.type]);
      } else {
        console.error('Login error:', err);
        setError(err.message || 'Invalid department name or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <FaCity size={60} color="#000000" />
          <h1>Municipal Admin Portal</h1>
          <p>Department Login</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">
              <FaBuilding /> Department Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your department name"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <FaLock /> Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="register-link">
          <p>Don't have an account? <Link to="/register">Register your department</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
