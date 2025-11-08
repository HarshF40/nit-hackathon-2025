import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { issuesData, issueColors } from '../data/dummyData';
import './IssueMap.css';

const IssueMap = () => {
  // Center of the map (New Delhi coordinates)
  const center = [28.6139, 77.2090];

  return (
    <div className="map-section">
      <h2 className="section-title">Issue Heat Map - 7 KM Radius</h2>
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
          
          {issuesData.map((issue) => (
            <CircleMarker
              key={issue.id}
              center={[issue.lat, issue.lng]}
              radius={8}
              pathOptions={{
                color: issueColors[issue.type],
                fillColor: issueColors[issue.type],
                fillOpacity: 0.6,
                weight: 2,
              }}
            >
              <Popup>
                <div className="popup-content">
                  <h3>{issue.type}</h3>
                  <p><strong>Status:</strong> {issue.status}</p>
                  <p><strong>Date:</strong> {issue.date}</p>
                  <p><strong>Severity:</strong> {issue.severity}</p>
                  <p><strong>Location:</strong> {issue.lat.toFixed(4)}, {issue.lng.toFixed(4)}</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      
      <div className="map-legend">
        <h3>Issue Types</h3>
        <div className="legend-items">
          {Object.entries(issueColors).map(([type, color]) => (
            <div key={type} className="legend-item">
              <span className="legend-color" style={{ backgroundColor: color }}></span>
              <span className="legend-label">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IssueMap;
