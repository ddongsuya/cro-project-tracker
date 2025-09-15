# 👑 Corestemchemon 관리자 가이드

## 🎯 관리자 역할 및 권한

### 관리자 유형

- **시스템 관리자**: 전체 시스템 관리 및 설정
- **팀 관리자**: 팀별 사용자 및 프로젝트 관리
- **데이터 관리자**: 데이터 백업, 복원, 분석

### 관리자 권한

- ✅ 모든 사용자 데이터 조회
- ✅ 팀 구성 및 권한 관리
- ✅ 시스템 설정 변경
- ✅ 데이터 백업/복원
- ✅ 사용 통계 및 분석

---

## 🏗️ 초기 시스템 설정

### Firebase 설정

1. **Firebase 콘솔** 접속
2. **Authentication** 설정:
   ```javascript
   // 허용된 도메인 추가
   -localhost(개발용) - your - domain.com(프로덕션);
   ```
3. **Firestore 보안 규칙** 설정:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // 사용자별 데이터 접근 제한
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }

       // 팀 데이터 접근 제한
       match /teams/{teamId}/{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

### 환경 변수 설정

```bash
# Vercel 환경 변수
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 👥 사용자 관리

### 팀 구성 관리

```javascript
// 권장 팀 구성
const teamStructure = {
  business_dev_1: {
    name: "사업개발 1팀",
    maxMembers: 6,
    leader: "team1.leader@company.com",
    members: [
      "member1@company.com",
      "member2@company.com",
      // ...
    ],
  },
  business_dev_2: {
    name: "사업개발 2팀",
    maxMembers: 4,
    leader: "team2.leader@company.com",
    members: [],
  },
  management: {
    name: "경영진",
    maxMembers: 10,
    permissions: ["view_all", "export_data", "manage_teams"],
  },
};
```

### 사용자 권한 관리

- **member**: 개인 프로젝트 관리
- **leader**: 팀 프로젝트 관리 + 팀원 관리
- **admin**: 전체 시스템 관리

---

## 📊 데이터 관리

### 데이터 구조

```javascript
// Firestore 데이터 구조
/users/{userId}/
  ├── profile: { email, team, role, joinDate }
  └── data/
      └── projects: { clients: [...] }

/teams/{teamId}/
  ├── info: { name, leader, members }
  └── aggregated: { totalProjects, revenue, ... }

/system/
  ├── settings: { version, features, ... }
  └── analytics: { usage, performance, ... }
```

### 정기 백업 설정

```bash
# Firebase CLI를 사용한 백업
firebase firestore:export gs://your-bucket/backups/$(date +%Y%m%d)

# 자동화 스크립트 (cron)
0 2 * * * /usr/local/bin/firebase firestore:export gs://backup-bucket/daily/$(date +%Y%m%d)
```

---

## 🔒 보안 관리

### 보안 체크리스트

- [ ] **HTTPS 강제 적용**
- [ ] **Firebase 보안 규칙 검토**
- [ ] **API 키 정기 교체**
- [ ] **사용자 권한 정기 감사**
- [ ] **데이터 암호화 확인**
- [ ] **백업 데이터 보안**

### 보안 사고 대응 절차

1. **즉시 조치**:

   - 해당 계정 비활성화
   - 관련 세션 강제 종료
   - 보안 로그 수집

2. **조사 및 분석**:

   - 침해 범위 파악
   - 영향받은 데이터 식별
   - 원인 분석

3. **복구 및 예방**:
   - 시스템 복구
   - 보안 강화 조치
   - 사용자 알림

---

## 🚀 배포 및 업데이트

### CI/CD 파이프라인

```yaml
# GitHub Actions 워크플로우
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "18"
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

### 업데이트 절차

1. **개발 환경 테스트**
2. **스테이징 환경 배포**
3. **사용자 승인 테스트**
4. **프로덕션 배포**
5. **배포 후 모니터링**

---

## 📋 정기 관리 작업

### 일일 작업

- [ ] 시스템 상태 확인
- [ ] 오류 로그 검토
- [ ] 사용자 피드백 확인
- [ ] 성능 지표 모니터링

### 주간 작업

- [ ] 사용 통계 분석
- [ ] 보안 로그 검토
- [ ] 데이터 백업 상태 확인
- [ ] 사용자 권한 검토

### 월간 작업

- [ ] 전체 시스템 성능 분석
- [ ] 사용자 만족도 조사
- [ ] 보안 감사
- [ ] 용량 계획 검토

---

## 📞 지원 및 연락처

### 기술 지원 팀

- **시스템 관리자**: admin@corestemchemon.com
- **개발팀 리더**: dev-lead@corestemchemon.com
- **보안 담당자**: security@corestemchemon.com

### 외부 지원

- **Firebase 지원**: https://firebase.google.com/support
- **Vercel 지원**: https://vercel.com/support
- **React 커뮤니티**: https://reactjs.org/community

---

**© 2024 Corestemchemon. All rights reserved.**
