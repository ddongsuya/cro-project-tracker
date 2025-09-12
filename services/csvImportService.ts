import Papa from 'papaparse';
import type { Client, Project, StageStatus } from '../types';
import { DEFAULT_STAGES } from '../constants';

interface CSVRow {
  [key: string]: string;
}

export class CSVImportService {
  // CSV 파일을 파싱하여 클라이언트 데이터로 변환
  static async importFromCSV(file: File): Promise<Client[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        encoding: 'UTF-8',
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const clients = this.convertCSVToClients(results.data as CSVRow[]);
            resolve(clients);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(new Error(`CSV 파싱 오류: ${error.message}`));
        }
      });
    });
  }

  // Excel 파일을 CSV로 변환 후 처리 (간단한 방법)
  static async importFromExcel(file: File): Promise<Client[]> {
    // Excel 파일을 CSV로 변환하는 간단한 방법
    // 실제로는 xlsx 라이브러리를 사용하는 것이 더 정확하지만,
    // 여기서는 사용자가 Excel에서 CSV로 저장해서 업로드하는 것을 가정
    return this.importFromCSV(file);
  }

  // CSV 데이터를 클라이언트 객체로 변환
  private static convertCSVToClients(csvData: CSVRow[]): Client[] {
    const clientsMap = new Map<string, Client>();

    csvData.forEach((row, index) => {
      try {
        // 실제 엑셀 시트 헤더에 맞춘 필수 필드 검증
        const requiredFields = ['의뢰기관', '견적서 번호', '견적명', '견적 송부 날짜', '견적금액'];
        const missingFields = requiredFields.filter(field => !row[field] || row[field].trim() === '');
        
        if (missingFields.length > 0) {
          console.warn(`행 ${index + 2}: 필수 필드 누락 - ${missingFields.join(', ')}`);
          return;
        }

        // 실제 엑셀 시트 컬럼명에 맞춰 데이터 추출
        const clientName = row['의뢰기관'].trim();
        const projectId = row['견적서 번호'].trim();
        const testItem = row['견적명'].trim();
        const quoteDate = this.parseDate(row['견적 송부 날짜']);
        const quotedAmount = this.parseAmount(row['견적금액']);
        const contractedAmount = row['계약금액'] ? this.parseAmount(row['계약금액']) : undefined;
        const statusText = row['결론'] || '견적 송부';
        const contactPerson = row['의뢰자'] || '담당자';
        const email = row['의뢰자 e-mail'] || `contact@${clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
        const phone = row['의뢰자 연락처'] || '02-0000-0000';
        const testStandard = row['시험기준'] || '';
        const contractNumber = row['계약번호'] || '';
        const purpose = row['제출용도'] || '';
        const materialType = row['물질종류'] || '';
        const manager = row['담당자'] || '';
        const discountRate = row['할인율'] || '';

        // 클라이언트가 이미 존재하는지 확인
        let client = clientsMap.get(clientName);
        if (!client) {
          client = {
            id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: clientName,
            contactPerson,
            email,
            phone,
            projects: []
          };
          clientsMap.set(clientName, client);
        }

        // 프로젝트 생성 (추가 정보 포함)
        const project: Project = {
          id: projectId,
          testItem: `${testItem}${testStandard ? ` (${testStandard})` : ''}${materialType ? ` - ${materialType}` : ''}`,
          quoteDate,
          quotedAmount,
          contractedAmount,
          statusText,
          stages: DEFAULT_STAGES.map((stage, stageIndex) => ({
            ...stage,
            id: `stage-${Date.now()}-${index}-${stageIndex}`,
            status: this.getStageStatus(statusText, stageIndex, contractNumber)
          })),
          tests: [],
          followUps: this.createInitialFollowUps(projectId, quoteDate, statusText, contactPerson)
        };

        // 중복 프로젝트 확인
        const existingProject = client.projects.find(p => p.id === projectId);
        if (!existingProject) {
          client.projects.push(project);
        }

      } catch (error) {
        console.error(`행 ${index + 2} 처리 중 오류:`, error);
      }
    });

    return Array.from(clientsMap.values());
  }

  // 날짜 파싱 (다양한 형식 지원)
  private static parseDate(dateStr: string): string {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    
    // 다양한 날짜 형식 처리
    const cleanDate = dateStr.trim().replace(/[^\d-/.]/g, '');
    
    // YYYY-MM-DD 형식으로 변환
    if (cleanDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return cleanDate;
    }
    
    // YYYY/MM/DD 또는 YYYY.MM.DD 형식
    if (cleanDate.match(/^\d{4}[/.]\d{2}[/.]\d{2}$/)) {
      return cleanDate.replace(/[/.]/g, '-');
    }
    
    // MM/DD/YYYY 형식
    if (cleanDate.match(/^\d{2}[/.]\d{2}[/.]\d{4}$/)) {
      const parts = cleanDate.split(/[/.]/);
      return `${parts[2]}-${parts[0]}-${parts[1]}`;
    }
    
    // 파싱 실패시 현재 날짜 반환
    console.warn(`날짜 파싱 실패: ${dateStr}, 현재 날짜로 대체`);
    return new Date().toISOString().split('T')[0];
  }

  // 금액 파싱 (쉼표, 원화 기호 등 제거)
  private static parseAmount(amountStr: string): number {
    if (!amountStr) return 0;
    
    // 숫자가 아닌 문자 제거 (쉼표, 원, 공백 등)
    const cleanAmount = amountStr.replace(/[^\d]/g, '');
    const amount = parseInt(cleanAmount, 10);
    
    return isNaN(amount) ? 0 : amount;
  }

  // 상태에 따른 단계 상태 결정 (계약번호 고려, 7단계 구조)
  private static getStageStatus(statusText: string, stageIndex: number, contractNumber?: string): StageStatus {
    const status = statusText.toLowerCase();
    const hasContract = contractNumber && contractNumber.trim() !== '';
    
    if (status.includes('보고서') || status.includes('완료') || status.includes('종료')) {
      return StageStatus.Completed; // 모든 단계 완료
    }
    
    if (status.includes('시험완료') || status.includes('분석완료')) {
      return stageIndex <= 5 ? StageStatus.Completed : StageStatus.InProgress; // 시험 접수요청까지 완료, 보고서 발행 진행중
    }
    
    if (status.includes('진행') || status.includes('시험') || status.includes('분석')) {
      return stageIndex <= 4 ? StageStatus.Completed : StageStatus.InProgress; // 계약 체결까지 완료, 시험 접수요청 진행중
    }
    
    if (status.includes('계약') || hasContract) {
      return stageIndex <= 4 ? StageStatus.Completed : StageStatus.Pending; // 계약 체결까지 완료
    }
    
    if (status.includes('견적') || status.includes('송부') || status.includes('발송')) {
      return stageIndex <= 2 ? StageStatus.Completed : StageStatus.Pending; // 견적서 송부까지 완료
    }
    
    if (status.includes('검토') || status.includes('협의')) {
      return stageIndex <= 3 ? StageStatus.Completed : StageStatus.Pending; // 지급 조건 설정까지 완료
    }
    
    // 기본값: 첫 3단계는 완료, 나머지는 대기
    return stageIndex <= 2 ? StageStatus.Completed : StageStatus.Pending;
  }

  // 초기 Follow-up 기록 생성
  private static createInitialFollowUps(projectId: string, quoteDate: string, statusText: string, contactPerson: string) {
    const followUps = [];
    
    // 견적 송부 Follow-up 자동 생성
    followUps.push({
      id: `followup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: quoteDate,
      method: '이메일' as const,
      contactPerson: contactPerson,
      content: `견적서 ${projectId} 발송 완료`,
      result: '응답대기' as const,
      nextAction: '고객 검토 후 연락 예정',
      nextActionDate: this.addDays(quoteDate, 7)
    });

    return followUps;
  }

  // 날짜에 일수 추가
  private static addDays(dateStr: string, days: number): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  // CSV 템플릿 다운로드 (실제 엑셀 시트 형식)
  static downloadTemplate(): void {
    const template = [
      ['견적 송부 날짜', '견적서 번호', '계약번호', '시험기준', '견적명', '의뢰기관', '의뢰자', '의뢰자 연락처', '의뢰자 e-mail', '제출용도', '물질종류', '담당자', '견적금액', '할인율', '계약금액', '결론'],
      ['2024-01-15', 'Q-2024-001', 'C-2024-001', 'UN38.3', '리튬이온 배터리 안전성 평가', '(주)엘지화학', '김영수', '02-3773-1234', 'kim@lgchem.com', '인증용', '배터리', '박철수', '50000000', '4%', '48000000', '시험 진행 중'],
      ['2024-01-20', 'Q-2024-002', '', 'KS C IEC 62133', '전기차 배터리 모듈 시험', '삼성SDI', '박민준', '031-8006-3456', 'park@samsungsdi.com', '품질검증', '배터리 모듈', '이영희', '75000000', '', '', '견적 검토 중'],
      ['2024-01-25', 'Q-2024-003', 'C-2024-002', 'ASTM D445', '윤활유 품질 분석', 'SK이노베이션', '정수현', '02-2121-5678', 'jung@sk.com', '품질관리', '윤활유', '김현우', '35000000', '5%', '33250000', '시험 완료']
    ];

    const csvContent = template.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    // UTF-8 BOM 추가 (Excel에서 한글 깨짐 방지)
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'CRO_프로젝트_템플릿.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}