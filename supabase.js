// src/lib/supabase.js
// Supabase 클라이언트 초기화
// .env 파일에 VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 설정해야 합니다

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 환경변수가 없을 때 에러 방지 (개발 중 fallback)
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase 환경변수가 설정되지 않았습니다. .env 파일을 확인해주세요.')
}

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// ============================================================
// Supabase에서 실행할 SQL 스키마 (Supabase > SQL Editor에서 실행)
// ============================================================
/*

-- 1. 서비스(카셰어링 업체) 테이블
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,           -- '쏘카', '그린카', '트루카'
  display_name TEXT NOT NULL,   -- 화면 표시용 이름
  color TEXT,                   -- 브랜드 컬러 (예: '#00C896')
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 차량 유형 테이블
CREATE TABLE vehicle_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  type_name TEXT NOT NULL,      -- '경형', '소형', '중형', '대형', 'SUV', '전기차', '승합', '럭셔리'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 차량 모델 테이블
CREATE TABLE vehicle_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_type_id UUID REFERENCES vehicle_types(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  model_name TEXT NOT NULL,     -- '아반떼', 'K5', '카니발' 등
  year INTEGER,                 -- 연식
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. 주행요금 테이블 (핵심 - 분기마다 이 테이블만 업데이트)
CREATE TABLE driving_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_model_id UUID REFERENCES vehicle_models(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  -- 거리 구간별 요금 (원/km)
  rate_0_30 INTEGER NOT NULL DEFAULT 0,      -- 0~30km 구간 요금/km
  rate_31_100 INTEGER NOT NULL DEFAULT 0,    -- 31~100km 구간 요금/km
  rate_101_plus INTEGER NOT NULL DEFAULT 0,  -- 101km 이상 구간 요금/km
  -- 유효 기간 (분기 관리용)
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,                          -- NULL이면 현재 유효
  quarter TEXT,                               -- '2026-Q1', '2026-Q2' 등
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. 사용자 계산 데이터 저장 테이블 (데이터 분석용!)
CREATE TABLE user_calculations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- 계산 그룹 (한 번 계산하기 누를 때 같은 group_id)
  session_id TEXT NOT NULL,
  total_distance INTEGER NOT NULL,           -- 입력한 총 주행거리 (km)
  vehicle_count INTEGER NOT NULL DEFAULT 1, -- 비교한 차량 수
  -- 차량 정보 (JSON 배열로 저장)
  vehicles JSONB NOT NULL,
  -- 계산 결과 요약
  results JSONB,
  -- 메타데이터
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- vehicles JSONB 예시:
-- [
--   {
--     "slot": 1,
--     "service": "쏘카",
--     "vehicle_type": "중형",
--     "vehicle_model": "아반떼",
--     "rental_fee": 50000,
--     "insurance_fee": 5000,
--     "other_fee": 0,
--     "driving_fee": 12000,
--     "total_fee": 67000
--   }
-- ]

-- 인덱스 최적화
CREATE INDEX idx_driving_rates_service ON driving_rates(service_id);
CREATE INDEX idx_driving_rates_model ON driving_rates(vehicle_model_id);
CREATE INDEX idx_driving_rates_effective ON driving_rates(effective_from, effective_to);
CREATE INDEX idx_user_calculations_created ON user_calculations(created_at);
CREATE INDEX idx_user_calculations_session ON user_calculations(session_id);

-- Row Level Security (RLS) - 보안 설정
ALTER TABLE user_calculations ENABLE ROW LEVEL SECURITY;
-- 누구나 INSERT 가능 (계산 저장), SELECT는 불가 (관리자만)
CREATE POLICY "Anyone can insert calculations" ON user_calculations FOR INSERT WITH CHECK (true);

-- 초기 데이터: 서비스
INSERT INTO services (name, display_name, color) VALUES
  ('socar', '쏘카', '#00C896'),
  ('greencar', '그린카', '#2ECC71'),
  ('truecar', '트루카', '#3498DB');

*/
