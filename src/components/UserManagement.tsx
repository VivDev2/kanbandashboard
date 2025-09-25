// frontend/src/components/admin/UserTeamManagement.tsx
import React, { useState, useEffect } from 'react';
import socketService from '../../src/services/socketService';
import { userService } from '../../src/services/userService';
import { useAuth } from '../hook/useAuth';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  team?: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

interface Team {
  _id: string;
  name: string;
  description?: string;
  members: string[];
}

const UserTeamManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchData();

    // Set up socket event listeners
    socketService.on('userAssignedToTeam', () => {
      fetchData();
    });

    socketService.on('userRemovedFromTeam', () => {
      fetchData();
    });

    socketService.on('teamCreated', () => {
      fetchTeams();
    });

    // Cleanup socket listeners
    return () => {
      socketService.off('userAssignedToTeam');
      socketService.off('userRemovedFromTeam');
      socketService.off('teamCreated');
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchTeams()]);
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      // Create a separate function for team users since it's different from regular users
      const token = localStorage.getItem('token');
      const response = await fetch('/api/teams/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/teams', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setTeams(data.teams);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTeam)
      });
      const data = await response.json();
      if (data.success) {
        setNewTeam({ name: '', description: '' });
        fetchTeams();
      }
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const handleAssignUserToTeam = async (userId: string, teamId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/teams/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, teamId })
      });
      const data = await response.json();
      if (data.success) {
        fetchData();
      }
    } catch (error) {
      console.error('Error assigning user to team:', error);
    }
  };

  const handleRemoveUserFromTeam = async (userId: string, teamId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/teams/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, teamId })
      });
      const data = await response.json();
      if (data.success) {
        fetchData();
      }
    } catch (error) {
      console.error('Error removing user from team:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="user-team-management">
      <h2>User & Team Management</h2>
      
      {/* Create Team Section */}
      <div className="create-team-section">
        <h3>Create New Team</h3>
        <form onSubmit={handleCreateTeam} className="team-form">
          <input
            type="text"
            placeholder="Team Name"
            value={newTeam.name}
            onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
            required
          />
          <textarea
            placeholder="Team Description"
            value={newTeam.description}
            onChange={(e) => setNewTeam({...newTeam, description: e.target.value})}
          />
          <button type="submit">Create Team</button>
        </form>
      </div>

      {/* Teams Section */}
      <div className="teams-section">
        <h3>Teams ({teams.length})</h3>
        <div className="teams-grid">
          {teams.map(team => (
            <div key={team._id} className="team-card">
              <h4>{team.name}</h4>
              <p>{team.description || 'No description'}</p>
              <span className="member-count">{team.members.length} members</span>
            </div>
          ))}
        </div>
      </div>

      {/* Users Section */}
      <div className="users-section">
        <h3>All Users ({users.length})</h3>
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Team</th>
                <th>Join Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {user.team ? (
                      <span className="team-badge">
                        {user.team.name}
                      </span>
                    ) : (
                      <span className="no-team">No team</span>
                    )}
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    {!user.team ? (
                      <select 
                        onChange={(e) => handleAssignUserToTeam(user._id, e.target.value)}
                        defaultValue=""
                      >
                        <option value="" disabled>Assign to Team</option>
                        {teams.map(team => (
                          <option key={team._id} value={team._id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button 
                        className="remove-btn"
                        onClick={() => handleRemoveUserFromTeam(user._id, user.team._id)}
                      >
                        Remove from Team
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .user-team-management {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .loading {
          text-align: center;
          padding: 50px;
          font-size: 18px;
        }

        .create-team-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }

        .team-form {
          display: flex;
          gap: 10px;
          align-items: end;
          flex-wrap: wrap;
        }

        .team-form input,
        .team-form textarea {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          flex: 1;
          min-width: 200px;
        }

        .team-form button {
          padding: 10px 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .teams-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 15px;
        }

        .team-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          background: white;
        }

        .team-card h4 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .team-card p {
          margin: 0 0 10px 0;
          color: #666;
          font-size: 14px;
        }

        .member-count {
          background: #e9ecef;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        }

        .users-table {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }

        th {
          background: #f8f9fa;
          font-weight: 600;
          color: #333;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #007bff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
        }

        .role-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .role-badge.admin {
          background: #dc3545;
          color: white;
        }

        .role-badge.user {
          background: #28a745;
          color: white;
        }

        .team-badge {
          background: #17a2b8;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
        }

        .no-team {
          color: #6c757d;
          font-style: italic;
        }

        select {
          padding: 6px 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .remove-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .remove-btn:hover {
          background: #c82333;
        }
      `}</style>
    </div>
  );
};

export default UserTeamManagement;