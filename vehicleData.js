// src/data/vehicleData.js
// ============================================================
// 초기 차량 데이터 및 주행요금 (Supabase에 데이터 없을 때 fallback)
// 실제 운영시에는 Supabase DB에서 불러옵니다
// 분기별 요금 변경시 Supabase 대시보드에서 직접 수정
// ============================================================

export const SERVICES = {
  socar: {
    id: 'socar',
    displayName: '쏘카',
    color: '#00C896',
    bgColor: '#E8FAF5',
  },
  greencar: {
    id: 'greencar',
    displayName: '그린카',
    color: '#27AE60',
    bgColor: '#E8F8EE',
  },
  truecar: {
    id: 'truecar',
    displayName: '트루카',
    color: '#2980B9',
    bgColor: '#E8F4FB',
  },
}

// 차량 유형 목록
export const VEHICLE_TYPES = ['경형', '소형', '준중형', '중형', '대형', 'SUV', '전기차', '승합', '럭셔리']

// 서비스별 차량 목록
export const VEHICLE_MODELS = {
  socar: {
    '경형': ['모닝', '스파크', '레이'],
    '소형': ['리오', '베르나', '프라이드'],
    '준중형': ['아반떼', 'K3', '벨로스터'],
    '중형': ['쏘나타', 'K5', 'SM6'],
    '대형': ['그랜저', 'K7', 'SM7'],
    'SUV': ['투싼', '스포티지', '티구안', '코나', '셀토스'],
    '전기차': ['아이오닉5', 'EV6', 'GV60', '아이오닉6'],
    '승합': ['카니발', '스타리아', '시에나'],
    '럭셔리': ['제네시스 G80', 'BMW 5시리즈', '벤츠 E클래스'],
  },
  greencar: {
    '경형': ['모닝', '스파크', '캐스퍼'],
    '소형': ['베르나', '리오'],
    '준중형': ['아반떼', 'K3'],
    '중형': ['쏘나타', 'K5'],
    '대형': ['그랜저', 'K8'],
    'SUV': ['투싼', '스포티지', '코나', '셀토스', '팰리세이드'],
    '전기차': ['아이오닉5', 'EV6', '니로EV'],
    '승합': ['카니발', '스타리아'],
    '럭셔리': ['제네시스 G80', 'G90'],
  },
  truecar: {
    '경형': ['모닝', '스파크'],
    '소형': ['베르나', '아반떼HEV'],
    '준중형': ['아반떼', 'K3'],
    '중형': ['쏘나타', 'K5', 'SM6'],
    '대형': ['그랜저', 'K8'],
    'SUV': ['투싼', '스포티지', 'QM6', '셀토스'],
    '전기차': ['아이오닉5', 'EV6', '아이오닉6'],
    '승합': ['카니발', '스타리아'],
    '럭셔리': ['제네시스 G80'],
  },
}

// ============================================================
// 주행요금 데이터 (원/km)
// 구간: 0~30km / 31~100km / 101km~
// ※ 이 데이터는 Supabase에서 관리됩니다. 아래는 fallback 데이터입니다.
// 실제 요금은 각 서비스 앱에서 확인 후 Supabase에 입력해주세요.
// ============================================================
export const DRIVING_RATES = {
  socar: {
    '경형': { rate_0_30: 130, rate_31_100: 110, rate_101_plus: 90 },
    '소형': { rate_0_30: 150, rate_31_100: 130, rate_101_plus: 110 },
    '준중형': { rate_0_30: 170, rate_31_100: 150, rate_101_plus: 130 },
    '중형': { rate_0_30: 200, rate_31_100: 170, rate_101_plus: 150 },
    '대형': { rate_0_30: 250, rate_31_100: 210, rate_101_plus: 180 },
    'SUV': { rate_0_30: 220, rate_31_100: 190, rate_101_plus: 160 },
    '전기차': { rate_0_30: 160, rate_31_100: 140, rate_101_plus: 120 },
    '승합': { rate_0_30: 280, rate_31_100: 240, rate_101_plus: 200 },
    '럭셔리': { rate_0_30: 400, rate_31_100: 350, rate_101_plus: 300 },
  },
  greencar: {
    '경형': { rate_0_30: 120, rate_31_100: 100, rate_101_plus: 85 },
    '소형': { rate_0_30: 140, rate_31_100: 120, rate_101_plus: 100 },
    '준중형': { rate_0_30: 160, rate_31_100: 140, rate_101_plus: 120 },
    '중형': { rate_0_30: 190, rate_31_100: 165, rate_101_plus: 140 },
    '대형': { rate_0_30: 240, rate_31_100: 200, rate_101_plus: 170 },
    'SUV': { rate_0_30: 210, rate_31_100: 180, rate_101_plus: 155 },
    '전기차': { rate_0_30: 150, rate_31_100: 130, rate_101_plus: 110 },
    '승합': { rate_0_30: 270, rate_31_100: 230, rate_101_plus: 195 },
    '럭셔리': { rate_0_30: 380, rate_31_100: 330, rate_101_plus: 280 },
  },
  truecar: {
    '경형': { rate_0_30: 125, rate_31_100: 105, rate_101_plus: 88 },
    '소형': { rate_0_30: 145, rate_31_100: 125, rate_101_plus: 105 },
    '준중형': { rate_0_30: 165, rate_31_100: 145, rate_101_plus: 125 },
    '중형': { rate_0_30: 195, rate_31_100: 168, rate_101_plus: 145 },
    '대형': { rate_0_30: 245, rate_31_100: 205, rate_101_plus: 175 },
    'SUV': { rate_0_30: 215, rate_31_100: 185, rate_101_plus: 158 },
    '전기차': { rate_0_30: 155, rate_31_100: 135, rate_101_plus: 115 },
    '승합': { rate_0_30: 275, rate_31_100: 235, rate_101_plus: 198 },
    '럭셔리': { rate_0_30: 390, rate_31_100: 340, rate_101_plus: 290 },
  },
}

// ============================================================
// 주행요금 계산 함수
// distance: 총 주행거리 (km)
// rates: { rate_0_30, rate_31_100, rate_101_plus }
// ============================================================
export function calculateDrivingFee(distance, rates) {
  if (!distance || distance <= 0 || !rates) return 0

  let fee = 0
  const d = Number(distance)

  if (d <= 30) {
    fee = d * rates.rate_0_30
  } else if (d <= 100) {
    fee = 30 * rates.rate_0_30 + (d - 30) * rates.rate_31_100
  } else {
    fee = 30 * rates.rate_0_30 + 70 * rates.rate_31_100 + (d - 100) * rates.rate_101_plus
  }

  return Math.round(fee)
}

// 숫자 → 원화 포맷 (예: 123456 → "123,456원")
export function formatKRW(amount) {
  if (!amount && amount !== 0) return '-'
  return Number(amount).toLocaleString('ko-KR') + '원'
}

// 세션 ID 생성 (데이터 그룹핑용)
export function generateSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
