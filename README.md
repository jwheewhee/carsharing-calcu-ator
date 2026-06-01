# 카셰어링 주행요금 계산기

쏘카, 그린카, 트루카 주행요금을 비교하는 웹 계산기입니다.

---

## 🛠️ 기술 스택

| 역할 | 기술 | 이유 |
|------|------|------|
| UI | React + Vite | 빠른 빌드, 컴포넌트 재사용 |
| DB / 백엔드 | Supabase | 서버리스 PostgreSQL, 관리자 UI, 무료 |
| 배포 | Vercel | GitHub 연동, 자동 배포, 무료 |

---

## 📁 파일 구조

```
carsharing-calculator/
├── public/
│   ├── favicon.svg
│   ├── robots.txt          ← 구글봇 허용
│   └── sitemap.xml         ← SEO 사이트맵
├── src/
│   ├── components/
│   │   ├── CalculatorSlot.jsx   ← 개별 차량 계산 카드
│   │   └── ResultSummary.jsx    ← 비교 결과 요약
│   ├── data/
│   │   └── vehicleData.js       ← 차량 목록 & 요금 fallback 데이터
│   ├── hooks/
│   │   └── useSupabase.js       ← DB 연동 로직
│   ├── lib/
│   │   └── supabase.js          ← Supabase 클라이언트 + SQL 스키마
│   ├── styles/
│   │   └── global.css           ← 전체 스타일
│   ├── App.jsx                  ← 메인 앱 컴포넌트
│   └── main.jsx                 ← 진입점
├── index.html                   ← SEO 메타태그 설정
├── vite.config.js
├── package.json
├── vercel.json                  ← Vercel 배포 설정
└── .env.example                 ← 환경변수 예시
```

---

## 🚀 배포 방법 (단계별 상세 가이드)

### STEP 1. Supabase 설정

1. **https://supabase.com** 접속 → **Start your project** → GitHub로 회원가입

2. **New project** 클릭
   - Organization: 본인 계정 선택
   - Name: `carsharing-calculator`
   - Database Password: 안전한 비밀번호 입력 (저장해두기!)
   - Region: **Northeast Asia (Seoul)** 선택 → **Create new project** 클릭

3. **SQL 스키마 실행**
   - 왼쪽 메뉴 → **SQL Editor** 클릭
   - `src/lib/supabase.js` 파일 안에 있는 `/* ... */` 주석 안의 SQL을 전부 복사
   - SQL Editor에 붙여넣고 **Run** 버튼 클릭
   - 테이블이 생성되면 완료!

4. **API 키 복사**
   - 왼쪽 메뉴 → **Project Settings** → **API** 탭
   - `Project URL` 복사 → `.env`의 `VITE_SUPABASE_URL`에 붙여넣기
   - `anon public` 키 복사 → `.env`의 `VITE_SUPABASE_ANON_KEY`에 붙여넣기

---

### STEP 2. 로컬 개발 환경 설정

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 파일 생성
cp .env.example .env
# .env 파일을 열어서 Supabase URL과 키 입력

# 3. 개발 서버 실행
npm run dev
# → http://localhost:5173 에서 확인
```

---

### STEP 3. GitHub에 코드 올리기

```bash
# 1. GitHub에서 새 레포지터리 생성 (https://github.com/new)
#    Repository name: carsharing-calculator
#    Public or Private 선택

# 2. 로컬에서 git 초기화
git init
git add .
git commit -m "초기 커밋: 카셰어링 주행요금 계산기"

# 3. GitHub 레포와 연결 (GitHub에서 보여주는 명령어 복사)
git remote add origin https://github.com/본인아이디/carsharing-calculator.git
git branch -M main
git push -u origin main
```

---

### STEP 4. Vercel 배포

1. **https://vercel.com** 접속 → **Continue with GitHub** 로그인

2. **New Project** 클릭
   - **Import** 버튼 옆에서 `carsharing-calculator` 레포 선택
   - **Import** 클릭

3. **환경변수 설정** (중요!)
   - `Environment Variables` 섹션 펼치기
   - 아래 2개 추가:
     | Name | Value |
     |------|-------|
     | `VITE_SUPABASE_URL` | Supabase에서 복사한 URL |
     | `VITE_SUPABASE_ANON_KEY` | Supabase에서 복사한 anon key |

4. **Deploy** 클릭
   - 빌드가 완료되면 `https://carsharing-calculator-xxx.vercel.app` 같은 URL이 생성됨!

5. **배포 완료 후 도메인 업데이트**
   - `index.html`의 `your-domain.com`을 실제 Vercel URL로 변경
   - `public/robots.txt`와 `public/sitemap.xml`도 같은 URL로 변경
   - 다시 `git push` → Vercel이 자동으로 재배포

---

### STEP 5. 코드 수정 후 재배포

```bash
# 코드 수정 후:
git add .
git commit -m "수정 내용 설명"
git push

# → Vercel이 자동으로 감지해서 1~2분 안에 자동 재배포됨!
```

---

## 📊 분기별 주행요금 업데이트 방법

**크롤링 없이 Supabase 대시보드에서 직접 수정!**

1. Supabase 대시보드 → **Table Editor** → `driving_rates` 테이블
2. 변경된 요금이 있는 행 클릭 → 숫자 수정 → 엔터
3. 끝! 웹사이트에 즉시 반영됩니다.

또는 SQL로 일괄 업데이트:

```sql
-- 예: 쏘카 중형 요금 변경
UPDATE driving_rates dr
SET rate_0_30 = 210, rate_31_100 = 180, rate_101_plus = 155,
    quarter = '2026-Q2', effective_from = '2026-04-01', updated_at = now()
FROM vehicle_models vm
JOIN vehicle_types vt ON vm.vehicle_type_id = vt.id
JOIN services s ON vt.service_id = s.id
WHERE dr.vehicle_model_id = vm.id
  AND vt.type_name = '중형'
  AND s.name = 'socar';
```

---

## 📈 데이터 분석 방법 (사용자 행동 파악)

Supabase → **Table Editor** → `user_calculations` 테이블에서 확인

유용한 쿼리 예시:

```sql
-- 가장 많이 비교되는 서비스 조합
SELECT
  vehicles->0->>'service' as service1,
  vehicles->1->>'service' as service2,
  COUNT(*) as count
FROM user_calculations
WHERE vehicle_count >= 2
GROUP BY 1, 2
ORDER BY count DESC;

-- 평균 주행거리
SELECT
  AVG(total_distance) as avg_distance,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_distance) as median_distance
FROM user_calculations;

-- 차량 유형 선호도
SELECT
  vehicles->0->>'vehicle_type' as vehicle_type,
  COUNT(*) as count
FROM user_calculations
GROUP BY 1
ORDER BY count DESC;

-- 일별 사용자 수
SELECT
  DATE(created_at) as date,
  COUNT(DISTINCT session_id) as unique_users,
  COUNT(*) as calculations
FROM user_calculations
GROUP BY 1
ORDER BY 1 DESC;
```

---

## 🔍 SEO 최적화 전략

### 타겟 키워드 (검색량 높은 순)
1. `쏘카 주행요금` - 월 검색량 높음
2. `그린카 주행요금`
3. `카셰어링 비교`
4. `쏘카 그린카 비교`
5. `카셰어링 주행요금 계산기`

### 추가 SEO 작업 (배포 후)
1. **구글 서치 콘솔** 등록
   - https://search.google.com/search-console
   - 도메인 소유권 확인 → 사이트맵 제출 (`https://your-domain/sitemap.xml`)

2. **네이버 서치어드바이저** 등록
   - https://searchadvisor.naver.com
   - 사이트 등록 → 사이트맵 제출

3. **코드 품질**: 페이지 로딩 속도 유지 (Lighthouse 90점 이상 목표)

---

## ✅ 추가 개선 아이디어

- [ ] **쿠폰/프로모코드 입력**: 할인 적용 후 금액 계산
- [ ] **이용 시간 입력**: 시간제 요금도 계산
- [ ] **즐겨찾기/공유 기능**: 계산 결과를 URL로 공유
- [ ] **요금 히스토리**: 분기별 요금 변화 그래프
- [ ] **카카오 공유 버튼**: 계산 결과 공유 기능
- [ ] **다크모드**

---

## 🆘 트러블슈팅

**Q: 환경변수가 적용이 안 돼요**
- Vercel 대시보드 → Project → Settings → Environment Variables에서 추가 후 **Redeploy** 필요

**Q: Supabase 연결이 안 돼요**
- `.env` 파일에 `VITE_` 접두사가 있는지 확인 (없으면 Vite가 읽지 못함)
- ANON KEY가 맞는지 확인 (service_role key가 아닌 anon key)

**Q: 로컬에서 작동하는데 배포 후 안 돼요**
- Vercel 환경변수에 동일한 값이 설정되어 있는지 확인
- Vercel 배포 로그에서 에러 메시지 확인
