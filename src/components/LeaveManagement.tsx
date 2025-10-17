// client/src/components/LeaveManagement.tsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  requestLeave,
  fetchMyLeaves,
  fetchAllLeaves,
  updateLeaveStatus,
  fetchLeaveStats
} from '../redux/slices/authSlice';
import type { RootState, AppDispatch } from '../redux/store';

// Removed unused interface Leave
const LeaveManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, myLeaves, leaves, leaveStats, leavesLoading, leavesError } = useSelector((state: RootState) => state.auth);
  
  const [activeTab, setActiveTab] = useState<'request' | 'my-requests' | 'admin'>('request');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [showStats, setShowStats] = useState(false);

  // Fetch data based on user role
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        dispatch(fetchAllLeaves());
        // Fetch leave stats for the current user or overall stats
        dispatch(fetchLeaveStats(user._id));
      } else {
        dispatch(fetchMyLeaves());
      }
    }
  }, [dispatch, user]);

  const handleRequestLeave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate || !reason) {
      alert('Please fill all fields');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      alert('End date must be after start date');
      return;
    }

    if (start < new Date()) {
      alert('Start date cannot be in the past');
      return;
    }

    dispatch(requestLeave({ startDate, endDate, reason }));
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  const handleApproveReject = (leaveId: string, status: 'approved' | 'rejected') => {
    dispatch(updateLeaveStatus({ leaveId, status }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
  };

  // Extract available leave days from leaveStats
  const availableLeaveDays = user?._id && leaveStats?.[user._id]?.total || 0;

  if (leavesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600">Manage your leave requests and approvals</p>
          {availableLeaveDays > 0 && (
            <div className="mt-2 text-sm text-blue-600">
              Available leave days: {availableLeaveDays}
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-200 ${
                activeTab === 'request'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('request')}
            >
              Request Leave
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-200 ${
                activeTab === 'my-requests'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('my-requests')}
            >
              My Requests ({myLeaves.length})
            </button>
            {user?.role === 'admin' && (
              <button
                className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-200 ${
                  activeTab === 'admin'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('admin')}
              >
                Admin Panel ({leaves.filter(l => l.status === 'pending').length} pending)
              </button>
            )}
          </div>

          <div className="p-6">
            {leavesError && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                {leavesError}
              </div>
            )}

            {activeTab === 'request' && (
              <div className="max-w-2xl mx-auto">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Request Leave</h2>
                <form onSubmit={handleRequestLeave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        min={startDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Reason *
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Enter reason for leave..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 resize-none"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Submit Leave Request
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'my-requests' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">My Leave Requests</h2>
                {myLeaves.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-500">No leave requests found</p>
                    <p className="text-gray-400 mt-1">Submit your first leave request</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date Range</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Days</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reason</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Applied On</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {myLeaves.map(leave => (
                          <tr key={leave._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {calculateDays(leave.startDate, leave.endDate)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                              {leave.reason}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                                leave.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {formatDate(leave.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'admin' && user?.role === 'admin' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Leave Requests</h2>
                  <button
                    onClick={() => setShowStats(!showStats)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-800 transition-all duration-200"
                  >
                    {showStats ? 'Hide Stats' : 'Show Stats'}
                  </button>
                </div>

                {showStats && (
                  <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-200">
                    <h3 className="text-lg font-bold text-purple-900 mb-4">Leave Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-purple-100">
                        <div className="text-2xl font-bold text-purple-600">
                          {leaves.filter(l => l.status === 'pending').length}
                        </div>
                        <div className="text-sm text-purple-700">Pending Requests</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-green-100">
                        <div className="text-2xl font-bold text-green-600">
                          {leaves.filter(l => l.status === 'approved').length}
                        </div>
                        <div className="text-sm text-green-700">Approved</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-red-100">
                        <div className="text-2xl font-bold text-red-600">
                          {leaves.filter(l => l.status === 'rejected').length}
                        </div>
                        <div className="text-sm text-red-700">Rejected</div>
                      </div>
                    </div>
                  </div>
                )}

                {leaves.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-500">No leave requests found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date Range</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Days</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reason</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Applied On</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {leaves.map(leave => (
                          <tr key={leave._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{leave.user.name}</div>
                              <div className="text-sm text-gray-500">{leave.user.email}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {calculateDays(leave.startDate, leave.endDate)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                              {leave.reason}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                                leave.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {formatDate(leave.createdAt)}
                            </td>
                            <td className="px-6 py-4">
                              {leave.status === 'pending' && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleApproveReject(leave._id, 'approved')}
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleApproveReject(leave._id, 'rejected')}
                                    className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-pink-700 transition-all duration-200"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                              {leave.status !== 'pending' && (
                                <span className="text-sm text-gray-500">
                                  {leave.approvedBy ? `by ${leave.approvedBy.name}` : 'Processed'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveManagement;