import React, { createContext, useContext, ReactNode } from 'react';
import type { Client, Project } from '../types';

interface AppContextType {
  clients: Client[];
  currentUser: any;
  selectedProject: Project | null;
  selectedClient: any;
  isFirebaseMode: boolean;
  // 공통 액션들
  onSelectClient: (clientId: string) => void;
  onSelectProject: (projectId: string) => void;
  onAddClient: () => void;
  onAddProject: () => void;
  onEditProject: (project: Project, requesterId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

interface AppProviderProps {
  children: ReactNode;
  value: AppContextType;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children, value }) => {
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;