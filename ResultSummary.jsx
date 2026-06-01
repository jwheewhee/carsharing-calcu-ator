// src/components/ResultSummary.jsx
// 계산 후 최저가 표시 및 비교 요약

import { SERVICES, formatKRW, calculateDrivingFee } from '../data/vehicleData'

export default function ResultSummary({ vehicles, distance, rates, vehicleCount }) {
  // 유효한 슬롯만 필터
  const validSlots = vehicles
    .slice(0, vehicleCount)
    .map((v, i) => {
      if (!v.service || !v.vehicleType) return null
      const typeRates = rates?.[v.service]?.[v.vehicleType]
      const drivingFee = typeRates ? calculateDrivingFee(distance, typeRates) : 0
      const totalFee = drivingFee + (Number(v.rentalFee) || 0) + (Number(v.insuranceFee) || 0) + (Number(v.otherFee) || 0)
      return {
        slot: i + 1,
        service: v.service,
        vehicleType: v.vehicleType,
        vehicleModel: v.vehicleModel,
        drivingFee,
        rentalFee: Number(v.rentalFee) || 0,
        insuranceFee: Number(v.insuranceFee) || 0,
        otherFee: Number(v.otherFee) || 0,
        totalFee,
      }
    })
    .filter(Boolean)

  if (validSlots.length < 2) return null

  // 최저가 찾기
  const minTotal = Math.min(...validSlots.map(s => s.totalFee))
  const cheapest = validSlots.find(s => s.totalFee === minTotal)

  // 최고가 대비 절약 금액
  const maxTotal = Math.max(...validSlots.map(s => s.totalFee))
  const savings = maxTotal - minTotal

  return (
    <div className="result-summary">
      <div className="result-summary-inner">
        <h2 className="result-title">📊 비교 결과</h2>

        {/* 최저가 뱃지 */}
        <div className="cheapest-banner">
          <div
            className="cheapest-badge"
            style={{ backgroundColor: SERVICES[cheapest.service]?.color }}
          >
            🏆 최저가
          </div>
          <div className="cheapest-info">
            <span className="cheapest-service">{SERVICES[cheapest.service]?.displayName}</span>
            {cheapest.vehicleModel && <span className="cheapest-model"> · {cheapest.vehicleModel}</span>}
            <span className="cheapest-price"> {formatKRW(cheapest.totalFee)}</span>
          </div>
          {savings > 0 && (
            <div className="savings-badge">
              최대 {formatKRW(savings)} 절약
            </div>
          )}
        </div>

        {/* 상세 비교표 */}
        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th className="col-item">항목</th>
                {validSlots.map(slot => (
                  <th key={slot.slot} className="col-service"
                    style={{ color: SERVICES[slot.service]?.color }}>
                    계산기 {slot.slot}<br />
                    <span className="service-name">{SERVICES[slot.service]?.displayName}</span>
                    {slot.vehicleModel && <span className="model-name"> {slot.vehicleModel}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="item-name">주행 요금</td>
                {validSlots.map(slot => (
                  <td key={slot.slot} className="item-value">{formatKRW(slot.drivingFee)}</td>
                ))}
              </tr>
              <tr>
                <td className="item-name">대여 요금</td>
                {validSlots.map(slot => (
                  <td key={slot.slot} className="item-value">{formatKRW(slot.rentalFee)}</td>
                ))}
              </tr>
              <tr>
                <td className="item-name">면책 상품</td>
                {validSlots.map(slot => (
                  <td key={slot.slot} className="item-value">{formatKRW(slot.insuranceFee)}</td>
                ))}
              </tr>
              <tr>
                <td className="item-name">기타 비용</td>
                {validSlots.map(slot => (
                  <td key={slot.slot} className="item-value">{formatKRW(slot.otherFee)}</td>
                ))}
              </tr>
              <tr className="total-row">
                <td className="item-name total-label-cell">총 금액</td>
                {validSlots.map(slot => (
                  <td key={slot.slot}
                    className={`item-value total-value-cell ${slot.totalFee === minTotal ? 'is-cheapest' : ''}`}
                    style={slot.totalFee === minTotal ? { color: SERVICES[slot.service]?.color } : {}}>
                    <strong>{formatKRW(slot.totalFee)}</strong>
                    {slot.totalFee === minTotal && <span className="crown">👑</span>}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* 주행거리 정보 */}
        <p className="result-note">
          📍 기준 주행거리: <strong>{Number(distance).toLocaleString()}km</strong>
          &nbsp;·&nbsp; {new Date().getFullYear()}년 기준 요금
        </p>
      </div>
    </div>
  )
}
