// Screen Navigation
function nextScreen(screenId) {
    const currentScreen = document.querySelector('.screen.active');
    const options = currentScreen.querySelectorAll('.option-button.selected, .broker-card.selected');

    if (options.length === 0) {
        alert('Please select at least one option before proceeding.');
        return;
    }

    currentScreen.classList.remove('active');
    const next = document.getElementById(screenId);
    next.classList.add('active');

    updateProgress(screenId);
}

function previousScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// Option Selection
function toggleOption(element) {
    element.classList.toggle('selected');
}

function selectSingle(element, group) {
    element.parentElement.querySelectorAll('.option-button').forEach(btn => btn.classList.remove('selected'));
    element.classList.add('selected');
}

function toggleBroker(element) {
    element.classList.toggle('selected');
}

// Tooltip
function showTooltip(event, text) {
    const tooltip = document.getElementById('tooltip');
    tooltip.textContent = text;
    tooltip.style.display = 'block';
    tooltip.style.left = event.pageX + 10 + 'px';
    tooltip.style.top = event.pageY - 30 + 'px';
    setTimeout(() => { tooltip.style.display = 'none'; }, 3000);
}

// Finish onboarding and go to dashboard
function finishOnboarding() {
    nextScreen('screen-dashboard');
}

// Progress Bar Update
function updateProgress(screenId) {
    const screenOrder = [
        'screen-preferences',
        'screen-portfolio-category',
        'screen-goals',
        'screen-experience',
        'screen-markets',
        'screen-risk',
        'screen-connect',
        'screen-dashboard'
    ];
    const index = screenOrder.indexOf(screenId);
    const percent = Math.min((index / (screenOrder.length - 1)) * 100, 100);

    document.querySelectorAll('.progress-fill').forEach(fill => {
        fill.style.width = `${percent}%`;
    });
}

// Optional: initialize first screen progress
updateProgress('screen-preferences');
