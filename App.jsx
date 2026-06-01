// src/App.jsx
// 메인 앱 컴포넌트

import { useState, useCallback, useMemo } from 'react'
import CalculatorSlot from './components/CalculatorSlot'
import ResultSummary from './components/ResultSummary'
import { useDrivingRates, useSaveCalculation } from './hooks/useSupabase'
import { calculateDrivingFee } from './data/vehicleData'

// 빈 슬롯 초기값
const emptySlot = () => ({
  service: '',
  vehicleType: '',
  vehicleModel: '',
  rentalFee: '',
  insuranceFee: '',
  otherFee: '',
})

const SLOT_TABS = [
  { count: 1, label: '1대' },
  { count: 2, label: '2대 비교' },
  { count: 3, label: '3대 비교' },
  { count: 4, label: '4대 비교' },
]

export default function App() {
  const [distance, setDistance] = useState('')
  const [vehicleCount, setVehicleCount] = useState(2)
  const [vehicles, setVehicles] = useState([emptySlot(), emptySlot(), emptySlot(), emptySlot()])
  const [showResult, setShowResult] = useState(false)
  const [calculated, setCalculated] = useState(false)
  const [distanceError, setDistanceError] = useState('')

  const { rates, loading: ratesLoading, lastUpdated, dataSource } = useDrivingRates()
  const { saveCalculation, saving } = useSaveCalculation()

  // 슬롯 탭 변경 시 결과 초기화
  const handleTabChange = useCallback((count) => {
    setVehicleCount(count)
    setShowResult(false)
    setCalculated(false)
  }, [])

  // 슬롯 데이터 변경
  const handleSlotChange = useCallback((slotIndex, field, value) => {
    setVehicles(prev => {
      const next = [...prev]
      next[slotIndex] = { ...next[slotIndex], [field]: value }
      return next
    })
    // 값 변경시 결과 숨기기
    setShowResult(false)
    setCalculated(false)
  }, [])

  // 주행거리 입력
  const handleDistanceChange = (e) => {
    const val = e.target.value
    if (val === '' || /^\d+$/.test(val)) {
      setDistance(val)
      setDistanceError('')
      setShowResult(false)
      setCalculated(false)
    }
  }

  // 결과 계산값 (계산하기 누를 때 사용)
  const calculatedResults = useMemo(() => {
    return vehicles.slice(0, vehicleCount).map(v => {
      if (!v.service || !v.vehicleType) return null
      const typeRates = rates?.[v.service]?.[v.vehicleType]
      const drivingFee = typeRates ? calculateDrivingFee(distance, typeRates) : 0
      const totalFee = drivingFee + (Number(v.rentalFee) || 0) + (Number(v.insuranceFee) || 0) + (Number(v.otherFee) || 0)
      return { drivingFee, totalFee }
    })
  }, [vehicles, vehicleCount, distance, rates])

  // 계산하기 버튼
  const handleCalculate = async () => {
    // 유효성 검사
    if (!distance || Number(distance) <= 0) {
      setDistanceError('주행거리를 입력해주세요.')
      return
    }
    if (Number(distance) > 100000) {
      setDistanceError('주행거리는 100,000km 이하로 입력해주세요.')
      return
    }

    const activeVehicles = vehicles.slice(0, vehicleCount)
    const hasAnyInput = activeVehicles.some(v => v.service || v.vehicleType)
    if (!hasAnyInput) {
      setDistanceError('최소 1개의 차량 정보를 입력해주세요.')
      return
    }

    setDistanceError('')
    setShowResult(true)
    setCalculated(true)

    // 데이터 저장 (백그라운드)
    await saveCalculation({
      distance,
      vehicles: activeVehicles,
      results: calculatedResults,
      vehicleCount,
    })
  }

  // 초기화
  const handleReset = () => {
    setDistance('')
    setVehicles([emptySlot(), emptySlot(), emptySlot(), emptySlot()])
    setShowResult(false)
    setCalculated(false)
    setDistanceError('')
  }

  // 마지막 업데이트 날짜 포맷
  const updateDateStr = useMemo(() => {
    if (lastUpdated) {
      return new Date(lastUpdated).toLocaleDateString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit'
      }) + ' 주행요금 업데이트 완료'
    }
    return '2026. 01. 08. 주행요금 업데이트 완료'
  }, [lastUpdated])

  return (
    <div className="app-container">
      {/* SEO용 숨겨진 h1 (스크린리더 + 구글봇 용) */}
      <span className="sr-only">카셰어링 주행요금 계산기 - 쏘카 그린카 트루카 비교</span>

      <header className="app-header">
        <div className="header-inner">
          <h1 className="main-title">카셰어링 주행요금 계산기</h1>
          <p className="main-subtitle">
            주행 거리 입력 후, 서비스와 차량을 선택하면 주행 요금이 계산됩니다.
          </p>
          <p className="update-date">({updateDateStr})</p>

          {/* 데이터 소스 표시 */}
          {dataSource === 'supabase' && (
            <span className="data-badge live">● 실시간 요금</span>
          )}
          {ratesLoading && (
            <span className="data-badge loading">요금 데이터 로딩중...</span>
          )}
        </div>
      </header>

      <main className="app-main">
        {/* 주행거리 입력 */}
        <section className="distance-section" aria-label="주행거리 입력">
          <div className="distance-inner">
            <label className="distance-label" htmlFor="distance-input">
              주행 거리
            </label>
            <div className="distance-input-group">
              <input
                id="distance-input"
                type="number"
                value={distance}
                onChange={handleDistanceChange}
                placeholder="0"
                className={`distance-input ${distanceError ? 'error' : ''}`}
                min="0"
                max="100000"
                aria-describedby="distance-error"
              />
              <span className="distance-unit">km</span>
            </div>
            {distanceError && (
              <p id="distance-error" className="error-message" role="alert">{distanceError}</p>
            )}
          </div>
        </section>

        {/* 비교 대수 탭 */}
        <div className="tab-section" role="tablist" aria-label="비교 차량 수 선택">
          {SLOT_TABS.map(tab => (
            <button
              key={tab.count}
              role="tab"
              aria-selected={vehicleCount === tab.count}
              className={`tab-btn ${vehicleCount === tab.count ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.count)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 계산기 슬롯들 */}
        <section
          className={`slots-grid slots-${vehicleCount}`}
          aria-label="차량 비교 계산기"
        >
          {Array.from({ length: vehicleCount }).map((_, i) => (
            <CalculatorSlot
              key={i}
              slotNumber={i + 1}
              data={vehicles[i]}
              onChange={(field, value) => handleSlotChange(i, field, value)}
              distance={distance}
              rates={rates}
              showResult={showResult}
            />
          ))}
        </section>

        {/* 계산하기 / 초기화 버튼 */}
        <div className="action-section">
          <button
            className={`calc-btn ${saving ? 'loading' : ''}`}
            onClick={handleCalculate}
            disabled={saving}
            aria-label="요금 계산하기"
          >
            {saving ? '저장 중...' : '계산하기'}
          </button>
          {calculated && (
            <button
              className="reset-btn"
              onClick={handleReset}
              aria-label="초기화"
            >
              초기화
            </button>
          )}
        </div>

        {/* 비교 결과 요약 (계산하기 후 표시) */}
        {showResult && vehicleCount >= 2 && (
          <ResultSummary
            vehicles={vehicles}
            distance={distance}
            rates={rates}
            vehicleCount={vehicleCount}
          />
        )}

        {/* SEO용 콘텐츠 영역 */}
        <section className="seo-content" aria-label="서비스 안내">
          <div className="seo-inner">
            <h2>카셰어링 주행요금이란?</h2>
            <p>
              카셰어링(쏘카, 그린카, 트루카)은 대여 요금 외에 <strong>주행거리에 따라 추가 요금</strong>이 부과됩니다.
              차량 유형과 이동 거리에 따라 요금이 크게 다를 수 있으므로, 미리 계산해보세요.
            </p>
            <div className="service-cards">
              <div className="service-card socar">
                <strong>🚗 쏘카</strong>
                <p>국내 최대 카셰어링. 전국 4,500여 개 존에서 이용 가능.</p>
              </div>
              <div className="service-card greencar">
                <strong>🌿 그린카</strong>
                <p>KT 그룹의 카셰어링. 전국 3,000여 개 존 운영.</p>
              </div>
              <div className="service-card truecar">
                <strong>🔵 트루카</strong>
                <p>합리적인 요금의 카셰어링 서비스.</p>
              </div>
            </div>
            <h3>주행요금 계산 방법</h3>
            <p>
              주행요금은 거리 구간별로 다르게 적용됩니다. 일반적으로
              <strong> 0~30km, 31~100km, 101km 이상</strong> 3구간으로 나뉘며,
              거리가 길어질수록 km당 단가가 낮아집니다.
            </p>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>본 계산기는 참고용이며, 실제 요금은 각 서비스 앱에서 확인하세요.</p>
        <p>요금은 분기별로 변동될 수 있습니다.</p>
      </footer>
    </div>
  )
}
