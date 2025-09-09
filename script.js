// Wait for the entire HTML document to be fully loaded and ready
document.addEventListener('DOMContentLoaded', () => {

    // --- Get all UI Elements ---
    const ui = {
        playerPiece: document.getElementById('player-piece'),
        diceButton: document.getElementById('dice-roll-button'),
        infoBox: document.getElementById('info-box'),
        finalScreen: document.getElementById('final-screen'),
        sounds: {
            roll: document.getElementById('sound-roll'),
            move: document.getElementById('sound-move'),
            win: document.getElementById('sound-win'),
        },
        path: document.getElementById('game-path'),
        spaceContainer: document.getElementById('space-container')
    };

    // --- Game Data ---
    const spacesData = [
        { type: 'start', label: 'شروع' },
        { type: 'sale', label: 'فروش' },
        { type: 'inventory', label: 'گدام' },
        { type: 'expense', label: 'مصرف' },
        { type: 'sale', label: 'فروش' },
        { type: 'expense', label: 'کرایه' },
        { type: 'sale', label: 'فروش' },
        { type: 'inventory', label: 'گدام' },
        { type: 'sale', label: 'فروش' },
        { type: 'end', label: 'مفاد!' }
    ];

    // --- Game State ---
    let playerPosition = 0;
    const totalSpaces = spacesData.length - 1;
    let isMoving = false;
    let pathLength = 0; // Will be calculated after board is built

    // --- Game Setup ---
    function initializeBoard() {
        // Clear any previous spaces
        ui.spaceContainer.innerHTML = '';

        // Create and place the spaces on the SVG path
        spacesData.forEach((data, index) => {
            const space = document.createElement('div');
            space.className = `space ${data.type}`;
            space.textContent = data.label;
            
            // Wait for the SVG path to be measurable
            if (ui.path.getTotalLength() > 0) {
                 pathLength = ui.path.getTotalLength();
                 const point = ui.path.getPointAtLength((index / totalSpaces) * pathLength);
                 space.style.left = `${point.x}px`;
                 space.style.top = `${point.y}px`;
            }
            ui.spaceContainer.appendChild(space);
        });
        
        // Initial placement of the player piece
        updatePiecePosition();
    }

    // --- Game Logic ---
    function movePlayer(steps) {
        let newPosition = Math.min(playerPosition + steps, totalSpaces);
        if (newPosition === playerPosition) { // Don't animate if not moving
             isMoving = false;
             ui.diceButton.disabled = false;
             ui.infoBox.textContent = 'دوباره زار بیندازید!';
             return;
        }

        let startTime = null;
        const startPathPos = (playerPosition / totalSpaces) * pathLength;
        const endPathPos = (newPosition / totalSpaces) * pathLength;
        const distance = endPathPos - startPathPos;
        const duration = Math.abs(distance) * 5; // Animation speed based on distance

        function animationStep(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            const currentPathLength = startPathPos + (progress * distance);
            const point = ui.path.getPointAtLength(currentPathLength);
            
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
        if (pathLength === 0) pathLength = ui.path.getTotalLength();
        if (pathLength === 0) return; // Still not ready

        const point = ui.path.getPointAtLength((playerPosition / totalSpaces) * pathLength);
        ui.playerPiece.style.left = `${point.x}px`;
        ui.playerPiece.style.top = `${point.y}px`;
    }

    function rollDice() {
        if (isMoving) return;
        isMoving = true;
        ui.diceButton.disabled = true;
        
        playSound(ui.sounds.roll);
        ui.diceButton.classList.add('rolling');
        
        const rollResult = Math.floor(Math.random() * 3) + 1;
        
        setTimeout(() => {
            ui.infoBox.innerHTML = `شما <strong>${rollResult}</strong> انداختید!`;
            ui.diceButton.classList.remove('rolling');
            movePlayer(rollResult);
        }, 600); // Wait for dice animation to finish
    }

    function winGame() {
        ui.finalScreen.classList.add('show');
        playSound(ui.sounds.win);
    }

    function playSound(sound) {
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log("Audio play failed:", e));
        }
    }

    // --- Event Listeners & Initialization ---
    if (ui.diceButton) {
        ui.diceButton.addEventListener('click', rollDice);
    } else {
        console.error("Dice button not found!");
    }

    // Use a small delay with window.onload to ensure everything, including SVG, is fully rendered and measurable
    window.onload = () => {
        initializeBoard();
    };
});