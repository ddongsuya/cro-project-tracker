import Tesseract from 'tesseract.js';
import type { Test } from '../types';

export interface TestRegistrationInfo {
  testManagementNumber: string; // 시험관리번호 (C-6849)
  projectNumber: string; // 프로젝트번호 (CP25-083)
  materialCode: string; // 물질명 코드 (Pearl-101)
  clientName: string; // 고객사명 (Pearlsinmires Co., Ltd.)
  testNumber: string; // 시험번호 (25-NV-0194)
  testName: string; // 시험명 (튜어물질의 초체물 분석)
  testManager: string; // 시험책임자명 (김지현B)
}

export interface MultipleTestInfo {
  commonInfo: {
    testManagementNumber: string;
    projectNumber: string;
    materialCode: string;
    clientName: string;
  };
  tests: TestRegistrationInfo[];
}

export class OCRService {
  // 이미지에서 텍스트 추출
  static async extractTextFromImage(imageFile: File): Promise<string> {
    try {
      const result = await Tesseract.recognize(imageFile, 'kor+eng', {
        logger: m => console.log(m) // OCR 진행 상황 로그
      });
      
      return result.data.text;
    } catch (error) {
      console.error('OCR 처리 오류:', error);
      throw new Error('이미지에서 텍스트를 추출할 수 없습니다.');
    }
  }

  // 추출된 텍스트에서 다중 시험 정보 파싱 (향상된 버전)
  static parseMultipleTestInfo(text: string): MultipleTestInfo | null {
    try {
      console.log('추출된 텍스트:', text);
      
      // 텍스트 전처리 (불필요한 공백, 특수문자 정리)
      const cleanText = text.replace(/\s+/g, ' ').trim();
      const lines = cleanText.split('\n').filter(line => line.trim() !== '');
      
      // 향상된 공통 정보 추출
      const commonPatterns = {
        testManagementNumber: /C-?\s*\d{4,}/gi,
        projectNumber: /CP\s*\d{2}-?\s*\d{3}/gi,
        materialCode: /Pearl-?\s*\d+|P\s*\d+|[A-Z]+-?\s*\d+/gi,
        clientName: /(Pearlsinmires\s*Co\.,?\s*Ltd\.|[가-힣\s]+(?:주식회사|㈜|회사|그룹|코퍼레이션|Co\.|Ltd\.|Inc\.))/gi
      };

      const commonInfo = {
        testManagementNumber: this.extractFirst(cleanText, commonPatterns.testManagementNumber)?.replace(/\s/g, '') || '',
        projectNumber: this.extractFirst(cleanText, commonPatterns.projectNumber)?.replace(/\s/g, '') || '',
        materialCode: this.extractFirst(cleanText, commonPatterns.materialCode)?.replace(/\s/g, '') || '',
        clientName: this.extractFirst(cleanText, commonPatterns.clientName)?.trim() || ''
      };

      console.log('공통 정보:', commonInfo);

      // 향상된 시험 정보 추출
      const tests: TestRegistrationInfo[] = [];
      
      // 더 포괄적인 시험번호 패턴
      const testNumberPatterns = [
        /\d{2}-[A-Z]{2}-\d{4}[A-Z]?/g, // 25-NV-0194
        /\d{2}-[A-Z]{2}-\d{4}/g,       // 25-RR-0195
        /\d{2}-[A-Z]{3}-\d{4}/g,       // 25-DRF-0196
        /\d{2}-[A-Z]{1,4}-\d{4}[A-Z]?/g // 일반적인 패턴
      ];

      let allTestNumbers: string[] = [];
      testNumberPatterns.forEach(pattern => {
        const matches = cleanText.match(pattern) || [];
        allTestNumbers = [...allTestNumbers, ...matches];
      });

      // 중복 제거
      allTestNumbers = [...new Set(allTestNumbers)];
      console.log('발견된 시험번호들:', allTestNumbers);

      // 향상된 시험명 패턴들
      const enhancedTestNamePatterns = [
        // 기존 패턴들
        /튜어물질의\s*초체물\s*분석/gi,
        /랫드\s*\d+주\s*DRF\s*시험\s*\([^)]+\)/gi,
        /랫드\s*\d+주\s*반복\s*\+\s*\d+주\s*회복\s*\+\s*독성동태\s*\([^)]+\)/gi,
        /랫드\s*Validation/gi,
        /비글\s*단회투여\s*독성시험\s*\([^)]+\)/gi,
        /비글\s*\d+주\s*반복\s*\+\s*\d+주\s*회복\s*\+\s*독성동태\s*\([^)]+\)/gi,
        /비글\s*Validation/gi,
        /기니피그\s*광독성\s*시험/gi,
        
        // 새로운 패턴들 (더 많은 시험 유형 지원)
        /[가-힣\s]*독성\s*시험[^가-힣]*/gi,
        /[가-힣\s]*분석[^가-힣]*/gi,
        /[가-힣\s]*평가[^가-힣]*/gi,
        /[가-힣\s]*검사[^가-힣]*/gi,
        /[가-힣\s]*측정[^가-힣]*/gi,
        /[A-Za-z\s]*Validation[A-Za-z\s]*/gi,
        /[A-Za-z\s]*Test[A-Za-z\s]*/gi,
        /[A-Za-z\s]*Analysis[A-Za-z\s]*/gi
      ];

      // 담당자 패턴 향상
      const enhancedManagerPatterns = [
        /([가-힣]{2,4}[A-Z]?)\s*$/gm,
        /([가-힣]{2,4})\s*[A-Z]?\s*$/gm,
        /담당자?\s*:?\s*([가-힣]{2,4}[A-Z]?)/gi,
        /책임자?\s*:?\s*([가-힣]{2,4}[A-Z]?)/gi
      ];

      // 각 시험번호에 대해 정보 매칭 (향상된 로직)
      allTestNumbers.forEach((testNumber, index) => {
        console.log(`시험 ${index + 1} 처리 중: ${testNumber}`);
        
        // 해당 시험번호가 포함된 라인과 주변 라인들 찾기
        const testLineIndex = lines.findIndex(line => line.includes(testNumber));
        const testLine = lines[testLineIndex];
        const nextLine = lines[testLineIndex + 1];
        const prevLine = lines[testLineIndex - 1];
        
        let testName = '';
        let testManager = '';

        // 시험명 추출 (현재 라인, 이전 라인, 다음 라인에서 검색)
        const searchLines = [testLine, nextLine, prevLine].filter(Boolean);
        
        for (const line of searchLines) {
          if (testName) break;
          
          for (const pattern of enhancedTestNamePatterns) {
            const match = line?.match(pattern);
            if (match && match[0].trim().length > 2) {
              testName = match[0].trim();
              break;
            }
          }
        }

        // 담당자 추출 (향상된 로직)
        for (const line of searchLines) {
          if (testManager) break;
          
          for (const pattern of enhancedManagerPatterns) {
            const matches = line?.match(pattern);
            if (matches) {
              const manager = matches[1] || matches[0];
              if (manager && manager.length >= 2 && manager.length <= 6) {
                testManager = manager.trim();
                break;
              }
            }
          }
        }

        // 시험명이 여전히 없으면 기본값 설정
        if (!testName) {
          testName = `시험 ${testNumber}`;
        }

        // 담당자가 없으면 기본값 설정
        if (!testManager) {
          testManager = '담당자 미지정';
        }

        console.log(`시험 ${index + 1} 결과:`, { testNumber, testName, testManager });

        tests.push({
          testManagementNumber: commonInfo.testManagementNumber,
          projectNumber: commonInfo.projectNumber,
          materialCode: commonInfo.materialCode,
          clientName: commonInfo.clientName,
          testNumber: testNumber,
          testName: testName,
          testManager: testManager
        });
      });

      console.log('최종 추출된 시험들:', tests);

      if (tests.length === 0) {
        return null;
      }

      return { commonInfo, tests };
    } catch (error) {
      console.error('다중 시험 정보 파싱 오류:', error);
      return null;
    }
  }

  // 단일 시험 정보 파싱 (기존 호환성 유지)
  static parseTestRegistrationInfo(text: string): TestRegistrationInfo | null {
    const multipleInfo = this.parseMultipleTestInfo(text);
    return multipleInfo?.tests[0] || null;
  }

  // 정규식에서 첫 번째 매치 추출
  private static extractFirst(text: string, pattern: RegExp): string | null {
    const matches = text.match(pattern);
    return matches?.[0]?.trim() || null;
  }

  // 정규식에서 마지막 매치 추출
  private static extractLast(text: string, pattern: RegExp): string | null {
    const matches = text.match(pattern);
    return matches?.[matches.length - 1]?.trim() || null;
  }

  // 시험 정보를 Test 객체로 변환
  static convertToTestObject(info: TestRegistrationInfo): Omit<Test, 'id'> {
    return {
      projectNumber: info.projectNumber || info.testManagementNumber || 'UNKNOWN',
      testNumber: info.testNumber || 'UNKNOWN',
      testName: info.testName || '시험명 미확인',
      testManager: info.testManager || '담당자 미지정',
      startDate: new Date().toISOString().split('T')[0], // 오늘 날짜
      endDate: this.calculateEndDate(new Date(), 30) // 30일 후 (기본값)
    };
  }

  // 다중 시험 정보를 Test 객체 배열로 변환
  static convertMultipleToTestObjects(multipleInfo: MultipleTestInfo): Omit<Test, 'id'>[] {
    return multipleInfo.tests.map(info => this.convertToTestObject(info));
  }

  // 종료일 계산 (시작일로부터 N일 후)
  private static calculateEndDate(startDate: Date, daysToAdd: number): string {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + daysToAdd);
    return endDate.toISOString().split('T')[0];
  }

  // 이미지 파일 유효성 검사
  static validateImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      throw new Error('지원하지 않는 이미지 형식입니다. (JPG, PNG, GIF, BMP만 지원)');
    }

    if (file.size > maxSize) {
      throw new Error('이미지 파일이 너무 큽니다. (최대 10MB)');
    }

    return true;
  }
}