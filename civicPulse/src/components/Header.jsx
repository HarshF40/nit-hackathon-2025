import React from 'react';
import { FaCity } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <div className="logo">
            <FaCity size={40} />
          </div>
          <h1 className="header-title">Municipal Issue Monitoring Dashboard</h1>
        </div>
        <nav className="header-nav">
          <a href="#home" className="nav-link active">Home</a>
          <a href="#reports" className="nav-link">Reports</a>
          <a href="#departments" className="nav-link">Departments</a>
          <a href="#contact" className="nav-link">Contact</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
