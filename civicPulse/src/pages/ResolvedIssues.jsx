import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMapMarkerAlt, FaCheckCircle, FaUser, FaCalendar, FaFilter, FaClock } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { getDepartmentId, getComplaintsByDepartment, transformComplaintData } from '../services/api';
import './ResolvedIssues.css';

const ResolvedIssues = () => {
  const navigate = useNavigate();
  const [resolvedIssues, setResolvedIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const departmentName = localStorage.getItem('departmentName') || 'Electricity Department';

  // Fetch resolved issues
  useEffect(() => {
    const fetchResolvedIssues = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get department ID
        const deptIdResponse = await getDepartmentId(departmentName);
        const departmentId = deptIdResponse.departmentId;

        // Get all complaints
        const complaintsResponse = await getComplaintsByDepartment(departmentId);
        const complaints = complaintsResponse.complaints;

        // Transform and filter for resolved only
        const transformedComplaints = transformComplaintData(complaints);
        const resolved = transformedComplaints.filter(c => 
          c.status === 'resolved' || c.status === 'closed' || c.status === 'completed'
        );

        console.log('✅ Resolved issues loaded:', resolved.length);
        setResolvedIssues(resolved);
        setLoading(false);
      } catch (err) {
        console.error('❌ Failed to fetch resolved issues:', err);
        setError('Failed to load resolved issues');
        setLoading(false);
      }
    };

    fetchResolvedIssues();
  }, [departmentName]);

  // Filter and sort
  useEffect(() => {
    let filtered = [...resolvedIssues];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(issue =>
        issue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.posterName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortBy === 'oldest') {
        return new Date(a.date) - new Date(b.date);
      }
      return 0;
    });

    setFilteredIssues(filtered);
  }, [resolvedIssues, searchTerm, sortBy]);

  return (
    <div className="resolved-issues-page">
      <Navbar 
        title={`${departmentName} Portal`}
        subtitle="Resolved Issues"
      />

      <div className="resolved-content">
        {/* Header */}
        <div className="resolved-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back to Dashboard
          </button>
          <div className="resolved-stats">
            <div className="stats-icon">
              <FaCheckCircle size={50} />
            </div>
            <div className="stats-info">
              <h2>Resolved Issues</h2>
              <p className="resolved-count">
                {filteredIssues.length} of {resolvedIssues.length} issues shown
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-group">
            <input
              type="text"
              placeholder="Search resolved issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <FaFilter />
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="date">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading resolved issues...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error-container">
            <p>❌ {error}</p>
          </div>
        )}

        {/* Resolved Issues Grid */}
        {!loading && !error && (
          <div className="resolved-grid">
            {filteredIssues.length === 0 ? (
              <div className="no-issues">
                <FaCheckCircle size={50} color="#4CAF50" />
                <h3>No resolved issues found</h3>
                <p>{searchTerm ? 'Try adjusting your search' : 'All issues are still pending or in progress'}</p>
              </div>
            ) : (
              filteredIssues.map((issue) => (
                <div key={issue.id} className="resolved-card">
                  <div className="resolved-card-header">
                    <div className="issue-id">#{issue.id}</div>
                    <div className="resolved-badge">
                      <FaCheckCircle /> Resolved
                    </div>
                  </div>

                  <div className="resolved-card-body">
                    {issue.image && (
                      <div className="resolved-image">
                        <img 
                          src={issue.image} 
                          alt="Resolved Issue" 
                          onError={(e) => e.target.style.display = 'none'}
                        />
                        <div className="image-url-display">
                          <small>
                            <strong>Image URL:</strong>{' '}
                            <a 
                              href={issue.image} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="image-url-link"
                            >
                              {issue.image}
                            </a>
                          </small>
                        </div>
                      </div>
                    )}

                    <h3 className="issue-title">{issue.description}</h3>
                    <p className="issue-type">
                      <strong>Type:</strong> {issue.type}
                    </p>

                    <div className="issue-details">
                      <div className="detail-item">
                        <FaMapMarkerAlt />
                        <span>{issue.location}</span>
                      </div>
                      <div className="detail-item">
                        <FaCalendar />
                        <span>Resolved on: {issue.date}</span>
                      </div>
                      {issue.posterName && (
                        <div className="detail-item">
                          <FaUser />
                          <span>Reported by: {issue.posterName}</span>
                        </div>
                      )}
                    </div>

                    <div className="issue-coordinates">
                      <small>
                        {(!isNaN(issue.lat) && !isNaN(issue.lng))
                          ? `Coordinates: ${issue.lat.toFixed(4)}, ${issue.lng.toFixed(4)}`
                          : 'Location data unavailable'
                        }
                      </small>
                    </div>
                  </div>

                  <div className="resolved-card-footer">
                    <button 
                      className="view-map-btn"
                      onClick={() => window.open(`https://www.google.com/maps?q=${issue.lat},${issue.lng}`, '_blank')}
                    >
                      <FaMapMarkerAlt /> View on Map
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResolvedIssues;
