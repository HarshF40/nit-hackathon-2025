import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaMapMarkerAlt, FaClock, FaExclamationCircle, FaCheckCircle, FaUser, FaCalendar, FaFilter, FaTimes, FaPlay, FaUpload, FaImage } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { updateComplaintStatus, startComplaint, updateComplaintProgress, uploadProgressImage } from '../services/api';
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
  const [selectedTeams, setSelectedTeams] = useState({}); // Track selected team for each complaint
  const [expandedCards, setExpandedCards] = useState(new Set()); // Track expanded ongoing cards
  const [progressUpdates, setProgressUpdates] = useState({}); // Track progress for each complaint
  const [uploadingImages, setUploadingImages] = useState({}); // Track image uploads
  
  // Get available teams from localStorage
  const getAvailableTeams = () => {
    const allTeams = localStorage.getItem('allTeams');
    const currentDepartment = localStorage.getItem('authType') || 'ELEC';
    if (allTeams) {
      const teams = JSON.parse(allTeams);
      return teams.filter(team => team.department === currentDepartment);
    }
    return [];
  };

  // Handle starting a complaint (assign team and move to ongoing)
  const handleStartComplaint = async (complaintId) => {
    const selectedTeam = selectedTeams[complaintId];
    if (!selectedTeam) {
      alert('Please select a team to assign this complaint');
      return;
    }

    try {
      setUpdatingIds(prev => new Set([...prev, complaintId]));
      
      // Call API to start complaint
      await startComplaint(complaintId, selectedTeam);
      
      // Update local state
      const updatedComplaints = localComplaints.map(c => 
        c.id === complaintId ? { 
          ...c, 
          status: 'in-progress',
          assignedTeam: selectedTeam,
          progress: 0
        } : c
      );
      setLocalComplaints(updatedComplaints);
      
      // Initialize progress for this complaint
      setProgressUpdates(prev => ({
        ...prev,
        [complaintId]: { progress: 0, images: [] }
      }));
      
      // Expand the card to show progress
      setExpandedCards(prev => new Set([...prev, complaintId]));
      
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(complaintId);
        return newSet;
      });
      
      console.log('✅ Complaint started with team:', selectedTeam);
    } catch (error) {
      console.error('❌ Failed to start complaint:', error);
      alert('Failed to start complaint. Please try again.');
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(complaintId);
        return newSet;
      });
    }
  };

  // Handle progress update
  const handleProgressUpdate = async (complaintId, newProgress) => {
    try {
      await updateComplaintProgress(complaintId, newProgress);
      
      // Update local state
      setProgressUpdates(prev => ({
        ...prev,
        [complaintId]: {
          ...prev[complaintId],
          progress: newProgress
        }
      }));
      
      // If 100%, mark as resolved
      if (newProgress === 100) {
        const updatedComplaints = localComplaints.map(c => 
          c.id === complaintId ? { ...c, status: 'resolved' } : c
        );
        setLocalComplaints(updatedComplaints);
        setExpandedCards(prev => {
          const newSet = new Set(prev);
          newSet.delete(complaintId);
          return newSet;
        });
      }
      
      console.log('✅ Progress updated:', complaintId, newProgress);
    } catch (error) {
      console.error('❌ Failed to update progress:', error);
      alert('Failed to update progress. Please try again.');
    }
  };

  // Handle image upload
  const handleImageUpload = async (complaintId, file) => {
    if (!file) return;
    
    try {
      setUploadingImages(prev => ({ ...prev, [complaintId]: true }));
      
      const imageUrl = await uploadProgressImage(complaintId, file);
      
      // Update local progress state with new image
      setProgressUpdates(prev => ({
        ...prev,
        [complaintId]: {
          ...prev[complaintId],
          images: [...(prev[complaintId]?.images || []), imageUrl]
        }
      }));
      
      setUploadingImages(prev => ({ ...prev, [complaintId]: false }));
      
      console.log('✅ Image uploaded:', imageUrl);
    } catch (error) {
      console.error('❌ Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
      setUploadingImages(prev => ({ ...prev, [complaintId]: false }));
    }
  };

  // Handle status change (for resolved)
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
      if (status === 'current') {
        // Current = NEW complaints that need to be started (status = pending)
        filtered = filtered.filter(c => 
          c.status === 'pending' || c.status === 'open' || c.status === 'new'
        );
        console.log('🔍 Filtering for CURRENT issues (pending):', filtered.length, 'found');
      } else if (status === 'pending') {
        // Pending/Ongoing = Complaints that have been STARTED (status = in-progress)
        filtered = filtered.filter(c => 
          c.status === 'in-progress' || c.status === 'active' || c.status === 'current'
        );
        console.log('🔍 Filtering for ONGOING issues (in-progress):', filtered.length, 'found');
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
    if (status === 'pending') return 'Ongoing Issues';
    if (status === 'ongoing') return 'Ongoing Issues';
    if (status === 'in-progress') return 'Ongoing Issues';
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
                  {/* Start Complaint with Team Selection (ONLY for pending complaints) */}
                  {complaint.status === 'pending' && (
                    <div className="start-complaint-container">
                      <div className="team-selection-group">
                        <label htmlFor={`team-${complaint.id}`}>Assign Team:</label>
                        <select
                          id={`team-${complaint.id}`}
                          className="team-dropdown"
                          value={selectedTeams[complaint.id] || ''}
                          onChange={(e) => setSelectedTeams(prev => ({
                            ...prev,
                            [complaint.id]: e.target.value
                          }))}
                        >
                          <option value="">Select a team...</option>
                          {getAvailableTeams().map(team => (
                            <option key={team.id} value={team.name}>
                              {team.name} ({team.members.length} members)
                            </option>
                          ))}
                        </select>
                      </div>
                      <button 
                        className="start-button"
                        onClick={() => handleStartComplaint(complaint.id)}
                        disabled={!selectedTeams[complaint.id] || updatingIds.has(complaint.id)}
                      >
                        <FaPlay /> {updatingIds.has(complaint.id) ? 'Starting...' : 'Start'}
                      </button>
                    </div>
                  )}

                  {/* Progress Tracking (ONLY for in-progress/ongoing complaints) */}
                  {complaint.status === 'in-progress' && (
                    <div className="ongoing-complaint-section">
                      <div className="ongoing-header">
                        <span className="assigned-team">
                          <FaUser /> Assigned to: <strong>{complaint.assignedTeam || selectedTeams[complaint.id] || 'Team'}</strong>
                        </span>
                        <button 
                          className="toggle-progress-btn"
                          onClick={() => {
                            setExpandedCards(prev => {
                              const newSet = new Set(prev);
                              if (newSet.has(complaint.id)) {
                                newSet.delete(complaint.id);
                              } else {
                                newSet.add(complaint.id);
                              }
                              return newSet;
                            });
                          }}
                        >
                          {expandedCards.has(complaint.id) ? 'Hide Progress' : 'Show Progress'}
                        </button>
                      </div>

                      {expandedCards.has(complaint.id) && (
                        <div className="progress-section">
                          <h4>Work Progress</h4>
                          
                          {/* Progress Bar */}
                          <div className="progress-bar-container">
                            <div className="progress-bar-track">
                              <div 
                                className="progress-bar-fill"
                                style={{ width: `${progressUpdates[complaint.id]?.progress || 0}%` }}
                              ></div>
                            </div>
                            <div className="progress-percentage">
                              {progressUpdates[complaint.id]?.progress || 0}%
                            </div>
                          </div>

                          {/* Progress Buttons */}
                          <div className="progress-buttons">
                            <button 
                              className={`progress-btn ${(progressUpdates[complaint.id]?.progress || 0) >= 25 ? 'active' : ''}`}
                              onClick={() => handleProgressUpdate(complaint.id, 25)}
                              disabled={(progressUpdates[complaint.id]?.progress || 0) >= 25}
                            >
                              25%
                            </button>
                            <button 
                              className={`progress-btn ${(progressUpdates[complaint.id]?.progress || 0) >= 50 ? 'active' : ''}`}
                              onClick={() => handleProgressUpdate(complaint.id, 50)}
                              disabled={(progressUpdates[complaint.id]?.progress || 0) >= 50}
                            >
                              50%
                            </button>
                            <button 
                              className={`progress-btn ${(progressUpdates[complaint.id]?.progress || 0) >= 75 ? 'active' : ''}`}
                              onClick={() => handleProgressUpdate(complaint.id, 75)}
                              disabled={(progressUpdates[complaint.id]?.progress || 0) >= 75}
                            >
                              75%
                            </button>
                            <button 
                              className={`progress-btn ${(progressUpdates[complaint.id]?.progress || 0) >= 100 ? 'active' : ''}`}
                              onClick={() => handleProgressUpdate(complaint.id, 100)}
                              disabled={(progressUpdates[complaint.id]?.progress || 0) >= 100}
                            >
                              100%
                            </button>
                          </div>

                          {/* Image Upload */}
                          <div className="image-upload-section">
                            <label className="upload-label">
                              <FaImage /> Upload Progress Photo
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleImageUpload(complaint.id, e.target.files[0]);
                                }
                              }}
                              className="file-input"
                              disabled={uploadingImages[complaint.id]}
                            />
                            {uploadingImages[complaint.id] && (
                              <span className="uploading-text">Uploading...</span>
                            )}
                          </div>

                          {/* Uploaded Images */}
                          {progressUpdates[complaint.id]?.images?.length > 0 && (
                            <div className="uploaded-images">
                              <h5>Progress Photos:</h5>
                              <div className="images-grid">
                                {progressUpdates[complaint.id].images.map((img, idx) => (
                                  <img key={idx} src={img} alt={`Progress ${idx + 1}`} className="progress-image" />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
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
