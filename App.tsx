import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { flushSync } from 'react-dom';
import NotificationSystem from './components/NotificationSystem';

// 통합 대시보드 import
const UnifiedDashboard = lazy(() => import('./components/UnifiedDashboard'));

// 지연 로딩 컴포넌트들
const ClientList = lazy(() => import('./components/ClientList'));
const SafeProjectView = lazy(() => import('./components/SafeProjectView'));
const ProjectList = lazy(() => import('./components/ProjectList'));
const SearchAndFilter = lazy(() => import('./components/SearchAndFilter'));
const DataManagement = lazy(() => import('./components/DataManagement'));
import { EXACT_EXCEL_CLIENTS } from './data/exactExcelData';
import { StorageService } from './services/storageService';
import type { Client, Project, Test, Requester } from './types';
import { DEFAULT_STAGES } from './constants';
// 폼 컴포넌트들도 지연 로딩
const Modal = lazy(() => import('./components/Modal'));
const ClientForm = lazy(() => import('./components/forms/ClientForm'));
const ProjectForm = lazy(() => import('./components/forms/ProjectForm'));
const TestForm = lazy(() => import('./components/forms/TestForm'));
const RequesterForm = lazy(() => import('./components/forms/RequesterForm'));
const AIInsights = lazy(() => import('./components/AIInsights'));
const PrintReport = lazy(() => import('./components/PrintReport'));
// 더 많은 지연 로딩 컴포넌트들
const AuthModal = lazy(() => import('./components/AuthModal'));
const TeamManagement = lazy(() => import('./components/TeamManagement'));
const Calendar = lazy(() => import('./components/Calendar'));
import { FirebaseService } from './services/firebaseService';
import { useForceUpdate } from './hooks/useForceUpdate';
import { useIsMobile } from './hooks/useMediaQuery';
import LoadingSpinner from './components/LoadingSpinner';
// 모바일 및 레이아웃 컴포넌트들
const MobileBottomNav = lazy(() => import('./components/MobileBottomNav'));
const MobileHeader = lazy(() => import('./components/MobileHeader'));
const MobileClientDrawer = lazy(() => import('./components/MobileClientDrawer'));
const Sidebar = lazy(() => import('./components/Sidebar'));
const ProjectFilter = lazy(() => import('./components/ProjectFilter'));

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
  | { type: 'AUTH' }
  | { type: 'TEAM_MANAGEMENT' };

type ViewMode = 'dashboard' | 'calendar' | 'projects';

function App() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFirebaseMode, setIsFirebaseMode] = useState(false);
  const [showMobileClientDrawer, setShowMobileClientDrawer] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('my-projects');
  const [selectedSubmenu, setSelectedSubmenu] = useState('all');
  
  const forceUpdate = useForceUpdate();
  const firebaseService = FirebaseService.getInstance();
  const isMobile = useIsMobile();
  
  const [modalState, setModalState] = useState<ModalState>({ type: 'NONE' });

  // Firebase 인증 상태 관리
  useEffect(() => {
    const unsubscribe = firebaseService.onAuthStateChange((user) => {
      setCurrentUser(user);
      // 로그인하면 자동으로 Firebase 모드 활성화
      if (user) {
        setIsFirebaseMode(true);
        loadFirebaseData();
      } else {
        setIsFirebaseMode(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 데이터 로드 및 저장 (로그인 사용자만)
  useEffect(() => {
    if (currentUser) {
      loadFirebaseData();
      return;
    }
    
    // 로그인하지 않은 경우 데이터 로드하지 않음
    setClients([]);
    setFilteredClients([]);
    // 로그인하지 않은 경우 더미 데이터도 로드하지 않음
  }, []);

  // 데이터 변경시 자동 저장 (로그인 사용자만)
  useEffect(() => {
    if (clients.length > 0 && currentUser) {
      // Firebase에만 저장 (로컬 저장 제거)
      firebaseService.saveData(clients).catch(console.error);
    }
  }, [clients, currentUser]);

  // clients가 변경될 때마다 filteredClients 업데이트 (검색이 활성화되지 않은 경우에만)
  useEffect(() => {
    if (!isSearchActive) {
      setFilteredClients(clients);
    }
  }, [clients, isSearchActive]);

  // Firebase 데이터 로드
  const loadFirebaseData = async () => {
    try {
      const firebaseData = await firebaseService.loadData();
      if (firebaseData) {
        setClients(firebaseData);
        setFilteredClients(firebaseData);
        if (firebaseData.length > 0) {
          setSelectedClientId(firebaseData[0].id);
          setSelectedProjectId(null);
        }
      }
    } catch (error) {
      console.error('Firebase 데이터 로드 실패:', error);
    }
  };

  // Firebase 실시간 동기화
  useEffect(() => {
    if (isFirebaseMode && currentUser) {
      const unsubscribe = firebaseService.onDataChange((firebaseClients) => {
        setClients(firebaseClients);
        if (!isSearchActive) {
          setFilteredClients(firebaseClients);
        }
      });

      return () => unsubscribe();
    }
  }, [isFirebaseMode, currentUser, isSearchActive]);

  const selectedClient = useMemo(() => 
    filteredClients.find(c => c.id === selectedClientId), 
    [filteredClients, selectedClientId]
  );
  
  // 새로운 구조에서 프로젝트 찾기 (모든 의뢰자의 프로젝트에서 검색)
  const selectedProject = useMemo(() => 
    selectedClient?.requesters
      .flatMap(r => r.projects)
      .find(p => p.id === selectedProjectId),
    [selectedClient, selectedProjectId]
  );
    
  // 선택된 프로젝트의 의뢰자 찾기
  const selectedRequester = useMemo(() => 
    selectedClient?.requesters
      .find(r => r.projects.some(p => p.id === selectedProjectId)),
    [selectedClient, selectedProjectId]
  );

  const handleSelectClient = useCallback((clientId: string) => {
    setSelectedClientId(clientId);
    setSelectedProjectId(null); // 고객사 선택 시 프로젝트는 선택하지 않음
  }, []);
  
  const handleSelectProject = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
  }, []);
  
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


  // 로그인하지 않은 경우 로그인 화면만 표시
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center font-sans">
        <div className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl ${isMobile ? 'p-8' : 'p-12'} max-w-md w-full mx-4 border border-white/20`}>
          <div className="text-center mb-8">
            <div className={`${isMobile ? 'text-5xl' : 'text-6xl'} mb-4`}>🧪</div>
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-slate-800 mb-2`}>Corestemchemon</h1>
            <p className="text-slate-600">CRO Management System</p>
            <p className="text-sm text-slate-500 mt-2">팀원 전용 - 로그인이 필요합니다</p>
          </div>
          
          <button
            onClick={() => setModalState({ type: 'AUTH' })}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-lg"
          >
            🔥 팀 협업 시작하기
          </button>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-xl">
            <h3 className="font-semibold text-blue-800 mb-2">✨ 팀 협업 기능</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 실시간 데이터 동기화</li>
              <li>• 사업개발 1팀 & 2팀 분리 관리</li>
              <li>• 개인/팀/전체 대시보드</li>
              <li>• 일정 관리 및 알림</li>
              <li>• 권한별 접근 제어</li>
            </ul>
          </div>
        </div>
        
        <AuthModal
          isOpen={modalState.type === 'AUTH'}
          onClose={() => setModalState({ type: 'NONE' })}
          onSuccess={() => setModalState({ type: 'NONE' })}
        />
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'flex flex-col' : 'flex'} h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 font-sans`}>
      {/* 데스크톱 사이드바 */}
      {!isMobile && (
        <Sidebar
          clients={filteredClients}
          currentUser={currentUser}
          onMenuSelect={(menu, submenu) => {
            setSelectedMenu(menu);
            setSelectedSubmenu(submenu || '');
            
            // 메뉴에 따른 뷰 모드 변경
            if (menu === 'dashboard') {
              if (submenu === 'personal') setViewMode('dashboard');
              else if (submenu === 'team') setViewMode('team-dashboard');
              else if (submenu === 'company') setViewMode('company-dashboard');
            } else if (menu === 'schedule') {
              setViewMode('calendar');
            } else if (menu === 'clients' || menu === 'my-projects') {
              setViewMode('projects');
            }
          }}
          selectedMenu={selectedMenu}
          selectedSubmenu={selectedSubmenu}
        />
      )}

      {/* 모바일 클라이언트 드로어 */}
      {isMobile && (
        <MobileClientDrawer
          isOpen={showMobileClientDrawer}
          onClose={() => setShowMobileClientDrawer(false)}
          clients={filteredClients}
          selectedClientId={selectedClientId}
          onSelectClient={handleSelectClient}
          onAddClient={() => setModalState({ type: 'ADD_CLIENT' })}
          onDeleteClient={handleDeleteClient}
        />
      )}
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 모바일 헤더 */}
        {isMobile ? (
          <MobileHeader
            currentUser={currentUser}
            clients={clients}
            onOpenAuth={() => setModalState({ type: 'AUTH' })}
            onOpenTeamManagement={() => setModalState({ type: 'TEAM_MANAGEMENT' })}
            onOpenPrintReport={() => setModalState({ type: 'PRINT_REPORT' })}
            onOpenDataManagement={() => setModalState({ type: 'DATA_MANAGEMENT' })}
            onSignOut={async () => {
              await firebaseService.signOut();
              setIsFirebaseMode(false);
            }}
            isFirebaseMode={isFirebaseMode}
            selectedClient={selectedClient}
            onToggleClientList={() => setShowMobileClientDrawer(true)}
          />
        ) : (
          /* 데스크톱 상단 네비게이션 */
          <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-slate-200/60 px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <nav className="flex gap-1 bg-gradient-to-r from-slate-100 to-slate-50 p-1.5 rounded-xl shadow-inner">
                <button
                  onClick={() => setViewMode('dashboard')}
                  className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                    viewMode === 'dashboard'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 hover:shadow-md'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    📊 <span>통합 대시보드</span>
                  </span>
                </button>
                
                {isFirebaseMode && currentUser && (
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                      viewMode === 'calendar'
                        ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/25'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 hover:shadow-md'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      📅 <span>일정 관리</span>
                    </span>
                  </button>
                )}
                
                <button
                  onClick={() => setViewMode('projects')}
                  className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
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
              {/* 로그인/로그아웃 */}
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-700 font-medium">팀 협업 활성</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">{currentUser.email}</span>
                    <button
                      onClick={() => setModalState({ type: 'TEAM_MANAGEMENT' })}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                    >
                      팀 관리
                    </button>
                    <button
                      onClick={async () => {
                        await firebaseService.signOut();
                        setIsFirebaseMode(false);
                      }}
                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                    >
                      로그아웃
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setModalState({ type: 'AUTH' })}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-lg hover:from-blue-200 hover:to-indigo-200 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <span className="text-lg">🔥</span>
                  <span className="font-medium">팀 협업 시작</span>
                </button>
              )}

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
        )}

        {/* 메인 콘텐츠 */}
        <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-4 pb-20' : 'p-8'} bg-gradient-to-br from-slate-50/80 via-blue-50/40 to-indigo-50/60 relative`}>
          <div className="absolute inset-0 opacity-30">
            <div className="w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f1f5f9' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }}></div>
          </div>
          <div className="relative z-10">
          <Suspense fallback={<LoadingSpinner size="lg" message="컴포넌트를 불러오는 중..." />}>
            {viewMode === 'dashboard' ? (
              <UnifiedDashboard clients={clients} currentUser={currentUser} />
            ) : viewMode === 'calendar' ? (
              <Calendar 
                currentUser={currentUser} 
                viewScope={currentUser ? 'team' : 'personal'} 
              />
            ) : (
            <div className="space-y-6">
              {/* 기존 프로젝트 관리 구조 복원 */}
              {selectedMenu === 'my-projects' ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* 고객사 목록 */}
                  <div className="lg:col-span-1">
                    <ClientList
                      clients={filteredClients}
                      selectedClientId={selectedClientId}
                      onSelectClient={handleSelectClient}
                      onAddClient={() => setModalState({ type: 'ADD_CLIENT' })}
                      onDeleteClient={handleDeleteClient}
                    />
                  </div>
                  
                  {/* 프로젝트 목록 */}
                  <div className="lg:col-span-1">
                    <ProjectList
                      client={selectedClient}
                      selectedProjectId={selectedProjectId}
                      onSelectProject={handleSelectProject}
                      onAddProject={() => setModalState({ type: 'ADD_PROJECT' })}
                      onEditProject={(project, requesterId) => setModalState({ type: 'EDIT_PROJECT', project, requesterId })}
                      onDeleteProject={handleDeleteProject}
                      onAddRequester={() => setModalState({ type: 'ADD_REQUESTER' })}
                      onDeleteRequester={handleDeleteRequester}
                    />
                  </div>
                  
                  {/* 프로젝트 타임라인 */}
                  <div className="lg:col-span-2">
                    {selectedProject ? (
                      <SafeProjectView
                        project={selectedProject}
                        onUpdateProject={handleUpdateProject}
                        onAddTest={() => setModalState({ type: 'ADD_TEST' })}
                        onEditTest={(test) => setModalState({ type: 'EDIT_TEST', test })}
                        onDeleteTest={handleDeleteTest}
                      />
                    ) : (
                      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center">
                        <div className="text-6xl mb-4">📋</div>
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">프로젝트를 선택하세요</h3>
                        <p className="text-slate-500">왼쪽에서 고객사와 프로젝트를 선택하면 상세 정보가 표시됩니다.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : selectedMenu === 'clients' ? (
                selectedSubmenu === 'add' ? (
                  <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">새 고객사 등록</h2>
                    <ClientForm onSave={handleAddClient} onCancel={() => setSelectedSubmenu('all')} />
                  </div>
                ) : selectedSubmenu === 'search' ? (
                  <div className="space-y-6">
                    <SearchAndFilter 
                      clients={clients} 
                      onFilteredResults={handleFilteredResults}
                    />
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      <div className="lg:col-span-1">
                        <ClientList
                          clients={filteredClients}
                          selectedClientId={selectedClientId}
                          onSelectClient={handleSelectClient}
                          onAddClient={() => setModalState({ type: 'ADD_CLIENT' })}
                          onDeleteClient={handleDeleteClient}
                        />
                      </div>
                      <div className="lg:col-span-1">
                        <ProjectList
                          client={selectedClient}
                          selectedProjectId={selectedProjectId}
                          onSelectProject={handleSelectProject}
                          onAddProject={() => setModalState({ type: 'ADD_PROJECT' })}
                          onEditProject={(project, requesterId) => setModalState({ type: 'EDIT_PROJECT', project, requesterId })}
                          onDeleteProject={handleDeleteProject}
                          onAddRequester={() => setModalState({ type: 'ADD_REQUESTER' })}
                          onDeleteRequester={handleDeleteRequester}
                        />
                      </div>
                      <div className="lg:col-span-2">
                        {selectedProject ? (
                          <ProjectTimeline
                            project={selectedProject}
                            onUpdateProject={handleUpdateProject}
                            onAddTest={() => setModalState({ type: 'ADD_TEST' })}
                            onEditTest={(test) => setModalState({ type: 'EDIT_TEST', test })}
                            onDeleteTest={handleDeleteTest}
                          />
                        ) : (
                          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-semibold text-slate-700 mb-2">검색 결과에서 선택하세요</h3>
                            <p className="text-slate-500">검색된 고객사와 프로젝트를 선택하면 상세 정보가 표시됩니다.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                      <ClientList
                        clients={filteredClients}
                        selectedClientId={selectedClientId}
                        onSelectClient={handleSelectClient}
                        onAddClient={() => setModalState({ type: 'ADD_CLIENT' })}
                        onDeleteClient={handleDeleteClient}
                      />
                    </div>
                    <div className="lg:col-span-1">
                      <ProjectList
                        client={selectedClient}
                        selectedProjectId={selectedProjectId}
                        onSelectProject={handleSelectProject}
                        onAddProject={() => setModalState({ type: 'ADD_PROJECT' })}
                        onEditProject={(project, requesterId) => setModalState({ type: 'EDIT_PROJECT', project, requesterId })}
                        onDeleteProject={handleDeleteProject}
                        onAddRequester={() => setModalState({ type: 'ADD_REQUESTER' })}
                        onDeleteRequester={handleDeleteRequester}
                      />
                    </div>
                    <div className="lg:col-span-2">
                      {selectedProject ? (
                        <div className="space-y-6">
                          <ProjectTimeline
                            project={selectedProject}
                            onUpdateProject={handleUpdateProject}
                            onAddTest={() => setModalState({ type: 'ADD_TEST' })}
                            onEditTest={(test) => setModalState({ type: 'EDIT_TEST', test })}
                            onDeleteTest={handleDeleteTest}
                          />
                          <AIInsights project={selectedProject} client={selectedClient} />
                        </div>
                      ) : (
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center">
                          <div className="text-6xl mb-4">📋</div>
                          <h3 className="text-xl font-semibold text-slate-700 mb-2">프로젝트를 선택하세요</h3>
                          <p className="text-slate-500">왼쪽에서 고객사와 프로젝트를 선택하면 상세 정보가 표시됩니다.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              ) : selectedMenu === 'analytics' ? (
                selectedSubmenu === 'export' ? (
                  <div className="text-center py-20">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 max-w-md mx-auto border border-slate-200/60">
                      <div className="text-6xl mb-6">🖨️</div>
                      <h2 className="text-2xl font-bold text-gray-700 mb-3">PDF 리포트 출력</h2>
                      <p className="text-gray-500 leading-relaxed mb-6">프로젝트 데이터를 PDF로 출력할 수 있습니다.</p>
                      <button
                        onClick={() => setModalState({ type: 'PRINT_REPORT' })}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                      >
                        리포트 생성
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 max-w-md mx-auto border border-slate-200/60">
                      <div className="text-6xl mb-6">📊</div>
                      <h2 className="text-2xl font-bold text-gray-700 mb-3">분석 기능 준비중</h2>
                      <p className="text-gray-500 leading-relaxed">고급 분석 기능이 곧 추가될 예정입니다.</p>
                    </div>
                  </div>
                )
              ) : selectedMenu === 'settings' ? (
                selectedSubmenu === 'data' ? (
                  <div className="text-center py-20">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 max-w-md mx-auto border border-slate-200/60">
                      <div className="text-6xl mb-6">💾</div>
                      <h2 className="text-2xl font-bold text-gray-700 mb-3">데이터 관리</h2>
                      <p className="text-gray-500 leading-relaxed mb-6">데이터를 가져오거나 내보낼 수 있습니다.</p>
                      <button
                        onClick={() => setModalState({ type: 'DATA_MANAGEMENT' })}
                        className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                      >
                        데이터 관리
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 max-w-md mx-auto border border-slate-200/60">
                      <div className="text-6xl mb-6">⚙️</div>
                      <h2 className="text-2xl font-bold text-gray-700 mb-3">설정 기능 준비중</h2>
                      <p className="text-gray-500 leading-relaxed">설정 기능이 곧 추가될 예정입니다.</p>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-20">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 max-w-md mx-auto border border-slate-200/60">
                    <div className="text-6xl mb-6">🏢</div>
                    <h2 className="text-2xl font-bold text-gray-700 mb-3">메뉴를 선택해주세요</h2>
                    <p className="text-gray-500 leading-relaxed">왼쪽 메뉴에서 원하는 기능을 선택하세요.</p>
                  </div>
                </div>
              )}

              {/* 프로젝트 상세 보기 */}
              {selectedClient && selectedProject && (
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
              )}
            </div>
          )}
          </Suspense>
          </div>
        </div>
      </main>

      {/* 모든 모달들을 Suspense로 감싸기 */}
      <Suspense fallback={<LoadingSpinner message="폼을 불러오는 중..." />}>
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

        <AuthModal
          isOpen={modalState.type === 'AUTH'}
          onClose={() => setModalState({ type: 'NONE' })}
          onSuccess={() => {
            // 로그인 성공 시 자동으로 Firebase 모드 활성화 (이미 useEffect에서 처리됨)
            setModalState({ type: 'NONE' });
          }}
        />

        <Modal
          isOpen={modalState.type === 'TEAM_MANAGEMENT'}
          onClose={() => setModalState({ type: 'NONE' })}
          title="팀 관리"
        >
          <TeamManagement currentUser={currentUser} />
        </Modal>
      </Suspense>



      {/* 모바일 하단 네비게이션 */}
      {isMobile && (
        <MobileBottomNav
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isFirebaseMode={isFirebaseMode}
          currentUser={currentUser}
        />
      )}

    </div>
  );
}

export default App;