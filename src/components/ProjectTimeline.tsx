import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, MoreVertical, Calendar, Users, AlignLeft, Expand } from 'lucide-react';

export default function ProjectTimeline() {
  const [expandedSections, setExpandedSections] = useState({
    ready: true,
    inProgress: true,
    toDo: false,
  });

  const [dateRange, setDateRange] = useState({
    start: '2024-04-20',
    end: '2024-05-05'
  });

  const [viewMode, setViewMode] = useState('split'); // 'split', 'list', 'timeline'
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [customDates, setCustomDates] = useState({});
  const timelineRef = useRef(null);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Generate dates for timeline header
  const generateDateRange = () => {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const dates = [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    
    return dates;
  };

  const timelineDates = generateDateRange();

  const tasks = {
    ready: [
      {
        id: 1,
        title: 'Finalize campaign brief',
        priority: 'High',
        dueDate: 'Dec 6',
        assignees: ['👩‍💼', '👩‍💼'],
        status: 'completed',
      },
      {
        id: 2,
        title: 'Audience & market research',
        priority: 'Urgent',
        dueDate: 'Jan 1',
        assignees: ['👨‍💼'],
        status: 'completed',
      },
      {
        id: 3,
        title: 'Confirm budgets',
        priority: 'Low',
        dueDate: 'Dec 25',
        assignees: ['👩‍💼', '👨‍💼'],
        status: 'completed',
      },
    ],
    inProgress: [
      {
        id: 4,
        title: 'Draft campaign messaging & copy',
        startDate: '2024-04-20',
        endDate: '2024-05-04',
        assignees: ['👨‍💼'],
        color: 'bg-green-500',
        progress: 75,
      },
      {
        id: 5,
        title: 'Finalize asset list and bill of materials',
        startDate: '2024-04-22',
        endDate: '2024-04-28',
        assignees: ['👩‍💼', '👩‍💼'],
        color: 'bg-purple-500',
        progress: 100,
      },
      {
        id: 6,
        title: 'Define channel strategy',
        startDate: '2024-04-23',
        assignees: [],
        color: 'bg-pink-500',
        progress: 50,
      },
      {
        id: 7,
        title: 'Audience & market research',
        startDate: '2024-04-27',
        endDate: '2024-05-01',
        assignees: ['👩‍💼', '👨‍💼'],
        color: 'bg-green-500',
        progress: 25,
      },
      {
        id: 8,
        title: 'Bill of materials',
        startDate: '2024-04-24',
        endDate: '2024-04-30',
        assignees: ['👩‍💼', '👨‍💼'],
        color: 'bg-purple-500',
        progress: 90,
      },
      {
        id: 9,
        title: 'Draft campaign messaging',
        startDate: '2024-04-29',
        assignees: ['👨‍💼'],
        color: 'bg-green-600',
        progress: 10,
      },
      {
        id: 10,
        title: 'Changing start date',
        startDate: '2024-04-25',
        assignees: [],
        color: 'bg-blue-500',
        progress: 0,
      },
    ],
    toDo: [
      {
        id: 11,
        title: 'Schedule kickoff meeting',
      },
      {
        id: 12,
        title: 'Customer Beta interviews',
      },
      {
        id: 13,
        title: 'Field marketing support plan',
      },
    ],
  };

  // Calculate task position and width in timeline
  const getTaskTimelinePosition = (task) => {
    const customTaskDates = customDates[task.id];
    const startDate = customTaskDates?.startDate || task.startDate;
    const endDate = customTaskDates?.endDate || task.endDate || startDate;
    
    const timelineStart = new Date(dateRange.start);
    const taskStart = new Date(startDate);
    const taskEnd = new Date(endDate);
    
    const totalDays = (new Date(dateRange.end) - timelineStart) / (1000 * 60 * 60 * 24);
    const startOffset = (taskStart - timelineStart) / (1000 * 60 * 60 * 24);
    const duration = ((taskEnd - taskStart) / (1000 * 60 * 60 * 24)) + 1;
    
    const position = (startOffset / totalDays) * 100;
    const width = (duration / totalDays) * 100;
    
    return { position: Math.max(0, position), width: Math.min(100, width) };
  };

  const handleDragStart = (task, section) => {
    setDraggedTask({ ...task, sourceSection: section });
  };

  const handleDragOver = (e, section) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetSection) => {
    e.preventDefault();
    if (draggedTask && draggedTask.sourceSection !== targetSection) {
      // In a real app, you'd update your state management here
      console.log(`Moving task ${draggedTask.id} from ${draggedTask.sourceSection} to ${targetSection}`);
    }
  };

  const updateTaskDates = (taskId, newStartDate, newEndDate) => {
    setCustomDates(prev => ({
      ...prev,
      [taskId]: {
        startDate: newStartDate,
        endDate: newEndDate
      }
    }));
  };

  const TaskItem = ({ task, isListView, section }) => {
    if (isListView) {
      return (
        <div 
          className="flex items-center gap-3 p-3 border-b border-gray-200 hover:bg-gray-50 cursor-move"
          draggable
          onDragStart={() => handleDragStart(task, section)}
        >
          <input type="checkbox" className="w-5 h-5" />
          <div className="flex-1">
            <p className="font-medium text-gray-800">{task.title}</p>
          </div>
          <div className="flex items-center gap-4">
            {task.priority && (
              <span className={`text-sm font-medium text-gray-600`}>
                {task.priority === 'High' && '🚩 High'}
                {task.priority === 'Urgent' && '🚩'}
                {task.priority === 'Low' && '🚩 Low'}
              </span>
            )}
            <span className="text-sm text-gray-500">{task.dueDate}</span>
            <div className="flex -space-x-2">
              {task.assignees?.map((assignee, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center text-sm font-bold text-white border-2 border-white"
                >
                  {assignee}
                </div>
              ))}
            </div>
            <button className="p-1 hover:bg-gray-200 rounded">
              <MoreVertical size={16} className="text-gray-500" />
            </button>
          </div>
        </div>
      );
    }

    // Timeline view
    const { position, width } = getTaskTimelinePosition(task);
    
    return (
      <div 
        className="relative py-2 cursor-move"
        draggable
        onDragStart={() => handleDragStart(task, section)}
      >
        <div
          className={`${task.color} text-white rounded-lg px-3 py-2 inline-flex items-center gap-2 text-sm font-medium whitespace-nowrap shadow-sm hover:shadow-md transition-shadow`}
          style={{
            marginLeft: `${position}%`,
            width: `${width}%`,
            minWidth: 'fit-content'
          }}
        >
          <div className="flex -space-x-1">
            {task.assignees?.map((assignee, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full bg-white bg-opacity-30 flex items-center justify-center text-xs"
              >
                {assignee}
              </div>
            ))}
          </div>
          {task.title}
          {task.progress !== undefined && (
            <div className="ml-2 w-16 bg-white bg-opacity-30 rounded-full h-1.5">
              <div 
                className="bg-white h-1.5 rounded-full" 
                style={{ width: `${task.progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const TimelineView = () => (
    <div className={`bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg border ${isTimelineExpanded ? 'col-span-2' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm font-semibold text-gray-600">
          {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
        </p>
        <button 
          onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-white rounded-lg border hover:bg-gray-50"
        >
          <Expand size={16} />
          {isTimelineExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {/* Timeline Grid */}
      <div className="space-y-6">
        {/* Date Header */}
        <div className="flex gap-1 text-center pl-12">
          {timelineDates.map((date, i) => (
            <div 
              key={i} 
              className="flex-1 text-xs font-semibold text-gray-500 min-w-8"
            >
              {date.getDate()}
              <div className="text-xs font-normal text-gray-400">
                {date.toLocaleDateString('en', { month: 'short' })}
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Tasks */}
        <div className="space-y-3 relative">
          {tasks.inProgress.map((task) => (
            <TaskItem 
              key={task.id} 
              task={task} 
              isListView={false} 
              section="inProgress"
            />
          ))}
          
          {/* Grid lines */}
          <div className="absolute inset-0 flex gap-1 pl-12 pointer-events-none">
            {timelineDates.map((_, i) => (
              <div 
                key={i} 
                className="flex-1 border-l border-gray-200"
                style={{ minWidth: '32px' }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const ListViewSection = ({ title, section, tasks, color }) => (
    <div 
      className="border rounded-lg overflow-hidden"
      onDragOver={(e) => handleDragOver(e, section)}
      onDrop={(e) => handleDrop(e, section)}
    >
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 font-semibold"
        style={{ color }}
      >
        <ChevronDown
          size={18}
          className={`transform transition ${
            expandedSections[section] ? '' : '-rotate-90'
          }`}
        />
        <span className="text-lg">
          {section === 'ready' ? '✓' : section === 'inProgress' ? '◎' : '○'}
        </span>
        {title}
        <span className="ml-2 text-sm font-normal text-gray-500">
          ({tasks.length})
        </span>
      </button>
      {expandedSections[section] && (
        <div>
          {tasks.map((task) => (
            <TaskItem 
              key={task.id} 
              task={task} 
              isListView={true} 
              section={section}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full bg-white p-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Project Timeline</h1>
        
        <div className="flex items-center gap-4">
          {/* Date Range Picker */}
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-500" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="border rounded px-2 py-1 text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['split', 'list', 'timeline'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-md text-sm font-medium capitalize ${
                  viewMode === mode 
                    ? 'bg-white shadow text-gray-800' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">
            <Plus size={18} />
            Add Task
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`grid gap-6 ${
        viewMode === 'split' ? 'grid-cols-2' : 
        viewMode === 'list' ? 'grid-cols-1' : 
        'grid-cols-1'
      }`}>
        {/* List View (shown in split and list modes) */}
        {(viewMode === 'split' || viewMode === 'list') && (
          <div className={viewMode === 'split' ? '' : 'max-w-4xl'}>
            <div className="space-y-4">
              <ListViewSection
                title="Ready"
                section="ready"
                tasks={tasks.ready}
                color="#059669"
              />
              
              <ListViewSection
                title="In Progress"
                section="inProgress"
                tasks={tasks.inProgress}
                color="#2563eb"
              />
              
              <ListViewSection
                title="To Do"
                section="toDo"
                tasks={tasks.toDo}
                color="#6b7280"
              />
            </div>
          </div>
        )}

        {/* Timeline View (shown in split and timeline modes) */}
        {(viewMode === 'split' || viewMode === 'timeline') && (
          <TimelineView />
        )}
      </div>
    </div>
  );
}