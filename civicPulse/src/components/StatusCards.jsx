import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaHourglassHalf, FaCheckCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { getStatistics } from '../data/departmentData';
import { getComplaintsByDepartment, transformComplaintData } from '../services/api';
import './StatusCards.css';

const StatusCards = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    current: 0,
    pending: 0,
    resolved: 0,
    critical: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch complaints when component loads
  useEffect(() => {
    const fetchComplaintsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get department ID from localStorage (stored during login)
        const departmentId = localStorage.getItem('departmentId');

        if (!departmentId) {
          console.warn('⚠️ Department ID not found in localStorage');
          setError('Department ID not found. Please login again.');
          setLoading(false);
          return;
        }

        console.log('🔄 Fetching complaints for department ID:', departmentId);

        // Fetch complaints from API
        const response = await getComplaintsByDepartment(parseInt(departmentId));
        const complaints = response.complaints || [];

        console.log('✅ Fetched', complaints.length, 'complaints from API');

        // Transform complaints data
        const transformedComplaints = transformComplaintData(complaints);

        // Calculate statistics from transformed complaints
        const calculatedStats = getStatistics(transformedComplaints);

        console.log('📊 Status Cards Statistics:', calculatedStats);

        // Update state with calculated statistics
        setStats(calculatedStats);
        setLoading(false);

      } catch (err) {
        console.error('❌ Error fetching complaints:', err);
        setError(err.message || 'Failed to fetch complaints data');
        setLoading(false);
        
        // Use default stats on error
        setStats({
          current: 0,
          pending: 0,
          resolved: 0,
          critical: 0,
          rejected: 0
        });
      }
    };

    fetchComplaintsData();
  }, []); // Run once on component mount

  // Handle card click navigation
  const handleCardClick = (status) => {
    if (status === 'resolved') {
      navigate('/resolved-issues');
    } else if (status === 'pending') {
      navigate('/ongoing-issues');
    } else if (status === 'current' || status === 'critical' || status === 'rejected') {
      navigate('/complaints', { 
        state: { 
          status: status
        } 
      });
    }
  };

  const cards = [
    {
      title: 'Current Issues',
      count: loading ? '...' : stats.current,
      icon: <FaClock size={40} />,
      color: '#398AB9',
      status: 'current'
    },
    {
      title: 'Ongoing Issues',
      count: loading ? '...' : stats.pending,
      icon: <FaHourglassHalf size={40} />,
      color: '#FFA500',
      status: 'pending'
    },
    {
      title: 'Resolved Issues',
      count: loading ? '...' : stats.resolved,
      icon: <FaCheckCircle size={40} />,
      color: '#4CAF50',
      status: 'resolved'
    },
    {
      title: 'Critical Issues',
      count: loading ? '...' : stats.critical,
      icon: <FaExclamationTriangle size={40} />,
      color: '#FF4444',
      status: 'critical'
    },
    {
      title: 'Rejected',
      count: loading ? '...' : stats.rejected,
      icon: <FaTimes size={40} />,
      color: '#9E9E9E',
      status: 'rejected'
    },
  ];

  return (
    <div className="status-cards-section">
      {error && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '1rem', 
          backgroundColor: 'rgba(255, 68, 68, 0.1)',
          border: '1px solid rgba(255, 68, 68, 0.3)',
          borderRadius: '8px',
          color: '#FF4444',
          textAlign: 'center'
        }}>
          ⚠️ {error}
        </div>
      )}
      <div className="status-cards-container">
        {cards.map((card, index) => (
          <div 
            key={index} 
            className="status-card"
            onClick={() => handleCardClick(card.status)}
            style={{ cursor: 'pointer' }}
          >
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
