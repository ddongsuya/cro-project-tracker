import React, { useState } from 'react';
import { CSVImportService } from '../services/csvImportService';
import type { Client } from '../types';
import CloudArrowUpIcon from './icons/CloudArrowUpIcon';
import DocumentArrowDownIcon from './icons/DocumentArrowDownIcon';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

interface CSVImportProps {
  onImportComplete: (clients: Client[]) => void;
  onClose: () => void;
}

const CSVImport: React.FC<CSVImportProps> = ({ onImportComplete, onClose }) => {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    clientCount?: number;
    projectCount?: number;
  } | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 형식 검증
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      setImportResult({
        success: false,
        message: 'CSV 또는 Excel 파일만 업로드 가능합니다.'
      });
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      let clients: Client[];
      
      if (fileExtension === '.csv') {
        clients = await CSVImportService.importFromCSV(file);
      } else {
        // Excel 파일의 경우 사용자에게 CSV로 변환 안내
        setImportResult({
          success: false,
          message: 'Excel 파일은 CSV 형식으로 저장한 후 업로드해주세요. (파일 → 다른 이름으로 저장 → CSV 형식 선택)'
        });
        setImporting(false);
        return;
      }

      if (clients.length === 0) {
        setImportResult({
          success: false,
          message: '유효한 데이터가 없습니다. 파일 형식을 확인해주세요.'
        });
      } else {
        const totalProjects = clients.reduce((sum, client) => sum + client.requesters.flatMap(r => r.projects).length, 0);
        
        setImportResult({
          success: true,
          message: '데이터 가져오기가 완료되었습니다!',
          clientCount: clients.length,
          projectCount: totalProjects
        });

        // 3초 후 자동으로 데이터 적용
        setTimeout(() => {
          onImportComplete(clients);
        }, 3000);
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: `가져오기 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      });
    } finally {
      setImporting(false);
      // 파일 입력 초기화
      event.target.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    CSVImportService.downloadTemplate();
  };

  return (
    <div className="space-y-6">
      {/* 안내 메시지 */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">📋 CSV/Excel 파일 업로드 안내</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• CSV 파일 또는 Excel에서 CSV로 저장한 파일을 업로드하세요</li>
          <li>• 첫 번째 행은 헤더(컬럼명)여야 합니다</li>
          <li>• 필수 컬럼: 의뢰기관, 견적서 번호, 견적명, 견적 송부 날짜, 견적금액</li>
          <li>• 선택 컬럼: 의뢰자, 의뢰자 연락처, 의뢰자 e-mail, 계약금액, 결론</li>
        </ul>
      </div>

      {/* 템플릿 다운로드 */}
      <div className="flex justify-center">
        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <DocumentArrowDownIcon className="h-5 w-5" />
          <span>CSV 템플릿 다운로드</span>
        </button>
      </div>

      {/* 파일 업로드 */}
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
        <label className="cursor-pointer">
          <CloudArrowUpIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <div className="text-lg font-medium text-slate-700 mb-2">
            {importing ? '파일 처리 중...' : 'CSV 파일을 선택하거나 드래그하세요'}
          </div>
          <div className="text-sm text-slate-500 mb-4">
            지원 형식: .csv, .xlsx, .xls (최대 10MB)
          </div>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
            disabled={importing}
            className="hidden"
          />
          <div className={`inline-block px-6 py-3 rounded-lg transition-colors ${
            importing 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
          } text-white`}>
            {importing ? '처리 중...' : '파일 선택'}
          </div>
        </label>
      </div>

      {/* 결과 메시지 */}
      {importResult && (
        <div className={`p-4 rounded-lg ${
          importResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            {importResult.success ? (
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            ) : (
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            )}
            <div className="flex-1">
              <div className={`font-medium ${
                importResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {importResult.message}
              </div>
              {importResult.success && importResult.clientCount && (
                <div className="text-sm text-green-700 mt-1">
                  {importResult.clientCount}개 고객사, {importResult.projectCount}개 프로젝트가 추가됩니다.
                  <br />
                  3초 후 자동으로 적용됩니다...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 컬럼 매핑 가이드 */}
      <div className="bg-slate-50 p-4 rounded-lg">
        <h4 className="font-medium text-slate-800 mb-3">📝 CSV 컬럼 형식 가이드</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong className="text-slate-700">필수 컬럼:</strong>
            <ul className="mt-1 space-y-1 text-slate-600">
              <li>• 의뢰기관: (주)엘지화학</li>
              <li>• 견적서 번호: Q-2024-001</li>
              <li>• 견적명: 배터리 안전성 평가</li>
              <li>• 견적 송부 날짜: 2024-01-15</li>
              <li>• 견적금액: 50000000</li>
            </ul>
          </div>
          <div>
            <strong className="text-slate-700">선택 컬럼:</strong>
            <ul className="mt-1 space-y-1 text-slate-600">
              <li>• 의뢰자: 김영수</li>
              <li>• 의뢰자 e-mail: kim@company.com</li>
              <li>• 의뢰자 연락처: 02-1234-5678</li>
              <li>• 계약금액: 48000000</li>
              <li>• 결론: 시험 진행 중</li>
              <li>• 시험기준: UN38.3</li>
              <li>• 계약번호: C-2024-001</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default CSVImport;