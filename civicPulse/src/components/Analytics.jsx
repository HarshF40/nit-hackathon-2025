import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { FaChartPie } from 'react-icons/fa';
import { getIssueDistribution, issueColors } from '../data/dummyData';
import './Analytics.css';

const Analytics = () => {
  const data = getIssueDistribution();

  const COLORS = Object.values(issueColors);

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="analytics-section">
      <div className="analytics-header">
        <FaChartPie size={30} color="#1C658C" />
        <h2 className="section-title">Issue Distribution Analytics</h2>
      </div>
      
      <div className="analytics-content">
        <div className="pie-chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={140}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#D8D2CB',
                  border: '2px solid #1C658C',
                  borderRadius: '8px',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-stats">
          <h3>Breakdown by Issue Type</h3>
          <div className="stats-list">
            {data.map((item, index) => (
              <div key={item.name} className="stat-item">
                <div className="stat-color" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <div className="stat-details">
                  <span className="stat-name">{item.name}</span>
                  <span className="stat-value">{item.value} issues</span>
                </div>
                <div className="stat-percentage">
                  {((item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
