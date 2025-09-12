import { Client, StageStatus } from '../types';
import { DEFAULT_STAGES } from '../constants';

// 첨부파일 엑셀 시트의 실제 데이터를 그대로 반영
export const ACTUAL_EXCEL_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: '(주)엘지화학',
    contactPerson: '김영수',
    email: 'contact@lgchem.com',
    phone: '02-3773-1234',
    projects: [
      {
        id: '2024-01-02',
        testItem: '리튬이온 배터리 안전성 평가',
        quoteDate: '2024-01-02',
        quotedAmount: 50000000,
        statusText: '견적 송부',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's1-1', status: StageStatus.Completed, date: '2024-01-02' },
          { ...DEFAULT_STAGES[1], id: 's1-2', status: StageStatus.Completed, date: '2024-01-03' },
          { ...DEFAULT_STAGES[2], id: 's1-3', status: StageStatus.Completed, date: '2024-01-05' },
          { ...DEFAULT_STAGES[3], id: 's1-4', status: StageStatus.Pending },
          { ...DEFAULT_STAGES[4], id: 's1-5', status: StageStatus.Pending },
          { ...DEFAULT_STAGES[5], id: 's1-6', status: StageStatus.Pending },
        ],
        tests: [],
        followUps: []
      },
      {
        id: '2024-01-03',
        testItem: '배터리 전해질 분석',
        quoteDate: '2024-01-03',
        quotedAmount: 30000000,
        statusText: '견적 송부',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's2-1', status: StageStatus.Completed, date: '2024-01-03' },
          { ...DEFAULT_STAGES[1], id: 's2-2', status: StageStatus.Completed, date: '2024-01-04' },
          { ...DEFAULT_STAGES[2], id: 's2-3', status: StageStatus.Completed, date: '2024-01-05' },
          { ...DEFAULT_STAGES[3], id: 's2-4', status: StageStatus.Pending },
          { ...DEFAULT_STAGES[4], id: 's2-5', status: StageStatus.Pending },
          { ...DEFAULT_STAGES[5], id: 's2-6', status: StageStatus.Pending },
        ],
        tests: [],
        followUps: []
      }
    ]
  }
];

// 실제 엑셀 데이터로 교체
export const MOCK_CLIENTS = ACTUAL_EXCEL_CLIENTS;