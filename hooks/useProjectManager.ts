import { useState, useCallback, useMemo } from 'react';
import { flushSync } from 'react-dom';
import type { Client, Project, Test, Requester } from '../types';
import { DEFAULT_STAGES } from '../constants';
import { useForceUpdate } from './useForceUpdate';

export const useProjectManager = (
  clients: Client[],
  setClients: React.Dispatch<React.SetStateAction<Client[]>>,
  selectedClientId: string | null,
  selectedProjectId: string | null,
  setSelectedProjectId: React.Dispatch<React.SetStateAction<string | null>>,
  isSearchActive: boolean,
  setFilteredClients: React.Dispatch<React.SetStateAction<Client[]>>
) => {
  const forceUpdate = useForceUpdate();

  const selectedClient = useMemo(() => 
    clients.find(c => c.id === selectedClientId), 
    [clients, selectedClientId]
  );
  
  const selectedProject = useMemo(() => 
    selectedClient?.requesters
      .flatMap(r => r.projects)
      .find(p => p.id === selectedProjectId),
    [selectedClient, selectedProjectId]
  );
    
  const selectedRequester = useMemo(() => 
    selectedClient?.requesters
      .find(r => r.projects.some(p => p.id === selectedProjectId)),
    [selectedClient, selectedProjectId]
  );

  const handleAddProject = useCallback((projectData: Omit<Project, 'stages' | 'tests'>, requesterId: string) => {
    if (!selectedClientId) return;
    
    const selectedClient = clients.find(c => c.id === selectedClientId);
    if (!selectedClient || selectedClient.requesters.length === 0) {
      alert('프로젝트를 추가하려면 먼저 의뢰자를 추가해주세요.');
      return;
    }
    
    const newProject: Project = {
      ...projectData,
      stages: DEFAULT_STAGES.map((s, index) => ({...s, id: `stage-${Date.now()}-${index}`})),
      tests: [],
      followUps: [],
    };
    
    const updatedClients = clients.map(client => {
      if (client.id === selectedClientId) {
        const updatedRequesters = client.requesters.map(requester => {
          if (requester.id === requesterId) {
            return { ...requester, projects: [...requester.projects, newProject] };
          }
          return requester;
        });
        return { ...client, requesters: updatedRequesters };
      }
      return client;
    });
    
    flushSync(() => {
      setClients(updatedClients);
      setSelectedProjectId(newProject.id);
      
      if (!isSearchActive) {
        setFilteredClients(updatedClients);
      }
    });
    
    forceUpdate();
  }, [clients, selectedClientId, setClients, setSelectedProjectId, isSearchActive, setFilteredClients, forceUpdate]);

  const handleUpdateProject = useCallback((updatedProject: Project) => {
    if (!selectedClientId || !selectedRequester) return;

    const updatedClients = clients.map(client => {
      if (client.id === selectedClientId) {
        const updatedRequesters = client.requesters.map(requester => {
          if (requester.id === selectedRequester.id) {
            const updatedProjects = requester.projects.map(p =>
              p.id === updatedProject.id ? { ...updatedProject } : p
            );
            return { ...requester, projects: updatedProjects };
          }
          return requester;
        });
        return { ...client, requesters: updatedRequesters };
      }
      return client;
    });
    
    flushSync(() => {
      setClients(updatedClients);
      
      if (!isSearchActive) {
        setFilteredClients(updatedClients);
      } else {
        const updatedFilteredClients = clients.map(client => {
          if (client.id === selectedClientId) {
            const updatedRequesters = client.requesters.map(requester => {
              if (requester.id === selectedRequester.id) {
                const updatedProjects = requester.projects.map(p =>
                  p.id === updatedProject.id ? { ...updatedProject } : p
                );
                return { ...requester, projects: updatedProjects };
              }
              return requester;
            });
            return { ...client, requesters: updatedRequesters };
          }
          return client;
        });
        setFilteredClients(updatedFilteredClients);
      }
    });
    
    forceUpdate();
  }, [clients, selectedClientId, selectedRequester, setClients, isSearchActive, setFilteredClients, forceUpdate]);

  const handleDeleteProject = useCallback((projectId: string) => {
    if (!selectedClientId || !window.confirm('정말로 이 프로젝트를 삭제하시겠습니까?\n\n삭제된 프로젝트는 복구할 수 없습니다.')) return;
    
    const updatedClients = clients.map(client => {
      if (client.id === selectedClientId) {
        const updatedRequesters = client.requesters.map(requester => ({
          ...requester,
          projects: requester.projects.filter(p => p.id !== projectId)
        }));
        return { ...client, requesters: updatedRequesters };
      }
      return client;
    });
    
    setClients(updatedClients);
    
    setFilteredClients(prevFiltered => 
      prevFiltered.map(client => {
        if (client.id === selectedClientId) {
          const updatedRequesters = client.requesters.map(requester => ({
            ...requester,
            projects: requester.projects.filter(p => p.id !== projectId)
          }));
          return { ...client, requesters: updatedRequesters };
        }
        return client;
      })
    );
    
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
    }
  }, [clients, selectedClientId, selectedProjectId, setClients, setFilteredClients, setSelectedProjectId]);

  return {
    selectedClient,
    selectedProject,
    selectedRequester,
    handleAddProject,
    handleUpdateProject,
    handleDeleteProject
  };
};