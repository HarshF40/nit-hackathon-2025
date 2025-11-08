import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaChartLine, FaChartBar } from 'react-icons/fa';
import { historicalData } from '../data/dummyData';
import './IssueChart.css';

const IssueChart = () => {
  const [chartType, setChartType] = useState('line');
  const [selectedMonth, setSelectedMonth] = useState('10');
  const [selectedYear, setSelectedYear] = useState('2025');

  const months = [
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
  ];

  const years = [
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' },
  ];

  const filteredData = useMemo(() => {
    return historicalData.filter(item => {
      const [year, month] = item.date.split('-');
      return year === selectedYear && month === selectedMonth;
    });
  }, [selectedMonth, selectedYear]);

  const ChartComponent = chartType === 'line' ? LineChart : BarChart;
  const DataComponent = chartType === 'line' ? Line : Bar;

  return (
    <div className="chart-section">
      <div className="chart-header">
        <h2 className="section-title">Issue Trends</h2>
        <div className="chart-controls">
          <div className="chart-type-toggle">
            <button
              className={`toggle-btn ${chartType === 'line' ? 'active' : ''}`}
              onClick={() => setChartType('line')}
            >
              <FaChartLine /> Line Chart
            </button>
            <button
              className={`toggle-btn ${chartType === 'bar' ? 'active' : ''}`}
              onClick={() => setChartType('bar')}
            >
              <FaChartBar /> Bar Chart
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
          <ChartComponent data={filteredData}>
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
            <DataComponent
              type="monotone"
              dataKey="issues"
              stroke="#1C658C"
              fill="#398AB9"
              strokeWidth={3}
              name="Issues Reported"
            />
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IssueChart;
