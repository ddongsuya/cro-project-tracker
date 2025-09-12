import { Client, StageStatus } from '../types';
import { DEFAULT_STAGES } from '../constants';

// 첨부파일의 실제 데이터를 정확히 반영 (새로운 구조)
export const EXACT_EXCEL_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: '(주)엘지화학',
    businessNumber: '123-45-67890',
    ceoName: '김현수',
    mainPhone: '02-3773-1114',
    website: 'https://www.lgchem.com',
    address: '서울특별시 영등포구 여의대로 128',
    requesters: [
      {
        id: 'req-1-1',
        name: '이영희',
        email: 'yhlee@lgchem.com',
        phone: '02-3773-2234',
        department: '배터리연구소',
        position: '선임연구원',
        projects: [
          {
            id: '2024-01-02',
            projectNumber: '24-01-LG-0001',
            testItem: '리튬이온 배터리 안전성 평가 (UN38.3 시험 포함)',
            quoteDate: '2024-01-02',
            quotedAmount: 175000000,
            statusText: '견적 송부',
            stages: [
              { ...DEFAULT_STAGES[0], id: 's1-1', status: StageStatus.Completed, date: '2024-01-02' },
              { ...DEFAULT_STAGES[1], id: 's1-2', status: StageStatus.Completed, date: '2024-01-03' },
              { ...DEFAULT_STAGES[2], id: 's1-3', status: StageStatus.Completed, date: '2024-01-05' },
              { ...DEFAULT_STAGES[3], id: 's1-4', status: StageStatus.Pending },
              { ...DEFAULT_STAGES[4], id: 's1-5', status: StageStatus.Pending },
              { ...DEFAULT_STAGES[5], id: 's1-6', status: StageStatus.Pending },
              { ...DEFAULT_STAGES[6], id: 's1-7', status: StageStatus.Pending },
            ],
            tests: [],
            followUps: []
          },
          {
            id: '2024-01-03',
            projectNumber: '24-01-LG-0002',
            testItem: '배터리 전해질 순도 분석 및 불순물 검출',
            quoteDate: '2024-01-03',
            quotedAmount: 85000000,
            statusText: '견적 송부',
            stages: [
              { ...DEFAULT_STAGES[0], id: 's2-1', status: StageStatus.Completed, date: '2024-01-03' },
              { ...DEFAULT_STAGES[1], id: 's2-2', status: StageStatus.Completed, date: '2024-01-04' },
              { ...DEFAULT_STAGES[2], id: 's2-3', status: StageStatus.Completed, date: '2024-01-05' },
              { ...DEFAULT_STAGES[3], id: 's2-4', status: StageStatus.Pending },
              { ...DEFAULT_STAGES[4], id: 's2-5', status: StageStatus.Pending },
              { ...DEFAULT_STAGES[5], id: 's2-6', status: StageStatus.Pending },
              { ...DEFAULT_STAGES[6], id: 's2-7', status: StageStatus.Pending },
            ],
            tests: [],
            followUps: []
          }
        ]
      },
      {
        id: 'req-1-2',
        name: '박민수',
        email: 'mspark@lgchem.com',
        phone: '02-3773-3345',
        department: '소재연구소',
        position: '책임연구원',
        projects: [
          {
            id: '2024-01-04',
            testItem: '양극재 전기화학적 특성 평가',
            quoteDate: '2024-01-04',
            quotedAmount: 120000000,
            statusText: '견적 검토 중',
            stages: [
              { ...DEFAULT_STAGES[0], id: 's3-1', status: StageStatus.Completed, date: '2024-01-04' },
              { ...DEFAULT_STAGES[1], id: 's3-2', status: StageStatus.InProgress, date: '2024-01-05' },
              { ...DEFAULT_STAGES[2], id: 's3-3', status: StageStatus.Pending },
              { ...DEFAULT_STAGES[3], id: 's3-4', status: StageStatus.Pending },
              { ...DEFAULT_STAGES[4], id: 's3-5', status: StageStatus.Pending },
              { ...DEFAULT_STAGES[5], id: 's3-6', status: StageStatus.Pending },
              { ...DEFAULT_STAGES[6], id: 's3-7', status: StageStatus.Pending },
            ],
            tests: [],
            followUps: []
          }
        ]
      }
    ]
  },
  {
    id: 'client-2',
    name: '식품의약품안전처',
    businessNumber: '104-82-07420',
    ceoName: '오유경',
    mainPhone: '043-719-1662',
    website: 'https://www.mfds.go.kr',
    address: '충청북도 청주시 흥덕구 오송읍 오송생명2로 187',
    requesters: [
      {
        id: 'req-2-1',
        name: '배예지',
        email: 'yjbae@korea.kr',
        phone: '043-719-2234',
        department: '의료기기심사부',
        position: '사무관',
        projects: []
      }
    ]
  },
  {
    id: 'client-3',
    name: '인바이오',
    businessNumber: '220-88-12345',
    ceoName: '김택수',
    mainPhone: '02-1234-5678',
    website: 'https://www.invivo.co.kr',
    address: '서울특별시 강남구 테헤란로 123',
    requesters: [
      {
        id: 'req-3-1',
        name: '김은주',
        email: 'ejkim@invivo.co.kr',
        phone: '02-1234-5679',
        department: '연구개발팀',
        position: '팀장',
        projects: []
      }
    ]
  }
];