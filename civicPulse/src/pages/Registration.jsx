import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaFileUpload, 
  FaCheckCircle, 
  FaCrosshairs,
  FaLock,
  FaCity,
  FaRoad,
  FaBolt,
  FaTrash,
  FaTint
} from 'react-icons/fa';
import './Registration.css';
import dummyUsers from '../data/dummyUsers';

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4387';

const Registration = () => {
  const navigate = useNavigate();

  // UI state controls
  const [showSplit, setShowSplit] = useState(false); // triggers hero shrink & panel reveal
  const [authMode, setAuthMode] = useState('register'); // 'login' | 'register'

  // Registration form state
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    address: '',
    location: { lat: '', lng: '' },
    password: '',
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfBase64, setPdfBase64] = useState('');

  // Login form state
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Shared state
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Kick off split-screen transition after slight delay for hero reveal
    const t = setTimeout(() => setShowSplit(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const departmentTypes = [
    { label: 'Electricity Department', value: 'ELEC' },
    { label: 'Water Department', value: 'WATER' },
    { label: 'Road Department', value: 'ROAD' },
    { label: 'Garbage Department', value: 'GARB' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: value
      }
    }));
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          location: {
            lat: position.coords.latitude.toFixed(6),
            lng: position.coords.longitude.toFixed(6)
          }
        }));
        setLocationLoading(false);
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred.';
        }
        setError(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size should be less than 5MB');
        return;
      }

      setPdfFile(file);
      setError('');

      // Convert to Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1]; // Remove data:application/pdf;base64, prefix
        setPdfBase64(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.name || !formData.type || !formData.address || !formData.location.lat || !formData.location.lng || !formData.password) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (!pdfFile) {
      setError('Please upload a registration PDF');
      setLoading(false);
      return;
    }

    try {
      // Create FormData for multipart/form-data submission
      // Send location in both shapes to be compatible with backend and UI consumers
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('password', formData.password);

      const parsedLat = parseFloat(formData.location.lat);
      const parsedLng = parseFloat(formData.location.lng);
      const locationObj = {
        // include both canonical and short keys
        latitude: isNaN(parsedLat) ? null : parsedLat,
        longitude: isNaN(parsedLng) ? null : parsedLng,
        lat: isNaN(parsedLat) ? null : parsedLat,
        lng: isNaN(parsedLng) ? null : parsedLng,
      };

      formDataToSend.append('location', JSON.stringify(locationObj));
      formDataToSend.append('registrationCopy', pdfFile); // Send the actual file

      const response = await fetch(`${API_BASE_URL}/regdep`, {
        method: 'POST',
        body: formDataToSend, // Don't set Content-Type header, browser will set it with boundary
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(true);
      
      // Show success message and redirect to login after 2 seconds
      setTimeout(() => {
        setAuthMode('login');
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register department. Please check if the server is running and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Login submission logic
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!loginName || !loginPassword) {
      setError('Please enter department name and password');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/logindept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: loginName, password: loginPassword })
      });
      const data = await response.json();
      if (response.ok && data && data.type) {
        // Fetch department ID and store it
        try {
          const deptIdResponse = await fetch(`${API_BASE_URL}/getDepartmentId`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: loginName })
          });
          
          const deptIdData = await deptIdResponse.json();
          
          if (deptIdResponse.ok && deptIdData.departmentId) {
            localStorage.setItem('departmentId', deptIdData.departmentId.toString());
            console.log('✅ Department ID stored:', deptIdData.departmentId);
          } else {
            console.warn('⚠️ Could not fetch department ID, but login successful');
          }
        } catch (deptIdError) {
          console.warn('⚠️ Error fetching department ID:', deptIdError);
          // Continue with login even if department ID fetch fails
        }
        
        localStorage.setItem('authType', data.type);
        localStorage.setItem('departmentName', loginName);
        localStorage.setItem('isAuthenticated', 'true');
        const routes = {
          'ELEC': '/electricity',
          'WATER': '/water',
          'ROAD': '/roads',
          'GARB': '/garbage'
        };
        navigate(routes[data.type]);
        return;
      }
      throw new Error((data && data.error) || 'Login failed');
    } catch (err) {
      // Fallback to local dummy auth when backend is unavailable
      const localUser = dummyUsers.find(
        (u) => (u.username || u.name).toLowerCase() === loginName.toLowerCase() && u.password === loginPassword
      );
      if (localUser) {
        // Try to fetch department ID even in fallback mode
        try {
          const deptIdResponse = await fetch(`${API_BASE_URL}/getDepartmentId`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: localUser.name })
          });
          
          const deptIdData = await deptIdResponse.json();
          
          if (deptIdResponse.ok && deptIdData.departmentId) {
            localStorage.setItem('departmentId', deptIdData.departmentId.toString());
            console.log('✅ Department ID stored (fallback mode):', deptIdData.departmentId);
          }
        } catch (deptIdError) {
          console.warn('⚠️ Could not fetch department ID in fallback mode');
        }
        
        localStorage.setItem('authType', localUser.type);
        localStorage.setItem('departmentName', localUser.name);
        localStorage.setItem('isAuthenticated', 'true');
        const routes = { 'ELEC': '/electricity', 'WATER': '/water', 'ROAD': '/roads', 'GARB': '/garbage' };
        navigate(routes[localUser.type]);
        return;
      }
      setError(err.message || 'Invalid department name or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`gov-auth-container ${showSplit ? 'split-active' : ''}`}>
      {/* Global background circles */}
      <div className="bg-circles" aria-hidden="true">
        <span className="ball b1" />
        <span className="ball b2" />
        <span className="ball b3" />
        <span className="ball b4" />
        <span className="ball b5" />
        <span className="ball b6" />
        <span className="ball b7" />
        {/* subtle foreground particles (small dots) — purely decorative */}
        <span className="particle p1" aria-hidden="true" />
        <span className="particle p2" aria-hidden="true" />
        <span className="particle p3" aria-hidden="true" />
        <span className="particle p4" aria-hidden="true" />
        <span className="particle p5" aria-hidden="true" />
        <span className="particle p6" aria-hidden="true" />
        <span className="particle p7" aria-hidden="true" />
        <span className="particle p8" aria-hidden="true" />
        <span className="particle p9" aria-hidden="true" />
        <span className="particle p10" aria-hidden="true" />
        <span className="particle p11" aria-hidden="true" />
        <span className="particle p12" aria-hidden="true" />
      </div>
      {/* Hero Section */}
      <section className="hero-panel">
        <div className="hero-overlay" />
        {/* Department Icons Background */}
        <div className="dept-icons-bg" aria-hidden="true">
          <FaRoad className="dept-icon dept-icon-road" />
          <FaBolt className="dept-icon dept-icon-elec" />
          <FaTrash className="dept-icon dept-icon-garbage" />
          <FaTint className="dept-icon dept-icon-water" />
        </div>
        <div className="hero-content">
          <div className="hero-icon-wrap">
            <FaCity className="hero-icon" />
          </div>
            <h1 className="hero-title">CivicPulse</h1>
            <p className="hero-subtitle">Unified civic infrastructure monitoring & rapid departmental response.</p>
            <div className="hero-accent-row">
              <span className="accent-pill">Secure</span>
              <span className="accent-pill">Coordinated</span>
              <span className="accent-pill">Efficient</span>
            </div>
        </div>
      </section>

      {/* Auth Section */}
      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => { if (!loading) { setError(''); setAuthMode('login'); } }}
              disabled={loading}
            >
              <FaLock /> Login
            </button>
            <button
              type="button"
              className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => { if (!loading) { setError(''); setAuthMode('register'); } }}
              disabled={loading}
            >
              <FaBuilding /> Register
            </button>
          </div>

          {success && authMode === 'register' && (
            <div className="success-message">
              <FaCheckCircle />
              <span>Department registered successfully! You can now login.</span>
            </div>
          )}
          {error && <div className="error-message">{error}</div>}

          {authMode === 'register' && (
            <form className="registration-form" onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label htmlFor="name"><FaBuilding /> Department Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Electricity"
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="type"><FaBuilding /> Department Type *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select Type</option>
                  {departmentTypes.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="address"><FaMapMarkerAlt /> Address *</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter official department address"
                  rows="3"
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password"><FaLock /> Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label><FaMapMarkerAlt /> Location *</label>
                <button
                  type="button"
                  className="location-button"
                  onClick={getCurrentLocation}
                  disabled={loading || locationLoading}
                >
                  <FaCrosshairs /> {locationLoading ? 'Detecting...' : 'Use Current Location'}
                </button>
                {formData.location.lat && formData.location.lng && (
                  <div className="location-display">
                    <FaCheckCircle />
                    <span>{formData.location.lat}, {formData.location.lng}</span>
                  </div>
                )}
                <small>We store coordinates to link issues to service zones.</small>
              </div>
              <div className="form-group">
                <label htmlFor="pdf"><FaFileUpload /> Registration Copy (PDF) *</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="pdf"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    required
                    disabled={loading}
                  />
                  {pdfFile && (
                    <div className="file-info">
                      <FaCheckCircle />
                      <span>{pdfFile.name}</span>
                      <span className="file-size">{(pdfFile.size / 1024).toFixed(1)} KB</span>
                    </div>
                  )}
                </div>
                <small>Official department registration document. Max 5MB.</small>
              </div>
              <button type="submit" className="primary-button" disabled={loading}>
                {loading ? 'Registering...' : 'Create Department Account'}
              </button>
            </form>
          )}

          {authMode === 'login' && (
            <form className="login-form" onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label htmlFor="loginName"><FaBuilding /> Department Name *</label>
                <input
                  id="loginName"
                  type="text"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  placeholder="e.g. elec"
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="loginPassword"><FaLock /> Password *</label>
                <input
                  id="loginPassword"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  disabled={loading}
                />
              </div>
              <button type="submit" className="primary-button" disabled={loading}>
                {loading ? 'Authenticating...' : 'Login'}
              </button>
              <div className="form-footer-text">
                <small>Need an account? <button type="button" className="link-button" onClick={() => setAuthMode('register')} disabled={loading}>Register</button></small>
              </div>
            </form>
          )}

          <div className="below-card-links">
            <small><Link to="/complaints">View Public Complaints</Link> • <Link to="/leaderboard">Leaderboard</Link></small>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Registration;
