import type { Client } from '../types';

export class StorageService {
  private static readonly STORAGE_KEY = 'cro-project-tracker-data';
  private static readonly BACKUP_KEY = 'cro-project-tracker-backup';

  // 데이터 저장
  static saveData(clients: Client[]): void {
    try {
      const dataToSave = {
        clients,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToSave));
      
      // 백업도 함께 저장
      const backups = this.getBackups();
      backups.unshift(dataToSave);
      
      // 최대 5개 백업만 유지
      if (backups.length > 5) {
        backups.splice(5);
      }
      
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backups));
      
      console.log('데이터가 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('데이터 저장 실패:', error);
    }
  }

  // 데이터 불러오기
  static loadData(): Client[] | null {
    try {
      const savedData = localStorage.getItem(this.STORAGE_KEY);
      if (!savedData) return null;

      const parsed = JSON.parse(savedData);
      return parsed.clients || null;
    } catch (error) {
      console.error('데이터 불러오기 실패:', error);
      return null;
    }
  }

  // 백업 목록 가져오기
  static getBackups(): any[] {
    try {
      const backups = localStorage.getItem(this.BACKUP_KEY);
      return backups ? JSON.parse(backups) : [];
    } catch (error) {
      console.error('백업 목록 불러오기 실패:', error);
      return [];
    }
  }

  // 특정 백업으로 복원
  static restoreFromBackup(backupIndex: number): Client[] | null {
    try {
      const backups = this.getBackups();
      if (backupIndex >= 0 && backupIndex < backups.length) {
        return backups[backupIndex].clients;
      }
      return null;
    } catch (error) {
      console.error('백업 복원 실패:', error);
      return null;
    }
  }

  // 데이터 내보내기 (JSON)
  static exportData(clients: Client[]): void {
    try {
      const dataToExport = {
        clients,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cro-project-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('데이터 내보내기 실패:', error);
    }
  }

  // 데이터 가져오기 (JSON)
  static importData(file: File): Promise<Client[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          
          if (parsed.clients && Array.isArray(parsed.clients)) {
            resolve(parsed.clients);
          } else {
            reject(new Error('올바르지 않은 파일 형식입니다.'));
          }
        } catch (error) {
          reject(new Error('파일을 읽을 수 없습니다.'));
        }
      };
      
      reader.onerror = () => reject(new Error('파일 읽기 실패'));
      reader.readAsText(file);
    });
  }

  // Excel 내보내기를 위한 CSV 생성
  static exportToCSV(clients: Client[]): void {
    try {
      let csvContent = 'BOM\uFEFF'; // UTF-8 BOM for Excel
      
      // 헤더
      csvContent += '고객사명,담당자,이메일,전화번호,프로젝트ID,시험항목,견적일,견적금액,계약금액,상태,진행률\n';
      
      // 데이터
      clients.forEach(client => {
        const allProjects = client.requesters.flatMap(r => r.projects);
        allProjects.forEach(project => {
          const completedStages = project.stages.filter(s => s.status === '완료').length;
          const progressRate = ((completedStages / project.stages.length) * 100).toFixed(1);
          
          const row = [
            client.name,
            client.contactPerson,
            client.email,
            client.phone,
            project.id,
            project.testItem,
            project.quoteDate,
            project.quotedAmount.toLocaleString(),
            project.contractedAmount?.toLocaleString() || '미정',
            project.statusText,
            `${progressRate}%`
          ].map(field => `"${field}"`).join(',');
          
          csvContent += row + '\n';
        });
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cro-project-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('CSV 내보내기 실패:', error);
    }
  }
}