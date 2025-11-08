import React, { useState, useEffect } from 'react';
import DepartmentDashboard from '../components/DepartmentDashboard';
import { 
  electricityIssues, 
  electricityHistorical, 
  crewDeploymentLogs,
  powerConsumptionData,
  transformerStatus as initialTransformerStatus,
  gridHealthMetrics
} from '../data/departmentData';
import { FaBolt, FaClock, FaUsers, FaChartLine, FaExclamationTriangle, FaCheckCircle, FaShieldAlt, FaPlus, FaTimes } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import './ElectricityPortal.css';

const ElectricityFeature = () => {
  // State for transformers with localStorage
  const [transformers, setTransformers] = useState(() => {
    const saved = localStorage.getItem('transformers');
    return saved ? JSON.parse(saved) : initialTransformerStatus;
  });
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTransformer, setNewTransformer] = useState({
    id: '',
    location: '',
    capacity: '',
    load: '',
    temperature: '',
    lastMaintenance: '',
    health: 'Good'
  });

  // Save to localStorage whenever transformers change
  useEffect(() => {
    localStorage.setItem('transformers', JSON.stringify(transformers));
  }, [transformers]);

  const handleAddTransformer = () => {
    if (!newTransformer.id || !newTransformer.location || !newTransformer.capacity) {
      alert('Please fill in all required fields (ID, Location, Capacity)');
      return;
    }

    const transformer = {
      ...newTransformer,
      load: parseInt(newTransformer.load) || 0,
      temperature: parseInt(newTransformer.temperature) || 0,
    };

    setTransformers([...transformers, transformer]);
    setNewTransformer({
      id: '',
      location: '',
      capacity: '',
      load: '',
      temperature: '',
      lastMaintenance: '',
      health: 'Good'
    });
    setShowAddModal(false);
  };

  const handleDeleteTransformer = (id) => {
    if (window.confirm(`Are you sure you want to delete transformer ${id}?`)) {
      setTransformers(transformers.filter(t => t.id !== id));
    }
  };
  // Calculate average outage duration
  const avgDuration = (
    electricityIssues.reduce((sum, issue) => sum + (issue.duration || 0), 0) / 
    electricityIssues.length
  ).toFixed(2);

  const totalOutageDuration = electricityIssues
    .reduce((sum, issue) => sum + (issue.duration || 0), 0)
    .toFixed(2);

  const avgCrewEfficiency = (
    crewDeploymentLogs.reduce((sum, crew) => sum + crew.efficiency, 0) /
    crewDeploymentLogs.length
  ).toFixed(1);

  // Grid health radar data
  const gridRadarData = [
    { metric: 'Health', value: gridHealthMetrics.overallHealth, fullMark: 100 },
    { metric: 'Voltage', value: gridHealthMetrics.voltageStability, fullMark: 100 },
    { metric: 'Uptime', value: gridHealthMetrics.uptime, fullMark: 100 },
    { metric: 'Load Mgmt', value: 85, fullMark: 100 },
    { metric: 'Efficiency', value: 92, fullMark: 100 },
  ];

  const getLoadColor = (load) => {
    if (load >= 90) return '#FF4444';
    if (load >= 75) return '#FFA500';
    return '#4CAF50';
  };

  const getHealthColor = (health) => {
    if (health === 'Critical') return '#FF4444';
    if (health === 'Warning') return '#FFA500';
    return '#4CAF50';
  };

  return (
    <>
      <section className="additional-feature-section">
        <h2 className="section-title">
          <FaBolt /> Electricity Department Metrics
        </h2>
        
        <div className="electricity-metrics">
          {/* Enhanced Metric Cards */}
          <div className="metric-cards">
            <div className="metric-card">
              <div className="metric-icon" style={{ backgroundColor: '#FFD700' }}>
                <FaClock size={30} />
              </div>
              <div className="metric-info">
                <h3>Average Outage Duration</h3>
                <p className="metric-value">{avgDuration} hours</p>
                <span className="metric-subtitle">Per incident</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon" style={{ backgroundColor: '#FF6B6B' }}>
                <FaBolt size={30} />
              </div>
              <div className="metric-info">
                <h3>Total Outage Time</h3>
                <p className="metric-value">{totalOutageDuration} hours</p>
                <span className="metric-subtitle">This week</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon" style={{ backgroundColor: '#4CAF50' }}>
                <FaUsers size={30} />
              </div>
              <div className="metric-info">
                <h3>Active Crews</h3>
                <p className="metric-value">
                  {crewDeploymentLogs.filter(crew => crew.status === 'deployed').length} / {crewDeploymentLogs.length}
                </p>
                <span className="metric-subtitle">Deployed teams</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon" style={{ backgroundColor: '#398AB9' }}>
                <FaChartLine size={30} />
              </div>
              <div className="metric-info">
                <h3>Crew Efficiency</h3>
                <p className="metric-value">{avgCrewEfficiency}%</p>
                <span className="metric-subtitle">Average performance</span>
              </div>
            </div>
          </div>

          {/* Grid Health Dashboard */}
          <div className="grid-health-dashboard">
            <h3><FaShieldAlt /> Grid Health Dashboard</h3>
            <div className="grid-health-content">
              <div className="grid-stats">
                <div className="grid-stat-card">
                  <span className="stat-label">Overall Health</span>
                  <span className="stat-value" style={{ color: '#4CAF50' }}>{gridHealthMetrics.overallHealth}%</span>
                  <div className="stat-bar">
                    <div className="stat-fill" style={{ width: `${gridHealthMetrics.overallHealth}%`, backgroundColor: '#4CAF50' }}></div>
                  </div>
                </div>
                <div className="grid-stat-card">
                  <span className="stat-label">Voltage Stability</span>
                  <span className="stat-value" style={{ color: '#2196F3' }}>{gridHealthMetrics.voltageStability}%</span>
                  <div className="stat-bar">
                    <div className="stat-fill" style={{ width: `${gridHealthMetrics.voltageStability}%`, backgroundColor: '#2196F3' }}></div>
                  </div>
                </div>
                <div className="grid-stat-card">
                  <span className="stat-label">System Uptime</span>
                  <span className="stat-value" style={{ color: '#9C27B0' }}>{gridHealthMetrics.uptime}%</span>
                  <div className="stat-bar">
                    <div className="stat-fill" style={{ width: `${gridHealthMetrics.uptime}%`, backgroundColor: '#9C27B0' }}></div>
                  </div>
                </div>
                <div className="grid-stat-card">
                  <span className="stat-label">Power Factor</span>
                  <span className="stat-value" style={{ color: '#FF9800' }}>{gridHealthMetrics.powerFactor}</span>
                </div>
                <div className="grid-stat-card">
                  <span className="stat-label">Peak Load Today</span>
                  <span className="stat-value" style={{ color: '#E91E63' }}>{gridHealthMetrics.peakLoad} MW</span>
                </div>
                <div className="grid-stat-card">
                  <span className="stat-label">Faults Today</span>
                  <span className="stat-value" style={{ color: '#FF4444' }}>{gridHealthMetrics.faultsToday}</span>
                </div>
              </div>
              
              <div className="radar-chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={gridRadarData}>
                    <PolarGrid stroke="#D8D2CB" />
                    <PolarAngleAxis dataKey="metric" stroke="#1C658C" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#398AB9" />
                    <Radar name="Grid Performance" dataKey="value" stroke="#1C658C" fill="#398AB9" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Power Consumption Analysis */}
          <div className="power-consumption-section">
            <h3><FaChartLine /> Power Consumption vs Demand</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={powerConsumptionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D8D2CB" />
                  <XAxis dataKey="hour" stroke="#1C658C" />
                  <YAxis stroke="#1C658C" label={{ value: 'MW', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#D8D2CB',
                      border: '2px solid #1C658C',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="consumption" stroke="#4CAF50" strokeWidth={3} name="Consumption" />
                  <Line type="monotone" dataKey="demand" stroke="#FF6B6B" strokeWidth={3} strokeDasharray="5 5" name="Demand" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transformer Status Monitoring */}
          <div className="transformer-monitoring">
            <h3><FaExclamationTriangle /> Transformer Status Monitoring</h3>
            <div className="transformer-grid">
              {/* Add Transformer Card */}
              <div className="transformer-card add-transformer-card" onClick={() => setShowAddModal(true)}>
                <div className="add-transformer-content">
                  <FaPlus size={50} />
                  <span>Add New Transformer</span>
                </div>
              </div>

              {/* Existing Transformer Cards */}
              {transformers.map(transformer => (
                <div key={transformer.id} className="transformer-card">
                  <button 
                    className="delete-transformer-btn"
                    onClick={() => handleDeleteTransformer(transformer.id)}
                    title="Delete Transformer"
                  >
                    <FaTimes />
                  </button>
                  <div className="transformer-header">
                    <span className="transformer-id">{transformer.id}</span>
                    <span className={`health-badge health-${transformer.health.toLowerCase()}`}>
                      {transformer.health}
                    </span>
                  </div>
                  <div className="transformer-details">
                    <div className="detail-row">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">{transformer.location}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Capacity:</span>
                      <span className="detail-value">{transformer.capacity}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Current Load:</span>
                      <span className="detail-value" style={{ color: getLoadColor(transformer.load) }}>
                        {transformer.load}%
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Temperature:</span>
                      <span className="detail-value" style={{ color: transformer.temperature > 80 ? '#FF4444' : '#4CAF50' }}>
                        {transformer.temperature}°C
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Last Maintenance:</span>
                      <span className="detail-value">{transformer.lastMaintenance}</span>
                    </div>
                  </div>
                  <div className="load-bar">
                    <div className="load-fill" style={{ 
                      width: `${transformer.load}%`,
                      backgroundColor: getLoadColor(transformer.load)
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Add Transformer Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content transformer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaPlus /> Add New Transformer</h2>
              <button className="close-button" onClick={() => setShowAddModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Transformer ID *</label>
                <input
                  type="text"
                  placeholder="e.g., T-105"
                  value={newTransformer.id}
                  onChange={(e) => setNewTransformer({ ...newTransformer, id: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  placeholder="e.g., North Zone, Sector 4"
                  value={newTransformer.location}
                  onChange={(e) => setNewTransformer({ ...newTransformer, location: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Capacity *</label>
                <input
                  type="text"
                  placeholder="e.g., 500 kVA"
                  value={newTransformer.capacity}
                  onChange={(e) => setNewTransformer({ ...newTransformer, capacity: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Current Load (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0-100"
                    value={newTransformer.load}
                    onChange={(e) => setNewTransformer({ ...newTransformer, load: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Temperature (°C)</label>
                  <input
                    type="number"
                    placeholder="e.g., 65"
                    value={newTransformer.temperature}
                    onChange={(e) => setNewTransformer({ ...newTransformer, temperature: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Health Status</label>
                  <select
                    value={newTransformer.health}
                    onChange={(e) => setNewTransformer({ ...newTransformer, health: e.target.value })}
                  >
                    <option value="Good">Good</option>
                    <option value="Warning">Warning</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Last Maintenance</label>
                  <input
                    type="date"
                    value={newTransformer.lastMaintenance}
                    onChange={(e) => setNewTransformer({ ...newTransformer, lastMaintenance: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="create-button" onClick={handleAddTransformer}>
                <FaPlus /> Add Transformer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ElectricityPortal = () => {
  return (
    <DepartmentDashboard
      issuesData={electricityIssues}
      historicalData={electricityHistorical}
      additionalFeature={<ElectricityFeature />}
    />
  );
};

export default ElectricityPortal;
