// Global variables
let dpMatrix = [];
let seq1, seq2;
let matchScore, mismatchScore, gapPenalty;

/**
 * Validates if a sequence contains only valid DNA nucleotides
 * @param {string} sequence - DNA sequence to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateDNA(sequence) {
    return /^[ATGC]+$/i.test(sequence);
}

/**
 * Loads example DNA sequences and scoring parameters
 */
function loadExample() {
    document.getElementById('seq1').value = 'AGCTA';
    document.getElementById('seq2').value = 'AGTCA';
    document.getElementById('match').value = '2';
    document.getElementById('mismatch').value = '-1';
    document.getElementById('gap').value = '-2';
}

/**
 * Main function to perform sequence alignment
 */
function alignSequences() {
    // Get input values
    seq1 = document.getElementById('seq1').value.toUpperCase().trim();
    seq2 = document.getElementById('seq2').value.toUpperCase().trim();
    matchScore = parseInt(document.getElementById('match').value);
    mismatchScore = parseInt(document.getElementById('mismatch').value);
    gapPenalty = parseInt(document.getElementById('gap').value);

    // Validate input
    if (!seq1 || !seq2) {
        alert('Please enter both DNA sequences');
        return;
    }

    if (!validateDNA(seq1) || !validateDNA(seq2)) {
        alert('Please enter valid DNA sequences (only A, T, G, C)');
        return;
    }

    // Show results section and start step-by-step demonstration
    document.getElementById('results').classList.remove('hidden');
    showStep1();
    
    // Execute algorithm steps with delays for visualization
    setTimeout(() => {
        initializeMatrix();
        showStep2();
        setTimeout(() => {
            fillMatrix();
            showStep3();
            setTimeout(() => {
                traceback();
                showFinalResult();
            }, 1000);
        }, 1000);
    }, 500);
}

/**
 * Initialize the DP matrix with gap penalties
 */
function initializeMatrix() {
    const m = seq1.length + 1;
    const n = seq2.length + 1;
    
    // Create matrix filled with zeros
    dpMatrix = Array(m).fill().map(() => Array(n).fill(0));
    
    // Initialize first row with gap penalties
    for (let i = 0; i < m; i++) {
        dpMatrix[i][0] = i * gapPenalty;
    }
    
    // Initialize first column with gap penalties
    for (let j = 0; j < n; j++) {
        dpMatrix[0][j] = j * gapPenalty;
    }
}

/**
 * Fill the DP matrix using the Needleman-Wunsch recurrence relation
 */
function fillMatrix() {
    const m = seq1.length + 1;
    const n = seq2.length + 1;
    
    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            // Calculate scores for three possible operations
            const match = dpMatrix[i-1][j-1] + (seq1[i-1] === seq2[j-1] ? matchScore : mismatchScore);
            const deletion = dpMatrix[i-1][j] + gapPenalty;
            const insertion = dpMatrix[i][j-1] + gapPenalty;
            
            // Take the maximum score
            dpMatrix[i][j] = Math.max(match, deletion, insertion);
        }
    }
}

/**
 * Perform traceback to find the optimal alignment
 */
function traceback() {
    const alignment1 = [];
    const alignment2 = [];
    let i = seq1.length;
    let j = seq2.length;
    
    // Traceback from bottom-right to top-left
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && 
            dpMatrix[i][j] === dpMatrix[i-1][j-1] + (seq1[i-1] === seq2[j-1] ? matchScore : mismatchScore)) {
            // Match or mismatch
            alignment1.unshift(seq1[i-1]);
            alignment2.unshift(seq2[j-1]);
            i--;
            j--;
        } else if (i > 0 && dpMatrix[i][j] === dpMatrix[i-1][j] + gapPenalty) {
            // Deletion (gap in sequence 2)
            alignment1.unshift(seq1[i-1]);
            alignment2.unshift('-');
            i--;
        } else {
            // Insertion (gap in sequence 1)
            alignment1.unshift('-');
            alignment2.unshift(seq2[j-1]);
            j--;
        }
    }
    
    // Store alignments globally for result display
    window.alignment1 = alignment1;
    window.alignment2 = alignment2;
}

/**
 * Create HTML representation of the DP matrix
 * @param {Array} matrix - 2D array representing the DP matrix
 * @param {string} title - Title for the matrix
 * @param {boolean} highlightPath - Whether to highlight the optimal path
 * @returns {string} - HTML string for the matrix
 */
function createMatrixHTML(matrix, title, highlightPath = false) {
    let html = `<h4>${title}</h4>`;
    html += '<div class="matrix-container"><table class="dp-matrix">';
    
    // Create header row
    html += '<tr><th></th><th>ε</th>';
    for (let j = 0; j < seq2.length; j++) {
        html += `<th>${seq2[j]}</th>`;
    }
    html += '</tr>';
    
    // Create data rows
    for (let i = 0; i < matrix.length; i++) {
        html += '<tr>';
        
        // Row header
        if (i === 0) {
            html += '<th>ε</th>';
        } else {
            html += `<th>${seq1[i-1]}</th>`;
        }
        
        // Data cells
        for (let j = 0; j < matrix[i].length; j++) {
            const cellClass = highlightPath && isInPath(i, j) ? 'path' : '';
            html += `<td class="${cellClass}">${matrix[i][j]}</td>`;
        }
        html += '</tr>';
    }
    
    html += '</table></div>';
    return html;
}

/**
 * Check if a cell is in the optimal alignment path
 * @param {number} i - Row index
 * @param {number} j - Column index
 * @returns {boolean} - True if cell is in path
 */
function isInPath(i, j) {
    // Simplified path highlighting
    // In a complete implementation, you would store the actual path during traceback
    return false;
}

/**
 * Display Step 1: Matrix Initialization
 */
function showStep1() {
    document.getElementById('step1-content').innerHTML = `
        <p>Initialize the DP matrix with gap penalties for the first row and column.</p>
        <p><strong>Formula:</strong></p>
        <ul style="margin-left: 20px; margin-bottom: 15px;">
            <li>dp[i][0] = i × gap_penalty (deletions from sequence 1)</li>
            <li>dp[0][j] = j × gap_penalty (insertions to sequence 1)</li>
        </ul>
        <p>This represents the cost of aligning one sequence with gaps at the beginning.</p>
    `;
}

/**
 * Display Step 2: Matrix Filling
 */
function showStep2() {
    document.getElementById('step2-content').innerHTML = `
        <p>Fill the DP matrix using the Needleman-Wunsch recurrence relation:</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>dp[i][j] = max(</strong></p>
            <ul style="margin-left: 20px;">
                <li><strong>dp[i-1][j-1] + score(seq1[i-1], seq2[j-1])</strong> // Match/Mismatch</li>
                <li><strong>dp[i-1][j] + gap_penalty</strong> // Deletion from seq1</li>
                <li><strong>dp[i][j-1] + gap_penalty</strong> // Insertion to seq1</li>
            </ul>
            <p><strong>)</strong></p>
        </div>
        <p>Where score(a,b) = match_score if a==b, else mismatch_score</p>
        ${createMatrixHTML(dpMatrix, 'Completed DP Matrix')}
        <p><strong>Final Score:</strong> ${dpMatrix[seq1.length][seq2.length]} (bottom-right cell)</p>
    `;
}

/**
 * Display Step 3: Traceback
 */
function showStep3() {
    document.getElementById('step3-content').innerHTML = `
        <p>Traceback from dp[m][n] to dp[0][0] to reconstruct the optimal alignment path.</p>
        <p>At each step, we choose the operation that led to the current cell's value:</p>
        <ul style="margin-left: 20px; margin-bottom: 15px;">
            <li><strong>Diagonal move:</strong> Match or mismatch between characters</li>
            <li><strong>Vertical move:</strong> Deletion (gap in sequence 2)</li>
            <li><strong>Horizontal move:</strong> Insertion (gap in sequence 1)</li>
        </ul>
        ${createMatrixHTML(dpMatrix, 'DP Matrix with Traceback Path', true)}
        <p>The traceback gives us the operations needed to transform one sequence into another optimally.</p>
    `;
}

/**
 * Display the final alignment result with statistics
 */
function showFinalResult() {
    const alignment1 = window.alignment1;
    const alignment2 = window.alignment2;
    
    // Calculate alignment statistics
    let matches = 0;
    let mismatches = 0;
    let gaps = 0;
    
    let alignmentHTML1 = '';
    let alignmentHTML2 = '';
    let matchLine = '';
    
    // Process each position in the alignment
    for (let i = 0; i < alignment1.length; i++) {
        if (alignment1[i] === '-' || alignment2[i] === '-') {
            gaps++;
            alignmentHTML1 += `<span class="gap">${alignment1[i]}</span>`;
            alignmentHTML2 += `<span class="gap">${alignment2[i]}</span>`;
            matchLine += ' ';
        } else if (alignment1[i] === alignment2[i]) {
            matches++;
            alignmentHTML1 += `<span class="match">${alignment1[i]}</span>`;
            alignmentHTML2 += `<span class="match">${alignment2[i]}</span>`;
            matchLine += '|';
        } else {
            mismatches++;
            alignmentHTML1 += `<span class="mismatch">${alignment1[i]}</span>`;
            alignmentHTML2 += `<span class="mismatch">${alignment2[i]}</span>`;
            matchLine += ' ';
        }
    }
    
    // Calculate final statistics
    const totalScore = dpMatrix[seq1.length][seq2.length];
    const identity = ((matches / alignment1.length) * 100).toFixed(1);
    const similarity = (((matches * matchScore) + (mismatches * mismatchScore) + (gaps * gapPenalty)) === totalScore);
    
    // Display results
    document.getElementById('alignment-result').innerHTML = `
        <div class="alignment-result">
            <h4>Optimal Global Alignment:</h4>
            <div class="alignment-sequences">
                Seq1: ${alignmentHTML1}<br>
                      ${matchLine}<br>
                Seq2: ${alignmentHTML2}
            </div>
            <p style="margin-top: 15px;"><strong>Legend:</strong> 
                <span class="match">Green = Match</span> | 
                <span class="mismatch">Red = Mismatch</span> | 
                <span class="gap">Orange = Gap</span>
            </p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">${totalScore}</div>
                <div class="stat-label">Alignment Score</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${matches}</div>
                <div class="stat-label">Matches</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${mismatches}</div>
                <div class="stat-label">Mismatches</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${gaps}</div>
                <div class="stat-label">Gaps</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${identity}%</div>
                <div class="stat-label">Sequence Identity</div>
            </div>
        </div>
        
        <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <h4>Alignment Quality Assessment:</h4>
            <p><strong>Score Calculation:</strong> ${matches} matches × ${matchScore} + ${mismatches} mismatches × ${mismatchScore} + ${gaps} gaps × ${gapPenalty} = ${totalScore}</p>
            <p><strong>Biological Significance:</strong> ${identity >= 70 ? 'High similarity - likely homologous sequences' : identity >= 30 ? 'Moderate similarity - possible evolutionary relationship' : 'Low similarity - distantly related or unrelated sequences'}</p>
        </div>
    `;
}

/**
 * Initialize the application on page load
 */
window.onload = function() {
    loadExample();
    
    // Add input validation on keyup
    document.getElementById('seq1').addEventListener('keyup', function() {
        this.value = this.value.toUpperCase().replace(/[^ATGC]/g, '');
    });
    
    document.getElementById('seq2').addEventListener('keyup', function() {
        this.value = this.value.toUpperCase().replace(/[^ATGC]/g, '');
    });
    
    // Add Enter key support
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            alignSequences();
        }
    });
};