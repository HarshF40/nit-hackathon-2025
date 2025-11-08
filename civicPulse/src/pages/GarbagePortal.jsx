import React, { useState, useEffect } from 'react';
import DepartmentDashboard from '../components/DepartmentDashboard';
import { garbageIssues, garbageHistorical, wasteTruckStatus as initialWasteTruckStatus, binCapacityData } from '../data/departmentData';
import { FaTrash, FaTruck, FaChartBar, FaPlus, FaTimes } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './GarbagePortal.css';

const GarbageFeature = () => {
  // State for trucks with localStorage
  const [wasteTruckStatus, setWasteTruckStatus] = useState(() => {
    const saved = localStorage.getItem('wasteTruckStatus');
    return saved ? JSON.parse(saved) : initialWasteTruckStatus;
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTruck, setNewTruck] = useState({
    truckNumber: '',
    area: '',
    capacity: '',
    status: 'idle',
    lastUpdate: ''
  });

  // Save to localStorage whenever trucks change
  useEffect(() => {
    localStorage.setItem('wasteTruckStatus', JSON.stringify(wasteTruckStatus));
  }, [wasteTruckStatus]);

  const handleAddTruck = () => {
    if (!newTruck.truckNumber || !newTruck.area || !newTruck.capacity) {
      alert('Please fill in all required fields (Truck Number, Area, Capacity)');
      return;
    }

    const truck = {
      id: wasteTruckStatus.length > 0 ? Math.max(...wasteTruckStatus.map(t => t.id)) + 1 : 1,
      truckNumber: newTruck.truckNumber,
      area: newTruck.area,
      capacity: parseInt(newTruck.capacity),
      status: newTruck.status,
      lastUpdate: newTruck.lastUpdate || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setWasteTruckStatus([...wasteTruckStatus, truck]);
    setNewTruck({
      truckNumber: '',
      area: '',
      capacity: '',
      status: 'idle',
      lastUpdate: ''
    });
    setShowAddModal(false);
  };

  const handleDeleteTruck = (id) => {
    if (window.confirm(`Are you sure you want to delete truck ${wasteTruckStatus.find(t => t.id === id)?.truckNumber}?`)) {
      setWasteTruckStatus(wasteTruckStatus.filter(t => t.id !== id));
    }
  };
  // Calculate metrics
  const activeTrucks = wasteTruckStatus.filter(truck => truck.status === 'active').length;
  const avgBinCapacity = (
    binCapacityData.reduce((sum, bin) => sum + bin.capacity, 0) / 
    binCapacityData.length
  ).toFixed(1);

  const overflowBins = garbageIssues.filter(issue => issue.binCapacity >= 90).length;

  const getCapacityColor = (capacity) => {
    if (capacity >= 90) return '#FF4444';
    if (capacity >= 70) return '#FFA500';
    return '#4CAF50';
  };

  const getTruckStatusColor = (status) => {
    if (status === 'active') return '#4CAF50';
    if (status === 'idle') return '#FFA500';
    return '#FF6B6B';
  };

  return (
    <section className="additional-feature-section">
      <h2 className="section-title">
        <FaTrash /> Garbage Department Metrics
      </h2>
      
      <div className="garbage-metrics">
        <div className="metric-cards">
          <div className="metric-card">
            <div className="metric-icon" style={{ backgroundColor: '#4CAF50' }}>
              <FaTruck size={30} />
            </div>
            <div className="metric-info">
              <h3>Active Trucks</h3>
              <p className="metric-value">{activeTrucks} / {wasteTruckStatus.length}</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon" style={{ backgroundColor: '#FFA500' }}>
              <FaChartBar size={30} />
            </div>
            <div className="metric-info">
              <h3>Avg. Bin Capacity</h3>
              <p className="metric-value">{avgBinCapacity}%</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon" style={{ backgroundColor: '#FF4444' }}>
              <FaTrash size={30} />
            </div>
            <div className="metric-info">
              <h3>Overflow Bins</h3>
              <p className="metric-value">{overflowBins} bins</p>
            </div>
          </div>
        </div>

        <div className="truck-status-section">
          <div className="section-header-with-button">
            <h3>Waste Truck Live Status</h3>
            <button className="add-truck-btn" onClick={() => setShowAddModal(true)}>
              <FaPlus /> Add New Truck
            </button>
          </div>
          <div className="truck-grid">
            {wasteTruckStatus.map(truck => (
              <div key={truck.id} className="truck-card">
                <button 
                  className="delete-truck-btn"
                  onClick={() => handleDeleteTruck(truck.id)}
                  title="Delete Truck"
                >
                  <FaTimes />
                </button>
                <div className="truck-header">
                  <div className="truck-number">
                    <FaTruck size={24} />
                    <span>{truck.truckNumber}</span>
                  </div>
                  <span className={`truck-status-badge status-${truck.status}`}>
                    {truck.status}
                  </span>
                </div>
                <div className="truck-details">
                  <div className="truck-detail">
                    <span className="detail-label">Area:</span>
                    <span className="detail-value">{truck.area}</span>
                  </div>
                  <div className="truck-detail">
                    <span className="detail-label">Capacity:</span>
                    <span className="detail-value capacity-value" style={{ color: getCapacityColor(truck.capacity) }}>
                      {truck.capacity}%
                    </span>
                  </div>
                  <div className="truck-detail">
                    <span className="detail-label">Last Update:</span>
                    <span className="detail-value">{truck.lastUpdate}</span>
                  </div>
                </div>
                <div className="capacity-bar">
                  <div 
                    className="capacity-fill"
                    style={{ 
                      width: `${truck.capacity}%`,
                      backgroundColor: getCapacityColor(truck.capacity)
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bin-capacity-section">
          <h3>Bin Capacity by Zone</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={binCapacityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D8D2CB" />
                <XAxis 
                  dataKey="zone" 
                  stroke="#1C658C"
                />
                <YAxis 
                  stroke="#1C658C" 
                  label={{ value: 'Capacity (%)', angle: -90, position: 'insideLeft' }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#D8D2CB',
                    border: '2px solid #1C658C',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [`${value}%`, 'Capacity']}
                />
                <Bar dataKey="capacity" name="Bin Capacity">
                  {binCapacityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCapacityColor(entry.capacity)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Add Truck Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content truck-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaPlus /> Add New Waste Truck</h2>
              <button className="close-button" onClick={() => setShowAddModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Truck Number *</label>
                <input
                  type="text"
                  placeholder="e.g., GC-01"
                  value={newTruck.truckNumber}
                  onChange={(e) => setNewTruck({ ...newTruck, truckNumber: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Area *</label>
                <input
                  type="text"
                  placeholder="e.g., North Zone"
                  value={newTruck.area}
                  onChange={(e) => setNewTruck({ ...newTruck, area: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Capacity (%) *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0-100"
                    value={newTruck.capacity}
                    onChange={(e) => setNewTruck({ ...newTruck, capacity: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={newTruck.status}
                    onChange={(e) => setNewTruck({ ...newTruck, status: e.target.value })}
                  >
                    <option value="idle">Idle</option>
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Last Update Time</label>
                <input
                  type="time"
                  value={newTruck.lastUpdate}
                  onChange={(e) => setNewTruck({ ...newTruck, lastUpdate: e.target.value })}
                />
                <small>Leave empty to use current time</small>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="create-button" onClick={handleAddTruck}>
                <FaPlus /> Add Truck
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const GarbagePortal = () => {
  return (
    <DepartmentDashboard
      issuesData={garbageIssues}
      historicalData={garbageHistorical}
      additionalFeature={<GarbageFeature />}
    />
  );
};

export default GarbagePortal;
