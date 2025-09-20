class DataManager {
    constructor() {
        this.dbName = 'ArkGridCalculator';
        this.dbVersion = 1;
        this.db = null;
        this.stores = {
            GEMS: 'gems',
            GRIDS: 'grids', 
            SAVES: 'saves'
        };
        this.autoSaveEnabled = false; // 기본값 OFF
        this.autoSaveInterval = null;
    }

    // DB 초기화
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB 초기화 완료');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // 젬 스토어
                if (!db.objectStoreNames.contains(this.stores.GEMS)) {
                    db.createObjectStore(this.stores.GEMS, { keyPath: 'id' });
                }

                // 그리드 스토어  
                if (!db.objectStoreNames.contains(this.stores.GRIDS)) {
                    db.createObjectStore(this.stores.GRIDS, { keyPath: 'id' });
                }

                // 저장 파일 스토어
                if (!db.objectStoreNames.contains(this.stores.SAVES)) {
                    const saveStore = db.createObjectStore(this.stores.SAVES, { 
                        keyPath: 'filename'
                    });
                    saveStore.createIndex('date', 'saveDate', { unique: false });
                    saveStore.createIndex('version', 'version', { unique: false });
                }
            };
        });
    }

    // 자동 저장 시작 (10분마다)
    startAutoSave() {
        if (!this.autoSaveEnabled) return;
        
        this.autoSaveInterval = setInterval(async () => {
            try {
                await this.saveCurrentData();
                console.log('자동 저장 완료');
            } catch (error) {
                console.error('자동 저장 실패:', error);
            }
        }, 600000); // 10분 = 600초
    }

    // 자동 저장 중지
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    // 자동 저장 설정 토글
    toggleAutoSave() {
        this.autoSaveEnabled = !this.autoSaveEnabled;
        
        if (this.autoSaveEnabled) {
            this.startAutoSave();
            console.log('자동 저장 활성화');
        } else {
            this.stopAutoSave();
            console.log('자동 저장 비활성화');
        }
        
        localStorage.setItem('autoSaveEnabled', this.autoSaveEnabled.toString());
        updateAutoSaveIndicator();
    }

    // 설정 로드
    loadSettings() {
        const saved = localStorage.getItem('autoSaveEnabled');
        this.autoSaveEnabled = saved === 'true';
    }

    // 현재 데이터 저장
    async saveCurrentData() {
        try {
            await this.saveGems(gems);
            await this.saveGrids(grids);
        } catch (error) {
            console.error('현재 데이터 저장 실패:', error);
        }
    }

    // 젬 저장
    async saveGems(gems) {
        try {
            const transaction = this.db.transaction([this.stores.GEMS], 'readwrite');
            const store = transaction.objectStore(this.stores.GEMS);
            
            await store.clear();
            
            for (const gem of gems) {
                await store.add(gem);
            }
            
            console.log('젬 저장:', gems.length + '개');
        } catch (error) {
            console.error('젬 저장 실패:', error);
        }
    }

    // 젬 로드
    async loadGems() {
        try {
            const transaction = this.db.transaction([this.stores.GEMS], 'readonly');
            const store = transaction.objectStore(this.stores.GEMS);
            
            return new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = () => {
                    const gems = request.result;
                    console.log('젬 로드:', gems.length + '개');
                    resolve(gems);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('젬 로드 실패:', error);
            return [];
        }
    }

    // 그리드 저장
    async saveGrids(grids) {
        try {
            const transaction = this.db.transaction([this.stores.GRIDS], 'readwrite');
            const store = transaction.objectStore(this.stores.GRIDS);
            
            await store.clear();
            
            for (const grid of grids) {
                await store.add(grid);
            }
            
            console.log('그리드 저장:', grids.length + '개');
        } catch (error) {
            console.error('그리드 저장 실패:', error);
        }
    }

    // 그리드 로드
    async loadGrids() {
        try {
            const transaction = this.db.transaction([this.stores.GRIDS], 'readonly');
            const store = transaction.objectStore(this.stores.GRIDS);
            
            return new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = () => {
                    const grids = request.result;
                    console.log('그리드 로드:', grids.length + '개');
                    resolve(grids);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('그리드 로드 실패:', error);
            return [];
        }
    }

    // 파일명 생성 (Save_날짜_V버전)
    generateFilename(version = null) {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
        
        if (version) {
            return `Save_${dateStr}_V${version}`;
        } else {
            return `Save_${dateStr}_${timeStr}`;
        }
    }

    // 간소화된 데이터 형식으로 변환
    simplifyData() {
        return {
            gems: gems.map(gem => ({
                id: gem.id,
                type: gem.type,
                subType: gem.subType,
                efficiency: gem.efficiency,
                point: gem.point
            })),
            grids: grids.map(grid => ({
                id: grid.id,
                type: grid.type,
                subType: grid.subType,
                points: grid.points
            })),
            counters: {
                gemId: gemIdCounter,
                gridId: gridIdCounter
            }
        };
    }

    // 간소화된 데이터를 전체 데이터로 복원
    expandData(simpleData) {
        const basePowers = {
            'stable': 8, 'solid': 9, 'immutable': 10,
            'erosion': 8, 'distortion': 9, 'collapse': 10
        };

        return {
            gems: simpleData.gems.map(gem => ({
                ...gem,
                baseWillpower: basePowers[gem.subType] || 8,
                need: Math.max(1, (basePowers[gem.subType] || 8) - gem.efficiency)
            })),
            grids: simpleData.grids,
            gemIdCounter: simpleData.counters.gemId,
            gridIdCounter: simpleData.counters.gridId
        };
    }

    // 저장 파일 생성
    async createSaveFile(filename = null, version = null) {
        try {
            const saveFilename = filename || this.generateFilename(version);
            const transaction = this.db.transaction([this.stores.SAVES], 'readwrite');
            const store = transaction.objectStore(this.stores.SAVES);
            
            const saveData = {
                filename: saveFilename,
                saveDate: new Date().toISOString(),
                version: version || 'auto',
                data: this.simplifyData()
            };
            
            return new Promise((resolve, reject) => {
                const request = store.put(saveData);
                request.onsuccess = () => {
                    console.log('저장 파일 생성:', saveFilename);
                    resolve(saveFilename);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('저장 파일 생성 실패:', error);
            throw error;
        }
    }

    // 저장 파일 목록 가져오기
    async getSaveFileList() {
        try {
            const transaction = this.db.transaction([this.stores.SAVES], 'readonly');
            const store = transaction.objectStore(this.stores.SAVES);
            
            return new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = () => {
                    const saves = request.result.map(save => ({
                        filename: save.filename,
                        date: new Date(save.saveDate).toLocaleString('ko-KR'),
                        version: save.version,
                        gemCount: save.data.gems.length,
                        gridCount: save.data.grids.length
                    })).sort((a, b) => new Date(b.date) - new Date(a.date));
                    resolve(saves);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('저장 파일 목록 로드 실패:', error);
            return [];
        }
    }

    // 저장 파일 불러오기
    async loadSaveFile(filename) {
        try {
            const transaction = this.db.transaction([this.stores.SAVES], 'readonly');
            const store = transaction.objectStore(this.stores.SAVES);
            
            return new Promise((resolve, reject) => {
                const request = store.get(filename);
                request.onsuccess = () => {
                    if (request.result) {
                        const expandedData = this.expandData(request.result.data);
                        
                        // 전역 변수에 데이터 복원
                        gems = expandedData.gems;
                        grids = expandedData.grids;
                        gemIdCounter = expandedData.gemIdCounter;
                        gridIdCounter = expandedData.gridIdCounter;
                        
                        // 화면 업데이트
                        updateGemList();
                        updateGridList();
                        
                        // 현재 데이터로 DB 업데이트
                        this.saveCurrentData();
                        
                        console.log('저장 파일 로드:', filename);
                        resolve(request.result);
                    } else {
                        reject(new Error('저장 파일을 찾을 수 없습니다.'));
                    }
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('저장 파일 로드 실패:', error);
            throw error;
        }
    }

    // 저장 파일 삭제
    async deleteSaveFile(filename) {
        try {
            const transaction = this.db.transaction([this.stores.SAVES], 'readwrite');
            const store = transaction.objectStore(this.stores.SAVES);
            
            return new Promise((resolve, reject) => {
                const request = store.delete(filename);
                request.onsuccess = () => {
                    console.log('저장 파일 삭제:', filename);
                    resolve();
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('저장 파일 삭제 실패:', error);
        }
    }

    // JSON 파일로 내보내기 (외부 백업용)
    exportToJSON(filename = null) {
        const saveFilename = filename || this.generateFilename();
        const exportData = {
            filename: saveFilename,
            exportDate: new Date().toISOString(),
            version: '1.0',
            ...this.simplifyData()
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `${saveFilename}.json`;
        link.click();
        
        console.log('JSON 내보내기:', saveFilename);
    }

    // JSON 파일에서 가져오기
    importFromJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const importData = JSON.parse(e.target.result);
                    
                    // 데이터 구조 확인 및 변환
                    let simpleData;
                    if (importData.gems && importData.grids) {
                        if (importData.counters) {
                            simpleData = importData;
                        } else {
                            simpleData = {
                                gems: importData.gems.map(gem => ({
                                    id: gem.id,
                                    type: gem.type,
                                    subType: gem.subType,
                                    efficiency: gem.efficiency,
                                    point: gem.point
                                })),
                                grids: importData.grids.map(grid => ({
                                    id: grid.id,
                                    type: grid.type,
                                    subType: grid.subType,
                                    points: grid.points
                                })),
                                counters: {
                                    gemId: importData.gemIdCounter || Math.max(...importData.gems.map(g => g.id)) + 1,
                                    gridId: importData.gridIdCounter || Math.max(...importData.grids.map(g => g.id)) + 1
                                }
                            };
                        }
                    } else {
                        throw new Error('잘못된 파일 형식입니다.');
                    }
                    
                    const expandedData = this.expandData(simpleData);
                    
                    gems = expandedData.gems;
                    grids = expandedData.grids;
                    gemIdCounter = expandedData.gemIdCounter;
                    gridIdCounter = expandedData.gridIdCounter;
                    
                    updateGemList();
                    updateGridList();
                    
                    await this.saveCurrentData();
                    
                    console.log('JSON 가져오기 완료');
                    resolve(importData);
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }

    // 모든 데이터 삭제
    async clearAllData() {
        try {
            const stores = Object.values(this.stores);
            const transaction = this.db.transaction(stores, 'readwrite');
            
            for (const storeName of stores) {
                const store = transaction.objectStore(storeName);
                await store.clear();
            }
            
            console.log('모든 데이터 삭제 완료');
        } catch (error) {
            console.error('데이터 삭제 실패:', error);
        }
    }

    // 정리 (앱 종료 시 호출)
    cleanup() {
        this.stopAutoSave();
        if (this.db) {
            this.db.close();
        }
    }
}

// 전역 인스턴스
const dataManager = new DataManager();

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    dataManager.cleanup();
});
