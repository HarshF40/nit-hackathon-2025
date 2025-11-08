import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaMapMarkerAlt, FaClock, FaExclamationCircle, FaCheckCircle, FaUser, FaCalendar, FaFilter, FaTimes } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { updateComplaintStatus } from '../services/api';
import './ComplaintsList.css';

const ComplaintsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { complaints = [], status = 'all', departmentName = '' } = location.state || {};
  
  // Log received data for debugging
  console.log('📋 ComplaintsList received:', {
    totalComplaints: complaints.length,
    statusFilter: status,
    departmentName: departmentName,
    firstComplaint: complaints[0]
  });
  
  const [filteredComplaints, setFilteredComplaints] = useState(complaints);
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [localComplaints, setLocalComplaints] = useState(complaints);
  const [updatingIds, setUpdatingIds] = useState(new Set());

  // Handle status change
  const handleStatusChange = async (complaintId, currentStatus) => {
    // Don't allow changing if already resolved
    if (currentStatus === 'resolved' || currentStatus === 'closed' || currentStatus === 'completed') {
      return;
    }

    try {
      setUpdatingIds(prev => new Set([...prev, complaintId]));
      
      // Update status to resolved
      await updateComplaintStatus(complaintId, 'resolved');
      
      // Update local state
      const updatedComplaints = localComplaints.map(c => 
        c.id === complaintId ? { ...c, status: 'resolved' } : c
      );
      setLocalComplaints(updatedComplaints);
      
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(complaintId);
        return newSet;
      });
      
      console.log('✅ Complaint marked as resolved:', complaintId);
    } catch (error) {
      console.error('❌ Failed to update complaint:', error);
      alert('Failed to update complaint status. Please try again.');
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(complaintId);
        return newSet;
      });
    }
  };

  // Filter and sort complaints
  useEffect(() => {
    let filtered = [...localComplaints];

    // Filter by status
    if (status !== 'all') {
      if (status === 'current' || status === 'pending') {
        // Both Current and Pending show the same data - all non-resolved complaints
        filtered = filtered.filter(c => 
          c.status === 'in-progress' || c.status === 'current' || c.status === 'active' ||
          c.status === 'pending' || c.status === 'open' || c.status === 'new'
        );
        console.log('🔍 Filtering for CURRENT/PENDING issues:', filtered.length, 'found');
      } else if (status === 'resolved') {
        filtered = filtered.filter(c => 
          c.status === 'resolved' || c.status === 'closed' || c.status === 'completed'
        );
        console.log('🔍 Filtering for RESOLVED issues:', filtered.length, 'found');
      } else if (status === 'critical') {
        filtered = filtered.filter(c => 
          c.priority === 'critical' || c.priority === 'high' || c.priority === 'urgent' || c.status === 'critical'
        );
        console.log('🔍 Filtering for CRITICAL issues:', filtered.length, 'found');
      } else if (status === 'rejected') {
        filtered = filtered.filter(c => 
          c.status === 'rejected' || c.status === 'declined' || c.status === 'dismissed'
        );
        console.log('🔍 Filtering for REJECTED issues:', filtered.length, 'found');
      }
    }

    // Filter by priority
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(c => c.priority === selectedPriority);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.posterName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortBy === 'priority') {
        const priorityOrder = { critical: 0, high: 1, urgent: 1, medium: 2, low: 3 };
        return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
      }
      return 0;
    });

    console.log('✅ Final filtered complaints:', filtered.length);
    setFilteredComplaints(filtered);
  }, [localComplaints, status, selectedPriority, searchTerm, sortBy]);

  const getStatusIcon = (complaint) => {
    const statusLower = complaint.status.toLowerCase();
    if (statusLower === 'resolved' || statusLower === 'closed' || statusLower === 'completed') {
      return <FaCheckCircle className="status-icon resolved" />;
    } else if (statusLower === 'in-progress' || statusLower === 'current' || statusLower === 'active') {
      return <FaClock className="status-icon current" />;
    } else if (statusLower === 'rejected' || statusLower === 'declined' || statusLower === 'dismissed') {
      return <FaTimes className="status-icon rejected" />;
    } else {
      return <FaExclamationCircle className="status-icon pending" />;
    }
  };

  const getStatusClass = (complaint) => {
    const statusLower = complaint.status.toLowerCase();
    if (statusLower === 'resolved' || statusLower === 'closed' || statusLower === 'completed') {
      return 'resolved';
    } else if (statusLower === 'in-progress' || statusLower === 'current' || statusLower === 'active') {
      return 'in-progress';
    } else if (statusLower === 'rejected' || statusLower === 'declined' || statusLower === 'dismissed') {
      return 'rejected';
    } else {
      return 'pending';
    }
  };

  const getPriorityClass = (priority) => {
    const priorityLower = priority.toLowerCase();
    if (priorityLower === 'critical' || priorityLower === 'high' || priorityLower === 'urgent') {
      return 'critical';
    } else if (priorityLower === 'medium') {
      return 'medium';
    } else {
      return 'low';
    }
  };

  const getStatusTitle = () => {
    if (status === 'current') return 'Current Issues';
    if (status === 'pending') return 'Pending Issues';
    if (status === 'resolved') return 'Resolved Issues';
    if (status === 'critical') return 'Critical Issues';
    if (status === 'rejected') return 'Rejected Issues';
    return 'All Complaints';
  };

  return (
    <div className="complaints-list-page">
      <Navbar 
        title={`${departmentName} Portal`}
        subtitle={getStatusTitle()}
      />

      <div className="complaints-content">
        {/* Header Section */}
        <div className="complaints-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back to Dashboard
          </button>
          <div className="complaints-stats">
            <h2>{getStatusTitle()}</h2>
            <p className="complaints-count">
              Showing {filteredComplaints.length} of {localComplaints.length} complaints
            </p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filter-group">
            <FaFilter />
            <label>Priority:</label>
            <select 
              value={selectedPriority} 
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="date">Date (Newest First)</option>
              <option value="priority">Priority (High to Low)</option>
            </select>
          </div>

          <div className="search-group">
            <input
              type="text"
              placeholder="Search by description, location, or reporter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Complaints List */}
        <div className="complaints-grid">
          {filteredComplaints.length === 0 ? (
            <div className="no-complaints">
              <FaExclamationCircle size={50} />
              <h3>No complaints found</h3>
              <p>Try adjusting your filters or search criteria</p>
            </div>
          ) : (
            filteredComplaints.map((complaint) => (
              <div key={complaint.id} className={`complaint-card ${getStatusClass(complaint)}`}>
                <div className="complaint-header-row">
                  <div className="complaint-id">#{complaint.id}</div>
                  <div className="complaint-badges">
                    <span className={`priority-badge ${getPriorityClass(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                    <span className={`status-badge ${getStatusClass(complaint)}`}>
                      {getStatusIcon(complaint)}
                      {complaint.status}
                    </span>
                  </div>
                </div>

                <div className="complaint-body">
                  {/* Resolve Checkbox */}
                  {(complaint.status !== 'resolved' && complaint.status !== 'closed' && complaint.status !== 'completed') && (
                    <div className="resolve-checkbox-container">
                      <label className="resolve-checkbox">
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => handleStatusChange(complaint.id, complaint.status)}
                          disabled={updatingIds.has(complaint.id)}
                        />
                        <span className="checkbox-label">
                          {updatingIds.has(complaint.id) ? 'Updating...' : 'Mark as Resolved'}
                        </span>
                      </label>
                    </div>
                  )}
                  
                  {(complaint.imageUrl || complaint.imageURL || complaint.image) && (
                    <div className="complaint-image">
                      <img 
                        src={complaint.imageUrl || complaint.imageURL || complaint.image} 
                        alt="Complaint" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          console.warn('Failed to load image for complaint:', complaint.id);
                        }}
                      />
                      <div className="image-url-display">
                        <small>
                          <strong>Image URL:</strong>{' '}
                          <a 
                            href={complaint.imageUrl || complaint.imageURL || complaint.image} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="image-url-link"
                          >
                            {complaint.imageUrl || complaint.imageURL || complaint.image}
                          </a>
                        </small>
                      </div>
                    </div>
                  )}
                  
                  <h3 className="complaint-title">{complaint.description}</h3>
                  <p className="complaint-type">
                    <strong>Type:</strong> {complaint.type}
                  </p>

                  <div className="complaint-details">
                    <div className="detail-item">
                      <FaMapMarkerAlt />
                      <span>{complaint.location}</span>
                    </div>
                    <div className="detail-item">
                      <FaCalendar />
                      <span>{complaint.date}</span>
                    </div>
                    {complaint.posterName && (
                      <div className="detail-item">
                        <FaUser />
                        <span>{complaint.posterName}</span>
                      </div>
                    )}
                  </div>

                  <div className="complaint-coordinates">
                    <small>
                      Coordinates: {
                        (!isNaN(complaint.lat) && !isNaN(complaint.lng)) 
                          ? `${complaint.lat.toFixed(4)}, ${complaint.lng.toFixed(4)}`
                          : 'Location data unavailable'
                      }
                    </small>
                  </div>
                </div>

                <div className="complaint-footer">
                  <button 
                    className="view-map-btn"
                    onClick={() => window.open(`https://www.google.com/maps?q=${complaint.lat},${complaint.lng}`, '_blank')}
                  >
                    <FaMapMarkerAlt /> View on Map
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintsList;
