import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaUsers, 
  FaClipboardList, 
  FaTrophy, 
  FaSignOutAlt,
  FaBolt,
  FaTint,
  FaRoad,
  FaTrash
} from 'react-icons/fa';
import './Navbar.css';

const Navbar = ({ title, subtitle, showNavLinks = true }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('authType');
    localStorage.removeItem('departmentName');
    localStorage.removeItem('isAuthenticated');
    navigate('/register');
  };

  const getDepartmentIcon = () => {
    const authType = localStorage.getItem('authType');
    switch(authType) {
      case 'ELEC': return <FaBolt size={24} />;
      case 'WATER': return <FaTint size={24} />;
      case 'ROAD': return <FaRoad size={24} />;
      case 'GARB': return <FaTrash size={24} />;
      default: return null;
    }
  };

  const isActive = (path) => location.pathname === path;

  const getHomePath = () => {
    const authType = localStorage.getItem('authType');
    switch(authType) {
      case 'ELEC': return '/electricity';
      case 'WATER': return '/water';
      case 'ROAD': return '/roads';
      case 'GARB': return '/garbage';
      default: return '/';
    }
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <div className="navbar-left">
          <div className="navbar-icon">
            {getDepartmentIcon()}
          </div>
          <div className="navbar-text">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
        </div>
        
        {showNavLinks && (
          <div className="navbar-right">
            <nav className="navbar-links">
              <button 
                onClick={() => navigate(getHomePath())} 
                className={`nav-button ${isActive(getHomePath()) ? 'active' : ''}`}
              >
                <FaHome />
                <span>Home</span>
              </button>
              <button 
                onClick={() => navigate('/teams')} 
                className={`nav-button ${isActive('/teams') ? 'active' : ''}`}
              >
                <FaUsers />
                <span>Team</span>
              </button>
              <button 
                onClick={() => navigate('/leaderboard')} 
                className={`nav-button ${isActive('/leaderboard') ? 'active' : ''}`}
              >
                <FaTrophy />
                <span>Leaderboard</span>
              </button>
            </nav>
            <button onClick={handleLogout} className="logout-btn">
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
