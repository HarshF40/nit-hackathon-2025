import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  FaUsers, 
  FaPlus, 
  FaTimes, 
  FaUserPlus, 
  FaEdit, 
  FaTrash, 
  FaTasks,
  FaUser
} from 'react-icons/fa';
import './Teams.css';

const Teams = () => {
  const navigate = useNavigate();
  
  // Get current department
  const currentDepartment = localStorage.getItem('authType') || 'ELEC';
  
  // Initialize default teams for each department
  const getDefaultTeams = (deptType) => {
    const defaultTeamsByDept = {
      'ELEC': [
        {
          id: 1,
          name: 'North Zone Electrical Crew',
          department: 'ELEC',
          members: ['John Doe', 'Jane Smith', 'Mike Johnson'],
          tasks: [
            { id: 1, title: 'Repair transformer T-101', status: 'In Progress', priority: 'High' },
            { id: 2, title: 'Inspect power lines', status: 'Pending', priority: 'Medium' }
          ],
          createdDate: '2025-10-20'
        },
        {
          id: 2,
          name: 'South Zone Electrical Crew',
          department: 'ELEC',
          members: ['Sarah Wilson', 'Tom Brown'],
          tasks: [
            { id: 3, title: 'Emergency outage response', status: 'Completed', priority: 'Critical' }
          ],
          createdDate: '2025-10-21'
        }
      ],
      'WATER': [
        {
          id: 1,
          name: 'Pipeline Maintenance Team',
          department: 'WATER',
          members: ['Alex Kumar', 'Priya Sharma', 'Rajesh Verma'],
          tasks: [
            { id: 1, title: 'Fix water leak at Block A', status: 'In Progress', priority: 'High' },
            { id: 2, title: 'Inspect water quality', status: 'Pending', priority: 'Medium' }
          ],
          createdDate: '2025-10-20'
        }
      ],
      'ROAD': [
        {
          id: 1,
          name: 'Road Repair Squad',
          department: 'ROAD',
          members: ['Vikram Singh', 'Amit Patel', 'Neha Gupta'],
          tasks: [
            { id: 1, title: 'Fill potholes on Main Street', status: 'In Progress', priority: 'High' },
            { id: 2, title: 'Resurface Highway 101', status: 'Pending', priority: 'Critical' }
          ],
          createdDate: '2025-10-20'
        }
      ],
      'GARB': [
        {
          id: 1,
          name: 'Waste Collection Unit A',
          department: 'GARB',
          members: ['Ramesh Kumar', 'Sunita Devi', 'Mukesh Yadav'],
          tasks: [
            { id: 1, title: 'Collect waste from Zone 1', status: 'Completed', priority: 'High' },
            { id: 2, title: 'Clean recycling center', status: 'Pending', priority: 'Medium' }
          ],
          createdDate: '2025-10-20'
        }
      ]
    };
    return defaultTeamsByDept[deptType] || [];
  };
  
  // Load teams from localStorage or use default for current department
  const [allTeams, setAllTeams] = useState(() => {
    const savedTeams = localStorage.getItem('allTeams');
    if (savedTeams) {
      return JSON.parse(savedTeams);
    } else {
      // Initialize with default teams for all departments
      const initialTeams = [
        ...getDefaultTeams('ELEC'),
        ...getDefaultTeams('WATER'),
        ...getDefaultTeams('ROAD'),
        ...getDefaultTeams('GARB')
      ];
      return initialTeams;
    }
  });

  // Filter teams for current department
  const teams = allTeams.filter(team => team.department === currentDepartment);

  // Save all teams to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('allTeams', JSON.stringify(allTeams));
  }, [allTeams]);

  // Get all unique members across all teams
  const getAllMembers = () => {
    const allMembers = teams.flatMap(team => team.members);
    return [...new Set(allMembers)].sort();
  };

  // Get member details with their teams and tasks
  const getMemberDetails = (memberName) => {
    const memberTeams = teams.filter(t => t.members.includes(memberName));
    const memberTasks = memberTeams.flatMap(team => 
      team.tasks.map(task => ({
        ...task,
        teamName: team.name
      }))
    );
    return {
      teams: memberTeams,
      tasks: memberTasks
    };
  };

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [newTeam, setNewTeam] = useState({ name: '', members: [''] });
  const [newTask, setNewTask] = useState({ title: '', priority: 'Medium', status: 'Pending', description: '' });

  const handleLogout = () => {
    localStorage.removeItem('authType');
    localStorage.removeItem('userId');
    localStorage.removeItem('isAuthenticated');
    navigate('/register');
  };

  const handleAddTeam = () => {
    if (newTeam.name.trim() && newTeam.members.some(m => m.trim())) {
      const team = {
        id: Date.now(), // Use timestamp for unique ID
        name: newTeam.name,
        department: currentDepartment,
        members: newTeam.members.filter(m => m.trim()),
        tasks: [],
        createdDate: new Date().toISOString().split('T')[0]
      };
      setAllTeams([...allTeams, team]);
      setNewTeam({ name: '', members: [''] });
      setShowTeamModal(false);
    }
  };

  const handleAddMember = () => {
    setNewTeam({ ...newTeam, members: [...newTeam.members, ''] });
  };

  const handleRemoveMember = (index) => {
    const updatedMembers = newTeam.members.filter((_, i) => i !== index);
    setNewTeam({ ...newTeam, members: updatedMembers.length ? updatedMembers : [''] });
  };

  const handleMemberChange = (index, value) => {
    const updatedMembers = [...newTeam.members];
    updatedMembers[index] = value;
    setNewTeam({ ...newTeam, members: updatedMembers });
  };

  const handleDeleteTeam = (teamId) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      setAllTeams(allTeams.filter(t => t.id !== teamId));
    }
  };

  const handleAddTask = () => {
    if (selectedTeam && newTask.title.trim()) {
      const updatedTeams = allTeams.map(team => {
        if (team.id === selectedTeam.id) {
          return {
            ...team,
            tasks: [...team.tasks, {
              id: Date.now(),
              ...newTask
            }]
          };
        }
        return team;
      });
      setAllTeams(updatedTeams);
      setNewTask({ title: '', priority: 'Medium', status: 'Pending', description: '' });
      setShowTaskModal(false);
      setSelectedTeam(null);
    }
  };

  const handleDeleteTask = (teamId, taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const updatedTeams = allTeams.map(team => {
        if (team.id === teamId) {
          return {
            ...team,
            tasks: team.tasks.filter(t => t.id !== taskId)
          };
        }
        return team;
      });
      setAllTeams(updatedTeams);
    }
  };

  const handleUpdateTaskStatus = (teamId, taskId, newStatus) => {
    const updatedTeams = allTeams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          tasks: team.tasks.map(task => 
            task.id === taskId ? { ...task, status: newStatus } : task
          )
        };
      }
      return team;
    });
    setAllTeams(updatedTeams);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return '#e74c3c';
      case 'High': return '#f39c12';
      case 'Medium': return '#3498db';
      case 'Low': return '#2ecc71';
      default: return '#95a5a6';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#2ecc71';
      case 'In Progress': return '#3498db';
      case 'Pending': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const getDepartmentName = () => {
    const names = {
      'ELEC': 'Electricity Department',
      'WATER': 'Water Department',
      'ROAD': 'Roads Department',
      'GARB': 'Garbage Department'
    };
    return names[currentDepartment] || 'Department';
  };

  return (
    <div className="teams-page">
      <Navbar title={`${getDepartmentName()} - Team Management`} subtitle="Manage your teams and assignments" />

      <div className="teams-content">
        {/* Add Team Button */}
        <div className="teams-header-section">
          <div className="teams-stats">
            <div className="stat-box">
              <span className="stat-label">Total Teams</span>
              <span className="stat-value">{teams.length}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Total Members</span>
              <span className="stat-value">{teams.reduce((sum, t) => sum + t.members.length, 0)}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Active Tasks</span>
              <span className="stat-value">{teams.reduce((sum, t) => sum + t.tasks.filter(task => task.status !== 'Completed').length, 0)}</span>
            </div>
          </div>
          <div className="header-actions">
            <button className="view-members-button" onClick={() => setShowMembersModal(true)}>
              <FaUser /> View All Members
            </button>
            <button className="add-team-button" onClick={() => setShowTeamModal(true)}>
              <FaPlus /> Create New Team
            </button>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="teams-grid">
          {teams.map(team => (
            <div key={team.id} className="team-card">
              <div className="team-card-header">
                <div className="team-title">
                  <FaUsers />
                  <h3>{team.name}</h3>
                </div>
                <div className="team-actions">
                  <button 
                    className="icon-button add-task-btn"
                    onClick={() => {
                      setSelectedTeam(team);
                      setShowTaskModal(true);
                    }}
                    title="Add Task"
                  >
                    <FaTasks />
                  </button>
                  <button 
                    className="icon-button delete-btn"
                    onClick={() => handleDeleteTeam(team.id)}
                    title="Delete Team"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="team-info">
                <p className="team-date">Created: {new Date(team.createdDate).toLocaleDateString()}</p>
              </div>

              <div className="team-members">
                <h4><FaUserPlus /> Members ({team.members.length})</h4>
                <ul className="members-list">
                  {team.members.map((member, index) => (
                    <li key={index} className="member-item">{member}</li>
                  ))}
                </ul>
              </div>

              <div className="team-tasks">
                <h4><FaTasks /> Tasks ({team.tasks.length})</h4>
                {team.tasks.length > 0 ? (
                  <div className="team-tasks-table-container">
                    <table className="team-tasks-table">
                      <thead>
                        <tr>
                          <th>✓</th>
                          <th>Task</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {team.tasks.map(task => (
                          <tr key={task.id} className={task.status === 'Completed' ? 'completed-task' : ''}>
                            <td className="checkbox-cell">
                              <input
                                type="checkbox"
                                checked={task.status === 'Completed'}
                                onChange={(e) => {
                                  handleUpdateTaskStatus(
                                    team.id,
                                    task.id,
                                    e.target.checked ? 'Completed' : 'In Progress'
                                  );
                                }}
                                className="task-checkbox"
                              />
                            </td>
                            <td className="task-title-cell">
                              <div className="task-title-wrapper">
                                <span className="task-title-text">{task.title}</span>
                                {task.description && (
                                  <span className="task-description">{task.description}</span>
                                )}
                              </div>
                            </td>
                            <td className="priority-cell">
                              <span 
                                className="priority-badge-table"
                                style={{ backgroundColor: getPriorityColor(task.priority) }}
                              >
                                {task.priority}
                              </span>
                            </td>
                            <td className="status-cell">
                              <span 
                                className="status-badge-table"
                                style={{ backgroundColor: getStatusColor(task.status) }}
                              >
                                {task.status}
                              </span>
                            </td>
                            <td className="action-cell">
                              <button
                                className="task-delete-btn"
                                onClick={() => handleDeleteTask(team.id, task.id)}
                                title="Delete Task"
                              >
                                <FaTimes />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="no-tasks">No tasks assigned yet</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {teams.length === 0 && (
          <div className="empty-state">
            <FaUsers size={60} />
            <h2>No Teams Yet</h2>
            <p>Create your first team to get started</p>
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showTeamModal && (
        <div className="modal-overlay" onClick={() => setShowTeamModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaUsers /> Create New Team</h2>
              <button className="close-button" onClick={() => setShowTeamModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Team Name</label>
                <input
                  type="text"
                  placeholder="Enter team name"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Team Members</label>
                {newTeam.members.map((member, index) => (
                  <div key={index} className="member-input-group">
                    <input
                      type="text"
                      placeholder={`Member ${index + 1} name`}
                      value={member}
                      onChange={(e) => handleMemberChange(index, e.target.value)}
                    />
                    {newTeam.members.length > 1 && (
                      <button
                        className="remove-member-btn"
                        onClick={() => handleRemoveMember(index)}
                        type="button"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                ))}
                <button className="add-member-button" onClick={handleAddMember}>
                  <FaUserPlus /> Add Another Member
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setShowTeamModal(false)}>
                Cancel
              </button>
              <button className="create-button" onClick={handleAddTeam}>
                <FaPlus /> Create Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaTasks /> Assign Task to {selectedTeam?.name}</h2>
              <button className="close-button" onClick={() => setShowTaskModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Task Title</label>
                <input
                  type="text"
                  placeholder="Enter task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Enter task description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setShowTaskModal(false)}>
                Cancel
              </button>
              <button className="create-button" onClick={handleAddTask}>
                <FaPlus /> Assign Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View All Members Modal */}
      {showMembersModal && (
        <div className="modal-overlay" onClick={() => setShowMembersModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaUser /> All Available Members</h2>
              <button className="close-button" onClick={() => setShowMembersModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="members-summary">
                <p className="members-count">Total Members: <strong>{getAllMembers().length}</strong></p>
              </div>
              {getAllMembers().length > 0 ? (
                <div className="all-members-grid">
                  {getAllMembers().map((member, index) => {
                    const memberDetails = getMemberDetails(member);
                    return (
                      <div 
                        key={index} 
                        className="member-card-detailed"
                        onClick={() => setSelectedMember(selectedMember === member ? null : member)}
                      >
                        <div className="member-card-header">
                          <div className="member-avatar">
                            <FaUser />
                          </div>
                          <div className="member-details">
                            <span className="member-name">{member}</span>
                            <span className="member-teams">
                              {memberDetails.teams.length} team(s) • {memberDetails.tasks.length} task(s)
                            </span>
                          </div>
                        </div>
                        
                        {selectedMember === member && memberDetails.tasks.length > 0 && (
                          <div className="member-tasks-section">
                            <h5><FaTasks /> Assigned Tasks:</h5>
                            <div className="tasks-table-container">
                              <table className="tasks-table">
                                <thead>
                                  <tr>
                                    <th>✓</th>
                                    <th>Task</th>
                                    <th>Team</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {memberDetails.tasks.map((task, idx) => {
                                    const taskTeam = teams.find(t => t.name === task.teamName);
                                    return (
                                      <tr key={idx} className={task.status === 'Completed' ? 'completed-task' : ''}>
                                        <td className="checkbox-cell">
                                          <input
                                            type="checkbox"
                                            checked={task.status === 'Completed'}
                                            onChange={(e) => {
                                              e.stopPropagation();
                                              handleUpdateTaskStatus(
                                                taskTeam.id,
                                                task.id,
                                                e.target.checked ? 'Completed' : 'In Progress'
                                              );
                                            }}
                                            className="task-checkbox"
                                          />
                                        </td>
                                        <td className="task-title-cell">{task.title}</td>
                                        <td className="team-cell">{task.teamName}</td>
                                        <td className="priority-cell">
                                          <span 
                                            className="priority-badge-table"
                                            style={{ backgroundColor: getPriorityColor(task.priority) }}
                                          >
                                            {task.priority}
                                          </span>
                                        </td>
                                        <td className="status-cell">
                                          <span 
                                            className="status-badge-table"
                                            style={{ backgroundColor: getStatusColor(task.status) }}
                                          >
                                            {task.status}
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                        
                        {selectedMember === member && memberDetails.tasks.length === 0 && (
                          <div className="member-tasks-section">
                            <p className="no-tasks-assigned">No tasks assigned yet</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-members">
                  <FaUser size={40} />
                  <p>No members available yet</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setShowMembersModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
