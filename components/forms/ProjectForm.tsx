import React, { useState, useEffect } from 'react';
import type { Project, Requester } from '../../types';

interface ProjectFormProps {
  // Fix: The form only deals with core project data, not stages or tests.
  // The onSave and initialData props are updated to reflect this.
  onSave: (projectData: Omit<Project, 'stages' | 'tests'>, requesterId: string) => void;
  onCancel: () => void;
  initialData?: Omit<Project, 'stages' | 'tests'>;
  initialRequesterId?: string; // 편집 모드에서 초기 의뢰자 ID
  requesters: Requester[]; // 의뢰자 목록
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSave, onCancel, initialData, initialRequesterId, requesters }) => {
    // 디버깅을 위한 콘솔 출력
    console.log('ProjectForm props:', { initialData, initialRequesterId, requesters });
    
    const [id, setId] = useState('');
    const [projectNumber, setProjectNumber] = useState('');
    const [testItem, setTestItem] = useState('');
    const [quoteDate, setQuoteDate] = useState(new Date().toISOString().slice(0, 10));
    const [quotedAmount, setQuotedAmount] = useState(0);
    const [contractedAmount, setContractedAmount] = useState(''); // Use string for input flexibility
    const [statusText, setStatusText] = useState('신규');
    const [selectedRequesterId, setSelectedRequesterId] = useState('');
    
    // 초기 의뢰자 ID 설정
    useEffect(() => {
        if (initialRequesterId) {
            setSelectedRequesterId(initialRequesterId);
        } else if (requesters && requesters.length > 0) {
            setSelectedRequesterId(requesters[0].id);
        }
    }, [initialRequesterId, requesters]);

    useEffect(() => {
        if (initialData) {
            setId(initialData.id);
            setProjectNumber(initialData.projectNumber || '');
            setTestItem(initialData.testItem);
            setQuoteDate(initialData.quoteDate);
            setQuotedAmount(initialData.quotedAmount);
            setContractedAmount(initialData.contractedAmount?.toString() || '');
            setStatusText(initialData.statusText);
        }
        if (initialRequesterId) {
            setSelectedRequesterId(initialRequesterId);
        } else if (requesters && requesters.length > 0 && !selectedRequesterId) {
            // 초기 의뢰자 ID가 없고 의뢰자 목록이 있으면 첫 번째 의뢰자 선택
            setSelectedRequesterId(requesters[0].id);
        }
    }, [initialData, initialRequesterId, requesters]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!id.trim() || !testItem.trim()) {
            alert('견적서 번호와 시험 항목을 입력해주세요.');
            return;
        }
        if (!selectedRequesterId) {
            alert('의뢰자를 선택해주세요.');
            return;
        }
        onSave({
            id,
            projectNumber: projectNumber.trim() || undefined,
            testItem,
            quoteDate,
            quotedAmount,
            contractedAmount: contractedAmount ? Number(contractedAmount) : undefined,
            statusText
        }, selectedRequesterId);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="project-id" className="block text-sm font-medium text-gray-700">견적서 번호</label>
                <input type="text" id="project-id" value={id} onChange={e => setId(e.target.value)} disabled={!!initialData} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" required />
            </div>
            
            <div>
                <label htmlFor="requester-select" className="block text-sm font-medium text-gray-700">의뢰자 *</label>
                <select 
                    id="requester-select" 
                    value={selectedRequesterId} 
                    onChange={e => setSelectedRequesterId(e.target.value)}
                    disabled={!!initialData} // 편집 모드에서는 의뢰자 변경 불가
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    required
                >
                    {!requesters || requesters.length === 0 ? (
                        <option value="">의뢰자가 없습니다</option>
                    ) : (
                        <>
                            {/* 편집 모드에서 현재 선택된 의뢰자가 없으면 안내 메시지 */}
                            {initialData && !selectedRequesterId && (
                                <option value="">현재 의뢰자를 찾을 수 없습니다</option>
                            )}
                            {requesters.map(requester => (
                                <option key={requester.id} value={requester.id}>
                                    {requester.name} ({requester.department}) - {requester.email}
                                </option>
                            ))}
                        </>
                    )}
                </select>
                {(!requesters || requesters.length === 0) && (
                    <p className="mt-1 text-sm text-red-600">
                        프로젝트를 추가하려면 먼저 의뢰자를 추가해주세요.
                    </p>
                )}
            </div>
            
            <div>
                <label htmlFor="project-number" className="block text-sm font-medium text-gray-700">프로젝트 번호</label>
                <input type="text" id="project-number" value={projectNumber} onChange={e => setProjectNumber(e.target.value)} placeholder="예: 25-03-DL-0006-3" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                <p className="mt-1 text-sm text-gray-500">프로젝트 번호를 입력하면 해당 프로젝트의 모든 시험에 자동으로 적용됩니다.</p>
            </div>
            <div>
                <label htmlFor="test-item" className="block text-sm font-medium text-gray-700">시험 항목</label>
                <input type="text" id="test-item" value={testItem} onChange={e => setTestItem(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
                <label htmlFor="quote-date" className="block text-sm font-medium text-gray-700">견적일</label>
                <input type="date" id="quote-date" value={quoteDate} onChange={e => setQuoteDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
                <label htmlFor="quoted-amount" className="block text-sm font-medium text-gray-700">견적 금액 (원)</label>
                <input type="number" id="quoted-amount" value={quotedAmount} onChange={e => setQuotedAmount(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
                <label htmlFor="contracted-amount" className="block text-sm font-medium text-gray-700">계약 금액 (원)</label>
                <input type="number" id="contracted-amount" value={contractedAmount} onChange={e => setContractedAmount(e.target.value)} placeholder="계약 체결 시 입력" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
             <div>
                <label htmlFor="status-text" className="block text-sm font-medium text-gray-700">진행 상태 (요약)</label>
                <input type="text" id="status-text" value={statusText} onChange={e => setStatusText(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">취소</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">저장</button>
            </div>
        </form>
    );
};

export default ProjectForm;