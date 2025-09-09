document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const ui = {
        playerPiece: document.getElementById('player-piece'),
        diceButton: document.getElementById('dice-roll-button'),
        infoBox: document.getElementById('info-box'),
        finalScreen: document.getElementById('final-screen'),
        sounds: { roll: document.getElementById('sound-roll'), move: document.getElementById('sound-move'), win: document.getElementById('sound-win') },
        path: document.getElementById('game-path'),
        spaceContainer: document.getElementById('space-container')
    };

    // --- Game Data ---
    const spacesData = [
        { type: 'start', label: 'شروع' }, { type: 'sale', label: 'فروش' },
        { type: 'inventory', label: 'گدام' }, { type: 'expense', label: 'مصرف' },
        { type: 'sale', label: 'فروش' }, { type: 'expense', label: 'کرایه' },
        { type: 'sale', label: 'فروش' }, { type: 'inventory', label: 'گدام' },
        { type: 'sale', label: 'فروش' }, { type: 'end', label: 'مفاد!' }
    ];

    // --- Game State ---
    let playerPosition = 0; // The index in the spacesData array
    const totalSpaces = spacesData.length - 1;
    let isMoving = false;
    const pathLength = ui.path.getTotalLength();

    // --- Game Setup ---
    function initializeBoard() {
        spacesData.forEach((data, index) => {
            const space = document.createElement('div');
            space.className = `space ${data.type}`;
            space.textContent = data.label;
            
            // Get the coordinate at a specific percentage along the path
            const point = ui.path.getPointAtLength((index / totalSpaces) * pathLength);
            space.style.left = `${point.x}px`;
            space.style.top = `${point.y}px`;
            
            ui.spaceContainer.appendChild(space);
        });
        updatePiecePosition();
    }

    // --- Game Logic ---
    function movePlayer(steps) {
        let newPosition = Math.min(playerPosition + steps, totalSpaces);
        
        let startTime = null;
        const duration = steps * 400; // 400ms per step

        function animationStep(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            // Calculate the current position along the path
            const currentPathPosition = playerPosition + (progress * steps);
            const point = ui.path.getPointAtLength((currentPathPosition / totalSpaces) * pathLength);
            
            ui.playerPiece.style.left = `${point.x}px`;
            ui.playerPiece.style.top = `${point.y}px`;

            if (progress < 1) {
                requestAnimationFrame(animationStep);
            } else {
                playerPosition = newPosition;
                if (playerPosition >= totalSpaces) {
                    setTimeout(winGame, 300);
                } else {
                    isMoving = false;
                    ui.diceButton.disabled = false;
                    ui.infoBox.textContent = 'دوباره زار بیندازید!';
                }
            }
        }
        
        playSound(ui.sounds.move);
        requestAnimationFrame(animationStep);
    }

    function updatePiecePosition() {
        const point = ui.path.getPointAtLength((playerPosition / totalSpaces) * pathLength);
        ui.playerPiece.style.left = `${point.x}px`;
        ui.playerPiece.style.top = `${point.y}px`;
    }

    function rollDice() { /* ... unchanged from previous working version ... */ }
    function winGame() { /* ... unchanged ... */ }
    function playSound(sound) { /* ... unchanged ... */ }

    // --- Event Listeners & Initialization ---
    ui.diceButton.addEventListener('click', rollDice);
    initializeBoard(); // Build the board dynamically
});