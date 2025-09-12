import { ProjectStage, StageStatus } from './types';

// Fix: Defining default stages for new projects based on user's workflow
export const DEFAULT_STAGES: Omit<ProjectStage, 'id'>[] = [
  { name: '온라인 문의 접수', status: StageStatus.Pending },
  { name: '문의 내용 검토 및 대응', status: StageStatus.Pending },
  { name: '견적서 송부', status: StageStatus.Pending },
  { name: '지급 조건 설정', status: StageStatus.Pending },
  { name: '계약 체결', status: StageStatus.Pending },
  { name: '시험 접수요청', status: StageStatus.Pending },
  { name: '최종보고서 발행', status: StageStatus.Pending },
];