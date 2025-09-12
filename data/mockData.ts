import { Client, StageStatus } from '../types';
import { DEFAULT_STAGES } from '../constants';

// 실제 CRO 업무 데이터 기반으로 업데이트
export const MOCK_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: '(주)엘지화학',
    contactPerson: '김영수',
    email: 'youngsoo.kim@lgchem.com',
    phone: '02-3773-1234',
    projects: [
      {
        id: 'P-2024-001',
        testItem: '리튬이온 배터리 안전성 평가',
        quoteDate: '2024-03-15',
        quotedAmount: 85000000,
        contractedAmount: 82000000,
        statusText: '시험 진행 중',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's1-1', status: StageStatus.Completed, date: '2024-05-01' },
          { ...DEFAULT_STAGES[1], id: 's1-2', status: StageStatus.Completed, date: '2024-05-02' },
          { ...DEFAULT_STAGES[2], id: 's1-3', status: StageStatus.Completed, date: '2024-05-03' },
          { ...DEFAULT_STAGES[3], id: 's1-4', status: StageStatus.Completed, date: '2024-05-08' },
          { ...DEFAULT_STAGES[4], id: 's1-5', status: StageStatus.Completed, date: '2024-05-10' },
          { ...DEFAULT_STAGES[5], id: 's1-6', status: StageStatus.InProgress, date: '2024-05-12' },
        ],
        tests: [
            { id: 't1-1', projectNumber: 'PN-24-05-01', testNumber: 'TN-001', testManager: '김철수', startDate: '2024-05-20', endDate: '2024-06-10'},
            { id: 't1-2', projectNumber: 'PN-24-05-01', testNumber: 'TN-002', testManager: '이영희', startDate: '2024-06-05', endDate: '2024-06-25'},
        ],
        followUps: [
          {
            id: 'fu-1',
            date: '2024-03-20',
            method: '전화',
            contactPerson: '김영수 과장',
            content: '견적서 검토 현황 문의 및 추가 설명 제공',
            result: '긍정적',
            nextAction: '기술 검토 후 재연락',
            nextActionDate: '2024-03-25'
          },
          {
            id: 'fu-2',
            date: '2024-03-25',
            method: '이메일',
            contactPerson: '김영수 과장',
            content: '기술 자료 추가 발송 및 일정 조율',
            result: '계약진행',
            nextAction: '계약서 검토',
            nextActionDate: '2024-03-30'
          }
        ]
      },
      {
        id: 'P-2024-002',
        testItem: '비스포크 냉장고 신뢰성 평가',
        quoteDate: '2024-06-10',
        quotedAmount: 120000000,
        statusText: '견적서 송부 완료',
        stages: [
            { ...DEFAULT_STAGES[0], id: 's2-1', status: StageStatus.Completed, date: '2024-06-10' },
            { ...DEFAULT_STAGES[1], id: 's2-2', status: StageStatus.Completed, date: '2024-06-11' },
            { ...DEFAULT_STAGES[2], id: 's2-3', status: StageStatus.Completed, date: '2024-06-12' },
            { ...DEFAULT_STAGES[3], id: 's2-4', status: StageStatus.Pending },
            { ...DEFAULT_STAGES[4], id: 's2-5', status: StageStatus.Pending },
            { ...DEFAULT_STAGES[5], id: 's2-6', status: StageStatus.Pending },
        ],
        tests: []
      },
    ]
  },
  {
    id: 'client-2',
    name: 'LG전자',
    contactPerson: '이순신',
    email: 'sunshin.lee@lge.com',
    phone: '010-9876-5432',
    projects: [
      {
        id: 'P-2024-003',
        testItem: 'OLED TV 패널 수명 시험',
        quoteDate: '2024-05-20',
        quotedAmount: 85000000,
        contractedAmount: 85000000,
        statusText: '계약 체결 완료',
        stages: [
            { ...DEFAULT_STAGES[0], id: 's3-1', status: StageStatus.Completed, date: '2024-05-20' },
            { ...DEFAULT_STAGES[1], id: 's3-2', status: StageStatus.Completed, date: '2024-05-22' },
            { ...DEFAULT_STAGES[2], id: 's3-3', status: StageStatus.Completed, date: '2024-05-23' },
            { ...DEFAULT_STAGES[3], id: 's3-4', status: StageStatus.Completed, date: '2024-05-24' },
            { ...DEFAULT_STAGES[4], id: 's3-5', status: StageStatus.Completed, date: '2024-05-28' },
            { ...DEFAULT_STAGES[5], id: 's3-6', status: StageStatus.Pending },
        ],
        tests: [
            { id: 't2-1', projectNumber: 'PN-24-05-20', testNumber: 'TN-LG-01', testManager: '박지성', startDate: '2024-06-10', endDate: '2024-07-10'},
        ]
      },
    ]
  },
  {
    id: 'client-3',
    name: '바이오노트',
    contactPerson: '김민준',
    email: 'mj.kim@bionote.co.kr',
    phone: '031-123-4567',
    projects: [
      {
        id: 'P-2024-004',
        testItem: '개 심장사상충 항원 신속진단키트 유효성 평가',
        quoteDate: '2024-04-15',
        quotedAmount: 35000000,
        contractedAmount: 35000000,
        statusText: '계약 완료, 시험 준비중',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's4-1', status: StageStatus.Completed, date: '2024-04-15' },
          { ...DEFAULT_STAGES[1], id: 's4-2', status: StageStatus.Completed, date: '2024-04-16' },
          { ...DEFAULT_STAGES[2], id: 's4-3', status: StageStatus.Completed, date: '2024-04-17' },
          { ...DEFAULT_STAGES[3], id: 's4-4', status: StageStatus.Completed, date: '2024-04-22' },
          { ...DEFAULT_STAGES[4], id: 's4-5', status: StageStatus.Completed, date: '2024-04-25' },
          { ...DEFAULT_STAGES[5], id: 's4-6', status: StageStatus.InProgress },
        ],
        tests: []
      },
      {
        id: 'P-2024-005',
        testItem: '고양이 범백혈구감소증 바이러스 항체 검사키트 평가',
        quoteDate: '2024-05-02',
        quotedAmount: 42000000,
        statusText: '견적 송부 후 협의 중',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's5-1', status: StageStatus.Completed, date: '2024-05-02' },
          { ...DEFAULT_STAGES[1], id: 's5-2', status: StageStatus.Completed, date: '2024-05-03' },
          { ...DEFAULT_STAGES[2], id: 's5-3', status: StageStatus.Completed, date: '2024-05-04' },
          { ...DEFAULT_STAGES[3], id: 's5-4', status: StageStatus.InProgress },
          { ...DEFAULT_STAGES[4], id: 's5-5', status: StageStatus.Pending },
          { ...DEFAULT_STAGES[5], id: 's5-6', status: StageStatus.Pending },
        ],
        tests: []
      }
    ]
  },
  {
    id: 'client-4',
    name: '씨젠',
    contactPerson: '이지은',
    email: 'jieun.lee@seegene.com',
    phone: '02-987-6543',
    projects: [
      {
        id: 'P-2024-006',
        testItem: '코로나19/독감 동시진단키트 분석 성능 시험',
        quoteDate: '2024-05-20',
        quotedAmount: 150000000,
        contractedAmount: 145000000,
        statusText: '시험 진행중',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's6-1', status: StageStatus.Completed, date: '2024-05-20' },
          { ...DEFAULT_STAGES[1], id: 's6-2', status: StageStatus.Completed, date: '2024-05-21' },
          { ...DEFAULT_STAGES[2], id: 's6-3', status: StageStatus.Completed, date: '2024-05-22' },
          { ...DEFAULT_STAGES[3], id: 's6-4', status: StageStatus.Completed, date: '2024-05-24' },
          { ...DEFAULT_STAGES[4], id: 's6-5', status: StageStatus.Completed, date: '2024-05-28' },
          { ...DEFAULT_STAGES[5], id: 's6-6', status: StageStatus.Completed, date: '2024-05-30' },
        ],
        tests: [
          { id: 't3-1', projectNumber: 'PN-SG-24-01', testNumber: 'TN-SG-CV-01', testManager: '최현우', startDate: '2024-06-05', endDate: '2024-08-30' }
        ]
      }
    ]
  },
  {
    id: 'client-5',
    name: 'SD바이오센서',
    contactPerson: '박서준',
    email: 'sj.park@sdbiosensor.com',
    phone: '031-456-7890',
    projects: [
      {
        id: 'P-2024-007',
        testItem: '뎅기열 항원 신속진단키트 민감도 및 특이도 평가',
        quoteDate: '2024-06-03',
        quotedAmount: 68000000,
        statusText: '문의 접수, 검토 중',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's7-1', status: StageStatus.Completed, date: '2024-06-03' },
          { ...DEFAULT_STAGES[1], id: 's7-2', status: StageStatus.InProgress, date: '2024-06-04' },
          { ...DEFAULT_STAGES[2], id: 's7-3', status: StageStatus.Pending },
          { ...DEFAULT_STAGES[3], id: 's7-4', status: StageStatus.Pending },
          { ...DEFAULT_STAGES[4], id: 's7-5', status: StageStatus.Pending },
          { ...DEFAULT_STAGES[5], id: 's7-6', status: StageStatus.Pending },
        ],
        tests: []
      }
    ]
  },
  {
    id: 'client-6',
    name: '휴마시스',
    contactPerson: '정다은',
    email: 'de.jung@humasis.com',
    phone: '031-789-0123',
    projects: [
      {
        id: 'P-2024-008',
        testItem: '임신진단테스트기 정확도 평가 시험',
        quoteDate: '2024-06-11',
        quotedAmount: 25000000,
        statusText: '견적 송부 완료',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's8-1', status: StageStatus.Completed, date: '2024-06-11' },
          { ...DEFAULT_STAGES[1], id: 's8-2', status: StageStatus.Completed, date: '2024-06-12' },
          { ...DEFAULT_STAGES[2], id: 's8-3', status: StageStatus.Completed, date: '2024-06-12' },
          { ...DEFAULT_STAGES[3], id: 's8-4', status: StageStatus.Pending },
          { ...DEFAULT_STAGES[4], id: 's8-5', status: StageStatus.Pending },
          { ...DEFAULT_STAGES[5], id: 's8-6', status: StageStatus.Pending },
        ],
        tests: []
      }
    ]
  }
];