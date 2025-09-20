// Global variables
let gems = [];
let grids = [];
let gemIdCounter = 1;
let gridIdCounter = 1;

// Page initialization
window.onload = function() {
    updateGemSubTypes();
    // Load example data only once
    if (gems.length === 0 && grids.length === 0) {
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
}