// 유틸리티 함수들

function getGridSubTypeName(subType) {
    const names = {
        'sun': '해',
        'moon': '달',
        'star': '별'
    };
    return names[subType] || subType;
}

function getGradeName(points) {
    const grades = {
        9: '영웅',
        12: '전설',
        15: '유물',
        17: '고대'
    };
    return grades[points] || '알 수 없음';
}

function getSubTypeName(subType) {
    const names = {
        'stable': '안정',
        'solid': '견고', 
        'immutable': '불변',
        'erosion': '침식',
        'distortion': '왜곡',
        'collapse': '붕괴'
    };
    return names[subType] || subType;
}

// 조합 계산 함수들
function getCombinations(arr, r) {
    if (r === 1) return arr.map(item => [item]);
    
    const result = [];
    arr.forEach((item, index) => {
        const rest = arr.slice(index + 1);
        const combinations = getCombinations(rest, r - 1);
        combinations.forEach(combination => {
            result.push([item, ...combination]);
        });
    });
    return result;
}

function calculateCombination(combination) {
    const totalNeed = combination.reduce((sum, gem) => sum + gem.need, 0);
    const totalPoint = combination.reduce((sum, gem) => sum + gem.point, 0);
    return { combination, totalNeed, totalPoint };
}