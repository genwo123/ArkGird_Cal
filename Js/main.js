// Global variables
let gems = [];
let grids = [];
let gemIdCounter = 1;
let gridIdCounter = 1;

// Page initialization
window.onload = async function() {
    updateGemSubTypes();
    
    try {
        // IndexedDB 초기화
        await dataManager.init();
        
        // 자동저장 설정 로드
        dataManager.loadSettings();
        updateAutoSaveIndicator();
        
        // 저장된 데이터 로드
        const savedGems = await dataManager.loadGems();
        const savedGrids = await dataManager.loadGrids();
        
        if (savedGems.length > 0) {
            gems = savedGems;
            // ID 카운터 업데이트
            if (gems.length > 0) {
                gemIdCounter = Math.max(...gems.map(g => g.id)) + 1;
            }
            updateGemList();
            console.log('저장된 젬 복원:', gems.length + '개');
        }
        
        if (savedGrids.length > 0) {
            grids = savedGrids;
            // ID 카운터 업데이트
            if (grids.length > 0) {
                gridIdCounter = Math.max(...grids.map(g => g.id)) + 1;
            }
            updateGridList();
            console.log('저장된 그리드 복원:', grids.length + '개');
        }
        
        // 저장된 데이터가 없을 때만 예제 데이터 추가
        if (gems.length === 0 && grids.length === 0) {
            addExampleData();
        }
        
    } catch (error) {
        console.error('데이터 로드 실패:', error);
        // 실패 시 예제 데이터 추가
        addExampleData();
    }
    
    // Update gem subtypes when gem type changes
    document.getElementById('gemType').addEventListener('change', updateGemSubTypes);
};

// Add initial example data
function addExampleData() {
    // Add example grids
    const exampleGrids = [
        {type: 'order', subType: 'sun', points: 15},
        {type: 'order', subType: 'moon', points: 17},
        {type: 'chaos', subType: 'star', points: 15},
    ];

    exampleGrids.forEach(example => {
        grids.push({
            id: gridIdCounter++,
            type: example.type,
            subType: example.subType,
            points: example.points
        });
    });

    // Add example gems
    const examples = [
        {type: 'order', subType: 'stable', efficiency: 5, point: 5},
        {type: 'order', subType: 'solid', efficiency: 5, point: 4},
        {type: 'order', subType: 'immutable', efficiency: 5, point: 5},
        {type: 'order', subType: 'stable', efficiency: 2, point: 5},
        {type: 'order', subType: 'solid', efficiency: 5, point: 4},
        {type: 'order', subType: 'stable', efficiency: 4, point: 3},
        {type: 'order', subType: 'immutable', efficiency: 3, point: 4},
        {type: 'order', subType: 'solid', efficiency: 4, point: 5},
        {type: 'chaos', subType: 'erosion', efficiency: 5, point: 5},
        {type: 'chaos', subType: 'distortion', efficiency: 5, point: 4},
        {type: 'chaos', subType: 'collapse', efficiency: 5, point: 5},
        {type: 'chaos', subType: 'erosion', efficiency: 3, point: 4},
    ];

    examples.forEach(example => {
        // Calculate base willpower locally
        const basePowers = {
            'stable': 8, 'solid': 9, 'immutable': 10,
            'erosion': 8, 'distortion': 9, 'collapse': 10
        };
        const baseWillpower = basePowers[example.subType] || 8;
        const actualNeed = Math.max(1, baseWillpower - example.efficiency);
        
        gems.push({
            id: gemIdCounter++,
            type: example.type,
            subType: example.subType,
            baseWillpower: baseWillpower,
            efficiency: example.efficiency,
            need: actualNeed,
            point: example.point
        });
    });

    updateGridList();
    updateGemList();
    
    // 예제 데이터 저장
    if (dataManager.db) {
        dataManager.saveGrids(grids);
        dataManager.saveGems(gems);
    }
}

// 자동저장 토글 함수
function toggleAutoSave() {
    dataManager.toggleAutoSave();
}

// 자동저장 UI 업데이트 함수
function updateAutoSaveIndicator() {
    const dot = document.getElementById('autoSaveDot');
    const text = document.getElementById('autoSaveText');
    const indicator = document.querySelector('.auto-save-indicator');
    
    if (dataManager.autoSaveEnabled) {
        dot.classList.remove('disabled');
        text.textContent = '자동저장 ON';
        indicator.classList.remove('disabled');
    } else {
        dot.classList.add('disabled');
        text.textContent = '자동저장 OFF';
        indicator.classList.add('disabled');
    }
}

// 헤더 데이터 관리 함수들
async function quickSave() {
    try {
        const versionInput = document.getElementById('saveVersion');
        const version = versionInput.value.trim() || null;
        
        const filename = await dataManager.createSaveFile(null, version);
        
        // 성공 메시지 표시
        showNotification(`저장 완료: ${filename}`, 'success');
        
        // 버전 입력창 초기화
        versionInput.value = '';
        
    } catch (error) {
        console.error('저장 실패:', error);
        showNotification('저장 실패: ' + error.message, 'error');
    }
}

async function showLoadModal() {
    try {
        const saves = await dataManager.getSaveFileList();
        const modal = document.getElementById('loadModal');
        const saveFileList = document.getElementById('saveFileList');
        
        if (saves.length === 0) {
            saveFileList.innerHTML = '<div style="text-align: center; padding: 20px; color: #6c757d;">저장된 파일이 없습니다.</div>';
        } else {
            saveFileList.innerHTML = saves.map(save => `
                <div class="save-file-item" onclick="loadSaveFile('${save.filename}')">
                    <div class="save-file-name">${save.filename}</div>
                    <div class="save-file-info">
                        ${save.date} | 젬: ${save.gemCount}개, 그리드: ${save.gridCount}개 | ${save.version}
                        <button onclick="event.stopPropagation(); deleteSaveFile('${save.filename}')" 
                                style="float: right; color: #dc3545; background: none; border: none; cursor: pointer;">삭제</button>
                    </div>
                </div>
            `).join('');
        }
        
        modal.style.display = 'flex';
    } catch (error) {
        console.error('저장 목록 로드 실패:', error);
        showNotification('저장 목록 로드 실패: ' + error.message, 'error');
    }
}

function hideLoadModal() {
    document.getElementById('loadModal').style.display = 'none';
}

async function loadSaveFile(filename) {
    try {
        await dataManager.loadSaveFile(filename);
        hideLoadModal();
        showNotification(`불러오기 완료: ${filename}`, 'success');
    } catch (error) {
        console.error('불러오기 실패:', error);
        showNotification('불러오기 실패: ' + error.message, 'error');
    }
}

async function deleteSaveFile(filename) {
    if (confirm(`정말로 "${filename}"을 삭제하시겠습니까?`)) {
        try {
            await dataManager.deleteSaveFile(filename);
            showLoadModal(); // 목록 새로고침
            showNotification(`삭제 완료: ${filename}`, 'success');
        } catch (error) {
            console.error('삭제 실패:', error);
            showNotification('삭제 실패: ' + error.message, 'error');
        }
    }
}

async function handleImport(event) {
    const file = event.target.files[0];
    if (file) {
        try {
            await dataManager.importFromJSON(file);
            showNotification('가져오기 완료!', 'success');
            // 입력 초기화
            event.target.value = '';
        } catch (error) {
            console.error('가져오기 실패:', error);
            showNotification('가져오기 실패: ' + error.message, 'error');
        }
    }
}

// 알림 표시 함수
function showNotification(message, type = 'info') {
    // 기존 알림 제거
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 새 알림 생성
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 스타일 적용
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: 'bold',
        zIndex: '10000',
        animation: 'slideIn 0.3s ease-out',
        maxWidth: '300px'
    });
    
    // 타입별 색상
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8'
    };
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // 3초 후 자동 제거
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 드롭다운 메뉴 관리 함수들
function toggleSaveMenu() {
    const menu = document.getElementById('saveMenu');
    menu.classList.toggle('show');
}

function hideSaveMenu() {
    const menu = document.getElementById('saveMenu');
    menu.classList.remove('show');
}

// 메뉴 외부 클릭 시 닫기
document.addEventListener('click', function(event) {
    const saveDropdown = document.querySelector('.save-dropdown');
    if (saveDropdown && !saveDropdown.contains(event.target)) {
        hideSaveMenu();
    }
});

// CSS 애니메이션 추가
const notificationCSS = `
@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
@keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = notificationCSS;
document.head.appendChild(styleSheet);