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
        spaces: Array.from(document.querySelectorAll('.space')).sort((a, b) => 
            parseInt(a.dataset.space, 10) - parseInt(b.dataset.space, 10)
        )
    };

    // --- Game State ---
    let playerPosition = 0; // The index in the ui.spaces array
    const endPosition = ui.spaces.length - 1;
    let isMoving = false;

    // --- Game Logic ---
    function movePlayerOneStep() {
        playerPosition++;
        updatePiecePosition();
        playSound(ui.sounds.move);
    }
    
    function animateMove(steps) {
        if (steps <= 0) {
            // After movement is finished, apply the space effect
            setTimeout(handleSpaceEffect, 300);
            return;
        }

        movePlayerOneStep();
        
        // Call the next step after a short delay
        setTimeout(() => animateMove(steps - 1), 300); // 300ms delay per step
    }

    function handleSpaceEffect() {
        const currentSpace = ui.spaces[playerPosition];
        if (!currentSpace) return;
        
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
                ui.infoText.innerHTML = 'دوباره زار بیندازید!';
            }
        }, 800); // Wait a bit longer to show the effect message
    }
    
    function updatePiecePosition() {
        const targetSpace = ui.spaces[playerPosition];
        if (!targetSpace) return;

        const boardRect = targetSpace.parentElement.getBoundingClientRect();
        const targetRect = targetSpace.getBoundingClientRect();
        
        // Calculate position relative to the board's top-left corner
        const top = targetRect.top - boardRect.top + (targetRect.height / 2) - (ui.playerPiece.offsetHeight / 2);
        const left = targetRect.left - boardRect.left + (targetRect.width / 2) - (ui.playerPiece.offsetWidth / 2);
        
        ui.playerPiece.style.transform = `translate(${left}px, ${top}px)`;
    }
    
    function rollDice() {
        if (isMoving) return;
        isMoving = true;
        ui.diceButton.disabled = true;
        
        playSound(ui.sounds.roll);
        ui.diceButton.classList.add('rolling');
        
        const rollResult = Math.floor(Math.random() * 3) + 1; // Roll between 1 and 3
        
        setTimeout(() => {
            ui.infoText.innerHTML = `شما <strong>${rollResult}</strong> انداختید! در حال حرکت...`;
            ui.diceButton.classList.remove('rolling');
            
            // Start the step-by-step animation
            animateMove(rollResult);
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
            sound.play().catch(e => console.log("Audio play failed:", e));
        }
    }

    // --- Event Listeners & Initialization ---
    ui.diceButton.addEventListener('click', rollDice);
    
    // Initial placement of the piece with a small delay
    setTimeout(updatePiecePosition, 200);
});