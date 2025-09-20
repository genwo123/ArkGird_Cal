// 젬 관련 함수들

function updateGemSubTypes() {
    const gemType = document.getElementById('gemType');
    const gemSubType = document.getElementById('gemSubType');
    
    if (!gemType || !gemSubType) {
        console.error('젬 타입 요소를 찾을 수 없습니다!');
        return;
    }
    
    gemSubType.innerHTML = '';
    
    if (gemType.value === 'order') {
        gemSubType.innerHTML = `
            <option value="stable">안정 (기본 8)</option>
            <option value="solid">견고 (기본 9)</option>
            <option value="immutable">불변 (기본 10)</option>
        `;
    } else {
        gemSubType.innerHTML = `
            <option value="erosion">침식 (기본 8)</option>
            <option value="distortion">왜곡 (기본 9)</option>
            <option value="collapse">붕괴 (기본 10)</option>
        `;
    }
}

function getBaseWillpower(subType) {
    const basePowers = {
        'stable': 8, 'solid': 9, 'immutable': 10,
        'erosion': 8, 'distortion': 9, 'collapse': 10
    };
    return basePowers[subType] || 8;
}

function addGem() {
    const type = document.getElementById('gemType').value;
    const subType = document.getElementById('gemSubType').value;
    const efficiency = parseInt(document.getElementById('gemEfficiency').value);
    const point = parseInt(document.getElementById('gemPoint').value);

    if (efficiency < 0 || point <= 0) {
        alert('의지력 효율은 0 이상, 포인트는 1 이상이어야 합니다.');
        return;
    }

    const baseWillpower = getBaseWillpower(subType);
    const actualNeed = Math.max(1, baseWillpower - efficiency);

    const gem = {
        id: gemIdCounter++,
        type: type,
        subType: subType,
        baseWillpower: baseWillpower,
        efficiency: efficiency,
        need: actualNeed,
        point: point
    };

    gems.push(gem);
    updateGemList();
    
    document.getElementById('gemEfficiency').value = 5;
    document.getElementById('gemPoint').value = 5;
}

function removeGem(id) {
    gems = gems.filter(gem => gem.id !== id);
    updateGemList();
}

function updateGemList() {
    const gemList = document.getElementById('gemList');
    gemList.innerHTML = '';

    console.log('젬 목록 업데이트:', gems.length);

    gems.forEach(gem => {
        const gemItem = document.createElement('div');
        gemItem.className = 'gem-item';
        
        gemItem.innerHTML = `
            <div class="gem-info">
                <div class="gem-type ${gem.type}-type">
                    ${gem.type === 'order' ? '질서' : '혼돈'} - ${getSubTypeName(gem.subType)}
                </div>
                <div class="gem-stats">기본 ${gem.baseWillpower} - 효율 ${gem.efficiency} = 필요 ${gem.need} | 포인트: ${gem.point}</div>
            </div>
            <div class="gem-actions">
                <button class="btn btn-danger" onclick="removeGem(${gem.id})">삭제</button>
            </div>
        `;
        
        gemList.appendChild(gemItem);
    });
}

function clearAllGems() {
    if (confirm('모든 젬을 삭제하시겠습니까?')) {
        gems.length = 0;
        gemIdCounter = 1;
        updateGemList();
        
        const resultSection = document.getElementById('resultSection');
        resultSection.style.display = 'none';
        
        console.log('젬 초기화 완료:', gems.length);
    }
}