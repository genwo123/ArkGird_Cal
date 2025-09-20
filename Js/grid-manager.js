// Grid management functions

function addGrid() {
    const type = document.getElementById('gridType').value;
    const subType = document.getElementById('gridSubType').value;
    const points = parseInt(document.getElementById('gridGrade').value);

    const grid = {
        id: gridIdCounter++,
        type: type,
        subType: subType,
        points: points
    };

    grids.push(grid);
    console.log('그리드 추가됨:', grid);
    console.log('현재 그리드 배열:', grids);
    updateGridList();
    
    // IndexedDB 자동 저장
    if (dataManager.db) {
        dataManager.saveGrids(grids);
    }
}

function removeGrid(id) {
    grids = grids.filter(grid => grid.id !== id);
    console.log('그리드 삭제됨, 남은 그리드:', grids.length);
    updateGridList();
    
    // IndexedDB 자동 저장
    if (dataManager.db) {
        dataManager.saveGrids(grids);
    }
}

// 그리드 등급에 따른 CSS 클래스 반환
function getGridGradeClass(points) {
    switch(points) {
        case 9: return 'grid-hero';      // 영웅 - 보라
        case 12: return 'grid-legend';   // 전설 - 노랑
        case 15: return 'grid-relic';    // 유물 - 주황
        case 17: return 'grid-ancient';  // 고대 - 흰색
        default: return 'grid-default';
    }
}

function updateGridList() {
    const gridList = document.getElementById('gridList');
    
    if (!gridList) {
        console.error('gridList 요소를 찾을 수 없습니다!');
        return;
    }
    
    gridList.innerHTML = '';
    console.log('그리드 목록 업데이트:', grids.length);

    if (grids.length === 0) {
        console.log('표시할 그리드가 없습니다.');
        return;
    }

    grids.forEach(grid => {
        const gridItem = document.createElement('div');
        gridItem.className = 'gem-item';
        
        const gridTypeName = grid.type === 'order' ? '질서' : '혼돈';
        const gridSubTypeName = getGridSubTypeName(grid.subType);
        const gradeName = getGradeName(grid.points);
        const gradeClass = getGridGradeClass(grid.points);
        
        gridItem.innerHTML = `
            <div class="gem-info">
                <div class="gem-type ${grid.type}-type ${gradeClass}">
                    ${gridTypeName} - ${gridSubTypeName} 그리드
                </div>
                <div class="gem-stats">${gradeName} (${grid.points}포인트)</div>
            </div>
            <div class="gem-actions">
                <button class="btn btn-danger" onclick="removeGrid(${grid.id})">삭제</button>
            </div>
        `;
        
        console.log('그리드 아이템 생성됨:', gridItem);
        gridList.appendChild(gridItem);
    });
    
    console.log('그리드 리스트 최종 HTML:', gridList.innerHTML);
}

function clearAllGrids() {
    if (confirm('모든 그리드를 삭제하시겠습니까?')) {
        grids.length = 0;
        gridIdCounter = 1;
        updateGridList();
        
        // IndexedDB 자동 저장
        if (dataManager.db) {
            dataManager.saveGrids(grids);
        }
        
        const resultSection = document.getElementById('resultSection');
        if (resultSection) {
            resultSection.style.display = 'none';
        }
        
        console.log('그리드 초기화 완료:', grids.length);
    }
}