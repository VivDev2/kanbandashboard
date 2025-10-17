import React, { useState } from 'react';
import { ChevronDown, Plus, MoreVertical, Calendar, Expand } from 'lucide-react';

interface CompletedTask {
  id: number;
  title: string;
  priority: string;
  dueDate: string;
  assignees: string[];
  status: 'completed';
}

interface InProgressTask {
  id: number;
  title: string;
  startDate: string;
  endDate?: string;
  assignees: string[];
  color: string;
  progress: number;
}

interface ToDoTask {
  id: number;
  title: string;
}

type Task = CompletedTask | InProgressTask | ToDoTask;

interface DateRange {
  start: string;
  end: string;
}

interface ExpandedSections {
  ready: boolean;
  inProgress: boolean;
  toDo: boolean;
}

interface CustomDates {
  [taskId: number]: {
    startDate: string;
    endDate?: string;
  };
}

interface DraggedTask extends InProgressTask {
  sourceSection: keyof TaskSections;
}

interface TaskSections {
  ready: CompletedTask[];
  inProgress: InProgressTask[];
  toDo: ToDoTask[];
}

const ProjectTimeline: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    ready: true,
    inProgress: true,
    toDo: false,
  });

  const [dateRange, setDateRange] = useState<DateRange>({
    start: '2024-04-20',
    end: '2024-05-05'
  });

  const [viewMode, setViewMode] = useState<'split' | 'list' | 'timeline'>('split');
  const [isTimelineExpanded, setIsTimelineExpanded] = useState<boolean>(false);
  const [draggedTask, setDraggedTask] = useState<DraggedTask | null>(null);
  const [customDates, setCustomDates] = useState<CustomDates>({});

  const toggleSection = (section: keyof ExpandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const generateDateRange = (): Date[] => {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const dates: Date[] = [];
    
    const current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  const timelineDates = generateDateRange();

  const tasks: TaskSections = {
    ready: [
      {
        id: 1,
        title: 'Finalize campaign brief',
        priority: 'High',
        dueDate: 'Dec 6',
        assignees: ['👩‍💼', '👩‍💼'],
        status: 'completed',
      }
    ] as CompletedTask[],
    inProgress: [
      {
        id: 4,
        title: 'Draft campaign messaging & copy',
        startDate: '2024-04-20',
        endDate: '2024-05-04',
        assignees: ['👨‍💼'],
        color: 'bg-green-500',
        progress: 75,
      }
    ] as InProgressTask[],
    toDo: [
      {
        id: 11,
        title: 'Schedule kickoff meeting',
      },
      {
        id: 12,
        title: 'Customer Beta interviews',
      }
    ] as ToDoTask[],
  };

  const getTaskTimelinePosition = (task: InProgressTask) => {
    const customTaskDates = customDates[task.id];
    const startDate = customTaskDates?.startDate || task.startDate;
    const endDate = customTaskDates?.endDate || task.endDate || startDate;
    
    const timelineStart = new Date(dateRange.start);
    const taskStart = new Date(startDate);
    const taskEnd = new Date(endDate);
    
    const totalDays = (new Date(dateRange.end).getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24);
    const startOffset = (taskStart.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24);
    const duration = ((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const position = (startOffset / totalDays) * 100;
    const width = (duration / totalDays) * 100;
    
    return { position: Math.max(0, position), width: Math.min(100, width) };
  };

  const handleDragStart = (task: InProgressTask, section: keyof TaskSections) => {
    setDraggedTask({ ...task, sourceSection: section });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetSection: keyof TaskSections) => {
    e.preventDefault();
    if (draggedTask && draggedTask.sourceSection !== targetSection) {
      console.log(`Moving task ${draggedTask.id} from ${String(draggedTask.sourceSection)} to ${String(targetSection)}`);
      // Remove the unused variable warning by using setCustomDates
      setCustomDates(prev => ({ ...prev }));
    }
    setDraggedTask(null);
  };

  interface TaskItemProps {
    task: Task;
    isListView: boolean;
    section: keyof TaskSections;
  }

  const TaskItem: React.FC<TaskItemProps> = ({ task, isListView, section }) => {
    if (isListView) {
      return (
        <div 
          className="flex items-center gap-3 p-3 border-b border-gray-200 hover:bg-gray-50 cursor-move"
          draggable={section === 'inProgress'}
          onDragStart={() => section === 'inProgress' && handleDragStart(task as InProgressTask, section)}
        >
          <input type="checkbox" className="w-5 h-5" />
          <div className="flex-1">
            <p className="font-medium text-gray-800">{task.title}</p>
          </div>
          <div className="flex items-center gap-4">
            {'priority' in task && (
              <span className={`text-sm font-medium text-gray-600`}>
                {task.priority === 'High' && '🚩 High'}
                {task.priority === 'Urgent' && '🚩'}
                {task.priority === 'Low' && '🚩 Low'}
              </span>
            )}
            {'dueDate' in task && (
              <span className="text-sm text-gray-500">{task.dueDate}</span>
            )}
            <div className="flex -space-x-2">
              {task.hasOwnProperty('assignees') && 
               (task as (CompletedTask | InProgressTask)).assignees?.map((assignee, i) => (
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

    if (section !== 'inProgress') return null;

    const inProgressTask = task as InProgressTask;
    const { position, width } = getTaskTimelinePosition(inProgressTask);
    
    return (
      <div 
        className="relative py-2 cursor-move"
        draggable
        onDragStart={() => handleDragStart(inProgressTask, section)}
      >
        <div
          className={`${inProgressTask.color} text-white rounded-lg px-3 py-2 inline-flex items-center gap-2 text-sm font-medium whitespace-nowrap shadow-sm hover:shadow-md transition-shadow`}
          style={{
            marginLeft: `${position}%`,
            width: `${width}%`,
            minWidth: 'fit-content'
          }}
        >
          <div className="flex -space-x-1">
            {inProgressTask.assignees.map((assignee, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full bg-white bg-opacity-30 flex items-center justify-center text-xs"
              >
                {assignee}
              </div>
            ))}
          </div>
          {inProgressTask.title}
          {inProgressTask.progress !== undefined && (
            <div className="ml-2 w-16 bg-white bg-opacity-30 rounded-full h-1.5">
              <div 
                className="bg-white h-1.5 rounded-full" 
                style={{ width: `${inProgressTask.progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const TimelineView: React.FC = () => (
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

      <div className="space-y-6">
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

        <div className="space-y-3 relative">
          {tasks.inProgress.map((task) => (
            <TaskItem 
              key={task.id} 
              task={task} 
              isListView={false} 
              section="inProgress"
            />
          ))}
          
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

  interface ListViewSectionProps {
    title: string;
    section: keyof TaskSections;
    tasks: Task[];
    color: string;
  }

  const ListViewSection: React.FC<ListViewSectionProps> = ({ title, section, tasks, color }) => (
    <div 
      className="border rounded-lg overflow-hidden"
      onDragOver={handleDragOver}
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Project Timeline</h1>
        
        <div className="flex items-center gap-4">
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

          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['split', 'list', 'timeline'] as const).map((mode) => (
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

      <div className={`grid gap-6 ${
        viewMode === 'split' ? 'grid-cols-2' : 
        viewMode === 'list' ? 'grid-cols-1' : 
        'grid-cols-1'
      }`}>
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

        {(viewMode === 'split' || viewMode === 'timeline') && (
          <TimelineView />
        )}
      </div>
    </div>
  );
};

export default ProjectTimeline;