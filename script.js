let assignments = [];

// DOM elements
const assignmentNameInput = document.getElementById('assignmentName');
const assignmentGradeInput = document.getElementById('assignmentGrade');
const addButton = document.getElementById('addButton');
const clearButton = document.getElementById('clearButton');
const gpaDisplay = document.getElementById('gpaDisplay');
const gpaValue = document.getElementById('gpaValue');
const assignmentsList = document.getElementById('assignmentsList');
const errorMessage = document.getElementById('errorMessage');

function setupEventListeners() {
    addButton.addEventListener('click', addAssignment);
    clearButton.addEventListener('click', clearAllAssignments);
    
    assignmentNameInput.addEventListener('keypress', function(e)         if (e.key === 'Enter') {
            assignmentGradeInput.focus();
        }
    });
    
    assignmentGradeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addAssignment();
        }
    });
    
    document.addEventListener('keypress', function(e) {
        if (e.key.toLowerCase() === 's') {
            logAllData();
        }
    });
    
    assignmentGradeInput.addEventListener('input', validateGrade);
}

function addAssignment() {
    const name = assignmentNameInput.value.trim();
    const grade = parseFloat(assignmentGradeInput.value);
    
    if (!name) {
        showError('Please enter an assignment name');
        assignmentNameInput.focus();
        return;
    }
    
    if (isNaN(grade) || grade < 0 || grade > 5) {
        showError('Please enter a valid grade between 0 and 5');
        assignmentGradeInput.focus();
        return;
    }
    
    if (assignments.some(assignment => assignment.name.toLowerCase() === name.toLowerCase())) {
        showError('Assignment name already exists');
        assignmentNameInput.focus();
        return;
    }
    
    const assignment = {
        id: Date.now(),
        name: name,
        grade: grade
    };
    
    assignments.push(assignment);
    
    assignmentNameInput.value = '';
    assignmentGradeInput.value = '';
    assignmentNameInput.focus();
    
    renderAssignments();
    calculateGPA();
    saveToStorage();
    hideError();
    
    console.log('Assignment added:', assignment);
}

function calculateGPA() {
    if (assignments.length === 0) {
        gpaValue.textContent = '0.00';
        return;
    }
    
    const totalPoints = assignments.reduce((sum, assignment) => sum + assignment.grade, 0);
    const gpa = totalPoints / assignments.length;
    
    gpaValue.textContent = gpa.toFixed(2);
    
    gpaDisplay.classList.add('updated');
    setTimeout(() => {
        gpaDisplay.classList.remove('updated');
    }, 600);
}

function renderAssignments() {
    if (assignments.length === 0) {
        assignmentsList.innerHTML = `
            <div class="no-assignments">
                No assignments added yet. Add your first assignment above!
            </div>
        `;
        return;
    }
    
    assignmentsList.innerHTML = assignments.map(assignment => `
        <div class="assignment-item" data-id="${assignment.id}">
            <span class="assignment-name">${escapeHtml(assignment.name)}</span>
            <div>
                <span class="assignment-grade">${assignment.grade.toFixed(1)}/5.0</span>
                <button onclick="removeAssignment(${assignment.id})" 
                        style="margin-left: 10px; background: #dc3545; padding: 5px 10px; font-size: 12px;">
                    Remove
                </button>
            </div>
        </div>
    `).join('');
}

function removeAssignment(id) {
    const assignment = assignments.find(a => a.id === id);
    assignments = assignments.filter(assignment => assignment.id !== id);
    
    renderAssignments();
    calculateGPA();
    saveToStorage();
    
    console.log('Assignment removed:', assignment);
}

function clearAllAssignments() {
    if (assignments.length === 0) return;
    
    if (confirm('Are you sure you want to clear all assignments?')) {
        assignments = [];
        renderAssignments();
        calculateGPA();
        saveToStorage();
        console.log('All assignments cleared');
    }
}

function logAllData() {
    console.clear();
    console.log('=== GPA CALCULATOR DATA ===');
    console.log(`Current GPA: ${gpaValue.textContent}`);
    console.log(`Total Assignments: ${assignments.length}`);
    console.log('');
    
    if (assignments.length > 0) {
        console.log('All Assignments:');
        console.table(assignments.map(assignment => ({
            Name: assignment.name,
            Grade: assignment.grade,
            'Added On': new Date(assignment.id).toLocaleString()
        })));
        
        console.log('');
        console.log('Raw Data:', assignments);
    } else {
        console.log('No assignments found.');
    }
    
    console.log('========================');
}


function validateGrade() {
    const grade = parseFloat(assignmentGradeInput.value);
    if (!isNaN(grade) && (grade < 0 || grade > 5)) {
        assignmentGradeInput.setCustomValidity('Grade must be between 0 and 5');
    } else {
        assignmentGradeInput.setCustomValidity('');
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function saveToStorage() {
    try {
        localStorage.setItem('gpaCalculatorData', JSON.stringify(assignments));
        console.log('Data saved to localStorage');
    } catch (error) {
        console.log('localStorage not available:', error);
    }
}


