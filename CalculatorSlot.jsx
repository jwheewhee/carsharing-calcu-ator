// src/components/CalculatorSlot.jsx
// 각 차량 1개의 계산기 카드 컴포넌트

import { useMemo } from 'react'
import { SERVICES, VEHICLE_TYPES, VEHICLE_MODELS, calculateDrivingFee, formatKRW } from '../data/vehicleData'

export default function CalculatorSlot({
  slotNumber,    // 1~4
  data,          // { service, vehicleType, vehicleModel, rentalFee, insuranceFee, otherFee }
  onChange,      // (field, value) => void
  distance,      // 전체 주행거리
  rates,         // 주행요금 데이터
  showResult,    // 계산하기 버튼 눌렀는지
}) {
  const { service, vehicleType, vehicleModel, rentalFee, insuranceFee, otherFee } = data

  // 선택된 서비스의 차량 유형 목록
  const availableTypes = useMemo(() => {
    if (!service) return []
    return VEHICLE_TYPES.filter(type => VEHICLE_MODELS[service]?.[type])
  }, [service])

  // 선택된 유형의 차량 모델 목록
  const availableModels = useMemo(() => {
    if (!service || !vehicleType) return []
    return VEHICLE_MODELS[service]?.[vehicleType] || []
  }, [service, vehicleType])

  // 주행요금 계산
  const drivingFee = useMemo(() => {
    if (!service || !vehicleType || !distance) return 0
    const typeRates = rates?.[service]?.[vehicleType]
    if (!typeRates) return 0
    return calculateDrivingFee(distance, typeRates)
  }, [service, vehicleType, distance, rates])

  // 구간별 요금 표시
  const currentRates = useMemo(() => {
    if (!service || !vehicleType) return null
    return rates?.[service]?.[vehicleType] || null
  }, [service, vehicleType, rates])

  // 총 금액
  const totalFee = useMemo(() => {
    if (!showResult) return 0
    return drivingFee + (Number(rentalFee) || 0) + (Number(insuranceFee) || 0) + (Number(otherFee) || 0)
  }, [showResult, drivingFee, rentalFee, insuranceFee, otherFee])

  const serviceInfo = service ? SERVICES[service] : null

  const handleServiceChange = (e) => {
    onChange('service', e.target.value)
    onChange('vehicleType', '')
    onChange('vehicleModel', '')
  }

  const handleTypeChange = (e) => {
    onChange('vehicleType', e.target.value)
    onChange('vehicleModel', '')
  }

  return (
    <div className="calc-slot" style={{
      '--slot-color': serviceInfo?.color || '#888',
      '--slot-bg': serviceInfo?.bgColor || '#f8f8f8',
    }}>
      {/* 슬롯 헤더 */}
      <div className="slot-header">
        <div className="slot-number-badge">계산기 {slotNumber}</div>
        {serviceInfo && (
          <div className="slot-service-tag" style={{ backgroundColor: serviceInfo.bgColor, color: serviceInfo.color }}>
            {serviceInfo.displayName}
          </div>
        )}
      </div>

      {/* 서비스 선택 */}
      <div className="form-row">
        <label className="form-label">서비스</label>
        <div className="select-wrapper">
          <select
            value={service || ''}
            onChange={handleServiceChange}
            className="form-select"
          >
            <option value="">선택하세요</option>
            {Object.values(SERVICES).map(s => (
              <option key={s.id} value={s.id}>{s.displayName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 차량 유형 선택 */}
      <div className="form-row">
        <label className="form-label">차량 유형</label>
        <div className="select-wrapper">
          <select
            value={vehicleType || ''}
            onChange={handleTypeChange}
            className="form-select"
            disabled={!service}
          >
            <option value="">{service ? '선택하세요' : '서비스 먼저 선택'}</option>
            {availableTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 차량명 선택 */}
      <div className="form-row">
        <label className="form-label">차량명</label>
        <div className="select-wrapper">
          <select
            value={vehicleModel || ''}
            onChange={e => onChange('vehicleModel', e.target.value)}
            className="form-select"
            disabled={!vehicleType}
          >
            <option value="">{vehicleType ? '선택하세요' : '차량 유형 먼저 선택'}</option>
            {availableModels.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 구간별 주행요금 안내 */}
      <div className="rates-info">
        {currentRates ? (
          <>
            <p className="rates-info-title">해당 차량의 거리별 주행 요금은 아래와 같습니다.</p>
            <div className="rates-table">
              <div className="rates-row">
                <span className="rates-range">0~30km</span>
                <span className="rates-value">{currentRates.rate_0_30.toLocaleString()}원/km</span>
              </div>
              <div className="rates-row">
                <span className="rates-range">31~100km</span>
                <span className="rates-value">{currentRates.rate_31_100.toLocaleString()}원/km</span>
              </div>
              <div className="rates-row">
                <span className="rates-range">101km 이상</span>
                <span className="rates-value">{currentRates.rate_101_plus.toLocaleString()}원/km</span>
              </div>
            </div>
          </>
        ) : (
          <p className="rates-info-placeholder">서비스와 차량 유형을 선택하면<br />거리별 주행요금이 표시됩니다.</p>
        )}
      </div>

      {/* 주행요금 (자동계산) */}
      <div className="form-row fee-row">
        <label className="form-label">주행 요금</label>
        <div className="fee-display-wrapper">
          <div className={`fee-display ${showResult && drivingFee > 0 ? 'has-value' : ''}`}>
            {showResult && drivingFee > 0 ? drivingFee.toLocaleString() : ''}
          </div>
          <span className="fee-unit">원</span>
        </div>
      </div>

      {/* 구분선 */}
      <div className="divider-label">사용자 입력</div>

      {/* 대여 요금 */}
      <div className="form-row fee-row">
        <label className="form-label">대여 요금</label>
        <div className="fee-input-wrapper">
          <input
            type="number"
            value={rentalFee || ''}
            onChange={e => onChange('rentalFee', e.target.value)}
            placeholder="0"
            className="fee-input"
            min="0"
          />
          <span className="fee-unit">원</span>
        </div>
      </div>

      {/* 면책 상품 (보험료) */}
      <div className="form-row fee-row">
        <label className="form-label">
          면책 상품
          <span className="label-hint">(보험료)</span>
        </label>
        <div className="fee-input-wrapper">
          <input
            type="number"
            value={insuranceFee || ''}
            onChange={e => onChange('insuranceFee', e.target.value)}
            placeholder="0"
            className="fee-input"
            min="0"
          />
          <span className="fee-unit">원</span>
        </div>
      </div>

      {/* 기타 비용 */}
      <div className="form-row fee-row">
        <label className="form-label">
          기타 비용
          <span className="label-hint">(주차, 충전 등)</span>
        </label>
        <div className="fee-input-wrapper">
          <input
            type="number"
            value={otherFee || ''}
            onChange={e => onChange('otherFee', e.target.value)}
            placeholder="0"
            className="fee-input"
            min="0"
          />
          <span className="fee-unit">원</span>
        </div>
      </div>

      {/* 총 금액 */}
      <div className="total-section">
        <span className="total-label">총 금액</span>
        <span className={`total-value ${showResult ? 'revealed' : 'hidden-value'}`}>
          {showResult ? formatKRW(totalFee) : '계산하기 버튼을 눌러주세요'}
        </span>
      </div>
    </div>
  )
}
