import React from 'react';
import { ProjectStage, StageStatus } from '../types';
import CheckCircleIcon from './icons/CheckCircleIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';
import MinusCircleIcon from './icons/MinusCircleIcon';
import InboxArrowDownIcon from './icons/InboxArrowDownIcon';
import DocumentMagnifyingGlassIcon from './icons/DocumentMagnifyingGlassIcon';
import PaperAirplaneIcon from './icons/PaperAirplaneIcon';
import CreditCardIcon from './icons/CreditCardIcon';
import PencilSquareIcon from './icons/PencilSquareIcon';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';

interface HorizontalProgressTrackerProps {
  stages: ProjectStage[];
  onStageClick: (stage: ProjectStage) => void;
}

const StageIcon: React.FC<{ name: string, status: StageStatus }> = ({ name, status }) => {
    const getIconByName = () => {
        const iconClass = `h-8 w-8 ${status === StageStatus.Completed ? 'text-blue-600' : status === StageStatus.InProgress ? 'text-green-600' : 'text-gray-500'}`;
        switch (name) {
            case '온라인 문의 접수': return <InboxArrowDownIcon className={iconClass} />;
            case '문의 내용 검토 및 대응': return <DocumentMagnifyingGlassIcon className={iconClass} />;
            case '견적서 송부': return <PaperAirplaneIcon className={iconClass} />;
            case '지급 조건 설정': return <CreditCardIcon className={iconClass} />;
            case '계약 체결': return <PencilSquareIcon className={iconClass} />;
            case '시험 접수요청': return <ClipboardDocumentListIcon className={iconClass} />;
            case '최종보고서 발행': return <DocumentTextIcon className={iconClass} />;
            default: return <div className={`h-8 w-8 rounded-full ${iconClass}`} />;
        }
    }
    
    return (
        <div className="relative">
            {getIconByName()}
            {status === StageStatus.InProgress && <ArrowPathIcon className="h-4 w-4 text-green-600 absolute -top-1 -right-1 animate-spin" />}
            {status === StageStatus.Completed && <CheckCircleIcon className="h-4 w-4 text-blue-600 bg-white rounded-full absolute -top-1 -right-1" />}
            {status === StageStatus.OnHold && <MinusCircleIcon className="h-4 w-4 text-yellow-600 bg-white rounded-full absolute -top-1 -right-1" />}
        </div>
    );
};


const getStatusColor = (status: StageStatus, isPast: boolean) => {
    if (status === StageStatus.Completed) return 'bg-blue-600';
    if (isPast) return 'bg-blue-600';
    return 'bg-gray-300';
}

const HorizontalProgressTracker: React.FC<HorizontalProgressTrackerProps> = ({ stages, onStageClick }) => {
    const inProgressIndex = stages.findIndex(s => s.status === StageStatus.InProgress);
    let lastCompletedIndex = -1;
    if (inProgressIndex === -1) {
        lastCompletedIndex = stages.map(s => s.status).lastIndexOf(StageStatus.Completed);
    }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
        {stages.map((stage, index) => {
            const isPast = inProgressIndex !== -1 ? index < inProgressIndex : index <= lastCompletedIndex;
            const isLast = index === stages.length - 1;

            return (
            <React.Fragment key={stage.id}>
                <div className="flex flex-col items-center flex-shrink-0">
                    <button onClick={() => onStageClick(stage)} className="rounded-full p-1 hover:bg-gray-100 transition-colors">
                        <StageIcon name={stage.name} status={stage.status} />
                    </button>
                    <p className="text-xs text-center mt-2 w-24 font-medium">{stage.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{stage.date || 'N/A'}</p>
                </div>
                {!isLast && (
                <div className={`flex-1 h-1 mx-2 ${getStatusColor(stage.status, isPast)}`} />
                )}
            </React.Fragment>
            );
        })}
        </div>
    </div>
  );
};

export default HorizontalProgressTracker;