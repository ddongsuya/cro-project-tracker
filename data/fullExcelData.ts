import { Client, StageStatus } from '../types';
import { DEFAULT_STAGES } from '../constants';

// 첨부파일 엑셀 시트의 모든 데이터를 완전히 반영한 목업데이터
export const FULL_EXCEL_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: '(주)엘지화학',
    contactPerson: '김영수 과장',
    email: 'youngsoo.kim@lgchem.com',
    phone: '02-3773-1234',
    projects: [
      {
        id: '2024-01-02',
        testItem: '리튬이온 배터리 안전성 평가 (UN38.3)',
        quoteDate: '2024-01-02',
        quotedAmount: 85000000,
        contractedAmount: 82000000,
        statusText: '시험 진행 중',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's1-1', status: StageStatus.Completed, date: '2024-01-02' },
          { ...DEFAULT_STAGES[1], id: 's1-2', status: StageStatus.Completed, date: '2024-01-03' },
          { ...DEFAULT_STAGES[2], id: 's1-3', status: StageStatus.Completed, date: '2024-01-05' },
          { ...DEFAULT_STAGES[3], id: 's1-4', status: StageStatus.Completed, date: '2024-01-10' },
          { ...DEFAULT_STAGES[4], id: 's1-5', status: StageStatus.Completed, date: '2024-01-15' },
          { ...DEFAULT_STAGES[5], id: 's1-6', status: StageStatus.InProgress, date: '2024-01-20' },
        ],
        tests: [
          { id: 't1-1', projectNumber: 'PN-LG-24-001', testNumber: 'TN-BAT-001', testManager: '박철수', startDate: '2024-01-25', endDate: '2024-03-10'},
        ],
        followUps: [
          {
            id: 'fu-1',
            date: '2024-01-05',
            method: '전화',
            contactPerson: '김영수 과장',
            content: '견적서 검토 현황 문의 및 추가 설명 제공',
            result: '긍정적',
            nextAction: '기술팀 검토 후 재연락',
            nextActionDate: '2024-01-08'
          }
        ]
      },
      {
        id: '2024-01-03',
        testItem: '배터리 전해질 순도 분석',
        quoteDate: '2024-01-03',
        quotedAmount: 45000000,
        statusText: '견적 검토 중',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's2-1', status: StageStatus.Completed, date: '2024-01-03' },
          { ...DEFAULT_STAGES[1], id: 's2-2', status: StageStatus.Completed, date: '2024-01-04' },
          { ...DEFAULT_STAGES[2], id: 's2-3', status: StageStatus.Completed, date: '2024-01-05' },
          { ...DEFAULT_STAGES[3], id: 's2-4', status: StageStatus.InProgress, date: '2024-01-08' },
          { ...DEFAULT_STAGES[4], id: 's2-5', status: StageStatus.Pending },
          { ...DEFAULT_STAGES[5], id: 's2-6', status: StageStatus.Pending },
        ],
        tests: [],
        followUps: [
          {
            id: 'fu-2',
            date: '2024-01-08',
            method: '이메일',
            contactPerson: '김영수 과장',
            content: '견적서 검토 현황 확인 및 추가 질문 답변',
            result: '추가정보요청',
            nextAction: '상세 분석 방법 자료 발송',
            nextActionDate: '2024-01-12'
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
        id: '2024-01-04',
        testItem: '전기차 배터리 모듈 열충격 시험',
        quoteDate: '2024-01-04',
        quotedAmount: 120000000,
        contractedAmount: 115000000,
        statusText: '시험 완료',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's3-1', status: StageStatus.Completed, date: '2024-01-04' },
          { ...DEFAULT_STAGES[1], id: 's3-2', status: StageStatus.Completed, date: '2024-01-05' },
          { ...DEFAULT_STAGES[2], id: 's3-3', status: StageStatus.Completed, date: '2024-01-08' },
          { ...DEFAULT_STAGES[3], id: 's3-4', status: StageStatus.Completed, date: '2024-01-12' },
          { ...DEFAULT_STAGES[4], id: 's3-5', status: StageStatus.Completed, date: '2024-01-18' },
          { ...DEFAULT_STAGES[5], id: 's3-6', status: StageStatus.Completed, date: '2024-01-25' },
        ],
        tests: [
          { id: 't3-1', projectNumber: 'PN-SDI-24-001', testNumber: 'TN-HEAT-001', testManager: '이영희', startDate: '2024-02-01', endDate: '2024-04-15'},
        ],
        followUps: [
          {
            id: 'fu-3',
            date: '2024-01-10',
            method: '방문',
            contactPerson: '박민준 차장',
            content: '직접 방문하여 견적 내용 설명 및 시험 방법론 논의',
            result: '계약진행',
            nextAction: '계약서 작성',
            nextActionDate: '2024-01-15'
          }
        ]
      },
      {
        id: '2024-01-05',
        testItem: '배터리팩 진동 내구성 시험',
        quoteDate: '2024-01-05',
        quotedAmount: 95000000,
        statusText: '견적 송부 완료',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's4-1', status: StageStatus.Completed, date: '2024-01-05' },
          { ...DEFAULT_STAGES[1], id: 's4-2', status: StageStatus.Completed, date: '2024-01-06' },
          { ...DEFAULT_STAGES[2], id: 's4-3', status: StageStatus.Completed, date: '2024-01-08' },
          { ...DEFAULT_STAGES[3], id: 's4-4', status: StageStatus.Pending },
          { ...DEFAULT_STAGES[4], id: 's4-5', status: StageStatus.Pending },
          { ...DEFAULT_STAGES[5], id: 's4-6', status: StageStatus.Pending },
        ],
        tests: [],
        followUps: [
          {
            id: 'fu-4',
            date: '2024-01-10',
            method: '전화',
            contactPerson: '박민준 차장',
            content: '견적서 검토 현황 확인',
            result: '응답대기',
            nextAction: '재연락 예정',
            nextActionDate: '2024-01-15'
          }
        ]
      },
      {
        id: '2024-01-08',
        testItem: '리튬이온 배터리 용량 측정',
        quoteDate: '2024-01-08',
        quotedAmount: 65000000,
        contractedAmount: 62000000,
        statusText: '시험 진행 중',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's5-1', status: StageStatus.Completed, date: '2024-01-08' },
          { ...DEFAULT_STAGES[1], id: 's5-2', status: StageStatus.Completed, date: '2024-01-09' },
          { ...DEFAULT_STAGES[2], id: 's5-3', status: StageStatus.Completed, date: '2024-01-12' },
          { ...DEFAULT_STAGES[3], id: 's5-4', status: StageStatus.Completed, date: '2024-01-16' },
          { ...DEFAULT_STAGES[4], id: 's5-5', status: StageStatus.Completed, date: '2024-01-22' },
          { ...DEFAULT_STAGES[5], id: 's5-6', status: StageStatus.InProgress, date: '2024-01-28' },
        ],
        tests: [
          { id: 't5-1', projectNumber: 'PN-SDI-24-002', testNumber: 'TN-CAP-001', testManager: '김소영', startDate: '2024-02-05', endDate: '2024-03-20'},
        ],
        followUps: []
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
        id: '2024-01-09',
        testItem: '윤활유 점도 및 산화 안정성 시험',
        quoteDate: '2024-01-09',
        quotedAmount: 52000000,
        contractedAmount: 50000000,
        statusText: '시험 완료',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's6-1', status: StageStatus.Completed, date: '2024-01-09' },
          { ...DEFAULT_STAGES[1], id: 's6-2', status: StageStatus.Completed, date: '2024-01-10' },
          { ...DEFAULT_STAGES[2], id: 's6-3', status: StageStatus.Completed, date: '2024-01-12' },
          { ...DEFAULT_STAGES[3], id: 's6-4', status: StageStatus.Completed, date: '2024-01-16' },
          { ...DEFAULT_STAGES[4], id: 's6-5', status: StageStatus.Completed, date: '2024-01-22' },
          { ...DEFAULT_STAGES[5], id: 's6-6', status: StageStatus.Completed, date: '2024-01-28' },
        ],
        tests: [
          { id: 't6-1', projectNumber: 'PN-SK-24-001', testNumber: 'TN-LUB-001', testManager: '김현우', startDate: '2024-02-01', endDate: '2024-03-15'},
        ],
        followUps: [
          {
            id: 'fu-6',
            date: '2024-01-14',
            method: '이메일',
            contactPerson: '정수현 팀장',
            content: '견적서 검토 완료 및 계약 진행 의사 확인',
            result: '계약진행',
            nextAction: '계약서 검토',
            nextActionDate: '2024-01-18'
          }
        ]
      },
      {
        id: '2024-01-10',
        testItem: '연료첨가제 성능 평가',
        quoteDate: '2024-01-10',
        quotedAmount: 38000000,
        statusText: '견적 검토 중',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's7-1', status: StageStatus.Completed, date: '2024-01-10' },
          { ...DEFAULT_STAGES[1], id: 's7-2', status: StageStatus.Completed, date: '2024-01-11' },
          { ...DEFAULT_STAGES[2], id: 's7-3', status: StageStatus.Completed, date: '2024-01-12' },
          { ...DEFAULT_STAGES[3], id: 's7-4', status: StageStatus.InProgress, date: '2024-01-15' },
          { ...DEFAULT_STAGES[4], id: 's7-5', status: StageStatus.Pending },
          { ...DEFAULT_STAGES[5], id: 's7-6', status: StageStatus.Pending },
        ],
        tests: [],
        followUps: [
          {
            id: 'fu-7',
            date: '2024-01-16',
            method: '전화',
            contactPerson: '정수현 팀장',
            content: '견적서 검토 현황 문의',
            result: '추가정보요청',
            nextAction: '상세 자료 발송',
            nextActionDate: '2024-01-20'
          }
        ]
      },
      {
        id: '2024-01-11',
        testItem: '석유화학 제품 품질 분석',
        quoteDate: '2024-01-11',
        quotedAmount: 42000000,
        contractedAmount: 40000000,
        statusText: '시험 진행 중',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's8-1', status: StageStatus.Completed, date: '2024-01-11' },
          { ...DEFAULT_STAGES[1], id: 's8-2', status: StageStatus.Completed, date: '2024-01-12' },
          { ...DEFAULT_STAGES[2], id: 's8-3', status: StageStatus.Completed, date: '2024-01-15' },
          { ...DEFAULT_STAGES[3], id: 's8-4', status: StageStatus.Completed, date: '2024-01-18' },
          { ...DEFAULT_STAGES[4], id: 's8-5', status: StageStatus.Completed, date: '2024-01-25' },
          { ...DEFAULT_STAGES[5], id: 's8-6', status: StageStatus.InProgress, date: '2024-02-01' },
        ],
        tests: [
          { id: 't8-1', projectNumber: 'PN-SK-24-002', testNumber: 'TN-PETRO-001', testManager: '박지영', startDate: '2024-02-05', endDate: '2024-03-20'},
        ],
        followUps: []
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
        id: '2024-01-12',
        testItem: '자동차 부품 내구성 시험 (진동/충격)',
        quoteDate: '2024-01-12',
        quotedAmount: 88000000,
        contractedAmount: 85000000,
        statusText: '시험 완료',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's9-1', status: StageStatus.Completed, date: '2024-01-12' },
          { ...DEFAULT_STAGES[1], id: 's9-2', status: StageStatus.Completed, date: '2024-01-13' },
          { ...DEFAULT_STAGES[2], id: 's9-3', status: StageStatus.Completed, date: '2024-01-15' },
          { ...DEFAULT_STAGES[3], id: 's9-4', status: StageStatus.Completed, date: '2024-01-20' },
          { ...DEFAULT_STAGES[4], id: 's9-5', status: StageStatus.Completed, date: '2024-01-26' },
          { ...DEFAULT_STAGES[5], id: 's9-6', status: StageStatus.Completed, date: '2024-02-02' },
        ],
        tests: [
          { id: 't9-1', projectNumber: 'PN-HM-24-001', testNumber: 'TN-DUR-001', testManager: '최민수', startDate: '2024-02-08', endDate: '2024-04-25'},
        ],
        followUps: [
          {
            id: 'fu-9',
            date: '2024-01-17',
            method: '방문',
            contactPerson: '이준호 부장',
            content: '직접 방문하여 견적 내용 설명 및 계약 조건 협의',
            result: '계약진행',
            nextAction: '계약서 작성',
            nextActionDate: '2024-01-22'
          }
        ]
      },
      {
        id: '2024-01-15',
        testItem: '브레이크 패드 마찰 성능 시험',
        quoteDate: '2024-01-15',
        quotedAmount: 72000000,
        statusText: '견적 송부 완료',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's10-1', status: StageStatus.Completed, date: '2024-01-15' },
          { ...DEFAULT_STAGES[1], id: 's10-2', status: StageStatus.Completed, date: '2024-01-16' },
          { ...DEFAULT_STAGES[2], id: 's10-3', status: StageStatus.Completed, date: '2024-01-18' },
          { ...DEFAULT_STAGES[3], id: 's10-4', status: StageStatus.Pending },
          { ...DEFAULT_STAGES[4], id: 's10-5', status: StageStatus.Pending },
          { ...DEFAULT_STAGES[5], id: 's10-6', status: StageStatus.Pending },
        ],
        tests: [],
        followUps: [
          {
            id: 'fu-10',
            date: '2024-01-20',
            method: '전화',
            contactPerson: '이준호 부장',
            content: '견적서 검토 현황 문의',
            result: '응답대기',
            nextAction: '재연락 예정',
            nextActionDate: '2024-01-25'
          }
        ]
      },
      {
        id: '2024-01-16',
        testItem: '에어백 전개 성능 시험',
        quoteDate: '2024-01-16',
        quotedAmount: 95000000,
        contractedAmount: 92000000,
        statusText: '시험 진행 중',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's11-1', status: StageStatus.Completed, date: '2024-01-16' },
          { ...DEFAULT_STAGES[1], id: 's11-2', status: StageStatus.Completed, date: '2024-01-17' },
          { ...DEFAULT_STAGES[2], id: 's11-3', status: StageStatus.Completed, date: '2024-01-19' },
          { ...DEFAULT_STAGES[3], id: 's11-4', status: StageStatus.Completed, date: '2024-01-24' },
          { ...DEFAULT_STAGES[4], id: 's11-5', status: StageStatus.Completed, date: '2024-01-30' },
          { ...DEFAULT_STAGES[5], id: 's11-6', status: StageStatus.InProgress, date: '2024-02-05' },
        ],
        tests: [
          { id: 't11-1', projectNumber: 'PN-HM-24-002', testNumber: 'TN-AIR-001', testManager: '김소영', startDate: '2024-02-10', endDate: '2024-04-30'},
        ],
        followUps: []
      }
    ]
  },
  {
    id: 'client-5',
    name: '포스코케미칼',
    contactPerson: '김태현 과장',
    email: 'taehyun.kim@poscochemical.com',
    phone: '054-220-1234',
    projects: [
      {
        id: '2024-01-17',
        testItem: '리튬 화합물 순도 분석',
        quoteDate: '2024-01-17',
        quotedAmount: 35000000,
        contractedAmount: 33000000,
        statusText: '시험 완료',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's12-1', status: StageStatus.Completed, date: '2024-01-17' },
          { ...DEFAULT_STAGES[1], id: 's12-2', status: StageStatus.Completed, date: '2024-01-18' },
          { ...DEFAULT_STAGES[2], id: 's12-3', status: StageStatus.Completed, date: '2024-01-20' },
          { ...DEFAULT_STAGES[3], id: 's12-4', status: StageStatus.Completed, date: '2024-01-24' },
          { ...DEFAULT_STAGES[4], id: 's12-5', status: StageStatus.Completed, date: '2024-01-30' },
          { ...DEFAULT_STAGES[5], id: 's12-6', status: StageStatus.Completed, date: '2024-02-05' },
        ],
        tests: [
          { id: 't12-1', projectNumber: 'PN-PC-24-001', testNumber: 'TN-LI-001', testManager: '이상훈', startDate: '2024-02-10', endDate: '2024-03-25'},
        ],
        followUps: [
          {
            id: 'fu-12',
            date: '2024-01-22',
            method: '이메일',
            contactPerson: '김태현 과장',
            content: '견적서 검토 완료 및 계약 조건 협의',
            result: '계약진행',
            nextAction: '계약서 검토',
            nextActionDate: '2024-01-26'
          }
        ]
      },
      {
        id: '2024-01-18',
        testItem: '양극재 전기화학적 특성 평가',
        quoteDate: '2024-01-18',
        quotedAmount: 68000000,
        statusText: '견적 검토 중',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's13-1', status: StageStatus.Completed, date: '2024-01-18' },
          { ...DEFAULT_STAGES[1], id: 's13-2', status: StageStatus.Completed, date: '2024-01-19' },
          { ...DEFAULT_STAGES[2], id: 's13-3', status: StageStatus.Completed, date: '2024-01-22' },
          { ...DEFAULT_STAGES[3], id: 's13-4', status: StageStatus.InProgress, date: '2024-01-25' },
          { ...DEFAULT_STAGES[4], id: 's13-5', status: StageStatus.Pending },
          { ...DEFAULT_STAGES[5], id: 's13-6', status: StageStatus.Pending },
        ],
        tests: [],
        followUps: [
          {
            id: 'fu-13',
            date: '2024-01-26',
            method: '전화',
            contactPerson: '김태현 과장',
            content: '견적서 검토 현황 확인 및 기술적 질문 답변',
            result: '추가정보요청',
            nextAction: '상세 분석 방법 자료 발송',
            nextActionDate: '2024-01-30'
          }
        ]
      },
      {
        id: '2024-01-19',
        testItem: '음극재 입자 크기 분석',
        quoteDate: '2024-01-19',
        quotedAmount: 28000000,
        contractedAmount: 26000000,
        statusText: '시험 진행 중',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's14-1', status: StageStatus.Completed, date: '2024-01-19' },
          { ...DEFAULT_STAGES[1], id: 's14-2', status: StageStatus.Completed, date: '2024-01-20' },
          { ...DEFAULT_STAGES[2], id: 's14-3', status: StageStatus.Completed, date: '2024-01-22' },
          { ...DEFAULT_STAGES[3], id: 's14-4', status: StageStatus.Completed, date: '2024-01-26' },
          { ...DEFAULT_STAGES[4], id: 's14-5', status: StageStatus.Completed, date: '2024-02-01' },
          { ...DEFAULT_STAGES[5], id: 's14-6', status: StageStatus.InProgress, date: '2024-02-08' },
        ],
        tests: [
          { id: 't14-1', projectNumber: 'PN-PC-24-002', testNumber: 'TN-ANODE-001', testManager: '조성민', startDate: '2024-02-12', endDate: '2024-03-28'},
        ],
        followUps: []
      }
    ]
  },
  {
    id: 'client-6',
    name: 'LG에너지솔루션',
    contactPerson: '박성민 차장',
    email: 'sungmin.park@lgensol.com',
    phone: '02-3773-5678',
    projects: [
      {
        id: '2024-01-22',
        testItem: '배터리 셀 안전성 시험 (과충전/과방전)',
        quoteDate: '2024-01-22',
        quotedAmount: 125000000,
        contractedAmount: 120000000,
        statusText: '시험 진행 중',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's15-1', status: StageStatus.Completed, date: '2024-01-22' },
          { ...DEFAULT_STAGES[1], id: 's15-2', status: StageStatus.Completed, date: '2024-01-23' },
          { ...DEFAULT_STAGES[2], id: 's15-3', status: StageStatus.Completed, date: '2024-01-25' },
          { ...DEFAULT_STAGES[3], id: 's15-4', status: StageStatus.Completed, date: '2024-01-30' },
          { ...DEFAULT_STAGES[4], id: 's15-5', status: StageStatus.Completed, date: '2024-02-05' },
          { ...DEFAULT_STAGES[5], id: 's15-6', status: StageStatus.InProgress, date: '2024-02-12' },
        ],
        tests: [
          { id: 't15-1', projectNumber: 'PN-LGES-24-001', testNumber: 'TN-SAFE-001', testManager: '정민호', startDate: '2024-02-18', endDate: '2024-05-05'},
          { id: 't15-2', projectNumber: 'PN-LGES-24-001', testNumber: 'TN-SAFE-002', testManager: '김은지', startDate: '2024-03-01', endDate: '2024-05-20'},
        ],
        followUps: [
          {
            id: 'fu-15',
            date: '2024-01-28',
            method: '방문',
            contactPerson: '박성민 차장',
            content: '직접 방문하여 안전성 시험 방법론 상세 설명 및 일정 협의',
            result: '계약진행',
            nextAction: '계약서 작성',
            nextActionDate: '2024-02-02'
          }
        ]
      },
      {
        id: '2024-01-23',
        testItem: '전고체 배터리 이온 전도도 측정',
        quoteDate: '2024-01-23',
        quotedAmount: 95000000,
        statusText: '견적 송부 완료',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's16-1', status: StageStatus.Completed, date: '2024-01-23' },
          { ...DEFAULT_STAGES[1], id: 's16-2', status: StageStatus.Completed, date: '2024-01-24' },
          { ...DEFAULT_STAGES[2], id: 's16-3', status: StageStatus.Completed, date: '2024-01-26' },
          { ...DEFAULT_STAGES[3], id: 's16-4', status: StageStatus.Pending },
          { ...DEFAULT_STAGES[4], id: 's16-5', status: StageStatus.Pending },
          { ...DEFAULT_STAGES[5], id: 's16-6', status: StageStatus.Pending },
        ],
        tests: [],
        followUps: [
          {
            id: 'fu-16',
            date: '2024-01-30',
            method: '전화',
            contactPerson: '박성민 차장',
            content: '견적서 검토 현황 문의 및 전고체 배터리 시험 경험 공유',
            result: '응답대기',
            nextAction: '기술팀 검토 후 재연락',
            nextActionDate: '2024-02-05'
          }
        ]
      }
    ]
  },
  {
    id: 'client-7',
    name: '한화솔루션',
    contactPerson: '최영준 팀장',
    email: 'youngjun.choi@hanwha.com',
    phone: '02-729-1234',
    projects: [
      {
        id: '2024-01-24',
        testItem: '태양광 모듈 내구성 시험 (UV/습도)',
        quoteDate: '2024-01-24',
        quotedAmount: 78000000,
        contractedAmount: 75000000,
        statusText: '시험 진행 중',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's17-1', status: StageStatus.Completed, date: '2024-01-24' },
          { ...DEFAULT_STAGES[1], id: 's17-2', status: StageStatus.Completed, date: '2024-01-25' },
          { ...DEFAULT_STAGES[2], id: 's17-3', status: StageStatus.Completed, date: '2024-01-27' },
          { ...DEFAULT_STAGES[3], id: 's17-4', status: StageStatus.Completed, date: '2024-02-01' },
          { ...DEFAULT_STAGES[4], id: 's17-5', status: StageStatus.Completed, date: '2024-02-07' },
          { ...DEFAULT_STAGES[5], id: 's17-6', status: StageStatus.InProgress, date: '2024-02-14' },
        ],
        tests: [
          { id: 't17-1', projectNumber: 'PN-HW-24-001', testNumber: 'TN-SOLAR-001', testManager: '윤서현', startDate: '2024-02-20', endDate: '2024-05-10'},
        ],
        followUps: [
          {
            id: 'fu-17',
            date: '2024-01-30',
            method: '이메일',
            contactPerson: '최영준 팀장',
            content: '견적서 검토 완료 및 시험 일정 확정',
            result: '계약진행',
            nextAction: '계약서 검토',
            nextActionDate: '2024-02-05'
          }
        ]
      }
    ]
  },
  {
    id: 'client-8',
    name: '롯데케미칼',
    contactPerson: '이동현 부장',
    email: 'donghyun.lee@lotte.co.kr',
    phone: '02-829-5678',
    projects: [
      {
        id: '2024-01-25',
        testItem: '플라스틱 첨가제 열안정성 평가',
        quoteDate: '2024-01-25',
        quotedAmount: 46000000,
        statusText: '견적 검토 중',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's18-1', status: StageStatus.Completed, date: '2024-01-25' },
          { ...DEFAULT_STAGES[1], id: 's18-2', status: StageStatus.Completed, date: '2024-01-26' },
          { ...DEFAULT_STAGES[2], id: 's18-3', status: StageStatus.Completed, date: '2024-01-29' },
          { ...DEFAULT_STAGES[3], id: 's18-4', status: StageStatus.InProgress, date: '2024-02-01' },
          { ...DEFAULT_STAGES[4], id: 's18-5', status: StageStatus.Pending },
          { ...DEFAULT_STAGES[5], id: 's18-6', status: StageStatus.Pending },
        ],
        tests: [],
        followUps: [
          {
            id: 'fu-18',
            date: '2024-02-02',
            method: '전화',
            contactPerson: '이동현 부장',
            content: '견적서 검토 현황 확인 및 시험 방법 추가 설명',
            result: '추가정보요청',
            nextAction: '상세 시험 절차서 발송',
            nextActionDate: '2024-02-06'
          }
        ]
      }
    ]
  },
  {
    id: 'client-9',
    name: '두산에너빌리티',
    contactPerson: '김민석 과장',
    email: 'minseok.kim@doosan.com',
    phone: '031-5179-1234',
    projects: [
      {
        id: '2024-01-26',
        testItem: '연료전지 스택 성능 평가',
        quoteDate: '2024-01-26',
        quotedAmount: 145000000,
        statusText: '견적 송부 완료',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's19-1', status: StageStatus.Completed, date: '2024-01-26' },
          { ...DEFAULT_STAGES[1], id: 's19-2', status: StageStatus.Completed, date: '2024-01-27' },
          { ...DEFAULT_STAGES[2], id: 's19-3', status: StageStatus.Completed, date: '2024-01-29' },
          { ...DEFAULT_STAGES[3], id: 's19-4', status: StageStatus.Pending },
          { ...DEFAULT_STAGES[4], id: 's19-5', status: StageStatus.Pending },
          { ...DEFAULT_STAGES[5], id: 's19-6', status: StageStatus.Pending },
        ],
        tests: [],
        followUps: [
          {
            id: 'fu-19',
            date: '2024-02-01',
            method: '이메일',
            contactPerson: '김민석 과장',
            content: '견적서 검토 현황 문의 및 연료전지 시험 경험 공유',
            result: '응답대기',
            nextAction: '전화 Follow-up',
            nextActionDate: '2024-02-08'
          }
        ]
      }
    ]
  },
  {
    id: 'client-10',
    name: '효성첨단소재',
    contactPerson: '박지훈 차장',
    email: 'jihoon.park@hyosung.com',
    phone: '031-8059-1234',
    projects: [
      {
        id: '2024-01-29',
        testItem: '탄소섬유 인장강도 시험',
        quoteDate: '2024-01-29',
        quotedAmount: 58000000,
        contractedAmount: 55000000,
        statusText: '시험 완료',
        stages: [
          { ...DEFAULT_STAGES[0], id: 's20-1', status: StageStatus.Completed, date: '2024-01-29' },
          { ...DEFAULT_STAGES[1], id: 's20-2', status: StageStatus.Completed, date: '2024-01-30' },
          { ...DEFAULT_STAGES[2], id: 's20-3', status: StageStatus.Completed, date: '2024-02-01' },
          { ...DEFAULT_STAGES[3], id: 's20-4', status: StageStatus.Completed, date: '2024-02-05' },
          { ...DEFAULT_STAGES[4], id: 's20-5', status: StageStatus.Completed, date: '2024-02-12' },
          { ...DEFAULT_STAGES[5], id: 's20-6', status: StageStatus.Completed, date: '2024-02-18' },
        ],
        tests: [
          { id: 't20-1', projectNumber: 'PN-HS-24-001', testNumber: 'TN-CF-001', testManager: '조성민', startDate: '2024-02-25', endDate: '2024-04-10'},
        ],
        followUps: [
          {
            id: 'fu-20',
            date: '2024-02-03',
            method: '방문',
            contactPerson: '박지훈 차장',
            content: '직접 방문하여 탄소섬유 시험 방법론 설명 및 계약 조건 협의',
            result: '계약진행',
            nextAction: '계약서 작성',
            nextActionDate: '2024-02-08'
          }
        ]
      }
    ]
  }
];

// 기존 MOCK_CLIENTS를 완전한 엑셀 데이터로 교체
export const MOCK_CLIENTS = FULL_EXCEL_CLIENTS;