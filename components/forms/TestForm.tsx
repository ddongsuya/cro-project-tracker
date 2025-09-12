import React, { useState, useEffect } from 'react';
import type { Test } from '../../types';

interface TestFormProps {
  onSave: (testData: Omit<Test, 'id'>) => void;
  onCancel: () => void;
  initialData?: Test;
  defaultProjectNumber?: string; // 기본 프로젝트 번호
}

const TestForm: React.FC<TestFormProps> = ({ onSave, onCancel, initialData, defaultProjectNumber }) => {
    const [projectNumber, setProjectNumber] = useState('');
    const [testNumber, setTestNumber] = useState('');
    const [testName, setTestName] = useState('');
    const [testManager, setTestManager] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
    const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
    
    useEffect(() => {
        if(initialData) {
            setProjectNumber(initialData.projectNumber);
            setTestNumber(initialData.testNumber);
            setTestName(initialData.testName || '');
            setTestManager(initialData.testManager);
            setStartDate(initialData.startDate);
            setEndDate(initialData.endDate);
        } else if (defaultProjectNumber) {
            setProjectNumber(defaultProjectNumber);
        }
    }, [initialData, defaultProjectNumber]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!testNumber.trim() || !testName.trim() || !testManager.trim() || !projectNumber.trim()) {
            alert('모든 필드를 입력해주세요.');
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            alert('시작일은 종료일보다 이전이어야 합니다.');
            return;
        }
        onSave({ projectNumber, testNumber, testName, testManager, startDate, endDate });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="project-number" className="block text-sm font-medium text-gray-700">프로젝트 번호</label>
                <input type="text" id="project-number" value={projectNumber} onChange={e => setProjectNumber(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
             <div>
                <label htmlFor="test-number" className="block text-sm font-medium text-gray-700">시험 번호</label>
                <input type="text" id="test-number" value={testNumber} onChange={e => setTestNumber(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
                <label htmlFor="test-name" className="block text-sm font-medium text-gray-700">시험명</label>
                <input type="text" id="test-name" value={testName} onChange={e => setTestName(e.target.value)} placeholder="예: 랫드 4주 DRF 시험" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
                <label htmlFor="test-manager" className="block text-sm font-medium text-gray-700">시험 책임자</label>
                <input type="text" id="test-manager" value={testManager} onChange={e => setTestManager(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">시작일</label>
                    <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                    <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">종료일</label>
                    <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">취소</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">저장</button>
            </div>
        </form>
    );
};

export default TestForm;