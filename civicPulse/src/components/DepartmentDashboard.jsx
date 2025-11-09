import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaClock, FaHourglassHalf, FaCheckCircle, FaExclamationTriangle, FaChartLine, FaChartBar, FaTimes, FaRobot } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { getStatistics, departmentColors } from '../data/departmentData';
import { getDepartmentId, getComplaintsByDepartment, transformComplaintData } from '../services/api';
import 'leaflet/dist/leaflet.css';
import './DepartmentDashboard.css';

const DepartmentDashboard = ({ 
  issuesData: fallbackIssuesData, 
  historicalData: fallbackHistoricalData, 
  additionalFeature 
}) => {
  const [chartType, setChartType] = useState('line');
  const [selectedMonth, setSelectedMonth] = useState('10');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [issuesData, setIssuesData] = useState(fallbackIssuesData || []);
  const [historicalData, setHistoricalData] = useState(fallbackHistoricalData || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Get department name from localStorage
  const departmentName = localStorage.getItem('departmentName') || 'Electricity Department';

  // Map department name to type code for colors
  const getDepartmentTypeFromName = (name) => {
    const mapping = {
      'Electricity Department': 'ELEC',
      'Water Department': 'WATER',
      'Roads Department': 'ROAD',
      'Garbage Department': 'GARB',
    };
    return mapping[name] || 'ELEC';
  };

  const departmentType = getDepartmentTypeFromName(departmentName);

  const stats = getStatistics(issuesData);
  // Center map on Goa (Panjim coordinates: 15.4909, 73.8278)
  const center = issuesData.length > 0 && issuesData[0].lat && issuesData[0].lng 
    ? [issuesData[0].lat, issuesData[0].lng] 
    : [15.4909, 73.8278]; // Goa coordinates

  // Fetch real-time complaints data
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get department ID from localStorage (stored during login)
        let departmentId = localStorage.getItem('departmentId');
        
        // If departmentId is not in localStorage, fetch it using department name
        if (!departmentId) {
          console.log('⚠️ Department ID not found in localStorage, fetching...');
          const deptIdResponse = await getDepartmentId(departmentName);
          departmentId = deptIdResponse.departmentId;
          localStorage.setItem('departmentId', departmentId.toString());
          console.log('✅ Department ID fetched and stored:', departmentId);
        } else {
          console.log('✅ Using stored Department ID:', departmentId);
        }

        // Get complaints for this department
        const complaintsResponse = await getComplaintsByDepartment(parseInt(departmentId));
        const complaints = complaintsResponse.complaints;
        console.log('✅ Received complaints:', complaints.length, 'complaints');
        console.log('📍 First complaint data:', complaints[0]);

        // Transform complaints data for UI
        const transformedComplaints = transformComplaintData(complaints);
        console.log('✅ Transformed complaints:', transformedComplaints.length, 'complaints');
        console.log('📍 First transformed complaint:', transformedComplaints[0]);
        
        // Log status breakdown for debugging
        const statusBreakdown = {};
        const priorityBreakdown = {};
        const complaintsWithImages = transformedComplaints.filter(c => c.image).length;
        
        transformedComplaints.forEach(c => {
          statusBreakdown[c.status] = (statusBreakdown[c.status] || 0) + 1;
          priorityBreakdown[c.priority] = (priorityBreakdown[c.priority] || 0) + 1;
        });
        
        console.log('📊 Status breakdown:', statusBreakdown);
        console.log('🎯 Priority breakdown:', priorityBreakdown);
        console.log('🖼️ Complaints with images:', complaintsWithImages, '/', transformedComplaints.length);
        
        // Calculate and log statistics
        const calculatedStats = getStatistics(transformedComplaints);
        console.log('📈 Calculated Dashboard Statistics:');
        console.log('   - Current Issues:', calculatedStats.current);
        console.log('   - Ongoing Issues:', calculatedStats.pending);
        console.log('   - Resolved Issues:', calculatedStats.resolved);
        console.log('   - Critical Issues:', calculatedStats.critical);
        console.log('   - Rejected Issues:', calculatedStats.rejected);
        console.log('   - Total Complaints:', transformedComplaints.length);
        
        setIssuesData(transformedComplaints);

        // Create comprehensive historical data from complaints for charts
        const historicalMap = {};
        
        transformedComplaints.forEach(complaint => {
          // Extract date components
          const dateObj = new Date(complaint.date);
          const dateKey = complaint.date; // Use original date format
          
          if (!historicalMap[dateKey]) {
            historicalMap[dateKey] = { 
              date: dateKey,
              total: 0,
              pending: 0,
              'in-progress': 0,
              resolved: 0,
              critical: 0
            };
          }
          
          // Count by status
          historicalMap[dateKey].total++;
          
          if (complaint.status === 'pending' || complaint.status === 'open' || complaint.status === 'new') {
            historicalMap[dateKey].pending++;
          } else if (complaint.status === 'in-progress' || complaint.status === 'current' || complaint.status === 'active') {
            historicalMap[dateKey]['in-progress']++;
          } else if (complaint.status === 'resolved' || complaint.status === 'closed' || complaint.status === 'completed') {
            historicalMap[dateKey].resolved++;
          }
          
          // Count critical priority
          if (complaint.priority === 'critical' || complaint.priority === 'high' || complaint.priority === 'urgent') {
            historicalMap[dateKey].critical++;
          }
        });
        
        // Convert to array and sort by date
        const historical = Object.values(historicalMap).sort((a, b) => 
          new Date(a.date) - new Date(b.date)
        );
        
        console.log('📈 Historical data created:', historical.length, 'data points');
        
        setHistoricalData(historical.length > 0 ? historical : fallbackHistoricalData);

        setLoading(false);
      } catch (err) {
        console.warn('Backend unavailable - using local data:', err.message);
        
        // Set user-friendly error message
        if (err.message.includes('timeout') || err.message.includes('Failed to fetch')) {
          setError('Backend server offline. Displaying local demo data.');
        } else {
          setError(err.message);
        }
        
        // Use fallback data if API fails
        setIssuesData(fallbackIssuesData || []);
        setHistoricalData(fallbackHistoricalData || []);
        setLoading(false);
      }
    };

    if (departmentName && fallbackIssuesData) {
      fetchComplaints();
    } else {
      // If no fallback data, just stop loading
      setLoading(false);
    }
  }, [departmentName, fallbackIssuesData, fallbackHistoricalData]);

  const months = [
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
  ];

  const years = [
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' },
  ];

  const filteredData = historicalData.filter(item => {
    try {
      // Parse the date from the complaint date format (e.g., "10/24/2025")
      const dateParts = item.date.split('/');
      let month, day, year;
      
      if (dateParts.length === 3) {
        // Format: MM/DD/YYYY or M/D/YYYY
        month = dateParts[0].padStart(2, '0');
        day = dateParts[1].padStart(2, '0');
        year = dateParts[2];
      } else {
        // Fallback: try to parse as date string
        const dateObj = new Date(item.date);
        month = String(dateObj.getMonth() + 1).padStart(2, '0');
        year = String(dateObj.getFullYear());
      }
      
      return year === selectedYear && month === selectedMonth;
    } catch (e) {
      console.warn('Error parsing date:', item.date);
      return false;
    }
  });

  // If no data for selected month/year, show all data
  const displayData = filteredData.length > 0 ? filteredData : historicalData.slice(-30);

  const handleLogout = () => {
    localStorage.removeItem('authType');
    localStorage.removeItem('userId');
    localStorage.removeItem('isAuthenticated');
    navigate('/register');
  };

  const ChartComponent = chartType === 'line' ? LineChart : BarChart;
  const DataComponent = chartType === 'line' ? Line : Bar;

  const statusCards = [
    {
      title: 'Current Issues',
      count: stats.current,
      icon: <FaClock size={35} />,
      color: '#398AB9',
      status: 'current',
    },
    {
      title: 'Ongoing Issues',
      count: stats.pending,
      icon: <FaHourglassHalf size={35} />,
      color: '#FFA500',
      status: 'pending',
    },
    {
      title: 'Resolved Issues',
      count: stats.resolved,
      icon: <FaCheckCircle size={35} />,
      color: '#4CAF50',
      status: 'resolved',
    },
    {
      title: 'Critical Issues',
      count: stats.critical,
      icon: <FaExclamationTriangle size={35} />,
      color: '#FF4444',
      status: 'critical',
    },
    {
      title: 'Rejected',
      count: stats.rejected,
      icon: <FaTimes size={35} />,
      color: '#9E9E9E',
      status: 'rejected',
    },
  ];

  const handleCardClick = (status) => {
    // Navigate to Resolved Issues page if status is resolved
    if (status === 'resolved') {
      navigate('/resolved-issues');
    } else {
      // Navigate to Complaints List for other statuses
      navigate('/complaints', { 
        state: { 
          complaints: issuesData, 
          status: status,
          departmentName: departmentName
        } 
      });
    }
  };

  const handleAISuggestions = () => {
    // Navigate to AI Suggestions page with all complaints data
    navigate('/ai-suggestions', {
      state: {
        complaints: issuesData,
        departmentName: departmentName
      }
    });
  };

  return (
    <div className="department-dashboard">
      <Navbar 
        title={`${departmentName} Portal`} 
        subtitle="Monitor and manage department operations"
      />

      <div className="dashboard-content">
        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading real-time data...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="info-container">
            <p className="info-message">ℹ️ {error}</p>
            <p className="info-note">The application is running in demo mode with sample data.</p>
          </div>
        )}

        {/* Heat Map Section */}
        <section className="map-section">
          <h2 className="section-title">
            Issue Locations - 7 KM Radius
            {!loading && !error && <span className="data-badge live">Live Data</span>}
            {!loading && error && <span className="data-badge demo">Demo Mode</span>}
          </h2>
          <div className="map-container">
            <MapContainer
              center={center}
              zoom={13}
              style={{ height: '100%', width: '100%', borderRadius: '8px' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {issuesData
                .filter(issue => issue.lat && issue.lng) // Only show issues with valid coordinates
                .map((issue) => (
                <CircleMarker
                  key={issue.id}
                  center={[issue.lat, issue.lng]}
                  radius={8}
                  pathOptions={{
                    color: departmentColors[departmentType],
                    fillColor: departmentColors[departmentType],
                    fillOpacity: 0.6,
                    weight: 2,
                  }}
                >
                  <Popup maxWidth={300}>
                    <div className="popup-content">
                      {issue.image && (
                        <div className="popup-image">
                          <img 
                            src={issue.image} 
                            alt="Complaint" 
                            onError={(e) => {
                              e.target.style.display = 'none';
                              console.warn('Failed to load image for complaint:', issue.id);
                            }}
                          />
                        </div>
                      )}
                      <h3>{issue.description}</h3>
                      <p><strong>Type:</strong> {issue.type}</p>
                      <p><strong>Status:</strong> <span className={`status-${issue.status}`}>{issue.status}</span></p>
                      <p><strong>Priority:</strong> {issue.priority}</p>
                      <p><strong>Date:</strong> {issue.date}</p>
                      {issue.location && <p><strong>Location:</strong> {issue.location}</p>}
                      {issue.posterName && <p><strong>Reported by:</strong> {issue.posterName}</p>}
                      <p><strong>Coordinates:</strong> {
                        (!isNaN(issue.lat) && !isNaN(issue.lng))
                          ? `${issue.lat.toFixed(4)}, ${issue.lng.toFixed(4)}`
                          : 'Location data unavailable'
                      }</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </section>

        {/* Status Cards */}
        <section className="status-cards-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="section-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
              Dashboard Statistics
              <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}>
                (Total: {issuesData.length} complaints)
              </span>
              {!loading && !error && <span className="data-badge live">Live Data</span>}
              {!loading && error && <span className="data-badge demo">Demo Mode</span>}
            </h2>
            
            {/* AI Suggestions Button */}
            <button className="ai-suggestions-button" onClick={handleAISuggestions}>
              <FaRobot />
              <span>Get AI Insights</span>
            </button>
          </div>
          
          <div className="status-cards-container">
            {statusCards.map((card, index) => (
              <div 
                key={index} 
                className="status-card clickable" 
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
        </section>

        {/* Graph Section */}
        <section className="chart-section">
          <div className="chart-header">
            <h2 className="section-title">
              Issue Trends Over Time
              {!loading && !error && <span className="data-badge live">Live Data</span>}
              {!loading && error && <span className="data-badge demo">Demo Mode</span>}
            </h2>
            <div className="chart-controls">
              <div className="chart-type-toggle">
                <button
                  className={`toggle-btn ${chartType === 'line' ? 'active' : ''}`}
                  onClick={() => setChartType('line')}
                >
                  <FaChartLine /> Line
                </button>
                <button
                  className={`toggle-btn ${chartType === 'bar' ? 'active' : ''}`}
                  onClick={() => setChartType('bar')}
                >
                  <FaChartBar /> Bar
                </button>
              </div>
              <div className="filter-controls">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="filter-select"
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="filter-select"
                >
                  {years.map(year => (
                    <option key={year.value} value={year.value}>
                      {year.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <ChartComponent data={displayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D8D2CB" />
                <XAxis
                  dataKey="date"
                  stroke="#1C658C"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis stroke="#1C658C" label={{ value: 'Number of Issues', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#D8D2CB',
                    border: '2px solid #1C658C',
                    borderRadius: '8px',
                  }}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return `Date: ${date.toLocaleDateString()}`;
                  }}
                />
                <Legend />
                {chartType === 'line' ? (
                  <>
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#1C658C"
                      strokeWidth={3}
                      name="Total Issues"
                      dot={{ fill: '#1C658C', r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pending"
                      stroke="#FFA500"
                      strokeWidth={2}
                      name="Ongoing"
                      dot={{ fill: '#FFA500', r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="in-progress"
                      stroke="#398AB9"
                      strokeWidth={2}
                      name="In Progress"
                      dot={{ fill: '#398AB9', r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="resolved"
                      stroke="#4CAF50"
                      strokeWidth={2}
                      name="Resolved"
                      dot={{ fill: '#4CAF50', r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="critical"
                      stroke="#FF4444"
                      strokeWidth={2}
                      name="Critical"
                      dot={{ fill: '#FF4444', r: 4 }}
                    />
                  </>
                ) : (
                  <>
                    <Bar dataKey="pending" fill="#FFA500" name="Ongoing" />
                    <Bar dataKey="in-progress" fill="#398AB9" name="In Progress" />
                    <Bar dataKey="resolved" fill="#4CAF50" name="Resolved" />
                    <Bar dataKey="critical" fill="#FF4444" name="Critical" />
                  </>
                )}
              </ChartComponent>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Additional Department-Specific Feature */}
        {additionalFeature}
      </div>
    </div>
  );
};

export default DepartmentDashboard;
