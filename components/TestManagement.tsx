import React from 'react';
import type { Test } from '../types';
import PlusIcon from './icons/PlusIcon';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';

interface TestManagementProps {
    tests: Test[];
    onAdd: () => void;
    onEdit: (test: Test) => void;
    onDelete: (testId: string) => void;
}

const TestManagement: React.FC<TestManagementProps> = ({ tests, onAdd, onEdit, onDelete }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow h-full">
            <div className="flex justify-between items-center mb-4">
                <button onClick={onAdd} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-sm text-gray-700 rounded-md hover:bg-gray-200">
                    <PlusIcon className="h-4 w-4"/>
                    <span>시험 추가</span>
                </button>
            </div>
            <div className="space-y-3 overflow-y-auto" style={{maxHeight: '300px'}}>
                {tests.length > 0 ? tests.map(test => (
                    <div key={test.id} className="grid grid-cols-3 gap-4 p-3 rounded-md border border-gray-200">
                        <div className="col-span-2">
                            <p className="font-bold text-sm text-gray-800">{test.testNumber}</p>
                            <p className="text-sm text-gray-700 mb-1">{test.testName || '시험명 없음'}</p>
                            <p className="text-xs text-gray-500">P/N: {test.projectNumber}</p>
                            <p className="text-xs text-gray-500">담당: {test.testManager}</p>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                             <div className="flex items-center gap-2">
                                <button onClick={() => onEdit(test)} className="p-1 rounded-full hover:bg-gray-200">
                                    <PencilIcon className="h-4 w-4 text-gray-500" />
                                </button>
                                <button onClick={() => onDelete(test.id)} className="p-1 rounded-full hover:bg-gray-200">
                                    <TrashIcon className="h-4 w-4 text-red-500" />
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 self-end mt-2">{test.startDate} ~ {test.endDate}</p>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>관리할 시험 정보가 없습니다.</p>
                        <p className="text-sm">'시험 추가' 버튼을 눌러 시작하세요.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestManagement;