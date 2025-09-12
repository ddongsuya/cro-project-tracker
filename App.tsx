import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import ClientList from './components/ClientList';
import ProjectTimeline from './components/ProjectTimeline';
import ProjectList from './components/ProjectList';
import Dashboard from './components/Dashboard';
import SearchAndFilter from './components/SearchAndFilter';
import NotificationSystem from './components/NotificationSystem';
import DataManagement from './components/DataManagement';
import { EXACT_EXCEL_CLIENTS } from './data/exactExcelData';
import { StorageService } from './services/storageService';
import type { Client, Project, Test, Requester } from './types';
import { DEFAULT_STAGES } from './constants';
import Modal from './components/Modal';
import ClientForm from './components/forms/ClientForm';
import ProjectForm from './components/forms/ProjectForm';
import TestForm from './components/forms/TestForm';
import RequesterForm from './components/forms/RequesterForm';
import AIInsights from './components/AIInsights';
import PrintReport from './components/PrintReport';
import { useForceUpdate } from './hooks/useForceUpdate';

type ModalState = 
  | { type: 'NONE' }
  | { type: 'ADD_CLIENT' }
  | { type: 'ADD_REQUESTER' }
  | { type: 'ADD_PROJECT' }
  | { type: 'EDIT_PROJECT', project: Project, requesterId: string }
  | { type: 'ADD_TEST' }
  | { type: 'EDIT_TEST', test: Test }
  | { type: 'DATA_MANAGEMENT' }
  | { type: 'PRINT_REPORT' }
  | { type: 'DATA_MANAGEMENT' }
  | { type: 'PRINT_REPORT' };

type ViewMode = 'dashboard' | 'projects';

function App() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [isSearchActive, setIsSearchActive] = useState(false);
  
  const forceUpdate = useForceUpdate();
  
  const [modalState, setModalState] = useState<ModalState>({ type: 'NONE' });

  // 데이터 로드 및 저장
  useEffect(() => {
    const savedData = StorageService.loadData();
    let initialData = savedData || EXACT_EXCEL_CLIENTS;
    
    // 새로운 구조로 마이그레이션 및 기존 6단계 데이터를 7단계로 마이그레이션
    initialData = initialData.map(client => {
      // 기존 구조(projects 직접 포함)에서 새 구조(requesters 포함)로 마이그레이션
      if ('projects' in client && !('requesters' in client)) {
        // 기존 구조를 새 구조로 변환
        const legacyClient = client as any;
        return {
          ...client,
          requesters: legacyClient.projects.length > 0 ? [{
            id: `req-${client.id}-1`,
            name: legacyClient.contactPerson || '담당자',
            email: legacyClient.email || '',
            phone: legacyClient.phone || '',
            department: '기본부서',
            position: '담당자',
            projects: legacyClient.projects.map((project: any) => ({
              ...project,
              stages: project.stages.length < 7 
                ? [...project.stages, { 
                    ...DEFAULT_STAGES[6], 
                    id: `stage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` 
                  }]
                : project.stages
            }))
          }] : []
        };
      } else {
        // 이미 새 구조인 경우 7단계 마이그레이션만 수행
        return {
          ...client,
          requesters: client.requesters.map(requester => ({
            ...requester,
            projects: requester.projects.map(project => ({
              ...project,
              stages: project.stages.length < 7 
                ? [...project.stages, { 
                    ...DEFAULT_STAGES[6], 
                    id: `stage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` 
                  }]
                : project.stages
            }))
          }))
        };
      }
    });
    
    setClients(initialData);
    setFilteredClients(initialData);
    
    if (initialData.length > 0) {
      setSelectedClientId(initialData[0].id);
      setSelectedProjectId(null); // 초기 로드 시에도 프로젝트는 선택하지 않음
    }
  }, []);

  // 데이터 변경시 자동 저장
  useEffect(() => {
    if (clients.length > 0) {
      StorageService.saveData(clients);
    }
  }, [clients]);

  // clients가 변경될 때마다 filteredClients 업데이트 (검색이 활성화되지 않은 경우에만)
  useEffect(() => {
    if (!isSearchActive) {
      setFilteredClients(clients);
    }
  }, [clients, isSearchActive]);

  const selectedClient = filteredClients.find(c => c.id === selectedClientId);
  
  // 새로운 구조에서 프로젝트 찾기 (모든 의뢰자의 프로젝트에서 검색)
  const selectedProject = selectedClient?.requesters
    .flatMap(r => r.projects)
    .find(p => p.id === selectedProjectId);
    
  // 선택된 프로젝트의 의뢰자 찾기
  const selectedRequester = selectedClient?.requesters
    .find(r => r.projects.some(p => p.id === selectedProjectId));

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setSelectedProjectId(null); // 고객사 선택 시 프로젝트는 선택하지 않음
  };
  
  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
  };
  
  const handleAddClient = (clientData: Omit<Client, 'id' | 'requesters'>) => {
    const newClient: Client = {
      ...clientData,
      id: `client-${Date.now()}`,
      requesters: [],
    };
    const updatedClients = [...clients, newClient];
    
    // 동기적으로 상태 업데이트
    flushSync(() => {
      setClients(updatedClients);
      setModalState({ type: 'NONE' });
      setSelectedClientId(newClient.id);
      setSelectedProjectId(null);
    });
    
    // 추가 강제 업데이트
    forceUpdate();
  };

  const handleAddRequester = (requesterData: Omit<Requester, 'id' | 'projects'>) => {
    if (!selectedClientId) return;
    
    const newRequester: Requester = {
      ...requesterData,
      id: `req-${Date.now()}`,
      projects: [],
    };
    
    const updatedClients = clients.map(client => {
      if (client.id === selectedClientId) {
        return { ...client, requesters: [...client.requesters, newRequester] };
      }
      return client;
    });
    
    // 동기적으로 상태 업데이트
    flushSync(() => {
      setClients(updatedClients);
      setModalState({ type: 'NONE' });
    });
    
    // 추가 강제 업데이트
    forceUpdate();
  };

  const handleAddProject = (projectData: Omit<Project, 'stages' | 'tests'>, requesterId: string) => {
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
      
      // 동기적으로 상태 업데이트
      flushSync(() => {
        setClients(updatedClients);
        setModalState({ type: 'NONE' });
        setSelectedProjectId(newProject.id);
        
        // filteredClients도 함께 업데이트
        if (!isSearchActive) {
          setFilteredClients(updatedClients);
        }
      });
      
      // 추가 강제 업데이트
      forceUpdate();
  };

  const handleEditProject = (projectData: Omit<Project, 'stages' | 'tests'>, requesterId: string) => {
    if (!selectedClientId || modalState.type !== 'EDIT_PROJECT') return;
    
    const originalProject = modalState.project;
    const updatedProject: Project = {
      ...originalProject,
      ...projectData,
      // stages, tests, followUps는 유지
      stages: originalProject.stages,
      tests: originalProject.tests,
      followUps: originalProject.followUps || [],
    };
    
    const updatedClients = clients.map(client => {
      if (client.id === selectedClientId) {
        const updatedRequesters = client.requesters.map(requester => {
          if (requester.id === requesterId) {
            const updatedProjects = requester.projects.map(p =>
              p.id === originalProject.id ? updatedProject : p
            );
            return { ...requester, projects: updatedProjects };
          }
          return requester;
        });
        return { ...client, requesters: updatedRequesters };
      }
      return client;
    });
    
    // 동기적으로 상태 업데이트
    flushSync(() => {
      setClients(updatedClients);
      setModalState({ type: 'NONE' });
      
      // filteredClients도 함께 업데이트
      if (!isSearchActive) {
        setFilteredClients(updatedClients);
      }
    });
    
    // 추가 강제 업데이트
    forceUpdate();
  };
  
  const handleUpdateProject = (updatedProject: Project) => {
      if (!selectedClientId || !selectedRequester) return;

      console.log('Updating project:', updatedProject); // 디버깅용
      console.log('Selected client ID:', selectedClientId); // 디버깅용

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
      
      console.log('Updated clients:', updatedClients); // 디버깅용
      
      // 동기적으로 상태 업데이트
      flushSync(() => {
        setClients(updatedClients);
        
        // filteredClients도 함께 업데이트 (검색 상태가 아닐 때만)
        if (!isSearchActive) {
          setFilteredClients(updatedClients);
        } else {
          // 검색 상태일 때는 필터링된 결과도 업데이트
          const updatedFilteredClients = filteredClients.map(client => {
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
      
      // 추가 강제 업데이트
      forceUpdate();
  };
  
  const handleSaveTest = (testData: Omit<Test, 'id'>) => {
    if (!selectedClientId || !selectedProjectId) return;
    
    let updatedTests: Test[];

    if (modalState.type === 'EDIT_TEST') {
        const editingTestId = modalState.test.id;
        updatedTests = selectedProject.tests.map(t => t.id === editingTestId ? { ...t, ...testData } : t);
    } else { // ADD_TEST
        const newTest: Test = { ...testData, id: `test-${Date.now()}`};
        updatedTests = [...(selectedProject?.tests || []), newTest];
    }
    
    handleUpdateProject({ ...selectedProject, tests: updatedTests });
    setModalState({ type: 'NONE' });
  };
  
  const handleDeleteTest = (testId: string) => {
    if (!selectedProject || !window.confirm('정말로 이 시험을 삭제하시겠습니까?')) return;
    
    const updatedTests = selectedProject.tests.filter(t => t.id !== testId);
    handleUpdateProject({ ...selectedProject, tests: updatedTests });
  };

  const handleDeleteProject = (projectId: string) => {
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
    
    // 필터링된 클라이언트도 업데이트
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
    
    // 삭제된 프로젝트가 현재 선택된 프로젝트라면 선택 해제
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
    }
  };

  const handleDeleteClient = (clientId: string) => {
    const updatedClients = clients.filter(c => c.id !== clientId);
    
    // 동기적으로 상태 업데이트
    flushSync(() => {
      setClients(updatedClients);
      
      // 삭제된 고객사가 현재 선택된 고객사라면 다른 고객사 선택
      if (selectedClientId === clientId) {
        if (updatedClients.length > 0) {
          setSelectedClientId(updatedClients[0].id);
        } else {
          setSelectedClientId(null);
        }
        setSelectedProjectId(null);
      }
    });
    
    // 추가 강제 업데이트
    forceUpdate();
  };

  const handleDeleteRequester = (requesterId: string) => {
    if (!selectedClientId) return;
    
    const updatedClients = clients.map(client => {
      if (client.id === selectedClientId) {
        const updatedRequesters = client.requesters.filter(r => r.id !== requesterId);
        return { ...client, requesters: updatedRequesters };
      }
      return client;
    });
    
    // 동기적으로 상태 업데이트
    flushSync(() => {
      setClients(updatedClients);
      
      // 삭제된 의뢰자의 프로젝트가 현재 선택된 프로젝트라면 선택 해제
      const deletedRequester = clients
        .find(c => c.id === selectedClientId)
        ?.requesters.find(r => r.id === requesterId);
      
      if (deletedRequester && selectedProjectId && 
          deletedRequester.projects.some(p => p.id === selectedProjectId)) {
        setSelectedProjectId(null);
      }
    });
    
    // 추가 강제 업데이트
    forceUpdate();
  };

  const handleDataImport = (importedClients: Client[]) => {
    setClients(importedClients);
    setIsSearchActive(false); // 검색 상태 초기화
    if (importedClients.length > 0) {
      setSelectedClientId(importedClients[0].id);
      setSelectedProjectId(null); // 프로젝트는 선택하지 않음
    }
  };

  const handleFilteredResults = (filtered: Client[], hasActiveSearch: boolean) => {
    setFilteredClients(filtered);
    setIsSearchActive(hasActiveSearch);
    
    // 필터링 결과에 현재 선택된 클라이언트가 없으면 첫 번째로 변경
    if (filtered.length > 0 && !filtered.find(c => c.id === selectedClientId)) {
      setSelectedClientId(filtered[0].id);
      setSelectedProjectId(null); // 프로젝트는 선택하지 않음
    }
  };


  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 font-sans">
      {/* 사이드바 */}
      <div className="w-80 bg-white/95 backdrop-blur-sm shadow-2xl border-r border-slate-200/60 flex flex-col">
        {/* 로고/헤더 */}
        <div className="p-6 border-b border-slate-200/60 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90"></div>
          <div className="relative z-10">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">🧪</span>
              CRO Project Tracker
            </h1>
            <p className="text-blue-100 text-sm mt-1 font-medium">프로젝트 관리 시스템</p>
          </div>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>
        </div>
        
        {/* 클라이언트 목록 */}
        <div className="flex-1 overflow-hidden">
          <ClientList
            clients={filteredClients}
            selectedClientId={selectedClientId}
            onSelectClient={handleSelectClient}
            onAddClient={() => setModalState({ type: 'ADD_CLIENT' })}
            onDeleteClient={handleDeleteClient}
          />
        </div>
      </div>
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 상단 네비게이션 */}
        <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-slate-200/60 px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <nav className="flex gap-2 bg-gradient-to-r from-slate-100 to-slate-50 p-1.5 rounded-xl shadow-inner">
                <button
                  onClick={() => setViewMode('dashboard')}
                  className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                    viewMode === 'dashboard'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 hover:shadow-md'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    📊 <span>대시보드</span>
                  </span>
                </button>
                <button
                  onClick={() => setViewMode('projects')}
                  className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                    viewMode === 'projects'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 hover:shadow-md'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    📋 <span>프로젝트 관리</span>
                  </span>
                </button>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setModalState({ type: 'PRINT_REPORT' })}
                className="flex items-center gap-2 px-5 py-3 text-sm bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-xl hover:from-indigo-200 hover:to-purple-200 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <span className="text-lg">🖨️</span>
                <span className="font-medium">리포트 출력</span>
              </button>
              <button
                onClick={() => setModalState({ type: 'DATA_MANAGEMENT' })}
                className="flex items-center gap-2 px-5 py-3 text-sm bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 rounded-xl hover:from-slate-200 hover:to-slate-100 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <span className="text-lg">💾</span>
                <span className="font-medium">데이터 관리</span>
              </button>
              <NotificationSystem clients={clients} />
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-slate-50/80 via-blue-50/40 to-indigo-50/60 relative">
          <div className="absolute inset-0 opacity-30">
            <div className="w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f1f5f9' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }}></div>
          </div>
          <div className="relative z-10">
          {viewMode === 'dashboard' ? (
            <Dashboard clients={clients} />
          ) : (
            <div className="space-y-6">
              <SearchAndFilter 
                clients={clients} 
                onFilteredResults={handleFilteredResults}
              />
              
              {selectedClient && selectedProject ? (
                <div className="space-y-8">
                  <ProjectTimeline
                    client={selectedClient}
                    project={selectedProject}
                    onSelectProject={handleSelectProject}
                    onAddProject={() => setModalState({ type: 'ADD_PROJECT' })}
                    onUpdateProject={handleUpdateProject}
                    onAddTest={() => setModalState({ type: 'ADD_TEST'})}
                    onEditTest={(test) => setModalState({ type: 'EDIT_TEST', test })}
                    onDeleteTest={handleDeleteTest}
                  />
                  <AIInsights project={selectedProject} client={selectedClient} />
                </div>
              ) : selectedClient ? (
                <ProjectList
                  client={selectedClient}
                  onSelectProject={handleSelectProject}
                  onAddProject={() => setModalState({ type: 'ADD_PROJECT' })}
                  onAddRequester={() => setModalState({ type: 'ADD_REQUESTER' })}
                  onEditProject={(project, requesterId) => setModalState({ type: 'EDIT_PROJECT', project, requesterId })}
                  onDeleteRequester={handleDeleteRequester}
                  onDeleteProject={handleDeleteProject}
                />
              ) : (
                 <div className="text-center py-20">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 max-w-md mx-auto border border-slate-200/60">
                    <div className="text-6xl mb-6">🏢</div>
                    <h2 className="text-2xl font-bold text-gray-700 mb-3">고객사를 선택해주세요</h2>
                    <p className="text-gray-500 leading-relaxed">왼쪽 목록에서 고객사를 선택하거나 새 고객사를 추가하세요.</p>
                    <button
                      onClick={() => setModalState({ type: 'ADD_CLIENT' })}
                      className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                    >
                      + 새 고객사 추가
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </main>

      <Modal 
        isOpen={modalState.type === 'ADD_CLIENT'} 
        onClose={() => setModalState({ type: 'NONE' })} 
        title="새 고객사 추가"
      >
        <ClientForm onSave={handleAddClient} onCancel={() => setModalState({ type: 'NONE' })} />
      </Modal>

      <Modal 
        isOpen={modalState.type === 'ADD_REQUESTER'} 
        onClose={() => setModalState({ type: 'NONE' })} 
        title="새 의뢰자 추가"
      >
        <RequesterForm onSave={handleAddRequester} onCancel={() => setModalState({ type: 'NONE' })} />
      </Modal>

      <Modal 
        isOpen={modalState.type === 'ADD_PROJECT'} 
        onClose={() => setModalState({ type: 'NONE' })} 
        title="새 프로젝트 추가"
      >
        <ProjectForm 
          onSave={handleAddProject} 
          onCancel={() => setModalState({ type: 'NONE' })} 
          requesters={selectedClient?.requesters || []}
        />
      </Modal>

      <Modal 
        isOpen={modalState.type === 'EDIT_PROJECT'} 
        onClose={() => setModalState({ type: 'NONE' })} 
        title="프로젝트 정보 수정"
      >
        <ProjectForm 
          onSave={handleEditProject} 
          onCancel={() => setModalState({ type: 'NONE' })} 
          requesters={clients.find(c => c.id === selectedClientId)?.requesters || []}
          initialData={modalState.type === 'EDIT_PROJECT' ? modalState.project : undefined}
          initialRequesterId={modalState.type === 'EDIT_PROJECT' ? modalState.requesterId : undefined}
        />
      </Modal>
      
      <Modal
        isOpen={modalState.type === 'ADD_TEST' || modalState.type === 'EDIT_TEST'}
        onClose={() => setModalState({ type: 'NONE' })}
        title={modalState.type === 'ADD_TEST' ? '새 시험 추가' : '시험 정보 수정'}
      >
        <TestForm
            onSave={handleSaveTest}
            onCancel={() => setModalState({ type: 'NONE' })}
            initialData={modalState.type === 'EDIT_TEST' ? modalState.test : undefined}
            defaultProjectNumber={selectedProject?.projectNumber || selectedProject?.id}
        />
      </Modal>

      <Modal
        isOpen={modalState.type === 'DATA_MANAGEMENT'}
        onClose={() => setModalState({ type: 'NONE' })}
        title="데이터 관리"
      >
        <DataManagement
          clients={clients}
          onDataImport={handleDataImport}
        />
      </Modal>

      <Modal
        isOpen={modalState.type === 'PRINT_REPORT'}
        onClose={() => setModalState({ type: 'NONE' })}
        title="리포트 출력"
      >
        <PrintReport
          clients={clients}
          selectedClient={selectedClient}
          selectedProject={selectedProject}
        />
      </Modal>

    </div>
  );
}

export default App;