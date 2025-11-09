import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaMapMarkerAlt, 
  FaClock, 
  FaUser, 
  FaCalendar,
  FaPlus,
  FaImage,
  FaUpload,
  FaThumbsDown,
  FaCheckCircle
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import './OngoingIssues.css';

const OngoingIssues = () => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingProgress, setUpdatingProgress] = useState({});
  const [uploadingImage, setUploadingImage] = useState({});
  const [imageDescriptions, setImageDescriptions] = useState({});
  const [uploadedImages, setUploadedImages] = useState({});
  
  // Get department info
  const departmentName = localStorage.getItem('departmentName') || 'Department';
  const departmentId = localStorage.getItem('departmentId');

  // Fetch ongoing complaints
  useEffect(() => {
    fetchOngoingComplaints();
  }, []);

  const fetchOngoingComplaints = async () => {
    try {
      setLoading(true);
      
      if (!departmentId) {
        throw new Error('Department ID not found');
      }

      console.log('🔄 Fetching ongoing complaints for department:', departmentId);

      let data = null;
      let ongoingComplaints = [];

      try {
        // Try the new dedicated endpoint first
        const response = await fetch(`${API_BASE_URL}/complaints/inprogress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            departmentId: parseInt(departmentId)
          }),
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        
        if (response.ok) {
          data = await response.json();
          ongoingComplaints = data.complaints || [];
          console.log('✅ Fetched from /complaints/inprogress endpoint');
        } else {
          throw new Error('Endpoint returned error: ' + response.status);
        }
      } catch (endpointError) {
        console.warn('⚠️ /complaints/inprogress endpoint failed, trying fallback...', endpointError.message);
        
        // Fallback to the old endpoint and filter client-side
        try {
          const fallbackResponse = await fetch(`${API_BASE_URL}/getComplaintsByDepartment/${departmentId}`, {
            signal: AbortSignal.timeout(5000)
          });
          
          if (!fallbackResponse.ok) {
            throw new Error('Fallback endpoint also failed');
          }

          const fallbackData = await fallbackResponse.json();
          
          // Filter only INPROGRESS complaints
          ongoingComplaints = (fallbackData.complaints || []).filter(
            complaint => complaint.status === 'INPROGRESS'
          );
          
          console.log('✅ Fetched from fallback endpoint and filtered');
        } catch (fallbackError) {
          console.error('❌ Both endpoints failed:', fallbackError);
          throw new Error('Unable to fetch complaints. Please check your connection.');
        }
      }

      // Transform data
      const transformedComplaints = ongoingComplaints.map(complaint => {
        // Handle latitude/longitude - might be stored as objects or strings
        let latitude = 0;
        let longitude = 0;
        
        if (complaint.latitude && typeof complaint.latitude === 'object') {
          // If it's an object like {latitude: x, longitude: y}
          latitude = parseFloat(complaint.latitude.latitude) || 0;
          longitude = parseFloat(complaint.latitude.longitude) || 0;
        } else {
          // Normal case - direct values
          latitude = parseFloat(complaint.latitude) || 0;
          longitude = parseFloat(complaint.longitude) || 0;
        }

        return {
          id: complaint.id,
          description: complaint.description,
          type: complaint.type || 'General',
          location: typeof complaint.location === 'string' ? complaint.location : 'Unknown Location',
          lat: latitude,
          lng: longitude,
          date: new Date(complaint.created_at).toLocaleDateString(),
          status: complaint.status,
          priority: complaint.priority || 'medium',
          posterName: complaint.posterName || 'Anonymous',
          image: complaint.imageURL || complaint.imageUrl || null,
          progress: complaint.percentageComplete || 0,
          downvotes: complaint.downvotes || 0
        };
      });

      setComplaints(transformedComplaints);
      console.log('✅ Loaded', transformedComplaints.length, 'ongoing complaints');
    } catch (error) {
      console.error('❌ Error fetching ongoing complaints:', error);
      alert('Failed to load ongoing complaints: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle progress update
  const handleProgressUpdate = async (complaintId) => {
    try {
      setUpdatingProgress(prev => ({ ...prev, [complaintId]: true }));

      const response = await fetch(`${API_BASE_URL}/updateProgress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          complaintId: complaintId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update progress');
      }

      const data = await response.json();
      console.log('✅ Progress updated:', data);

      // Update local state
      setComplaints(prevComplaints =>
        prevComplaints.map(complaint =>
          complaint.id === complaintId
            ? { ...complaint, progress: data.complaint.percentageComplete }
            : complaint
        )
      );

      // If progress reaches 100%, refresh the list (complaint might move to resolved)
      if (data.complaint.percentageComplete >= 100) {
        setTimeout(() => {
          fetchOngoingComplaints();
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Error updating progress:', error);
      alert('Failed to update progress: ' + error.message);
    } finally {
      setUpdatingProgress(prev => ({ ...prev, [complaintId]: false }));
    }
  };

  // Handle image upload
  const handleImageUpload = async (complaintId, file) => {
    if (!file) return;

    const description = imageDescriptions[complaintId] || '';
    
    if (!description.trim()) {
      alert('Please enter a description for the image');
      return;
    }

    try {
      setUploadingImage(prev => ({ ...prev, [complaintId]: true }));

      const formData = new FormData();
      formData.append('image', file);
      formData.append('complaintId', complaintId);
      formData.append('description', description);

      // TODO: Replace with actual upload endpoint
      const response = await fetch(`${API_BASE_URL}/uploadProgressImage`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      console.log('✅ Image uploaded:', data);

      // Store uploaded image locally
      setUploadedImages(prev => ({
        ...prev,
        [complaintId]: [...(prev[complaintId] || []), {
          url: data.imageUrl,
          description: description,
          timestamp: new Date().toISOString()
        }]
      }));

      // Clear description input
      setImageDescriptions(prev => ({ ...prev, [complaintId]: '' }));

      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      alert('Failed to upload image: ' + error.message);
    } finally {
      setUploadingImage(prev => ({ ...prev, [complaintId]: false }));
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

  const getProgressSteps = (progress) => {
    const steps = [0, 25, 50, 75, 100];
    return steps.map(step => ({
      value: step,
      completed: progress >= step
    }));
  };

  if (loading) {
    return (
      <div className="ongoing-issues-page">
        <Navbar 
          title={`${departmentName} Portal`}
          subtitle="Ongoing Issues"
        />
        <div className="ongoing-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading ongoing issues...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ongoing-issues-page">
      <Navbar 
        title={`${departmentName} Portal`}
        subtitle="Ongoing Issues Management"
      />

      <div className="ongoing-content">
        {/* Header */}
        <div className="ongoing-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back to Dashboard
          </button>
          <div className="ongoing-stats">
            <h2>Ongoing Issues</h2>
            <p className="complaints-count">
              Total: {complaints.length} active complaints
            </p>
          </div>
        </div>

        {/* Complaints Grid */}
        {complaints.length === 0 ? (
          <div className="no-complaints">
            <FaCheckCircle size={60} color="#4CAF50" />
            <h3>No Ongoing Issues</h3>
            <p>All complaints are either pending or resolved</p>
          </div>
        ) : (
          <div className="ongoing-grid">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="ongoing-card">
                {/* Card Header */}
                <div className="ongoing-card-header">
                  <div className="complaint-id-section">
                    <span className="complaint-id">#{complaint.id}</span>
                    <span className={`priority-badge ${getPriorityClass(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                  </div>
                  <div className="downvotes-section">
                    <FaThumbsDown className="downvote-icon" />
                    <span className="downvote-count">{complaint.downvotes}</span>
                  </div>
                </div>

                {/* Complaint Image */}
                {complaint.image && (
                  <div className="complaint-image">
                    <img 
                      src={complaint.image} 
                      alt="Complaint" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Complaint Details */}
                <div className="complaint-details-section">
                  <h3 className="complaint-title">{complaint.description}</h3>
                  <p className="complaint-type">
                    <strong>Type:</strong> {complaint.type}
                  </p>

                  <div className="detail-items">
                    <div className="detail-item">
                      <FaMapMarkerAlt />
                      <span>{complaint.location}</span>
                    </div>
                    <div className="detail-item">
                      <FaCalendar />
                      <span>{complaint.date}</span>
                    </div>
                    <div className="detail-item">
                      <FaUser />
                      <span>{complaint.posterName}</span>
                    </div>
                  </div>

                  <div className="coordinates">
                    <small>
                      📍 {complaint.lat.toFixed(4)}, {complaint.lng.toFixed(4)}
                    </small>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="progress-section">
                  <div className="progress-header">
                    <h4>Work Progress</h4>
                    <span className="progress-percentage">{complaint.progress}%</span>
                  </div>

                  {/* Progress Steps */}
                  <div className="progress-steps">
                    {getProgressSteps(complaint.progress).map((step, index) => (
                      <div 
                        key={step.value} 
                        className={`progress-step ${step.completed ? 'completed' : ''}`}
                      >
                        <div className="step-circle">
                          {step.completed ? '✓' : step.value}
                        </div>
                        {index < 4 && (
                          <div className={`step-line ${step.completed ? 'completed' : ''}`}></div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Update Progress Button */}
                  {complaint.progress < 100 && (
                    <button
                      className="update-progress-btn"
                      onClick={() => handleProgressUpdate(complaint.id)}
                      disabled={updatingProgress[complaint.id]}
                    >
                      <FaPlus />
                      {updatingProgress[complaint.id] ? 'Updating...' : 'Update Progress (+25%)'}
                    </button>
                  )}

                  {complaint.progress >= 100 && (
                    <div className="completion-message">
                      <FaCheckCircle /> Work Completed!
                    </div>
                  )}
                </div>

                {/* Image Upload Section */}
                <div className="image-upload-section">
                  <h4><FaImage /> Upload Progress Photo</h4>
                  
                  <div className="upload-form">
                    <textarea
                      placeholder="Enter image description..."
                      value={imageDescriptions[complaint.id] || ''}
                      onChange={(e) => setImageDescriptions(prev => ({
                        ...prev,
                        [complaint.id]: e.target.value
                      }))}
                      className="description-input"
                      rows="2"
                    />
                    
                    <div className="upload-controls">
                      <input
                        type="file"
                        accept="image/*"
                        id={`file-input-${complaint.id}`}
                        className="file-input-hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleImageUpload(complaint.id, e.target.files[0]);
                          }
                        }}
                        disabled={uploadingImage[complaint.id]}
                      />
                      <label 
                        htmlFor={`file-input-${complaint.id}`}
                        className={`upload-btn ${uploadingImage[complaint.id] ? 'disabled' : ''}`}
                      >
                        <FaUpload />
                        {uploadingImage[complaint.id] ? 'Uploading...' : 'Upload Image'}
                      </label>
                    </div>
                  </div>

                  {/* Display uploaded images */}
                  {uploadedImages[complaint.id] && uploadedImages[complaint.id].length > 0 && (
                    <div className="uploaded-images-list">
                      <h5>Uploaded Images:</h5>
                      {uploadedImages[complaint.id].map((img, idx) => (
                        <div key={idx} className="uploaded-image-item">
                          <img src={img.url} alt={`Progress ${idx + 1}`} />
                          <p className="image-desc">{img.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* View on Map */}
                <div className="card-footer">
                  <button 
                    className="view-map-btn"
                    onClick={() => window.open(`https://www.google.com/maps?q=${complaint.lat},${complaint.lng}`, '_blank')}
                  >
                    <FaMapMarkerAlt /> View on Map
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OngoingIssues;