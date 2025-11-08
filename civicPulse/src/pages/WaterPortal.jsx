import React, { useState, useEffect } from 'react';
import DepartmentDashboard from '../components/DepartmentDashboard';
import { waterIssues as initialWaterIssues, waterHistorical } from '../data/departmentData';
import { FaTint, FaExclamationCircle, FaChartArea, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './WaterPortal.css';
import Footer from '../components/Footer';

const WaterFeature = () => {
  // State for water issues with localStorage
  const [waterIssues, setWaterIssues] = useState(() => {
    const saved = localStorage.getItem('waterIssues');
    return saved ? JSON.parse(saved) : initialWaterIssues;
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newIssue, setNewIssue] = useState({
    description: '',
    severity: '',
    waterLoss: '',
    status: 'pending'
  });

  // Save to localStorage whenever waterIssues change
  useEffect(() => {
    localStorage.setItem('waterIssues', JSON.stringify(waterIssues));
  }, [waterIssues]);

  const handleAddIssue = () => {
    if (!newIssue.description || !newIssue.severity || !newIssue.waterLoss) {
      alert('Please fill in all required fields (Description, Severity, Water Loss)');
      return;
    }

    const issue = {
      id: waterIssues.length > 0 ? Math.max(...waterIssues.map(i => i.id)) + 1 : 1,
      description: newIssue.description,
      severity: parseFloat(newIssue.severity),
      waterLoss: parseInt(newIssue.waterLoss),
      status: newIssue.status,
      lat: 28.6139 + (Math.random() - 0.5) * 0.05, // Random location near Delhi
      lng: 77.2090 + (Math.random() - 0.5) * 0.05,
      type: "WATER",
      date: new Date().toISOString().split('T')[0]
    };

    setWaterIssues([...waterIssues, issue]);
    setNewIssue({
      description: '',
      severity: '',
      waterLoss: '',
      status: 'pending'
    });
    setShowAddModal(false);
  };

  const handleDeleteIssue = (id) => {
    if (window.confirm(`Are you sure you want to delete issue #${id}?`)) {
      setWaterIssues(waterIssues.filter(i => i.id !== id));
    }
  };
  // Calculate metrics
  const avgSeverity = waterIssues.length > 0 
    ? (waterIssues.reduce((sum, issue) => sum + (issue.severity || 0), 0) / waterIssues.length).toFixed(1)
    : '0.0';

  const totalWaterLoss = waterIssues
    .reduce((sum, issue) => sum + (issue.waterLoss || 0), 0);

  const criticalLeaks = waterIssues.filter(issue => issue.severity >= 7).length;

  // Prepare data for severity chart
  const severityData = waterIssues.map(issue => ({
    id: `Issue ${issue.id}`,
    severity: issue.severity,
    waterLoss: issue.waterLoss,
  }));

  const getSeverityColor = (severity) => {
    if (severity >= 8) return '#FF4444';
    if (severity >= 5) return '#FFA500';
    return '#4CAF50';
  };

  return (
    <>
    <section className="additional-feature-section">
      <h2 className="section-title">
        <FaTint /> Water Department Metrics
      </h2>
      
      <div className="water-metrics">
        <div className="metric-cards">
          <div className="metric-card">
            <div className="metric-icon" style={{ backgroundColor: '#1E90FF' }}>
              <FaExclamationCircle size={30} />
            </div>
            <div className="metric-info">
              <h3>Average Leakage Severity</h3>
              <p className="metric-value">{avgSeverity} / 10</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon" style={{ backgroundColor: '#FF6B6B' }}>
              <FaTint size={30} />
            </div>
            <div className="metric-info">
              <h3>Total Water Loss</h3>
              <p className="metric-value">{totalWaterLoss.toLocaleString()} L</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon" style={{ backgroundColor: '#FFA500' }}>
              <FaChartArea size={30} />
            </div>
            <div className="metric-info">
              <h3>Critical Leaks</h3>
              <p className="metric-value">{criticalLeaks} issues</p>
            </div>
          </div>
        </div>

        <div className="severity-chart-section">
          <h3>Leakage Severity Index by Issue</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D8D2CB" />
                <XAxis 
                  dataKey="id" 
                  stroke="#1C658C"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#1C658C" 
                  label={{ value: 'Severity Level', angle: -90, position: 'insideLeft' }}
                  domain={[0, 10]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#D8D2CB',
                    border: '2px solid #1C658C',
                    borderRadius: '8px',
                  }}
                  formatter={(value, name) => {
                    if (name === 'severity') return [`${value} / 10`, 'Severity'];
                    if (name === 'waterLoss') return [`${value} L`, 'Water Loss'];
                    return [value, name];
                  }}
                />
                <Bar dataKey="severity" name="Severity Level">
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getSeverityColor(entry.severity)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="water-loss-table">
          <div className="table-header-section">
            <h3>Water Loss Estimates by Issue</h3>
            <button className="add-issue-btn" onClick={() => setShowAddModal(true)}>
              <FaPlus /> Add New Issue
            </button>
          </div>
          <div className="table-container">
            <table className="loss-table">
              <thead>
                <tr>
                  <th>Issue ID</th>
                  <th>Description</th>
                  <th>Severity</th>
                  <th>Water Loss (L)</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {waterIssues
                  .sort((a, b) => b.waterLoss - a.waterLoss)
                  .map(issue => (
                    <tr key={issue.id} className={issue.severity >= 7 ? 'critical-row' : ''}>
                      <td>#{issue.id}</td>
                      <td>{issue.description}</td>
                      <td>
                        <span className={`severity-badge severity-${Math.floor(issue.severity / 3)}`}>
                          {issue.severity} / 10
                        </span>
                      </td>
                      <td className="loss-value">{issue.waterLoss.toLocaleString()} L</td>
                      <td>
                        <span className={`status-badge ${issue.status}`}>
                          {issue.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="delete-issue-btn"
                          onClick={() => handleDeleteIssue(issue.id)}
                          title="Delete Issue"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
    </section>

    {/* Add Issue Modal */}
    {showAddModal && (
      <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
        <div className="modal-content water-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2><FaPlus /> Add New Water Issue</h2>
            <button className="close-button" onClick={() => setShowAddModal(false)}>
              <FaTimes />
            </button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>Issue Description *</label>
              <textarea
                placeholder="Enter detailed description of the water issue"
                value={newIssue.description}
                onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Severity (1-10) *</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.1"
                  placeholder="1-10"
                  value={newIssue.severity}
                  onChange={(e) => setNewIssue({ ...newIssue, severity: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Water Loss (Liters) *</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g., 5000"
                  value={newIssue.waterLoss}
                  onChange={(e) => setNewIssue({ ...newIssue, waterLoss: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={newIssue.status}
                onChange={(e) => setNewIssue({ ...newIssue, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="in-progress">In Progress</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button className="cancel-button" onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
            <button className="create-button" onClick={handleAddIssue}>
              <FaPlus /> Add Issue
            </button>
          </div>
        </div>
      </div>
    )}

    <Footer />
    </>
  );
};

const WaterPortal = () => {
  // Use initial water issues for the dashboard
  const [waterIssues] = useState(() => {
    const saved = localStorage.getItem('waterIssues');
    return saved ? JSON.parse(saved) : initialWaterIssues;
  });

  return (
    <DepartmentDashboard
      issuesData={waterIssues}
      historicalData={waterHistorical}
      additionalFeature={<WaterFeature />}
    />
  );
};

export default WaterPortal;
