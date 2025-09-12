import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  onSnapshot, 
  collection, 
  query, 
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import type { Client } from '../types';

// Firebase 설정
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  team: 'business_dev_1' | 'business_dev_2' | 'management';
  position?: string;
  lastActive: Timestamp;
}

export interface DataSnapshot {
  id: string;
  data: Client[];
  lastModified: Timestamp;
  modifiedBy: string;
  version: number;
}

export class FirebaseService {
  private static instance: FirebaseService;
  private currentUser: User | null = null;
  private dataListeners: Array<() => void> = [];

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  // 사용자 인증
  async signIn(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    this.currentUser = userCredential.user;
    return userCredential.user;
  }

  async signUp(email: string, password: string, name: string, team: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    this.currentUser = userCredential.user;
    
    // 사용자 프로필 저장
    await this.saveUserProfile(userCredential.user.uid, {
      id: userCredential.user.uid,
      email,
      name,
      role: 'editor', // 기본 권한
      team: team as 'business_dev_1' | 'business_dev_2' | 'management',
      lastActive: serverTimestamp() as Timestamp
    });
    
    return userCredential.user;
  }

  async signOut(): Promise<void> {
    await signOut(auth);
    this.currentUser = null;
    this.clearListeners();
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      callback(user);
    });
  }

  // 개인 데이터 관리
  async saveData(clients: Client[]): Promise<void> {
    if (!this.currentUser) throw new Error('사용자가 로그인되지 않았습니다.');

    const dataSnapshot: Omit<DataSnapshot, 'id'> = {
      data: clients,
      lastModified: serverTimestamp() as Timestamp,
      modifiedBy: this.currentUser.email || this.currentUser.uid,
      version: Date.now()
    };

    // 개인 데이터 저장 (사용자별 분리)
    await setDoc(doc(db, 'users', this.currentUser.uid, 'data', 'projects'), dataSnapshot);
    
    // 활동 로그 저장
    await this.logActivity('data_updated', `데이터가 업데이트되었습니다 (${clients.length}개 고객사)`);
  }

  // 개인 데이터 로드
  async loadData(): Promise<Client[] | null> {
    if (!this.currentUser) return null;
    
    try {
      const docRef = doc(db, 'users', this.currentUser.uid, 'data', 'projects');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as DataSnapshot;
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('개인 데이터 로드 실패:', error);
      return null;
    }
  }

  // 개인 데이터 실시간 동기화
  onDataChange(callback: (clients: Client[]) => void): () => void {
    if (!this.currentUser) return () => {};
    
    const docRef = doc(db, 'users', this.currentUser.uid, 'data', 'projects');
    
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as DataSnapshot;
        callback(data.data);
      } else {
        callback([]); // 데이터가 없으면 빈 배열
      }
    });

    this.dataListeners.push(unsubscribe);
    return unsubscribe;
  }

  // 팀 전체 데이터 로드 (대시보드용)
  async loadAllTeamData(): Promise<{ [userId: string]: { profile: any, clients: Client[] } }> {
    try {
      const teamData: { [userId: string]: { profile: any, clients: Client[] } } = {};
      
      // 모든 사용자 프로필 가져오기
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const profile = userDoc.data();
        
        // 각 사용자의 프로젝트 데이터 가져오기
        const projectsRef = doc(db, 'users', userId, 'data', 'projects');
        const projectsSnap = await getDoc(projectsRef);
        
        const clients = projectsSnap.exists() ? 
          (projectsSnap.data() as DataSnapshot).data : [];
        
        teamData[userId] = { profile, clients };
      }
      
      return teamData;
    } catch (error) {
      console.error('팀 데이터 로드 실패:', error);
      return {};
    }
  }

  // 특정 팀의 데이터만 로드 (간단한 방법)
  async loadTeamData(teamName: string): Promise<{ [userId: string]: { profile: any, clients: Client[] } }> {
    try {
      console.log('팀 데이터 로드 시작:', teamName);
      const teamData: { [userId: string]: { profile: any, clients: Client[] } } = {};
      
      // 모든 사용자의 데이터를 가져와서 팀별로 필터링
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        
        try {
          // 사용자의 프로젝트 데이터 가져오기
          const projectsRef = doc(db, 'users', userId, 'data', 'projects');
          const projectsSnap = await getDoc(projectsRef);
          
          if (projectsSnap.exists()) {
            const clients = (projectsSnap.data() as DataSnapshot).data || [];
            
            // 임시로 모든 데이터를 포함 (팀 필터링은 나중에)
            teamData[userId] = { 
              profile: { email: userId, team: teamName }, 
              clients 
            };
            
            console.log(`사용자 ${userId}의 프로젝트:`, clients.length, '개');
          }
        } catch (userError) {
          console.log(`사용자 ${userId} 데이터 로드 실패:`, userError);
        }
      }
      
      console.log('최종 팀 데이터:', Object.keys(teamData).length, '명');
      return teamData;
    } catch (error) {
      console.error('팀 데이터 로드 실패:', error);
      return {};
    }
  }

  // 팀 멤버 관리
  async saveUserProfile(userId: string, profile: TeamMember): Promise<void> {
    await setDoc(doc(db, 'teamMembers', userId), profile);
  }

  async getTeamMembers(): Promise<TeamMember[]> {
    try {
      const q = query(collection(db, 'teamMembers'), orderBy('name'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as TeamMember);
    } catch (error) {
      console.error('팀 멤버 로드 실패:', error);
      return [];
    }
  }

  // 활동 로그
  async logActivity(action: string, description: string): Promise<void> {
    if (!this.currentUser) return;

    const activity = {
      userId: this.currentUser.uid,
      userEmail: this.currentUser.email,
      action,
      description,
      timestamp: serverTimestamp(),
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    await setDoc(doc(db, 'activities', activity.id), activity);
  }

  // 권한 확인
  async getUserRole(): Promise<string> {
    if (!this.currentUser) return 'viewer';
    
    try {
      const docRef = doc(db, 'teamMembers', this.currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const profile = docSnap.data() as TeamMember;
        return profile.role;
      }
      return 'viewer';
    } catch (error) {
      console.error('권한 확인 실패:', error);
      return 'viewer';
    }
  }

  private clearListeners(): void {
    this.dataListeners.forEach(unsubscribe => unsubscribe());
    this.dataListeners = [];
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
}

// getDocs import 추가
import { getDocs } from 'firebase/firestore';

export default FirebaseService;