// src/hooks/useSupabase.js
// Supabase에서 주행요금 데이터를 불러오고
// 사용자 계산 결과를 저장하는 커스텀 훅

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { DRIVING_RATES, generateSessionId } from '../data/vehicleData'

// 세션 ID (탭 당 하나, 새로고침해도 유지)
let SESSION_ID = null
function getSessionId() {
  if (!SESSION_ID) {
    SESSION_ID = sessionStorage.getItem('calc_session_id') || generateSessionId()
    sessionStorage.setItem('calc_session_id', SESSION_ID)
  }
  return SESSION_ID
}

// ============================================================
// 주행요금 데이터 훅
// Supabase에서 현재 유효한 요금 데이터를 가져옴
// 없으면 로컬 fallback 데이터 사용
// ============================================================
export function useDrivingRates() {
  const [rates, setRates] = useState(DRIVING_RATES)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [dataSource, setDataSource] = useState('local') // 'local' | 'supabase'

  useEffect(() => {
    if (!supabase) {
      setDataSource('local')
      return
    }

    const fetchRates = async () => {
      setLoading(true)
      try {
        // 현재 유효한 요금 데이터 조회
        const today = new Date().toISOString().split('T')[0]
        const { data, error } = await supabase
          .from('driving_rates')
          .select(`
            rate_0_30,
            rate_31_100,
            rate_101_plus,
            quarter,
            updated_at,
            vehicle_models (
              model_name,
              vehicle_types (
                type_name,
                services (name)
              )
            )
          `)
          .lte('effective_from', today)
          .or(`effective_to.is.null,effective_to.gte.${today}`)

        if (error) throw error

        if (data && data.length > 0) {
          // Supabase 데이터를 로컬 형식으로 변환
          const supabaseRates = {}
          data.forEach(row => {
            const serviceName = row.vehicle_models?.vehicle_types?.services?.name
            const typeName = row.vehicle_models?.vehicle_types?.type_name
            if (serviceName && typeName) {
              if (!supabaseRates[serviceName]) supabaseRates[serviceName] = {}
              supabaseRates[serviceName][typeName] = {
                rate_0_30: row.rate_0_30,
                rate_31_100: row.rate_31_100,
                rate_101_plus: row.rate_101_plus,
              }
            }
          })

          // Supabase 데이터와 로컬 데이터 병합 (Supabase 우선)
          const mergedRates = { ...DRIVING_RATES }
          Object.keys(supabaseRates).forEach(service => {
            mergedRates[service] = { ...DRIVING_RATES[service], ...supabaseRates[service] }
          })

          setRates(mergedRates)
          setDataSource('supabase')
          setLastUpdated(data[0]?.updated_at)
        }
      } catch (err) {
        console.warn('Supabase 요금 데이터 로드 실패, 로컬 데이터 사용:', err)
        setDataSource('local')
      } finally {
        setLoading(false)
      }
    }

    fetchRates()
  }, [])

  return { rates, loading, lastUpdated, dataSource }
}

// ============================================================
// 계산 결과 저장 훅
// 사용자가 "계산하기" 버튼을 누를 때 Supabase에 저장
// ============================================================
export function useSaveCalculation() {
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const saveCalculation = useCallback(async ({ distance, vehicles, results, vehicleCount }) => {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    // 저장할 데이터 구조
    const payload = {
      session_id: getSessionId(),
      total_distance: Number(distance),
      vehicle_count: vehicleCount,
      vehicles: vehicles.map((v, i) => ({
        slot: i + 1,
        service: v.service || null,
        vehicle_type: v.vehicleType || null,
        vehicle_model: v.vehicleModel || null,
        rental_fee: Number(v.rentalFee) || 0,
        insurance_fee: Number(v.insuranceFee) || 0,
        other_fee: Number(v.otherFee) || 0,
        driving_fee: results?.[i]?.drivingFee || 0,
        total_fee: results?.[i]?.totalFee || 0,
      })),
      results: results || null,
      user_agent: navigator.userAgent.substring(0, 200),
    }

    // Supabase가 없으면 localStorage fallback
    if (!supabase) {
      try {
        const existing = JSON.parse(localStorage.getItem('calc_data') || '[]')
        existing.push({ ...payload, created_at: new Date().toISOString() })
        // 최근 100건만 유지
        if (existing.length > 100) existing.splice(0, existing.length - 100)
        localStorage.setItem('calc_data', JSON.stringify(existing))
        setSaveSuccess(true)
      } catch (e) {
        setSaveError('로컬 저장 실패')
      } finally {
        setSaving(false)
      }
      return
    }

    try {
      const { error } = await supabase
        .from('user_calculations')
        .insert([payload])

      if (error) throw error
      setSaveSuccess(true)
    } catch (err) {
      console.error('계산 데이터 저장 실패:', err)
      setSaveError(err.message)
      // 저장 실패해도 사용자에게 계산 결과는 보여줌 (UI 차단하지 않음)
    } finally {
      setSaving(false)
    }
  }, [])

  return { saveCalculation, saving, saveError, saveSuccess }
}
