// frontend/src/components/admin/UserManagement.tsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchAllUsers, 
  updateUserRole, 
  addUserToTeam as addUserToTeamAction,
  removeUserFromTeam as removeUserFromTeamAction
} from '../redux/slices/authSlice';
import { 
  fetchAllTeams, 
  createTeam, 
  deleteTeam, 
  addMemberToTeam, 
  removeMemberFromTeam
} from '../redux/slices/authSlice';
import type { RootState, AppDispatch } from '../redux/store'; // Import AppDispatch

// Define types for User and Team
interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
  team?: {
    _id: string;
    name: string;
  };
}

interface Team {
  _id: string;
  name: string;
  description?: string;
  project?: string;
  members: User[]; // Assuming members are stored as full user objects in the team
  createdAt: string;
}

// Define the state slice type based on your authSlice
interface AuthState {
  user: User | null; // Current logged-in user
  token: string | null;
  loading: boolean;
  error: string | null;
  users: User[]; // List of all users
  teams: Team[]; // List of all teams
  usersLoading: boolean;
  teamsLoading: boolean;
  usersError: string | null;
  teamsError: string | null;
  // ... other auth-related state
}

const UserManagement: React.FC = () => {
  const dispatch: AppDispatch = useDispatch(); // Use AppDispatch for correct typing
  // Use the more specific AuthState type
  const { users, teams, usersLoading, teamsLoading, usersError, teamsError } = useSelector(
    (state: RootState) => (state as { auth: AuthState }).auth // Type assertion might be needed depending on your root state structure
  );
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', description: '', project: '' });
  const [activeTab, setActiveTab] = useState<'users' | 'teams'>('users');

  // Fetch users and teams from auth slice
  useEffect(() => {
    dispatch(fetchAllUsers());
    dispatch(fetchAllTeams());
  }, [dispatch]);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTeam.name.trim()) return;
    
    try {
      const resultAction = await dispatch(createTeam({
        name: newTeam.name,
        description: newTeam.description,
        project: newTeam.project,
        members: selectedUsers
      }));

      // Check if the dispatched action was successful
      if (createTeam.fulfilled.match(resultAction)) {
        const createdTeam = resultAction.payload; // Use resultAction.payload

        if (createdTeam && createdTeam._id) {
          // Update users to assign them to the new team
          selectedUsers.forEach(userId => {
            // Dispatch the action to update the user's team in the global state
            dispatch(addUserToTeamAction({ 
              userId, 
              teamId: createdTeam._id, 
              teamName: createdTeam.name 
            }));
          });
        }
      } else if (createTeam.rejected.match(resultAction)) {
        console.error('Failed to create team:', resultAction.error.message || 'Unknown error');
        // Optionally, display an error message to the user
      }
      
      setNewTeam({ name: '', description: '', project: '' });
      setSelectedUsers([]);
      setShowCreateTeamModal(false);
    } catch (error) {
      console.error('Error creating team:', error);
      // Optionally, display an error message to the user
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length && filteredUsers.length > 0) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user._id));
    }
  };

  const handleAssignUserToTeam = async (userId: string, teamId: string) => {
    try {
      const resultAction = await dispatch(addMemberToTeam({ teamId, userId }));
      
      if (addMemberToTeam.fulfilled.match(resultAction)) {
        const updatedTeam = resultAction.payload; // Use resultAction.payload
        
        if (updatedTeam && updatedTeam._id && updatedTeam.name) {
          // Update user's team in the global state
          dispatch(addUserToTeamAction({ 
            userId, 
            teamId: updatedTeam._id, 
            teamName: updatedTeam.name 
          }));
        }
      } else if (addMemberToTeam.rejected.match(resultAction)) {
        console.error('Failed to add user to team:', resultAction.error.message || 'Unknown error');
        // Optionally, display an error message
      }
    } catch (error) {
      console.error('Error assigning user to team:', error);
      // Optionally, display an error message
    }
  };

  const handleRemoveUserFromTeam = async (userId: string, teamId: string) => {
    try {
      const resultAction = await dispatch(removeMemberFromTeam({ teamId, userId }));
      
      if (removeMemberFromTeam.fulfilled.match(resultAction)) {
        // const updatedTeam = resultAction.payload; // Potentially updated team object
        // Update user's team (remove from team) in the global state
        dispatch(removeUserFromTeamAction(userId));
      } else if (removeMemberFromTeam.rejected.match(resultAction)) {
        console.error('Failed to remove user from team:', resultAction.error.message || 'Unknown error');
        // Optionally, display an error message
      }
    } catch (error) {
      console.error('Error removing user from team:', error);
      // Optionally, display an error message
    }
  };

  const handleAddUsersToExistingTeam = async (teamId: string) => {
    if (selectedUsers.length === 0) return;
    
    for (const userId of selectedUsers) {
      try {
        const resultAction = await dispatch(addMemberToTeam({ teamId, userId }));
        
        if (addMemberToTeam.fulfilled.match(resultAction)) {
          const updatedTeam = resultAction.payload; // Use resultAction.payload
          
          if (updatedTeam && updatedTeam._id && updatedTeam.name) {
            // Update user's team in the global state
            dispatch(addUserToTeamAction({ 
              userId, 
              teamId: updatedTeam._id, 
              teamName: updatedTeam.name 
            }));
          }
        } else if (addMemberToTeam.rejected.match(resultAction)) {
          console.error(`Failed to add user ${userId} to team:`, resultAction.error.message || 'Unknown error');
          // Optionally, display an error message for this specific user
        }
      } catch (error) {
        console.error(`Error adding user ${userId} to team:`, error);
        // Optionally, display an error message for this specific user
      }
    }
    
    setSelectedUsers([]); // Clear selection after attempting to add all
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    
    try {
      const resultAction = await dispatch(deleteTeam(teamId));
      
      if (deleteTeam.fulfilled.match(resultAction)) {
        // Update users in the global state to remove team assignment
        users.forEach(user => {
          if (user.team && user.team._id === teamId) {
            dispatch(removeUserFromTeamAction(user._id));
          }
        });
      } else if (deleteTeam.rejected.match(resultAction)) {
        console.error('Failed to delete team:', resultAction.error.message || 'Unknown error');
        // Optionally, display an error message
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      // Optionally, display an error message
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      await dispatch(updateUserRole({ userId, role: newRole }));
    } catch (error) {
      console.error('Error updating user role:', error);
      // Optionally, display an error message
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?'; // Handle potential undefined or empty name
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-gradient-to-r from-red-500 to-pink-600';
      default: return 'bg-gradient-to-r from-green-500 to-teal-600';
    }
  };

  const loading = usersLoading || teamsLoading;
  const error = usersError || teamsError;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <button 
              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 group"
              onClick={() => setShowCreateTeamModal(true)}
            >
              <span className="text-xl group-hover:scale-110 transition-transform">+</span> 
              Create New Team
            </button>
          </div>
          <p className="text-gray-600">Manage your team members and collaborate effectively</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-blue-600 text-xl">👥</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Teams</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{teams.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-xl">🏢</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{users.filter(u => u.role === 'admin').length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-purple-600 text-xl">👑</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Selected</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{selectedUsers.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <span className="text-yellow-600 text-xl">✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-200 ${
                activeTab === 'users'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('users')}
            >
              Users ({users.length})
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-200 ${
                activeTab === 'teams'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('teams')}
            >
              Teams ({teams.length})
            </button>
          </div>

          <div className="p-6">
            {/* Search Bar */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
              </div>
            </div>

            {activeTab === 'users' ? (
              /* Users Table */
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left">
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                            onChange={handleSelectAll}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                          />
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Member</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Team</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Join Date</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                          <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedUsers.includes(user._id)}
                                onChange={() => handleSelectUser(user._id)}
                                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold mr-4 shadow-sm">
                                  {getInitials(user.name)}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{user.name}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={user.role}
                                onChange={(e) => handleUpdateUserRole(user._id, e.target.value as 'admin' | 'user')}
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${getRoleColor(user.role)} focus:outline-none`}
                              >
                                <option value="user">user</option>
                                <option value="admin">admin</option>
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              {user.team ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                  {user.team.name}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400 italic">No team assigned</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {new Date(user.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                            <td className="px-6 py-4">
                              {!user.team ? (
                                <select 
                                  onChange={(e) => handleAssignUserToTeam(user._id, e.target.value)}
                                  defaultValue=""
                                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
                                  className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-sm"
                                  onClick={() => handleRemoveUserFromTeam(user._id, user.team!._id)}
                                >
                                  Remove
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center">
                            <div className="text-gray-400">
                              <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                              <p className="text-lg font-medium text-gray-500">No users found</p>
                              <p className="text-sm">Try adjusting your search terms</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Teams Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.length > 0 ? (
                  teams.map(team => (
                    <div key={team._id} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{team.name}</h3>
                          <p className="text-gray-600 text-sm mt-1">{team.description || 'No description provided'}</p>
                          {team.project && (
                            <p className="text-sm text-gray-500 mt-1">
                              <span className="font-medium">Project:</span> {team.project}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {team.members.length} {team.members.length === 1 ? 'member' : 'members'}
                          </span>
                          <button 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-full text-sm transition-colors"
                            onClick={() => handleDeleteTeam(team._id)}
                            title="Delete team"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <select
                          onChange={(e) => {
                             const selectedUserId = e.target.value;
                             if (selectedUserId) {
                               handleAddUsersToExistingTeam(team._id);
                               e.target.value = ''; // Reset dropdown
                             }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          defaultValue=""
                        >
                          <option value="" disabled>Add selected users...</option>
                          {users.filter(u => !u.team || u.team._id !== team._id).map(user => (
                            <option key={user._id} value={user._id}>
                              {user.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-4">
                        <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <span>Team Members</span>
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                            {team.members.length}
                          </span>
                        </h5>
                        {team.members.length > 0 ? (
                          <div className="space-y-3">
                            {team.members.map(member => (
                              <div key={member._id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-white flex items-center justify-center font-bold text-xs mr-3">
                                    {getInitials(member.name)}
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-gray-900">{member.name}</span>
                                    <div className="text-xs text-gray-500">{member.email}</div>
                                  </div>
                                </div>
                                <button 
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                                  onClick={() => handleRemoveUserFromTeam(member._id, team._id)}
                                  title="Remove from team"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <div className="text-gray-400 mb-2">
                              <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-500">No members in this team yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="text-gray-400">
                      <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <p className="text-lg font-medium text-gray-500 mb-2">No teams created yet</p>
                      <p className="text-sm mb-4">Get started by creating your first team</p>
                      <button 
                        className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all duration-200"
                        onClick={() => setShowCreateTeamModal(true)}
                      >
                        Create Your First Team
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Create Team Modal */}
        {showCreateTeamModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Create New Team</h3>
                <button 
                  className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                  onClick={() => setShowCreateTeamModal(false)}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleCreateTeam} className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                    required
                    placeholder="Enter team name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Team Description
                  </label>
                  <textarea
                    value={newTeam.description}
                    onChange={(e) => setNewTeam({...newTeam, description: e.target.value})}
                    placeholder="Enter team description (optional)"
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200 resize-none"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project (Optional)
                  </label>
                  <input
                    type="text"
                    value={newTeam.project}
                    onChange={(e) => setNewTeam({...newTeam, project: e.target.value})}
                    placeholder="Enter project name (optional)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
                  />
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Selected Users ({selectedUsers.length})
                  </h4>
                  {selectedUsers.length > 0 ? (
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-gray-50 rounded-xl">
                      {users
                        .filter(user => selectedUsers.includes(user._id))
                        .map(user => (
                          <div key={user._id} className="bg-white px-3 py-2 rounded-lg border border-gray-200 text-sm flex items-center gap-2 shadow-sm">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                              {getInitials(user.name)}
                            </div>
                            <span className="font-medium text-gray-700">{user.name}</span>
                            <button 
                              type="button"
                              onClick={() => handleSelectUser(user._id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-500 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-gray-500 text-sm">No users selected</p>
                      <p className="text-gray-400 text-xs mt-1">Select users from the table above</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button 
                    type="button" 
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setShowCreateTeamModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      selectedUsers.length === 0 || !newTeam.name 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 shadow-sm'
                    }`}
                    disabled={selectedUsers.length === 0 || !newTeam.name}
                  >
                    Create Team
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;