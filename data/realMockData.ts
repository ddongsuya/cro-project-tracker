import { Client, StageStatus } from '../types';
import { DEFAULT_STAGES } from '../constants';

// 실제 CRO 업무 데이터 기반 목 데이터
export const REAL_MOCK_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: '(주)엘지화학',
    contactPerson: '김영수 과장',
    email: 'youngsoo.kim@lgchem.com',
    phone: '02-3773-1234',
    projects: [
      {
        id: 'Q-2024-0315-001',
        testItem: '리튬이온 배터리 안전성 평가 (UN38.3)',
        quoteDate: '2024-03-15',
        quotedAmount: 85000000,
        contractedAmount: 82000000,
        statusText: '시험 진행 중',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's1-1', status: StageStatus.Completed, date: '2024-03-15' },
          { ...DEFAULT_STAGES[1], id: 's1-2', status: StageStatus.Completed, date: '2024-03-16' },
          { ...DEFAULT_STAGES[2], id: 's1-3', status: StageStatus.Completed, date: '2024-03-18' },
          { ...DEFAULT_STAGES[3], id: 's1-4', status: StageStatus.Completed, date: '2024-03-25' },
          { ...DEFAULT_STAGES[4], id: 's1-5', status: StageStatus.Completed, date: '2024-03-30' },
          { ...DEFAULT_STAGES[5], id: 's1-6', status: StageStatus.InProgress, date: '2024-04-02' },
        ],
        tests: [
          { id: 't1-1', projectNumber: 'PN-LG-24-001', testNumber: 'TN-BAT-001', testManager: '박철수', startDate: '2024-04-05', endDate: '2024-05-20'},
          { id: 't1-2', projectNumber: 'PN-LG-24-001', testNumber: 'TN-BAT-002', testManager: '이영희', startDate: '2024-05-10', endDate: '2024-06-15'},
        ],
        followUps: [
          {
            id: 'fu-1',
            date: '2024-03-20',
            method: '전화',
            contactPerson: '김영수 과장',
            content: '견적서 검토 현황 문의 및 추가 설명 제공. 배터리 안전성 시험 범위와 일정에 대해 상세히 설명함.',
            result: '긍정적',
            nextAction: '기술팀 검토 후 재연락',
            nextActionDate: '2024-03-25'
          },
          {
            id: 'fu-2',
            date: '2024-03-25',
            method: '이메일',
            contactPerson: '김영수 과장',
            content: '기술 자료 추가 발송 및 일정 조율. UN38.3 시험 절차서와 샘플 준비 가이드 전달.',
            result: '계약진행',
            nextAction: '계약서 검토 및 서명',
            nextActionDate: '2024-03-30'
          }
        ]
      }
    ]
  },
  {
    id: 'client-2',
    name: '삼성SDI',
    contactPerson: '박민준 차장',
    email: 'minjun.park@samsungsdi.com',
    phone: '031-8006-3456',
    projects: [
      {
        id: 'Q-2024-0410-002',
        testItem: '전기차 배터리팩 진동 시험',
        quoteDate: '2024-04-10',
        quotedAmount: 120000000,
        statusText: '견적 검토 중',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's2-1', status: StageStatus.Completed, date: '2024-04-10' },
          { ...DEFAULT_STAGES[1], id: 's2-2', status: StageStatus.Completed, date: '2024-04-11' },
          { ...DEFAULT_STAGES[2], id: 's2-3', status: StageStatus.Completed, date: '2024-04-12' },
          { ...DEFAULT_STAGES[3], id: 's2-4', status: StageStatus.InProgress, date: '2024-04-15' },
          { ...DEFAULT_STAGES[4], id: 's2-5', status: StageStatus.Pending },
          { ...DEFAULT_STAGES[5], id: 's2-6', status: StageStatus.Pending },
        ],
        tests: [],
        followUps: [
          {
            id: 'fu-3',
            date: '2024-04-15',
            method: '전화',
            contactPerson: '박민준 차장',
            content: '견적서 발송 후 검토 현황 확인. 진동 시험 조건과 기준에 대한 추가 질문 답변.',
            result: '추가정보요청',
            nextAction: '상세 시험 계획서 발송',
            nextActionDate: '2024-04-18'
          },
          {
            id: 'fu-4',
            date: '2024-04-18',
            method: '이메일',
            contactPerson: '박민준 차장',
            content: '상세 시험 계획서 및 참고 자료 발송. 유사 프로젝트 사례 공유.',
            result: '응답대기',
            nextAction: '검토 결과 확인 연락',
            nextActionDate: '2024-04-25'
          }
        ]
      }
    ]
  },
  {
    id: 'client-3',
    name: 'SK이노베이션',
    contactPerson: '정수현 팀장',
    email: 'suhyun.jung@sk.com',
    phone: '02-2121-5678',
    projects: [
      {
        id: 'Q-2024-0505-003',
        testItem: '윤활유 점도 및 산화 안정성 시험',
        quoteDate: '2024-05-05',
        quotedAmount: 45000000,
        contractedAmount: 43000000,
        statusText: '계약 완료, 시험 준비중',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's3-1', status: StageStatus.Completed, date: '2024-05-05' },
          { ...DEFAULT_STAGES[1], id: 's3-2', status: StageStatus.Completed, date: '2024-05-06' },
          { ...DEFAULT_STAGES[2], id: 's3-3', status: StageStatus.Completed, date: '2024-05-07' },
          { ...DEFAULT_STAGES[3], id: 's3-4', status: StageStatus.Completed, date: '2024-05-10' },
          { ...DEFAULT_STAGES[4], id: 's3-5', status: StageStatus.Completed, date: '2024-05-15' },
          { ...DEFAULT_STAGES[5], id: 's3-6', status: StageStatus.InProgress, date: '2024-05-20' },
        ],
        tests: [
          { id: 't3-1', projectNumber: 'PN-SK-24-001', testNumber: 'TN-LUB-001', testManager: '김현우', startDate: '2024-05-25', endDate: '2024-07-10'},
        ],
        followUps: [
          {
            id: 'fu-5',
            date: '2024-05-08',
            method: '방문',
            contactPerson: '정수현 팀장',
            content: '직접 방문하여 견적 내용 설명 및 시험 방법론 논의. 샘플 수량과 배송 일정 확정.',
            result: '계약진행',
            nextAction: '계약서 작성 및 발송',
            nextActionDate: '2024-05-12'
          }
        ]
      },
      {
        id: 'Q-2024-0520-004',
        testItem: '연료첨가제 성능 평가',
        quoteDate: '2024-05-20',
        quotedAmount: 38000000,
        statusText: '견적 송부 완료',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's4-1', status: StageStatus.Completed, date: '2024-05-20' },
          { ...DEFAULT_STAGES[1], id: 's4-2', status: StageStatus.Completed, date: '2024-05-21' },
          { ...DEFAULT_STAGES[2], id: 's4-3', status: StageStatus.Completed, date: '2024-05-22' },
          { ...DEFAULT_STAGES[3], id: 's4-4', status: StageStatus.Pending },
          { ...DEFAULT_STAGES[4], id: 's4-5', status: StageStatus.Pending },
          { ...DEFAULT_STAGES[5], id: 's4-6', status: StageStatus.Pending },
        ],
        tests: [],
        followUps: [
          {
            id: 'fu-6',
            date: '2024-05-25',
            method: '이메일',
            contactPerson: '정수현 팀장',
            content: '견적서 검토 현황 문의 및 추가 질문 사항 확인.',
            result: '응답대기',
            nextAction: '전화 Follow-up',
            nextActionDate: '2024-05-30'
          }
        ]
      }
    ]
  },
  {
    id: 'client-4',
    name: '현대모비스',
    contactPerson: '이준호 부장',
    email: 'junho.lee@mobis.co.kr',
    phone: '031-280-9876',
    projects: [
      {
        id: 'Q-2024-0601-005',
        testItem: '자동차 부품 내구성 시험 (진동/충격)',
        quoteDate: '2024-06-01',
        quotedAmount: 95000000,
        statusText: '문의 접수, 검토 중',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's5-1', status: StageStatus.Completed, date: '2024-06-01' },
          { ...DEFAULT_STAGES[1], id: 's5-2', status: StageStatus.InProgress, date: '2024-06-02' },
          { ...DEFAULT_STAGES[2], id: 's5-3', status: StageStatus.Pending },
          { ...DEFAULT_STAGES[3], id: 's5-4', status: StageStatus.Pending },
          { ...DEFAULT_STAGES[4], id: 's5-5', status: StageStatus.Pending },
          { ...DEFAULT_STAGES[5], id: 's5-6', status: StageStatus.Pending },
        ],
        tests: [],
        followUps: []
      }
    ]
  }
];

// 기존 MOCK_CLIENTS를 새로운 데이터로 교체
export const MOCK_CLIENTS = REAL_MOCK_CLIENTS;