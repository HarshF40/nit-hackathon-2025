import React from 'react';
import DepartmentDashboard from '../components/DepartmentDashboard';
import { roadIssues, roadHistorical, maintenanceRequests } from '../data/departmentData';
import { FaRoad, FaExclamationTriangle, FaClipboardList } from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import './RoadsPortal.css';

const RoadsFeature = () => {
  // Calculate metrics
  const avgPriority = (
    roadIssues.reduce((sum, issue) => sum + (issue.priority || 0), 0) / 
    roadIssues.length
  ).toFixed(1);

  const highPriorityIssues = roadIssues.filter(issue => issue.priority >= 7).length;

  // Prepare priority distribution data
  const priorityDistribution = [
    { name: 'Low (1-3)', value: roadIssues.filter(i => i.priority <= 3).length, color: '#4CAF50' },
    { name: 'Medium (4-6)', value: roadIssues.filter(i => i.priority >= 4 && i.priority <= 6).length, color: '#FFA500' },
    { name: 'High (7-8)', value: roadIssues.filter(i => i.priority >= 7 && i.priority <= 8).length, color: '#FF6B6B' },
    { name: 'Critical (9-10)', value: roadIssues.filter(i => i.priority >= 9).length, color: '#FF4444' },
  ];

  // Maintenance type distribution
  const maintenanceTypes = {
    Emergency: roadIssues.filter(i => i.maintenanceType === 'Emergency').length,
    Routine: roadIssues.filter(i => i.maintenanceType === 'Routine').length,
    Scheduled: roadIssues.filter(i => i.maintenanceType === 'Scheduled').length,
  };

  return (
    <section className="additional-feature-section">
      <h2 className="section-title">
        <FaRoad /> Road Department Metrics
      </h2>
      
      <div className="roads-metrics">
        <div className="metric-cards">
          <div className="metric-card">
            <div className="metric-icon" style={{ backgroundColor: '#FF6B6B' }}>
              <FaExclamationTriangle size={30} />
            </div>
            <div className="metric-info">
              <h3>Average Priority Level</h3>
              <p className="metric-value">{avgPriority} / 10</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon" style={{ backgroundColor: '#FFA500' }}>
              <FaRoad size={30} />
            </div>
            <div className="metric-info">
              <h3>High Priority Issues</h3>
              <p className="metric-value">{highPriorityIssues} issues</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon" style={{ backgroundColor: '#4CAF50' }}>
              <FaClipboardList size={30} />
            </div>
            <div className="metric-info">
              <h3>Maintenance Requests</h3>
              <p className="metric-value">{maintenanceRequests.length} total</p>
            </div>
          </div>
        </div>

        <div className="priority-chart-section">
          <h3>Repair Priority Level Distribution</h3>
          <div className="chart-grid">
            <div className="pie-chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={priorityDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {priorityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="maintenance-type-stats">
              <h4>Maintenance Types</h4>
              <div className="type-stat">
                <span className="type-label">Emergency:</span>
                <span className="type-value emergency">{maintenanceTypes.Emergency}</span>
              </div>
              <div className="type-stat">
                <span className="type-label">Routine:</span>
                <span className="type-value routine">{maintenanceTypes.Routine}</span>
              </div>
              <div className="type-stat">
                <span className="type-label">Scheduled:</span>
                <span className="type-value scheduled">{maintenanceTypes.Scheduled}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="maintenance-tracking-section">
          <h3>Maintenance Request Tracking</h3>
          <div className="table-container">
            <table className="maintenance-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Location</th>
                  <th>Request Date</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceRequests.map(request => (
                  <tr key={request.id} className={request.priority === 'Critical' ? 'critical-row' : ''}>
                    <td>#{request.id}</td>
                    <td>{request.location}</td>
                    <td>{request.requestDate}</td>
                    <td>
                      <span className={`priority-badge priority-${request.priority.toLowerCase()}`}>
                        {request.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${request.status.toLowerCase().replace(' ', '-')}`}>
                        {request.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

const RoadsPortal = () => {
  return (
    <DepartmentDashboard
      issuesData={roadIssues}
      historicalData={roadHistorical}
      additionalFeature={<RoadsFeature />}
    />
  );
};

export default RoadsPortal;
