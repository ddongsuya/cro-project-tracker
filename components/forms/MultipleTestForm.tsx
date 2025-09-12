import React, { useState } from 'react';
import type { Test } from '../../types';
import PlusIcon from '../icons/PlusIcon';
import TrashIcon from '../icons/TrashIcon';

interface TestFormData {
  testNumber: string;
  testName: string;
  testManager: string;
  startDate: string;
  endDate: string;
}

interface MultipleTestFormProps {
  projectNumber: string;
  onSave: (tests: Omit<Test, 'id'>[]) => void;
  onCancel: () => void;
}

const MultipleTestForm: React.FC<MultipleTestFormProps> = ({ projectNumber, onSave, onCancel }) => {
  const [tests, setTests] = useState<TestFormData[]>([
    {
      testNumber: '',
      testName: '',
      testManager: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  ]);

  const addTest = () => {
    setTests([...tests, {
      testNumber: '',
      testName: '',
      testManager: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }]);
  };

  const removeTest = (index: number) => {
    if (tests.length > 1) {
      setTests(tests.filter((_, i) => i !== index));
    }
  };

  const updateTest = (index: number, field: keyof TestFormData, value: string) => {
    const updatedTests = [...tests];
    updatedTests[index] = { ...updatedTests[index], [field]: value };
    setTests(updatedTests);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검사
    const validTests = tests.filter(test => 
      test.testNumber.trim() && 
      test.testName.trim() && 
      test.testManager.trim()
    );

    if (validTests.length === 0) {
      alert('최소 하나의 완전한 시험 정보를 입력해주세요.');
      return;
    }

    const testsToSave = validTests.map(test => ({
      projectNumber,
      testNumber: test.testNumber.trim(),
      testName: test.testName.trim(),
      testManager: test.testManager.trim(),
      startDate: test.startDate,
      endDate: test.endDate
    }));

    onSave(testsToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">📋 다중 시험 정보 입력</h4>
        <p className="text-sm text-blue-700">여러 개의 시험을 한 번에 추가할 수 있습니다. 필요한 만큼 시험을 추가하세요.</p>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {tests.map((test, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h5 className="font-medium text-gray-700">시험 {index + 1}</h5>
              {tests.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTest(index)}
                  className="p-1 text-red-500 hover:bg-red-100 rounded-full"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  시험번호 *
                </label>
                <input
                  type="text"
                  value={test.testNumber}
                  onChange={(e) => updateTest(index, 'testNumber', e.target.value)}
                  placeholder="예: 25-RR-0195"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  시험명 *
                </label>
                <input
                  type="text"
                  value={test.testName}
                  onChange={(e) => updateTest(index, 'testName', e.target.value)}
                  placeholder="예: 랫드 4주 DRF 시험"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  담당자 *
                </label>
                <input
                  type="text"
                  value={test.testManager}
                  onChange={(e) => updateTest(index, 'testManager', e.target.value)}
                  placeholder="예: 김지현"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  프로젝트번호
                </label>
                <input
                  type="text"
                  value={projectNumber}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  시작일
                </label>
                <input
                  type="date"
                  value={test.startDate}
                  onChange={(e) => updateTest(index, 'startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  종료일
                </label>
                <input
                  type="date"
                  value={test.endDate}
                  onChange={(e) => updateTest(index, 'endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={addTest}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          시험 추가
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {tests.filter(t => t.testNumber.trim() && t.testName.trim() && t.testManager.trim()).length}개 시험 저장
          </button>
        </div>
      </div>
    </form>
  );
};

export default MultipleTestForm;