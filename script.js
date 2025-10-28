// 현재 선택된 ESS 인덱스
let currentSelectedESS = null;

// ESS 데이터 생성 - 실제 운영 환경 반영 (에러 최소화)
const essData = [];

// 에러를 가진 ESS와 배터리 인덱스 미리 정의 (2개 ESS에 각 1-2개씩만)
const errorESSIndices = [2, 5]; // ESS-03, ESS-06에만 에러
const errorBatteries = {
    2: [156, 287], // ESS-03의 157번, 288번 배터리
    5: [89] // ESS-06의 90번 배터리
};

for (let i = 0; i < 9; i++) {
    const hasError = errorESSIndices.includes(i);
    const batteries = [];
    
    // 420개의 배터리 데이터 생성
    for (let j = 0; j < 420; j++) {
        const isErrorBattery = hasError && errorBatteries[i] && errorBatteries[i].includes(j);
        
        batteries.push({
            id: `B-${String(j + 1).padStart(3, '0')}`,
            status: isErrorBattery ? 'alert' : 'normal',
            voltage: isErrorBattery ? (3.2 + Math.random() * 0.2).toFixed(2) : (3.65 + Math.random() * 0.2).toFixed(2),
            current: (20 + Math.random() * 10).toFixed(1),
            temperature: isErrorBattery ? (45 + Math.random() * 5).toFixed(1) : (24 + Math.random() * 4).toFixed(1),
            soc: isErrorBattery ? Math.floor(15 + Math.random() * 10) : Math.floor(75 + Math.random() * 15),
            soh: isErrorBattery ? Math.floor(75 + Math.random() * 5) : Math.floor(96 + Math.random() * 4),
            cycles: Math.floor(800 + Math.random() * 1200),
            dod: Math.floor(60 + Math.random() * 20), // Depth of Discharge
            internal_resistance: (2.5 + Math.random() * 0.5).toFixed(2) // 내부 저항 (mΩ)
        });
    }
    
    essData.push({
        id: `ESS-${String(i + 1).padStart(2, '0')}`,
        status: hasError ? 'alert' : 'normal',
        voltage: (48.5 + Math.random() * 1).toFixed(1),
        current: (100 + Math.random() * 50).toFixed(1),
        temperature: hasError ? (45 + Math.random() * 5).toFixed(1) : (25 + Math.random() * 3).toFixed(1),
        soc: Math.floor(75 + Math.random() * 15),
        soh: Math.floor(95 + Math.random() * 5),
        batteries: batteries,
        // 추가 지표들
        rte: (92 + Math.random() * 3).toFixed(1), // Round Trip Efficiency
        cycles: Math.floor(1200 + Math.random() * 800),
        power: (450 + Math.random() * 50).toFixed(0), // kW
        energy: (1800 + Math.random() * 200).toFixed(0), // kWh
        peakShaving: (85 + Math.random() * 10).toFixed(1), // Peak Shaving 효율 %
        availability: hasError ? (94 + Math.random() * 2).toFixed(1) : (99.2 + Math.random() * 0.5).toFixed(1), // 가동률
        co2Reduction: (2.5 + Math.random() * 0.5).toFixed(2), // 일일 CO2 감축량 (톤)
        costSaving: Math.floor(150000 + Math.random() * 50000), // 일일 비용 절감액 (원)
        renewableRate: (65 + Math.random() * 15).toFixed(1), // 재생에너지 연계율 %
        mtbf: Math.floor(2000 + Math.random() * 1000) // Mean Time Between Failures (hours)
    });
}

// ESS 그리드 렌더링
function renderESSGrid() {
    const grid = document.getElementById('essGrid');
    grid.innerHTML = '';
    
    let normalCount = 0;
    let alertCount = 0;
    let totalAvailability = 0;
    let totalRTE = 0;
    let totalCO2 = 0;
    let totalSaving = 0;
    let totalRenewable = 0;
    let totalPeakShaving = 0;
    
    essData.forEach((ess, index) => {
        if (ess.status === 'normal') normalCount++;
        else alertCount++;
        
        // 통계 합산
        totalAvailability += parseFloat(ess.availability);
        totalRTE += parseFloat(ess.rte);
        totalCO2 += parseFloat(ess.co2Reduction);
        totalSaving += ess.costSaving;
        totalRenewable += parseFloat(ess.renewableRate);
        totalPeakShaving += parseFloat(ess.peakShaving);
        
        const essUnit = document.createElement('div');
        essUnit.className = `ess-unit ${ess.status}`;
        essUnit.onclick = () => showBatteryDetail(index);
        
        // 배터리 프리뷰 생성
        let batteryPreview = '';
        for (let i = 0; i < 60; i++) {
            const batteryIndex = Math.floor(i * 7);
            const battery = ess.batteries[batteryIndex];
            batteryPreview += `<div class="battery-dot ${battery.status}"></div>`;
        }
        
        // 에러가 있는 ESS는 추가 경고 표시
        const errorBadge = ess.status === 'alert' ? 
            `<div style="position: absolute; top: 10px; right: 10px; background: #EF4444; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; animation: pulse 2s infinite;">
                ⚠️ ${ess.batteries.filter(b => b.status === 'alert').length} 이상
            </div>` : '';
        
        essUnit.innerHTML = `
            ${errorBadge}
            <div class="ess-header">
                <div class="ess-title">${ess.id}</div>
                <div class="ess-status-icon">
                    ${ess.status === 'normal' ? '✓' : '!'}
                </div>
            </div>
            <div class="ess-info">
                <div class="ess-metric">
                    <div class="ess-metric-label">SOC/SOH</div>
                    <div class="ess-metric-value">${ess.soc}%/${ess.soh}%</div>
                </div>
                <div class="ess-metric">
                    <div class="ess-metric-label">RTE</div>
                    <div class="ess-metric-value">${ess.rte}%</div>
                </div>
                <div class="ess-metric">
                    <div class="ess-metric-label">온도</div>
                    <div class="ess-metric-value" style="${parseFloat(ess.temperature) > 30 ? 'color: #fbbf24;' : ''}">${ess.temperature}°C</div>
                </div>
                <div class="ess-metric">
                    <div class="ess-metric-label">가동률</div>
                    <div class="ess-metric-value">${ess.availability}%</div>
                </div>
            </div>
            <div class="ess-battery-preview">
                ${batteryPreview}
            </div>
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: #94a3b8;">
                <div style="display: flex; justify-content: space-between;">
                    <span>출력: ${ess.power}kW</span>
                    <span>용량: ${ess.energy}kWh</span>
                </div>
                <div style="margin-top: 4px;">사이클: ${ess.cycles}회 | MTBF: ${ess.mtbf}h</div>
            </div>
        `;
        
        grid.appendChild(essUnit);
    });
    
    // 통계 패널 업데이트
    document.getElementById('normalCount').textContent = normalCount;
    document.getElementById('alertCount').textContent = alertCount;
    document.getElementById('avgAvailability').innerHTML = `${(totalAvailability / 9).toFixed(1)}%<span class="stat-trend">${alertCount > 0 ? '⚠️ 점검' : '정상'}</span>`;
    document.getElementById('avgRTE').innerHTML = `${(totalRTE / 9).toFixed(1)}%<span class="stat-trend">▲ 0.3%</span>`;
    document.getElementById('totalCO2').innerHTML = `${totalCO2.toFixed(1)}톤<span class="stat-trend">▲ 2.1톤</span>`;
    document.getElementById('totalSaving').innerHTML = `${Math.floor(totalSaving / 10000)}만<span class="stat-trend">▲ 8.2%</span>`;
    document.getElementById('avgRenewable').innerHTML = `${(totalRenewable / 9).toFixed(1)}%<span class="stat-trend">태양광</span>`;
    document.getElementById('avgPeakShaving').innerHTML = `${(totalPeakShaving / 9).toFixed(1)}%<span class="stat-trend">효율</span>`;
    
    // 미니맵도 함께 업데이트
    renderMinimap();
}

// 미니맵 렌더링
function renderMinimap() {
    const minimapContent = document.getElementById('minimapContent');
    minimapContent.innerHTML = '';
    
    let totalAlertBatteries = 0;
    
    essData.forEach((ess, index) => {
        const minimapESS = document.createElement('div');
        minimapESS.className = `minimap-ess ${ess.status}`;
        if (currentSelectedESS === index) {
            minimapESS.className += ' selected';
        }
        minimapESS.onclick = () => {
            if (currentSelectedESS === index) {
                showESSGrid();
            } else {
                showBatteryDetail(index);
            }
        };
        
        // 배터리 샘플링 (100개만 표시)
        let batteryGrid = '';
        let essAlertCount = 0;
        for (let i = 0; i < 100; i++) {
            const batteryIndex = Math.floor(i * 4.2); // 420개 중 샘플링
            const battery = ess.batteries[batteryIndex];
            if (battery.status === 'alert') {
                totalAlertBatteries++;
                essAlertCount++;
            }
            batteryGrid += `<div class="minimap-battery ${battery.status}"></div>`;
        }
        
        minimapESS.innerHTML = `
            <div class="minimap-ess-label">${ess.id.replace('ESS-', '')}</div>
            <div class="minimap-battery-grid">
                ${batteryGrid}
            </div>
            ${ess.status === 'alert' ? '<div class="minimap-indicator alert"></div>' : ''}
        `;
        
        minimapContent.appendChild(minimapESS);
    });
    
    // 실제 에러 배터리 개수 계산
    const actualAlertCount = essData.reduce((total, ess) => {
        return total + ess.batteries.filter(b => b.status === 'alert').length;
    }, 0);
    
    document.getElementById('minimapAlertCount').textContent = actualAlertCount;
}

// 미니맵 토글
function toggleMinimap() {
    const minimap = document.getElementById('minimap');
    const icon = document.getElementById('minimapToggleIcon');
    
    if (minimap.classList.contains('collapsed')) {
        minimap.classList.remove('collapsed');
        icon.textContent = '−';
    } else {
        minimap.classList.add('collapsed');
        icon.textContent = '□';
    }
}

// 배터리 상세 뷰 표시
function showBatteryDetail(essIndex) {
    currentSelectedESS = essIndex;
    const ess = essData[essIndex];
    document.getElementById('selectedESSName').textContent = ess.id;
    document.getElementById('breadcrumb').textContent = `전체 시스템 > ${ess.id}`;
    
    const batteryGrid = document.getElementById('batteryGrid');
    batteryGrid.innerHTML = '';
    
    ess.batteries.forEach((battery, index) => {
        const batteryCell = document.createElement('div');
        batteryCell.className = `battery-cell ${battery.status}`;
        batteryCell.textContent = index + 1;
        batteryCell.onclick = () => showBatteryPopup(essIndex, index);
        batteryCell.onmouseenter = (e) => showTooltip(e, battery);
        batteryCell.onmouseleave = hideTooltip;
        
        batteryGrid.appendChild(batteryCell);
    });
    
    document.getElementById('essGridView').style.display = 'none';
    document.getElementById('batteryDetailView').classList.add('active');
    
    // 미니맵 업데이트
    renderMinimap();
}

// ESS 그리드로 돌아가기
function showESSGrid() {
    currentSelectedESS = null;
    document.getElementById('breadcrumb').textContent = '전체 시스템';
    document.getElementById('essGridView').style.display = 'block';
    document.getElementById('batteryDetailView').classList.remove('active');
    
    // 미니맵 업데이트
    renderMinimap();
}

// 배터리 팝업 표시
function showBatteryPopup(essIndex, batteryIndex) {
    const battery = essData[essIndex].batteries[batteryIndex];
    
    document.getElementById('popupBatteryId').textContent = `${essData[essIndex].id} - ${battery.id}`;
    document.getElementById('popupStatus').className = `battery-status-badge ${battery.status}`;
    document.getElementById('popupStatus').textContent = battery.status === 'normal' ? '정상' : '경고';
    document.getElementById('popupVoltage').textContent = `${battery.voltage}V`;
    document.getElementById('popupVoltage').className = battery.voltage < 3.5 ? 'detail-value alert' : 'detail-value';
    document.getElementById('popupCurrent').textContent = `${battery.current}A`;
    document.getElementById('popupTemp').textContent = `${battery.temperature}°C`;
    document.getElementById('popupTemp').className = battery.temperature > 35 ? 'detail-value alert' : 'detail-value';
    document.getElementById('popupSOC').textContent = `${battery.soc}%`;
    document.getElementById('popupSOC').className = battery.soc < 20 ? 'detail-value alert' : 'detail-value';
    document.getElementById('popupSOH').textContent = `${battery.soh}%`;
    document.getElementById('popupSOH').className = battery.soh < 80 ? 'detail-value alert' : 'detail-value';
    document.getElementById('popupCycles').textContent = battery.cycles;
    document.getElementById('popupDoD').textContent = `${battery.dod}%`;
    document.getElementById('popupResistance').textContent = `${battery.internal_resistance}mΩ`;
    
    document.getElementById('batteryPopup').classList.add('active');
}

// 배터리 팝업 닫기
function closeBatteryPopup() {
    document.getElementById('batteryPopup').classList.remove('active');
}

// 툴팁 표시
function showTooltip(e, battery) {
    const tooltip = document.getElementById('tooltip');
    tooltip.innerHTML = `
        ${battery.id}<br>
        전압: ${battery.voltage}V<br>
        온도: ${battery.temperature}°C<br>
        SOC: ${battery.soc}%
    `;
    tooltip.style.left = e.pageX + 10 + 'px';
    tooltip.style.top = e.pageY + 10 + 'px';
    tooltip.classList.add('active');
}

// 툴팁 숨기기
function hideTooltip() {
    document.getElementById('tooltip').classList.remove('active');
}

// 팝업 오버레이 클릭시 닫기
document.getElementById('batteryPopup').addEventListener('click', function(e) {
    if (e.target === this) {
        closeBatteryPopup();
    }
});

// 실시간 데이터 업데이트 시뮬레이션
function updateData() {
    essData.forEach((ess, index) => {
        // 에러 ESS는 상태 유지
        const hasError = errorESSIndices.includes(index);
        
        // 정상 범위 내에서 변동
        ess.voltage = (48.5 + Math.random() * 1).toFixed(1);
        ess.current = (100 + Math.random() * 50).toFixed(1);
        ess.temperature = hasError ? (45 + Math.random() * 5).toFixed(1) : (25 + Math.random() * 3).toFixed(1);
        ess.soc = Math.floor(75 + Math.random() * 15);
        ess.rte = (92 + Math.random() * 3).toFixed(1);
        ess.availability = hasError ? (94 + Math.random() * 2).toFixed(1) : (99.2 + Math.random() * 0.5).toFixed(1);
        ess.co2Reduction = (2.5 + Math.random() * 0.5).toFixed(2);
        ess.costSaving = Math.floor(150000 + Math.random() * 50000);
        ess.peakShaving = (85 + Math.random() * 10).toFixed(1);
        
        ess.batteries.forEach((battery, j) => {
            // 에러 배터리는 상태 유지
            const isErrorBattery = hasError && errorBatteries[index] && errorBatteries[index].includes(j);
            
            if (!isErrorBattery) {
                battery.voltage = (3.65 + Math.random() * 0.2).toFixed(2);
                battery.current = (20 + Math.random() * 10).toFixed(1);
                battery.temperature = (24 + Math.random() * 4).toFixed(1);
                battery.soc = Math.floor(75 + Math.random() * 15);
            }
        });
    });
}

// 초기화
renderESSGrid();
renderMinimap();

// 5초마다 데이터 업데이트
// setInterval(() => {
    updateData();
    if (document.getElementById('essGridView').style.display !== 'none') {
        renderESSGrid();
    }
// }, 5000);