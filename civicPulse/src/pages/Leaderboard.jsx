import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  FaTrophy, 
  FaMedal, 
  FaCrown, 
  FaStar,
  FaBolt,
  FaTint,
  FaRoad,
  FaTrash,
  FaFire,
  FaChartLine
} from 'react-icons/fa';
import './Leaderboard.css';

const Leaderboard = () => {
  const navigate = useNavigate();

  // Calculate scores from localStorage data
  const calculateDepartmentScore = (deptType) => {
    let completed = 0;
    let pending = 0;

    // Check various storage keys based on department
    if (deptType === 'ELEC') {
      const transformers = JSON.parse(localStorage.getItem('transformers') || '[]');
      // You can add logic to count completed vs pending
      completed = 15;
      pending = 3;
    } else if (deptType === 'WATER') {
      const issues = JSON.parse(localStorage.getItem('waterIssues') || '[]');
      completed = issues.filter(i => i.status === 'resolved').length;
      pending = issues.filter(i => i.status === 'pending').length;
    } else if (deptType === 'GARB') {
      const trucks = JSON.parse(localStorage.getItem('wasteTruckStatus') || '[]');
      completed = 12;
      pending = 2;
    } else if (deptType === 'ROAD') {
      completed = 8;
      pending = 5;
    }

    const score = (completed * 10) - (pending * 1);
    return { completed, pending, score };
  };

  // Get icon component based on type
  const getDeptIcon = (type) => {
    switch(type) {
      case 'ELEC': return <FaBolt />;
      case 'WATER': return <FaTint />;
      case 'GARB': return <FaTrash />;
      case 'ROAD': return <FaRoad />;
      default: return <FaStar />;
    }
  };

  // Mock leaderboard data - can be replaced with actual API data
  const [leaderboardData, setLeaderboardData] = useState(() => {
    const departments = [
      {
        id: 1,
        name: 'Electricity Department',
        type: 'ELEC',
        color: '#FFD700',
        ...calculateDepartmentScore('ELEC'),
        streak: 7,
        badges: ['⚡ Speed Demon', '🎯 Perfectionist']
      },
      {
        id: 2,
        name: 'Water Department',
        type: 'WATER',
        color: '#1E90FF',
        ...calculateDepartmentScore('WATER'),
        streak: 5,
        badges: ['💧 Water Warrior']
      },
      {
        id: 3,
        name: 'Garbage Department',
        type: 'GARB',
        color: '#4CAF50',
        ...calculateDepartmentScore('GARB'),
        streak: 4,
        badges: ['♻️ Eco Champion']
      },
      {
        id: 4,
        name: 'Roads Department',
        type: 'ROAD',
        color: '#FF6B6B',
        ...calculateDepartmentScore('ROAD'),
        streak: 3,
        badges: ['🛣️ Path Maker']
      }
    ];
    
    return departments.sort((a, b) => b.score - a.score);
  });

  // Weekly stats
  const [weeklyStats] = useState({
    totalCompleted: leaderboardData.reduce((sum, dept) => sum + dept.completed, 0),
    totalPending: leaderboardData.reduce((sum, dept) => sum + dept.pending, 0),
    topPerformer: leaderboardData[0]?.name || 'N/A',
    weekNumber: Math.ceil((new Date().getDate()) / 7)
  });

  const handleLogout = () => {
    localStorage.removeItem('authType');
    localStorage.removeItem('userId');
    localStorage.removeItem('isAuthenticated');
    navigate('/register');
  };

  const getRankIcon = (index) => {
    if (index === 0) return <FaCrown className="rank-crown" />;
    if (index === 1) return <FaMedal className="rank-medal silver" />;
    if (index === 2) return <FaMedal className="rank-medal bronze" />;
    return <span className="rank-number">{index + 1}</span>;
  };

  const getRankClass = (index) => {
    if (index === 0) return 'first-place';
    if (index === 1) return 'second-place';
    if (index === 2) return 'third-place';
    return '';
  };

  return (
    <div className="leaderboard-page">
      <Navbar 
        title="Department Leaderboard" 
        subtitle={`Week ${weeklyStats.weekNumber} Performance`}
      />

      <div className="leaderboard-content">
        {/* Weekly Stats Cards */}
        <section className="weekly-stats">
          <div className="stat-card stat-completed">
            <div className="stat-icon">
              <FaStar />
            </div>
            <div className="stat-info">
              <h3>Tasks Completed</h3>
              <p className="stat-value">{weeklyStats.totalCompleted}</p>
              <span className="stat-label">This Week</span>
            </div>
          </div>

          <div className="stat-card stat-pending">
            <div className="stat-icon">
              <FaChartLine />
            </div>
            <div className="stat-info">
              <h3>Tasks Pending</h3>
              <p className="stat-value">{weeklyStats.totalPending}</p>
              <span className="stat-label">Active Tasks</span>
            </div>
          </div>

          <div className="stat-card stat-performer">
            <div className="stat-icon">
              <FaFire />
            </div>
            <div className="stat-info">
              <h3>Top Performer</h3>
              <p className="stat-value-text">{weeklyStats.topPerformer}</p>
              <span className="stat-label">Leading This Week</span>
            </div>
          </div>
        </section>

        {/* Podium for Top 3 */}
        <section className="podium-section">
          <h2 className="section-title">
            <FaTrophy /> Top Performers
          </h2>
          <div className="podium-container">
            {/* Second Place */}
            {leaderboardData[1] && (
              <div className="podium-place second">
                <div className="podium-card silver">
                  <div className="rank-badge silver">
                    <FaMedal />
                    <span>2nd</span>
                  </div>
                  <div className="dept-icon" style={{ color: leaderboardData[1].color }}>
                    {getDeptIcon(leaderboardData[1].type)}
                  </div>
                  <h3>{leaderboardData[1].name}</h3>
                  <div className="score-display">
                    <span className="score-value">{leaderboardData[1].score}</span>
                    <span className="score-label">points</span>
                  </div>
                  <div className="stats-mini">
                    <div className="stat-mini">
                      <span className="stat-mini-value">{leaderboardData[1].completed}</span>
                      <span className="stat-mini-label">Completed</span>
                    </div>
                    <div className="stat-mini">
                      <span className="stat-mini-value">{leaderboardData[1].streak}</span>
                      <span className="stat-mini-label">Day Streak</span>
                    </div>
                  </div>
                </div>
                <div className="podium-base silver-base">2</div>
              </div>
            )}

            {/* First Place */}
            {leaderboardData[0] && (
              <div className="podium-place first">
                <div className="podium-card winner">
                  <div className="rank-badge gold">
                    <FaCrown />
                    <span>1st</span>
                  </div>
                  <div className="winner-glow"></div>
                  <div className="dept-icon" style={{ color: leaderboardData[0].color }}>
                    {getDeptIcon(leaderboardData[0].type)}
                  </div>
                  <h3>{leaderboardData[0].name}</h3>
                  <div className="score-display">
                    <span className="score-value">{leaderboardData[0].score}</span>
                    <span className="score-label">points</span>
                  </div>
                  <div className="stats-mini">
                    <div className="stat-mini">
                      <span className="stat-mini-value">{leaderboardData[0].completed}</span>
                      <span className="stat-mini-label">Completed</span>
                    </div>
                    <div className="stat-mini">
                      <span className="stat-mini-value">{leaderboardData[0].streak}</span>
                      <span className="stat-mini-label">Day Streak</span>
                    </div>
                  </div>
                  <div className="winner-badges">
                    {leaderboardData[0].badges.map((badge, idx) => (
                      <span key={idx} className="badge-chip">{badge}</span>
                    ))}
                  </div>
                </div>
                <div className="podium-base gold-base">1</div>
              </div>
            )}

            {/* Third Place */}
            {leaderboardData[2] && (
              <div className="podium-place third">
                <div className="podium-card bronze">
                  <div className="rank-badge bronze">
                    <FaMedal />
                    <span>3rd</span>
                  </div>
                  <div className="dept-icon" style={{ color: leaderboardData[2].color }}>
                    {getDeptIcon(leaderboardData[2].type)}
                  </div>
                  <h3>{leaderboardData[2].name}</h3>
                  <div className="score-display">
                    <span className="score-value">{leaderboardData[2].score}</span>
                    <span className="score-label">points</span>
                  </div>
                  <div className="stats-mini">
                    <div className="stat-mini">
                      <span className="stat-mini-value">{leaderboardData[2].completed}</span>
                      <span className="stat-mini-label">Completed</span>
                    </div>
                    <div className="stat-mini">
                      <span className="stat-mini-value">{leaderboardData[2].streak}</span>
                      <span className="stat-mini-label">Day Streak</span>
                    </div>
                  </div>
                </div>
                <div className="podium-base bronze-base">3</div>
              </div>
            )}
          </div>
        </section>

        {/* Full Rankings Table */}
        <section className="rankings-section">
          <h2 className="section-title">
            <FaChartLine /> Complete Rankings
          </h2>
          <div className="rankings-table-container">
            <table className="rankings-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Department</th>
                  <th>Completed</th>
                  <th>Pending</th>
                  <th>Score</th>
                  <th>Streak</th>
                  <th>Badges</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((dept, index) => (
                  <tr key={dept.id} className={`rank-row ${getRankClass(index)}`}>
                    <td className="rank-cell">
                      {getRankIcon(index)}
                    </td>
                    <td className="dept-cell">
                      <div className="dept-info">
                        <div className="dept-icon-small" style={{ color: dept.color }}>
                          {getDeptIcon(dept.type)}
                        </div>
                        <span>{dept.name}</span>
                      </div>
                    </td>
                    <td className="completed-cell">
                      <span className="value-badge completed">{dept.completed}</span>
                    </td>
                    <td className="pending-cell">
                      <span className="value-badge pending">{dept.pending}</span>
                    </td>
                    <td className="score-cell">
                      <span className="score-badge">{dept.score} pts</span>
                    </td>
                    <td className="streak-cell">
                      <span className="streak-badge">
                        <FaFire /> {dept.streak} days
                      </span>
                    </td>
                    <td className="badges-cell">
                      {dept.badges.map((badge, idx) => (
                        <span key={idx} className="badge-mini">{badge}</span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Scoring Info */}
        <section className="scoring-info">
          <h3>📊 Scoring System</h3>
          <div className="scoring-rules">
            <div className="rule-item">
              <span className="rule-icon">✅</span>
              <span className="rule-text"><strong>+10 points</strong> for each completed task</span>
            </div>
            <div className="rule-item">
              <span className="rule-icon">⏳</span>
              <span className="rule-text"><strong>-1 point</strong> for each pending task</span>
            </div>
            <div className="rule-item">
              <span className="rule-icon">🔥</span>
              <span className="rule-text">Maintain streaks by completing tasks daily</span>
            </div>
            <div className="rule-item">
              <span className="rule-icon">🏆</span>
              <span className="rule-text">Earn badges for exceptional performance</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Leaderboard;
