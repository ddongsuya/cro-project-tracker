import React from 'react';
import ClientList from './ClientList';
import type { Client } from '../types';

interface MobileClientDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  selectedClientId: string | null;
  onSelectClient: (clientId: string) => void;
  onAddClient: () => void;
  onDeleteClient: (clientId: string) => void;
}

const MobileClientDrawer: React.FC<MobileClientDrawerProps> = ({
  isOpen,
  onClose,
  clients,
  selectedClientId,
  onSelectClient,
  onAddClient,
  onDeleteClient
}) => {
  const handleSelectClient = (clientId: string) => {
    onSelectClient(clientId);
    onClose(); // 클라이언트 선택 후 드로어 닫기
  };

  return (
    <>
      {/* 오버레이 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* 드로어 */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* 헤더 */}
        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-xl">🧪</span>
                클라이언트 목록
              </h2>
              <p className="text-blue-100 text-sm">고객사를 선택하세요</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* 클라이언트 목록 */}
        <div className="flex-1 overflow-hidden">
          <ClientList
            clients={clients}
            selectedClientId={selectedClientId}
            onSelectClient={handleSelectClient}
            onAddClient={onAddClient}
            onDeleteClient={onDeleteClient}
          />
        </div>
      </div>
    </>
  );
};

export default MobileClientDrawer;