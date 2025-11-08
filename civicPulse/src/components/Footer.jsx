import React from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaCity } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <div className="footer-logo">
            <FaCity size={32} />
            <h3>Municipal Authority</h3>
          </div>
          <p className="footer-description">
            Dedicated to improving civic services and infrastructure through efficient issue monitoring and resolution.
          </p>
        </div>

        <div className="footer-section">
          <h4>Contact Information</h4>
          <div className="contact-info">
            <div className="contact-item">
              <FaPhone />
              <span>+91 11 2345 6789</span>
            </div>
            <div className="contact-item">
              <FaEnvelope />
              <span>support@municipaldashboard.gov.in</span>
            </div>
            <div className="contact-item">
              <FaMapMarkerAlt />
              <span>Municipal Corporation Building, New Delhi - 110001</span>
            </div>
          </div>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#reports">Reports</a></li>
            <li><a href="#departments">Departments</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#terms">Terms of Service</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Office Hours</h4>
          <div className="office-hours">
            <p><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM</p>
            <p><strong>Saturday:</strong> 9:00 AM - 2:00 PM</p>
            <p><strong>Sunday:</strong> Closed</p>
            <p className="emergency-note">Emergency services available 24/7</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Municipal Issue Monitoring Dashboard. All rights reserved.</p>
        <p>Developed for better civic governance and citizen welfare</p>
      </div>
    </footer>
  );
};

export default Footer;
