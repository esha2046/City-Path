// Global variables
let currentAlgorithm = '';
let simulationInterval = null;
let simulationStep = 0;
let dpMatrix = [];
let seq1 = '', seq2 = '';
let scores = { match: 2, mismatch: -1, gap: -2 };

// Tab Management
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`${tabName}-tab`).classList.add('active');
    document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');
}

// Input validation and processing
function getInputs() {
    seq1 = document.getElementById('seq1').value.toUpperCase().trim();
    seq2 = document.getElementById('seq2').value.toUpperCase().trim();
    scores.match = parseInt(document.getElementById('match').value);
    scores.mismatch = parseInt(document.getElementById('mismatch').value);
    scores.gap = parseInt(document.getElementById('gap').value);
    
    if (!seq1 || !seq2 || !/^[ATGC]+$/.test(seq1) || !/^[ATGC]+$/.test(seq2)) {
        alert('Please enter valid DNA sequences (A, T, G, C only)');
        return false;
    }
    return true;
}

// Needleman-Wunsch Algorithm
function needlemanWunsch() {
    const m = seq1.length + 1;
    const n = seq2.length + 1;
    dpMatrix = Array(m).fill().map(() => Array(n).fill(0));
    
    // Initialize first row and column
    for (let i = 0; i < m; i++) dpMatrix[i][0] = i * scores.gap;
    for (let j = 0; j < n; j++) dpMatrix[0][j] = j * scores.gap;
    
    // Fill matrix
    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            const match = dpMatrix[i-1][j-1] + (seq1[i-1] === seq2[j-1] ? scores.match : scores.mismatch);
            const del = dpMatrix[i-1][j] + scores.gap;
            const ins = dpMatrix[i][j-1] + scores.gap;
            dpMatrix[i][j] = Math.max(match, del, ins);
        }
    }
    
    return traceback(m-1, n-1, 'needleman');
}

// Smith-Waterman Algorithm
function smithWaterman() {
    const m = seq1.length + 1;
    const n = seq2.length + 1;
    dpMatrix = Array(m).fill().map(() => Array(n).fill(0));
    
    let maxScore = 0;
    let maxI = 0, maxJ = 0;
    
    // Fill matrix (no negative values)
    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            const match = dpMatrix[i-1][j-1] + (seq1[i-1] === seq2[j-1] ? scores.match : scores.mismatch);
            const del = dpMatrix[i-1][j] + scores.gap;
            const ins = dpMatrix[i][j-1] + scores.gap;
            
            dpMatrix[i][j] = Math.max(0, match, del, ins);
            
            if (dpMatrix[i][j] > maxScore) {
                maxScore = dpMatrix[i][j];
                maxI = i;
                maxJ = j;
            }
        }
    }
    
    return traceback(maxI, maxJ, 'smith');
}

// Traceback function
function traceback(startI, startJ, algorithm) {
    const alignment1 = [];
    const alignment2 = [];
    let i = startI, j = startJ;
    
    while (i > 0 || j > 0) {
        if (algorithm === 'smith' && dpMatrix[i][j] === 0) break;
        
        const current = dpMatrix[i][j];
        const diagonal = i > 0 && j > 0 ? dpMatrix[i-1][j-1] : -Infinity;
        const up = i > 0 ? dpMatrix[i-1][j] : -Infinity;
        const left = j > 0 ? dpMatrix[i][j-1] : -Infinity;
        
        if (i > 0 && j > 0 && current === diagonal + (seq1[i-1] === seq2[j-1] ? scores.match : scores.mismatch)) {
            alignment1.unshift(seq1[i-1]);
            alignment2.unshift(seq2[j-1]);
            i--; j--;
        } else if (i > 0 && current === up + scores.gap) {
            alignment1.unshift(seq1[i-1]);
            alignment2.unshift('-');
            i--;
        } else if (j > 0) {
            alignment1.unshift('-');
            alignment2.unshift(seq2[j-1]);
            j--;
        } else break;
    }
    
    return { alignment1, alignment2, score: dpMatrix[startI][startJ] };
}

// Run alignment
function runAlignment(algorithm) {
    if (!getInputs()) return;
    
    currentAlgorithm = algorithm;
    const result = algorithm === 'needleman' ? needlemanWunsch() : smithWaterman();
    
    displayResults(result, algorithm);
    document.getElementById('results').classList.remove('hidden');
}

// Display results
function displayResults(result, algorithm) {
    const { alignment1, alignment2, score } = result;
    
    // Algorithm info
    const algoInfo = {
        needleman: {
            title: '🧬 Needleman-Wunsch Algorithm (Global Alignment)',
            description: 'Finds the optimal global alignment between two sequences, considering the entire length of both sequences.'
        },
        smith: {
            title: '🔬 Smith-Waterman Algorithm (Local Alignment)',
            description: 'Finds the optimal local alignment by identifying the most similar subsequences within the two sequences.'
        }
    };
    
    document.getElementById('algo-title').textContent = algoInfo[algorithm].title;
    document.getElementById('algo-description').textContent = algoInfo[algorithm].description;
    
    // Matrix display
    displayMatrix();
    
    // Alignment display
    displayAlignment(alignment1, alignment2);
    
    // Statistics
    displayStats(alignment1, alignment2, score);
}

// Display matrix
function displayMatrix() {
    let html = '<table>';
    
    // Header row
    html += '<tr><th></th><th>ε</th>';
    for (let char of seq2) html += `<th>${char}</th>`;
    html += '</tr>';
    
    // Data rows
    for (let i = 0; i < dpMatrix.length; i++) {
        html += '<tr>';
        html += i === 0 ? '<th>ε</th>' : `<th>${seq1[i-1]}</th>`;
        
        for (let j = 0; j < dpMatrix[i].length; j++) {
            const value = dpMatrix[i][j];
            let className = '';
            
            if (currentAlgorithm === 'smith' && value === Math.max(...dpMatrix.flat())) {
                className = 'max-cell';
            }
            
            html += `<td class="${className}">${value}</td>`;
        }
        html += '</tr>';
    }
    
    html += '</table>';
    document.getElementById('matrix-display').innerHTML = html;
}

// Display alignment
function displayAlignment(alignment1, alignment2) {
    let html1 = '', html2 = '', matches = '';
    
    for (let i = 0; i < alignment1.length; i++) {
        const char1 = alignment1[i];
        const char2 = alignment2[i];
        
        if (char1 === '-' || char2 === '-') {
            html1 += `<span class="gap">${char1}</span>`;
            html2 += `<span class="gap">${char2}</span>`;
            matches += ' ';
        } else if (char1 === char2) {
            html1 += `<span class="match">${char1}</span>`;
            html2 += `<span class="match">${char2}</span>`;
            matches += '|';
        } else {
            html1 += `<span class="mismatch">${char1}</span>`;
            html2 += `<span class="mismatch">${char2}</span>`;
            matches += ' ';
        }
    }
    
    document.getElementById('alignment-display').innerHTML = `
        <div>Seq1: ${html1}</div>
        <div>      ${matches}</div>
        <div>Seq2: ${html2}</div>
        <div style="margin-top: 15px;">
            <span class="match">■ Match</span> |
            <span class="mismatch">■ Mismatch</span> |
            <span class="gap">■ Gap</span>
        </div>
    `;
}

// Display statistics
function displayStats(alignment1, alignment2, score) {
    let matches = 0, gaps = 0;
    
    for (let i = 0; i < alignment1.length; i++) {
        if (alignment1[i] === alignment2[i]) matches++;
        if (alignment1[i] === '-' || alignment2[i] === '-') gaps++;
    }
    
    const identity = ((matches / alignment1.length) * 100).toFixed(1);
    
    document.getElementById('score-value').textContent = score;
    document.getElementById('matches-value').textContent = matches;
    document.getElementById('gaps-value').textContent = gaps;
    document.getElementById('identity-value').textContent = identity + '%';
}

// Simulation functions
function startSimulation() {
    if (!getInputs()) return;
    
    resetSimulation();
    simulationStep = 0;
    
    const speed = parseInt(document.getElementById('speed').value);
    simulationInterval = setInterval(simulateStep, 2100 - speed);
    
    // Initialize matrix for simulation
    const m = seq1.length + 1;
    const n = seq2.length + 1;
    dpMatrix = Array(m).fill().map(() => Array(n).fill(0));
    
    // Initialize first row and column
    for (let i = 0; i < m; i++) dpMatrix[i][0] = i * scores.gap;
    for (let j = 0; j < n; j++) dpMatrix[0][j] = j * scores.gap;
    
    displaySimulationMatrix();
}

function simulateStep() {
    const m = seq1.length + 1;
    const n = seq2.length + 1;
    const totalSteps = (m - 1) * (n - 1);
    
    if (simulationStep >= totalSteps) {
        pauseSimulation();
        return;
    }
    
    const i = Math.floor(simulationStep / (n - 1)) + 1;
    const j = (simulationStep % (n - 1)) + 1;
    
    // Calculate cell value
    const match = dpMatrix[i-1][j-1] + (seq1[i-1] === seq2[j-1] ? scores.match : scores.mismatch);
    const del = dpMatrix[i-1][j] + scores.gap;
    const ins = dpMatrix[i][j-1] + scores.gap;
    dpMatrix[i][j] = Math.max(match, del, ins);
    
    // Update display
    displaySimulationMatrix(i, j);
    updateStepInfo(i, j);
    
    simulationStep++;
}

function displaySimulationMatrix(currentI = -1, currentJ = -1) {
    let html = '<table>';
    
    // Header row
    html += '<tr><th></th><th>ε</th>';
    for (let char of seq2) html += `<th>${char}</th>`;
    html += '</tr>';
    
    // Data rows
    for (let i = 0; i < dpMatrix.length; i++) {
        html += '<tr>';
        html += i === 0 ? '<th>ε</th>' : `<th>${seq1[i-1]}</th>`;
        
        for (let j = 0; j < dpMatrix[i].length; j++) {
            let className = '';
            if (i === currentI && j === currentJ) className = 'current-cell';
            else if (dpMatrix[i][j] !== 0 || (i === 0 || j === 0)) className = 'highlight';
            
            html += `<td class="${className}">${dpMatrix[i][j]}</td>`;
        }
        html += '</tr>';
    }
    
    html += '</table>';
    document.getElementById('live-matrix').innerHTML = html;
}

function updateStepInfo(i, j) {
    const char1 = seq1[i-1];
    const char2 = seq2[j-1];
    const isMatch = char1 === char2;
    const operation = isMatch ? 'Match' : 'Mismatch';
    const scoreUsed = isMatch ? scores.match : scores.mismatch;
    
    document.getElementById('step-info').innerHTML = `
        <h4>Step ${simulationStep + 1}: Processing cell [${i}][${j}]</h4>
        <p><strong>Comparing:</strong> ${char1} vs ${char2} (${operation})</p>
        <p><strong>Calculations:</strong></p>
        <ul style="margin-left: 20px;">
            <li>Diagonal: ${dpMatrix[i-1][j-1]} + ${scoreUsed} = ${dpMatrix[i-1][j-1] + scoreUsed}</li>
            <li>Up (gap): ${dpMatrix[i-1][j]} + ${scores.gap} = ${dpMatrix[i-1][j] + scores.gap}</li>
            <li>Left (gap): ${dpMatrix[i][j-1]} + ${scores.gap} = ${dpMatrix[i][j-1] + scores.gap}</li>
        </ul>
        <p><strong>Maximum value:</strong> ${dpMatrix[i][j]}</p>
    `;
}

function pauseSimulation() {
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }
}

function resetSimulation() {
    pauseSimulation();
    simulationStep = 0;
    document.getElementById('live-matrix').innerHTML = '';
    document.getElementById('step-info').innerHTML = '';
}

// Comparison functions
function runBothAlgorithms() {
    if (!getInputs()) return;
    
    const needlemanResult = needlemanWunsch();
    const needlemanMatrix = [...dpMatrix.map(row => [...row])];
    
    const smithResult = smithWaterman();
    const smithMatrix = [...dpMatrix.map(row => [...row])];
    
    displayComparison(needlemanResult, smithResult, needlemanMatrix, smithMatrix);
}

function displayComparison(needleman, smith, nMatrix, sMatrix) {
    const html = `
        <div class="side-by-side">
            <div class="comparison-result">
                <h4>🧬 Needleman-Wunsch (Global)</h4>
                <div class="matrix-display">${createMatrixHTML(nMatrix)}</div>
                <div class="alignment-display">
                    ${formatAlignment(needleman.alignment1, needleman.alignment2)}
                </div>
                <p><strong>Score:</strong> ${needleman.score}</p>
                <p><strong>Type:</strong> Complete sequence alignment</p>
            </div>
            
            <div class="comparison-result">
                <h4>🔬 Smith-Waterman (Local)</h4>
                <div class="matrix-display">${createMatrixHTML(sMatrix, true)}</div>
                <div class="alignment-display">
                    ${formatAlignment(smith.alignment1, smith.alignment2)}
                </div>
                <p><strong>Score:</strong> ${smith.score}</p>
                <p><strong>Type:</strong> Best local similarity region</p>
            </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px;">
            <h4>📈 Analysis:</h4>
            <p><strong>Global vs Local:</strong> ${needleman.score > smith.score ? 
                'Global alignment found better overall match' : 
                'Local alignment found stronger regional similarity'}</p>
            <p><strong>Use Case:</strong> ${Math.abs(seq1.length - seq2.length) > 3 ? 
                'Smith-Waterman recommended for different length sequences' : 
                'Both algorithms suitable for similar length sequences'}</p>
        </div>
    `;
    
    document.getElementById('comparison-results').innerHTML = html;
}

function createMatrixHTML(matrix, highlightMax = false) {
    let html = '<table>';
    
    // Find max value for Smith-Waterman highlighting
    const maxValue = highlightMax ? Math.max(...matrix.flat()) : -1;
    
    // Header
    html += '<tr><th></th><th>ε</th>';
    for (let char of seq2) html += `<th>${char}</th>`;
    html += '</tr>';
    
    // Rows
    for (let i = 0; i < matrix.length; i++) {
        html += '<tr>';
        html += i === 0 ? '<th>ε</th>' : `<th>${seq1[i-1]}</th>`;
        
        for (let j = 0; j < matrix[i].length; j++) {
            const className = highlightMax && matrix[i][j] === maxValue ? 'max-cell' : '';
            html += `<td class="${className}">${matrix[i][j]}</td>`;
        }
        html += '</tr>';
    }
    
    html += '</table>';
    return html;
}

function formatAlignment(seq1, seq2) {
    let html1 = '', html2 = '';
    
    for (let i = 0; i < seq1.length; i++) {
        const char1 = seq1[i];
        const char2 = seq2[i];
        
        if (char1 === '-' || char2 === '-') {
            html1 += `<span class="gap">${char1}</span>`;
            html2 += `<span class="gap">${char2}</span>`;
        } else if (char1 === char2) {
            html1 += `<span class="match">${char1}</span>`;
            html2 += `<span class="match">${char2}</span>`;
        } else {
            html1 += `<span class="mismatch">${char1}</span>`;
            html2 += `<span class="mismatch">${char2}</span>`;
        }
    }
    
    return `<div>${html1}</div><div>${html2}</div>`;
}

// Utility functions
function loadRandomExample() {
    const sequences = [
        ['AGCTA', 'AGTCA'],
        ['ATCGAT', 'ATGCAT'],
        ['GATTACA', 'GCATGCU'],
        ['ACGTACGT', 'ACATACGT'],
        ['TGCAATG', 'TGCATG']
    ];
    
    const [s1, s2] = sequences[Math.floor(Math.random() * sequences.length)];
    document.getElementById('seq1').value = s1;
    document.getElementById('seq2').value = s2;
}

// Input validation
function setupInputValidation() {
    ['seq1', 'seq2'].forEach(id => {
        document.getElementById(id).addEventListener('input', function() {
            this.value = this.value.toUpperCase().replace(/[^ATGC]/g, '');
        });
    });
    
    // Enter key support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && document.querySelector('.tab-content.active').id === 'alignment-tab') {
            runAlignment('needleman');
        }
    });
}

// Initialize
window.onload = function() {
    setupInputValidation();
    loadRandomExample();
};