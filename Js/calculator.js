// 최적화 계산 함수

function calculateOptimal() {
    console.log('계산 시작 - 그리드:', grids.length, '젬:', gems.length);
    
    if (grids.length === 0) {
        alert('최소 하나의 그리드를 추가해주세요.');
        return;
    }

    if (gems.length === 0) {
        alert('최소 1개의 젬이 필요합니다.');
        return;
    }

    const resultSection = document.getElementById('resultSection');
    resultSection.style.display = 'block';
    resultSection.innerHTML = '<div class="loading">계산 중...</div>';

    setTimeout(() => {
        try {
            const results = [];
            let usedGems = new Set();

            console.log('사용 가능한 젬들:', gems.map(g => `${g.type}-${g.subType}(필${g.need}포${g.point})`));

            grids.forEach((grid, index) => {
                const compatibleGems = gems.filter(gem => 
                    gem.type === grid.type && !usedGems.has(gem.id)
                );

                console.log(`그리드 ${index + 1} (${grid.type} ${getGridSubTypeName(grid.subType)}):`, 
                           `호환 젬 ${compatibleGems.length}개`);

                if (compatibleGems.length > 0) {
                    let bestCombo = null;
                    
                    for (let gemCount = Math.min(4, compatibleGems.length); gemCount >= 1; gemCount--) {
                        console.log(`${gemCount}개 조합 시도 중...`);
                        
                        if (gemCount === 1) {
                            const validGems = compatibleGems.filter(gem => gem.need <= grid.points);
                            if (validGems.length > 0) {
                                const bestGem = validGems.sort((a, b) => b.point - a.point)[0];
                                bestCombo = {
                                    combination: [bestGem],
                                    totalNeed: bestGem.need,
                                    totalPoint: bestGem.point,
                                    gemCount: 1
                                };
                                console.log(`1개 젬 성공:`, bestGem);
                                break;
                            }
                        } else {
                            const combinations = getCombinations(compatibleGems, gemCount);
                            console.log(`${gemCount}개 조합 총 ${combinations.length}개 확인 중...`);
                            
                            const validCombinations = [];
                            for (let combo of combinations) {
                                const totalNeed = combo.reduce((sum, gem) => sum + gem.need, 0);
                                const totalPoint = combo.reduce((sum, gem) => sum + gem.point, 0);
                                
                                if (totalNeed <= grid.points) {
                                    validCombinations.push({
                                        combination: combo,
                                        totalNeed: totalNeed,
                                        totalPoint: totalPoint,
                                        gemCount: gemCount
                                    });
                                }
                            }
                            
                            if (validCombinations.length > 0) {
                                bestCombo = validCombinations.sort((a, b) => b.totalPoint - a.totalPoint)[0];
                                console.log(`${gemCount}개 조합 성공:`, bestCombo.totalPoint, '포인트');
                                break;
                            }
                        }
                    }

                    if (bestCombo) {
                        results.push({
                            grid: grid,
                            combination: bestCombo.combination,
                            totalNeed: bestCombo.totalNeed,
                            totalPoint: bestCombo.totalPoint,
                            gridIndex: index + 1,
                            gemCount: bestCombo.gemCount
                        });

                        bestCombo.combination.forEach(gem => {
                            usedGems.add(gem.id);
                            console.log(`젬 ${gem.id} 사용됨`);
                        });
                    } else {
                        console.log('유효한 조합 없음 - 의지력 부족');
                        results.push({
                            grid: grid,
                            combination: [],
                            totalNeed: 0,
                            totalPoint: 0,
                            gridIndex: index + 1,
                            error: '의지력 부족',
                            gemCount: 0
                        });
                    }
                } else {
                    console.log('호환되는 젬 없음');
                    results.push({
                        grid: grid,
                        combination: [],
                        totalNeed: 0,
                        totalPoint: 0,
                        gridIndex: index + 1,
                        error: '젬 부족',
                        gemCount: 0
                    });
                }
            });

            console.log('최종 결과:', results);
            displayOptimalResults(results);
        } catch (error) {
            console.error('계산 오류:', error);
            resultSection.innerHTML = '<div class="no-result">계산 중 오류가 발생했습니다.</div>';
        }
    }, 100);
}