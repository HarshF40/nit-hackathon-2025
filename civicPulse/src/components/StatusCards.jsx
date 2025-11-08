import React from 'react';
import { FaClock, FaHourglassHalf, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { getStatistics } from '../data/dummyData';
import './StatusCards.css';

const StatusCards = () => {
  const stats = getStatistics();

  const cards = [
    {
      title: 'Current Issues',
      count: stats.current,
      icon: <FaClock size={40} />,
      color: '#398AB9',
    },
    {
      title: 'Pending Issues',
      count: stats.pending,
      icon: <FaHourglassHalf size={40} />,
      color: '#FFA500',
    },
    {
      title: 'Resolved Issues',
      count: stats.resolved,
      icon: <FaCheckCircle size={40} />,
      color: '#4CAF50',
    },
    {
      title: 'Critical Issues',
      count: stats.critical,
      icon: <FaExclamationTriangle size={40} />,
      color: '#FF4444',
    },
  ];

  return (
    <div className="status-cards-section">
      <div className="status-cards-container">
        {cards.map((card, index) => (
          <div key={index} className="status-card">
            <div className="card-icon" style={{ color: card.color }}>
              {card.icon}
            </div>
            <div className="card-content">
              <h3 className="card-title">{card.title}</h3>
              <p className="card-count">{card.count}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusCards;
