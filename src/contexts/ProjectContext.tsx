import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Project } from '../models/types';
import { useUser } from './UserContext';
import { db } from '../db/LocalDB';

interface ProjectContextValue {
  currentProject: Project | null;
  setCurrentProject: React.Dispatch<React.SetStateAction<Project | null>>;
  userProjects: Project[];
  loading: boolean;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue>({
  currentProject: null,
  setCurrentProject: () => {},
  userProjects: [],
  loading: true,
  refreshProjects: async () => {}
});

export const useProject = () => useContext(ProjectContext);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useUser();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Use useCallback to prevent the function from being recreated on every render
  const refreshProjects = useCallback(async () => {
    if (!currentUser) {
      setUserProjects([]);
      return;
    }
    
    try {
      const projects = await db.projects
        .where('ownerId')
        .equals(currentUser.id)
        .toArray();
      
      setUserProjects(projects);
      
      // If we have no current project but projects exist, set the first one
      if (!currentProject && projects.length > 0) {
        setCurrentProject(projects[0]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  }, [currentUser, currentProject]);
  
  // When the user changes, load their projects
  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      try {
        await refreshProjects();
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      loadProjects();
    } else {
      // Clear projects when no user is logged in
      setUserProjects([]);
      setCurrentProject(null);
      setLoading(false);
    }
  }, [currentUser, refreshProjects]);
  
  // When current project changes, save it to localStorage
  useEffect(() => {
    if (currentProject) {
      localStorage.setItem('currentProjectId', currentProject.id);
    } else {
      localStorage.removeItem('currentProjectId');
    }
  }, [currentProject]);
  
  return (
    <ProjectContext.Provider 
      value={{ 
        currentProject, 
        setCurrentProject, 
        userProjects, 
        loading,
        refreshProjects
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
} 