// client/src/pages/Dashboard/Projects.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import KanbanBoard from '../components/KanbanBoard';
import { mockProjects } from '../data/mockData';

const Projects: React.FC = () => {
  const { projectId } = useParams<{ projectId?: string }>();

  const project = projectId ? mockProjects.find(p => p.id === projectId) : null;

  return (
    <div className="h-full">
      {project ? (
        <div>
          <div className="mb-6">
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full ${project.color} mr-3`}></div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            </div>
            <p className="text-gray-600 mt-1">{project.description}</p>
          </div>
          <KanbanBoard projectId={projectId} />
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">All Projects</h1>
            <p className="text-gray-600">Select a project to view its Kanban board</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockProjects.map(project => (
              <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className={`w-4 h-4 rounded-full ${project.color} mr-3`}></div>
                  <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                <a
                  href={`/dashboard/projects/${project.id}`}
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  View Board
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;