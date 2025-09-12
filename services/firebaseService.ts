import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
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
  appId: "1:845390790357:web:227bb9fa7bd7b4968d6c5c"
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

  // 데이터 관리
  async saveData(clients: Client[]): Promise<void> {
    if (!this.currentUser) throw new Error('사용자가 로그인되지 않았습니다.');

    const dataSnapshot: Omit<DataSnapshot, 'id'> = {
      data: clients,
      lastModified: serverTimestamp() as Timestamp,
      modifiedBy: this.currentUser.email || this.currentUser.uid,
      version: Date.now()
    };

    await setDoc(doc(db, 'projectData', 'main'), dataSnapshot);
    
    // 활동 로그 저장
    await this.logActivity('data_updated', `데이터가 업데이트되었습니다 (${clients.length}개 고객사)`);
  }

  async loadData(): Promise<Client[] | null> {
    try {
      const docRef = doc(db, 'projectData', 'main');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as DataSnapshot;
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      return null;
    }
  }

  // 실시간 데이터 동기화
  onDataChange(callback: (clients: Client[]) => void): () => void {
    const docRef = doc(db, 'projectData', 'main');
    
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as DataSnapshot;
        callback(data.data);
      }
    });

    this.dataListeners.push(unsubscribe);
    return unsubscribe;
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