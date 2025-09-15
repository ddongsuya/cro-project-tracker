import React, { useState } from 'react';
import NotificationSystem from './NotificationSystem';
import type { Client } from '../types';

interface MobileHeaderProps {
  currentUser: any;
  clients: Client[];
  onOpenAuth: () => void;
  onOpenTeamManagement: () => void;
  onOpenPrintReport: () => void;
  onOpenDataManagement: () => void;
  onSignOut: () => void;
  isFirebaseMode: boolean;
  selectedClient?: any;
  onToggleClientList?: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentUser,
  clients,
  onOpenAuth,
  onOpenTeamManagement,
  onOpenPrintReport,
  onOpenDataManagement,
  onSignOut,
  isFirebaseMode,
  selectedClient,
  onToggleClientList
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-slate-200/60 px-4 py-3 relative z-40">
      <div className="flex items-center justify-between">
        {/* 로고 및 선택된 클라이언트 */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧪</span>
            <div className="flex flex-col min-w-0">
              <h1 className="text-lg font-bold text-slate-800 truncate">Corestemchemon</h1>
              {selectedClient && (
                <button
                  onClick={onToggleClientList}
                  className="text-xs text-slate-600 truncate text-left hover:text-blue-600 transition-colors"
                >
                  {selectedClient.name} ▼
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 우측 메뉴 */}
        <div className="flex items-center gap-2">
          <NotificationSystem clients={clients} />
          
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* 드롭다운 메뉴 */}
      {showMenu && (
        <div className="absolute top-full right-4 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50">
          {currentUser ? (
            <>
              <div className="px-4 py-2 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-700 font-medium">팀 협업 활성</span>
                </div>
                <p className="text-sm text-slate-600 truncate">{currentUser.email}</p>
              </div>
              
              <button
                onClick={() => {
                  onOpenTeamManagement();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 transition-colors flex items-center gap-3"
              >
                <span className="text-lg">👥</span>
                팀 관리
              </button>
              
              <button
                onClick={() => {
                  onOpenPrintReport();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 transition-colors flex items-center gap-3"
              >
                <span className="text-lg">🖨️</span>
                리포트 출력
              </button>
              
              <button
                onClick={() => {
                  onOpenDataManagement();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 transition-colors flex items-center gap-3"
              >
                <span className="text-lg">💾</span>
                데이터 관리
              </button>
              
              <div className="border-t border-slate-100 mt-2 pt-2">
                <button
                  onClick={() => {
                    onSignOut();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                >
                  <span className="text-lg">🚪</span>
                  로그아웃
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => {
                onOpenAuth();
                setShowMenu(false);
              }}
              className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 transition-colors flex items-center gap-3"
            >
              <span className="text-lg">🔥</span>
              팀 협업 시작
            </button>
          )}
        </div>
      )}
      
      {/* 메뉴 오버레이 */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </header>
  );
};

export default MobileHeader;