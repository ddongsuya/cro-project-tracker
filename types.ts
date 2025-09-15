// Enhanced type definitions for the application
export type ViewMode = 'dashboard' | 'team-dashboard' | 'company-dashboard' | 'calendar' | 'projects';

export type ProjectStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type TestStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export enum StageStatus {
  Pending = '대기',
  InProgress = '진행중',
  Completed = '완료',
  OnHold = '보류',
}

export interface ProjectStage {
  id: string;
  name: string;
  status: StageStatus;
  date?: string;
  notes?: string;
}

export interface Test {
  id: string;
  projectNumber: string;
  testNumber: string;
  testName: string;  // 시험명 추가
  testManager: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface FollowUpRecord {
  id: string;
  date: string; // YYYY-MM-DD
  method: '전화' | '이메일' | '방문' | '기타';
  contactPerson: string;
  content: string;
  result: '응답대기' | '긍정적' | '부정적' | '추가정보요청' | '계약진행' | '거절';
  nextAction?: string;
  nextActionDate?: string;
}

export interface Project {
  id: string; // 견적서 번호
  projectNumber?: string; // 프로젝트 번호 (별도 입력)
  testItem: string; // 시험 항목
  quoteDate: string; // 견적일
  quotedAmount: number; // 견적 금액
  contractedAmount?: number; // 계약 금액
  statusText: string; // 진행 상태 (요summary)
  stages: ProjectStage[];
  tests: Test[];
  followUps?: FollowUpRecord[]; // Follow-up 기록 추가 (선택적)
}

export interface Requester {
  id: string;
  name: string; // 의뢰자 이름
  email: string;
  phone: string;
  department?: string; // 부서
  position?: string; // 직책
  projects: Project[]; // 해당 의뢰자가 요청한 프로젝트들
}

export interface Client {
  id: string;
  name: string; // 회사명
  businessNumber?: string; // 사업자등록번호
  ceoName?: string; // 대표이사
  mainPhone?: string; // 대표번호
  website?: string; // 홈페이지
  address?: string; // 주소
  requesters: Requester[]; // 의뢰자들
}