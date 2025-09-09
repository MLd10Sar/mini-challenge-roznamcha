document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const ui = {
        playerPiece: document.getElementById('player-piece'),
        diceButton: document.getElementById('dice-roll-button'),
        infoText: document.getElementById('info-text'),
        finalScreen: document.getElementById('final-screen'),
        sounds: {
            roll: document.getElementById('sound-roll'),
            move: document.getElementById('sound-move'),
            win: document.getElementById('sound-win'),
        },
        // Create an array from the spaces in the correct order
        spaces: Array.from(document.querySelectorAll('.space')).sort((a, b) => 
            parseInt(a.dataset.space, 10) - parseInt(b.dataset.space, 10)
        )
    };

    // --- Game State ---
    let playerPosition = 0; // The index in the ui.spaces array
    const endPosition = ui.spaces.length - 1;
    let isMoving = false;

    // --- Game Logic ---
    function movePlayerSmoothly(steps) {
        let newPosition = playerPosition + steps;
        
        if (newPosition >= endPosition) {
            newPosition = endPosition;
            updatePiecePosition();
            setTimeout(winGame, 600); // Win after the final move
            return;
        }

        const interval = setInterval(() => {
            if (playerPosition === newPosition) {
                clearInterval(interval);
                handleSpaceEffect(); // Apply effect after landing
                return;
            }
            playerPosition++;
            updatePiecePosition();
        }, 300); // 300ms per step
    }
    
    function handleSpaceEffect() {
        const currentSpace = ui.spaces[playerPosition];
        if (currentSpace.classList.contains('expense')) {
            ui.infoText.innerHTML = `وه! مصرف باعث شد <strong>۱ خانه</strong> به عقب بروید.`;
            playerPosition--;
        } else if (currentSpace.classList.contains('inventory')) {
            ui.infoText.innerHTML = `عالی! گدام تان منظم است. <strong>۱ خانه</strong> جایزه پیش بروید.`;
            playerPosition++;
        }
        
        // A small delay before updating the piece position for the effect
        setTimeout(() => {
            updatePiecePosition();
            if (playerPosition >= endPosition) {
                setTimeout(winGame, 600);
            } else {
                isMoving = false;
                ui.diceButton.disabled = false;
            }
        }, 500);
    }
    
    function updatePiecePosition() {
        const targetSpace = ui.spaces[playerPosition];
        if (!targetSpace) return;

        const boardRect = targetSpace.parentElement.getBoundingClientRect();
        const targetRect = targetSpace.getBoundingClientRect();
        
        // Calculate position relative to the board
        const top = targetRect.top - boardRect.top + (targetRect.height / 2) - (ui.playerPiece.offsetHeight / 2);
        const left = targetRect.left - boardRect.left + (targetRect.width / 2) - (ui.playerPiece.offsetWidth / 2);
        
        ui.playerPiece.style.transform = `translate(${left}px, ${top}px)`;
        playSound(ui.sounds.move);
    }
    
    function rollDice() {
        if (isMoving) return;
        isMoving = true;
        ui.diceButton.disabled = true;
        
        playSound(ui.sounds.roll);
        ui.diceButton.classList.add('rolling');
        
        const rollResult = Math.floor(Math.random() * 3) + 1; // Roll between 1 and 3
        
        setTimeout(() => {
            ui.infoText.innerHTML = `شما <strong>${rollResult}</strong> انداختید!`;
            ui.diceButton.classList.remove('rolling');
            movePlayerSmoothly(rollResult);
        }, 500);
    }
    
    function winGame() {
        ui.infoText.textContent = "شما برنده شدید!";
        ui.finalScreen.classList.add('show');
        playSound(ui.sounds.win);
    }

    function playSound(sound) {
        if (sound) {
            sound.currentTime = 0;
            sound.play();
        }
    }

    // --- Event Listeners & Initialization ---
    ui.diceButton.addEventListener('click', rollDice);
    
    // A small delay to ensure layout is fully calculated before placing the piece
    setTimeout(updatePiecePosition, 100);
});