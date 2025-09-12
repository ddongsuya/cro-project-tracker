import React, { useState } from 'react';
import { StorageService } from '../services/storageService';
import type { Client } from '../types';
import CloudArrowDownIcon from './icons/CloudArrowDownIcon';
import CloudArrowUpIcon from './icons/CloudArrowUpIcon';
import DocumentArrowDownIcon from './icons/DocumentArrowDownIcon';
import ClockIcon from './icons/ClockIcon';
import CSVImport from './CSVImport';
import Modal from './Modal';

interface DataManagementProps {
  clients: Client[];
  onDataImport: (clients: Client[]) => void;
}

const DataManagement: React.FC<DataManagementProps> = ({ clients, onDataImport }) => {
  const [showBackups, setShowBackups] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);

  const handleExportJSON = () => {
    StorageService.exportData(clients);
  };

  const handleExportCSV = () => {
    StorageService.exportToCSV(clients);
  };

  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const importedClients = await StorageService.importData(file);
      onDataImport(importedClients);
      alert('데이터를 성공적으로 가져왔습니다!');
    } catch (error) {
      alert(`데이터 가져오기 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setImporting(false);
      // 파일 입력 초기화
      event.target.value = '';
    }
  };

  const handleRestoreBackup = (backupIndex: number) => {
    const restoredData = StorageService.restoreFromBackup(backupIndex);
    if (restoredData) {
      onDataImport(restoredData);
      alert('백업에서 데이터를 복원했습니다!');
      setShowBackups(false);
    } else {
      alert('백업 복원에 실패했습니다.');
    }
  };

  const backups = StorageService.getBackups();

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">데이터 관리</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 데이터 내보내기 */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">데이터 내보내기</h4>
          
          <button
            onClick={handleExportJSON}
            className="w-full flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <CloudArrowDownIcon className="h-5 w-5" />
            <span>JSON 파일로 내보내기</span>
          </button>
          
          <button
            onClick={handleExportCSV}
            className="w-full flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            <span>Excel용 CSV 내보내기</span>
          </button>
          
          <button
            onClick={() => setShowCSVImport(true)}
            className="w-full flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            <CloudArrowUpIcon className="h-5 w-5" />
            <span>CSV/Excel 파일 가져오기</span>
          </button>
        </div>

        {/* 데이터 가져오기 */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">데이터 가져오기</h4>
          
          <label className="w-full flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 cursor-pointer">
            <CloudArrowUpIcon className="h-5 w-5" />
            <span>{importing ? '가져오는 중...' : 'JSON 파일 가져오기'}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              disabled={importing}
              className="hidden"
            />
          </label>
          
          <button
            onClick={() => setShowBackups(!showBackups)}
            className="w-full flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <ClockIcon className="h-5 w-5" />
            <span>백업에서 복원 ({backups.length}개)</span>
          </button>
        </div>
      </div>

      {/* 백업 목록 */}
      {showBackups && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-700 mb-3">사용 가능한 백업</h4>
          
          {backups.length === 0 ? (
            <p className="text-gray-500 text-sm">사용 가능한 백업이 없습니다.</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {backups.map((backup, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      백업 #{index + 1}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(backup.timestamp).toLocaleString('ko-KR')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {backup.clients?.length || 0}개 고객사, 버전 {backup.version}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRestoreBackup(index)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    복원
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 사용 안내 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h5 className="font-medium text-blue-800 mb-2">💡 사용 팁</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 데이터는 자동으로 브라우저에 저장됩니다</li>
          <li>• JSON 파일로 백업하여 다른 컴퓨터에서도 사용 가능</li>
          <li>• CSV 파일은 Excel에서 열어 분석할 수 있습니다</li>
          <li>• CSV/Excel 파일을 업로드하여 대량 데이터 입력 가능</li>
          <li>• 최대 5개의 자동 백업이 유지됩니다</li>
        </ul>
      </div>

      {/* CSV 가져오기 모달 */}
      <Modal
        isOpen={showCSVImport}
        onClose={() => setShowCSVImport(false)}
        title="CSV/Excel 파일 가져오기"
      >
        <CSVImport
          onImportComplete={(importedClients) => {
            onDataImport(importedClients);
            setShowCSVImport(false);
          }}
          onClose={() => setShowCSVImport(false)}
        />
      </Modal>
    </div>
  );
};

export default DataManagement;