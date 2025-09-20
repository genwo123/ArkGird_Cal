// 결과 표시 함수

function displayOptimalResults(results) {
    const validResults = results.filter(result => result.combination.length > 0);
    const totalPoints = validResults.reduce((sum, result) => sum + result.totalPoint, 0);
    
    const usedGemIds = new Set();
    validResults.forEach(result => {
        result.combination.forEach(gem => usedGemIds.add(gem.id));
    });
    
    const unusedGems = gems.filter(gem => !usedGemIds.has(gem.id));
    
    let html = `
        <div class="total-points">📊 전체 총합: ${totalPoints}포인트</div>
        
        <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
            <h3 style="color: #fff; margin-bottom: 20px; text-align: center;">🔮 그리드별 젬 배치표</h3>
            
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden;">
                    <thead>
                        <tr style="background: rgba(255,255,255,0.1);">
    `;

    // 테이블 헤더 생성
    results.forEach(result => {
        const gridTypeName = result.grid.type === 'order' ? '질서' : '혼돈';
        const gridSubTypeName = getGridSubTypeName(result.grid.subType);
        const gradeName = getGradeName(result.grid.points);
        const typeClass = result.grid.type === 'order' ? 'color: #ffd700;' : 'color: #ff6b6b;';
        
        html += `
            <th style="padding: 15px; text-align: center; border: 1px solid rgba(255,255,255,0.2); ${typeClass}">
                <div style="font-size: 16px; font-weight: bold;">${gridTypeName} ${gridSubTypeName}</div>
                <div style="font-size: 12px; opacity: 0.8;">${gradeName} (${result.grid.points}포인트)</div>
                ${result.error ? `<div style="color: #ff6b6b; font-size: 11px; margin-top: 5px;">${result.error}</div>` : ''}
            </th>
        `;
    });

    html += `
                        </tr>
                    </thead>
                    <tbody>
    `;

    // 젬 행들 생성 (최대 4개)
    for (let i = 0; i < 4; i++) {
        html += '<tr>';
        results.forEach(result => {
            if (result.error) {
                html += `<td style="padding: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.2); color: #999; font-style: italic;">-</td>`;
            } else {
                const gem = result.combination[i];
                if (gem) {
                    html += `
                        <td style="padding: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.2); color: #fff;">
                            <div style="font-weight: bold; margin-bottom: 3px;">${getSubTypeName(gem.subType)}</div>
                            <div style="font-size: 12px; opacity: 0.8;">필${gem.need} 포${gem.point}</div>
                        </td>
                    `;
                } else {
                    html += `<td style="padding: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.2); color: #666; font-style: italic;">빈 슬롯</td>`;
                }
            }
        });
        html += '</tr>';
    }

    // 포인트 합계 행
    html += `
                        <tr style="background: rgba(255,255,255,0.1); font-weight: bold;">
    `;
    results.forEach(result => {
        if (result.error) {
            html += `
                <td style="padding: 15px; text-align: center; border: 1px solid rgba(255,255,255,0.2); color: #ff6b6b; font-size: 14px;">
                    0포인트
                </td>
            `;
        } else {
            html += `
                <td style="padding: 15px; text-align: center; border: 1px solid rgba(255,255,255,0.2); color: #fff; font-size: 16px;">
                    총 ${result.totalPoint}포인트<br>
                    <span style="font-size: 12px; opacity: 0.8;">(${result.gemCount || 0}/4 젬)</span>
                </td>
            `;
        }
    });
    html += `
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // 사용되지 않은 젬들 표시
    if (unusedGems.length > 0) {
        html += `
            <div style="background: rgba(255,255,255,0.05); border-radius: 10px; padding: 20px; margin-top: 20px;">
                <h4 style="color: #fff; margin-bottom: 15px;">🔴 사용되지 않은 젬들 (${unusedGems.length}개)</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
        `;
        
        unusedGems.forEach(gem => {
            const typeName = gem.type === 'order' ? '질서' : '혼돈';
            const typeColor = gem.type === 'order' ? '#ffd700' : '#ff6b6b';
            
            html += `
                <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; border-left: 3px solid ${typeColor};">
                    <div style="color: ${typeColor}; font-weight: bold; font-size: 12px;">${typeName}</div>
                    <div style="color: #fff; font-size: 14px;">${getSubTypeName(gem.subType)} (필${gem.need} 포${gem.point})</div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }

    document.getElementById('resultSection').innerHTML = html;
}