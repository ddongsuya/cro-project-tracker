import React, { useState } from 'react';
import { OCRService, TestRegistrationInfo, MultipleTestInfo } from '../services/ocrService';
import type { Test } from '../types';
import CloudArrowUpIcon from './icons/CloudArrowUpIcon';
import DocumentMagnifyingGlassIcon from './icons/DocumentMagnifyingGlassIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';

interface OCRTestUploadProps {
  onTestExtracted: (testData: Omit<Test, 'id'>, extractedInfo: TestRegistrationInfo) => void;
  onMultipleTestsExtracted: (testsData: Omit<Test, 'id'>[], extractedInfo: MultipleTestInfo) => void;
  onClose: () => void;
}

const OCRTestUpload: React.FC<OCRTestUploadProps> = ({ onTestExtracted, onMultipleTestsExtracted, onClose }) => {
  const [processing, setProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [extractedInfo, setExtractedInfo] = useState<TestRegistrationInfo | null>(null);
  const [multipleTestInfo, setMultipleTestInfo] = useState<MultipleTestInfo | null>(null);
  const [error, setError] = useState<string>('');

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    setError('');
    setExtractedText('');
    setExtractedInfo(null);

    try {
      // 이미지 파일 유효성 검사
      OCRService.validateImageFile(file);

      // OCR로 텍스트 추출
      const text = await OCRService.extractTextFromImage(file);
      setExtractedText(text);

      // 다중 시험 정보 파싱 시도
      const multipleInfo = OCRService.parseMultipleTestInfo(text);
      
      if (multipleInfo && multipleInfo.tests.length > 1) {
        // 다중 시험인 경우
        setMultipleTestInfo(multipleInfo);
        setExtractedInfo(null);
      } else {
        // 단일 시험인 경우
        const singleInfo = OCRService.parseTestRegistrationInfo(text);
        if (!singleInfo) {
          setError('이미지에서 시험 정보를 찾을 수 없습니다. 이미지가 선명한지 확인해주세요.');
          return;
        }
        setExtractedInfo(singleInfo);
        setMultipleTestInfo(null);
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
      // 파일 입력 초기화
      event.target.value = '';
    }
  };

  const handleConfirmExtraction = async () => {
    try {
      if (multipleTestInfo) {
        // 다중 시험인 경우
        console.log('다중 시험 등록 시작:', multipleTestInfo);
        const testsData = OCRService.convertMultipleToTestObjects(multipleTestInfo);
        console.log('변환된 시험 데이터:', testsData);
        onMultipleTestsExtracted(testsData, multipleTestInfo);
      } else if (extractedInfo) {
        // 단일 시험인 경우
        console.log('단일 시험 등록 시작:', extractedInfo);
        const testData = OCRService.convertToTestObject(extractedInfo);
        console.log('변환된 시험 데이터:', testData);
        onTestExtracted(testData, extractedInfo);
      }
    } catch (error) {
      console.error('시험 등록 오류:', error);
      setError(error instanceof Error ? error.message : '시험 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 안내 메시지 */}
      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2 text-sm sm:text-base">📧 시험 접수 확인서 자동 등록</h4>
        <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
          <li>• 이메일로 받은 시험 접수 확인서 이미지를 업로드하세요</li>
          <li>• OCR 기술로 자동으로 시험 정보를 추출합니다</li>
          <li>• 추출된 정보를 확인 후 프로젝트에 등록할 수 있습니다</li>
          <li>• 지원 형식: JPG, PNG, GIF, BMP (최대 10MB)</li>
        </ul>
      </div>

      {/* 이미지 업로드 */}
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 sm:p-6 lg:p-8 text-center hover:border-blue-400 transition-colors">
        <label className="cursor-pointer">
          <CloudArrowUpIcon className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-slate-400 mx-auto mb-3 sm:mb-4" />
          <div className="text-sm sm:text-base lg:text-lg font-medium text-slate-700 mb-2">
            {processing ? 'OCR 처리 중...' : '시험 접수 확인서 이미지를 선택하세요'}
          </div>
          <div className="text-xs sm:text-sm text-slate-500 mb-3 sm:mb-4">
            이미지에서 자동으로 시험 정보를 추출합니다
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={processing}
            className="hidden"
          />
          <div className={`inline-block px-4 py-2 sm:px-6 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
            processing 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
          } text-white`}>
            {processing ? (
              <div className="flex items-center gap-2">
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                <span>처리 중...</span>
              </div>
            ) : (
              '이미지 선택'
            )}
          </div>
        </label>
      </div>

      {/* 오류 메시지 */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            <div className="text-red-800">{error}</div>
          </div>
        </div>
      )}

      {/* 다중 시험 정보 표시 */}
      {multipleTestInfo && (
        <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
            <h4 className="font-medium text-green-800 text-sm sm:text-base">
              다중 시험 정보 추출 완료! ({multipleTestInfo.tests.length}개 시험)
            </h4>
          </div>
          
          {/* 공통 정보 */}
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-white rounded-lg border">
            <h5 className="font-medium text-green-700 mb-2 text-sm sm:text-base">공통 정보</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="break-words">
                <strong>시험관리번호:</strong> {multipleTestInfo.commonInfo.testManagementNumber}
              </div>
              <div className="break-words">
                <strong>프로젝트번호:</strong> {multipleTestInfo.commonInfo.projectNumber}
              </div>
              <div className="break-words">
                <strong>물질명:</strong> {multipleTestInfo.commonInfo.materialCode}
              </div>
              <div className="break-words">
                <strong>고객사명:</strong> {multipleTestInfo.commonInfo.clientName}
              </div>
            </div>
          </div>

          {/* 개별 시험 정보 */}
          <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-60 overflow-y-auto">
            {multipleTestInfo.tests.map((test, index) => (
              <div key={index} className="p-2 sm:p-3 bg-white rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <h6 className="font-medium text-green-700 text-sm">시험 {index + 1}</h6>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded break-all">
                    {test.testNumber}
                  </span>
                </div>
                <div className="space-y-1 text-xs sm:text-sm">
                  <div className="break-words">
                    <strong>시험명:</strong> {test.testName || '미확인'}
                  </div>
                  <div className="break-words">
                    <strong>담당자:</strong> {test.testManager || '미확인'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-green-200">
            <button
              onClick={handleConfirmExtraction}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {multipleTestInfo.tests.length}개 시험 모두 등록하기
            </button>
          </div>
        </div>
      )}

      {/* 단일 시험 정보 표시 */}
      {extractedInfo && !multipleTestInfo && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
            <h4 className="font-medium text-green-800">시험 정보 추출 완료!</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="text-green-700">시험관리번호:</strong>
              <div className="text-green-600 mt-1">{extractedInfo.testManagementNumber || '미확인'}</div>
            </div>
            <div>
              <strong className="text-green-700">프로젝트번호:</strong>
              <div className="text-green-600 mt-1">{extractedInfo.projectNumber || '미확인'}</div>
            </div>
            <div>
              <strong className="text-green-700">고객사명:</strong>
              <div className="text-green-600 mt-1">{extractedInfo.clientName || '미확인'}</div>
            </div>
            <div>
              <strong className="text-green-700">시험번호:</strong>
              <div className="text-green-600 mt-1">{extractedInfo.testNumber || '미확인'}</div>
            </div>
            <div className="md:col-span-2">
              <strong className="text-green-700">시험명:</strong>
              <div className="text-green-600 mt-1">{extractedInfo.testName || '미확인'}</div>
            </div>
            <div>
              <strong className="text-green-700">시험책임자:</strong>
              <div className="text-green-600 mt-1">{extractedInfo.testManager || '미확인'}</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-green-200">
            <button
              onClick={handleConfirmExtraction}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              이 정보로 시험 등록하기
            </button>
          </div>
        </div>
      )}

      {/* 추출된 원본 텍스트 (디버깅용) */}
      {extractedText && (
        <details className="bg-slate-50 p-4 rounded-lg">
          <summary className="cursor-pointer text-sm font-medium text-slate-700 mb-2">
            추출된 원본 텍스트 보기 (디버깅용)
          </summary>
          <pre className="text-xs text-slate-600 whitespace-pre-wrap bg-white p-3 rounded border">
            {extractedText}
          </pre>
        </details>
      )}

      {/* 안내 메시지 */}
      <div className="text-center text-xs sm:text-sm text-slate-500 mt-4">
        우측 상단의 ✕ 버튼을 클릭하여 창을 닫을 수 있습니다
      </div>
    </div>
  );
};

export default OCRTestUpload;