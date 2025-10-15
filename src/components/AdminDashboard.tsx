// client/src/components/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import KanbanBoard from './KanbanBoard';
import { fetchTasks, fetchAllUsers } from '../redux/slices/taskSlice';
import type { RootState, AppDispatch } from '../redux/store';
import TaskService from '../services/taskService';

interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  color: string;
  title: string;
}

const AdminDashboard: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState<Note | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { tasks, allUsers, loading } = useSelector((state: RootState) => state.tasks);

  // Fixed project names
  const projects = [
    { id: 'proj1', name: 'Frontend' },
    { id: 'proj2', name: 'Backend' },
    { id: 'proj3', name: 'UI/UX' },
    { id: 'proj4', name: 'AI' },
  ];

  // Note colors with better contrast
  const noteColors = [
    { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800' },
    { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800' },
    { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800' },
    { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-800' },
    { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-800' },
    { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-800' },
    { bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-800' },
    { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-800' },
  ];

  // Calculate stats
  const stats = {
    totalUsers: allUsers.length,
    pendingRequests: 3, // You can calculate this from your data
    completedTasks: tasks.filter((t: any) => t.status === 'done').length,
    totalTasks: tasks.length
  };

  useEffect(() => {
    dispatch(fetchTasks() as any);
    dispatch(fetchAllUsers() as any);
    
    // Load notes from localStorage
    const savedNotes = localStorage.getItem('adminNotes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, [dispatch]);

  useEffect(() => {
    const handleTaskAssigned = () => {
      dispatch(fetchTasks() as any); // Refresh tasks when assigned
    };

    const handleTaskUpdated = () => {
      dispatch(fetchTasks() as any); // Refresh tasks when updated
    };

    const handleTaskDeleted = () => {
      dispatch(fetchTasks() as any); // Refresh tasks when deleted
    };

    TaskService.setupTaskListeners(
      handleTaskAssigned,
      handleTaskUpdated,
      handleTaskDeleted
    );

    return () => {
      TaskService.disconnect();
    };
  }, [dispatch]);

  const handleAddNote = () => {
    if (newNote.title.trim() === '' || newNote.content.trim() === '') return;
    
    const randomColor = noteColors[Math.floor(Math.random() * noteColors.length)];
    const newNoteObj: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color: `${randomColor.bg} ${randomColor.border} ${randomColor.text}`
    };
    
    const updatedNotes = [newNoteObj, ...notes];
    setNotes(updatedNotes);
    localStorage.setItem('adminNotes', JSON.stringify(updatedNotes));
    setNewNote({ title: '', content: '' });
    setShowNoteForm(false);
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem('adminNotes', JSON.stringify(updatedNotes));
  };

  const startEditingNote = (note: Note) => {
    setEditingNoteId(note.id);
    setEditNote({ ...note });
  };

  const handleUpdateNote = () => {
    if (!editingNoteId || !editNote || editNote.title.trim() === '' || editNote.content.trim() === '') return;
    
    const updatedNotes = notes.map(note => 
      note.id === editingNoteId ? editNote : note
    );
    
    setNotes(updatedNotes);
    localStorage.setItem('adminNotes', JSON.stringify(updatedNotes));
    setEditingNoteId(null);
    setEditNote(null);
  };

  if (loading) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-indigo-800 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards - unchanged */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 011-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
                <p className="text-2xl font-semibold text-gray-700">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Pending Requests</h3>
                <p className="text-2xl font-semibold text-gray-700">{stats.pendingRequests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Completed Tasks</h3>
                <p className="text-2xl font-semibold text-gray-700">{stats.completedTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Total Tasks</h3>
                <p className="text-2xl font-semibold text-gray-700">{stats.totalTasks}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Project Filter - unchanged */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Task Management</h2>
            <div className="flex items-center space-x-4">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sticky Notes Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Admin Notes</h2>
            <button
              onClick={() => setShowNoteForm(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Add Note
            </button>
          </div>

          {showNoteForm && (
            <div className="mb-6 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Note</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newNote.title}
                    onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                    placeholder="Note title..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                    placeholder="Write your note here..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition min-h-[120px] resize-y"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        handleAddNote();
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Press Ctrl+Enter to save</p>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    onClick={() => setShowNoteForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNote}
                    className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          )}

          {editingNoteId && editNote && (
            <div className="mb-6 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Note</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editNote.title}
                    onChange={(e) => setEditNote({...editNote, title: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={editNote.content}
                    onChange={(e) => setEditNote({...editNote, content: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition min-h-[120px] resize-y"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        handleUpdateNote();
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Press Ctrl+Enter to save</p>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    onClick={() => setEditingNoteId(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateNote}
                    className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Update Note
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {notes.map((note) => {
              const colorClasses = note.color.split(' ');
              const bgClass = colorClasses.find(c => c.startsWith('bg-')) || 'bg-yellow-100';
              const borderClass = colorClasses.find(c => c.startsWith('border-')) || 'border-yellow-300';
              const textClass = colorClasses.find(c => c.startsWith('text-')) || 'text-yellow-800';
              
              return (
                <div
                  key={note.id}
                  className={`border rounded-xl p-5 shadow-md h-64 flex flex-col ${bgClass} ${borderClass} ${textClass}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg truncate max-w-[70%]">{note.title}</h3>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => startEditingNote(note)}
                        className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-100"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex-grow overflow-y-auto pr-1">
                    <p className="whitespace-pre-wrap break-words text-sm">{note.content}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-opacity-30 text-xs opacity-70">
                    {new Date(note.updatedAt).toLocaleString()}
                  </div>
                </div>
              );
            })}
            {notes.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 mb-2">No notes yet</div>
                <p className="text-gray-500">Create your first note using the "Add Note" button</p>
              </div>
            )}
          </div>
        </div>

        {/* Kanban Board - unchanged */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              {selectedProject === 'all' 
                ? 'All Tasks' 
                : projects.find(p => p.id === selectedProject)?.name + ' Tasks'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Drag cards between columns to update status • Click cards to edit details
            </p>
          </div>
          <div className="p-6 min-h-[500px]">
            <KanbanBoard 
              selectedProject={selectedProject}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;