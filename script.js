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
        spaces: document.querySelectorAll('.space'),
    };

    // --- Game State ---
    let playerPosition = 0;
    const endPosition = ui.spaces.length - 1;
    let isRolling = false;
    
    // --- Game Logic ---
    function movePlayer(steps) {
        let newPosition = playerPosition + steps;
        
        // Handle board boundaries and special spaces
        if (newPosition > endPosition) newPosition = endPosition;
        
        const targetSpace = ui.spaces[newPosition];
        if (targetSpace.classList.contains('expense')) {
            ui.infoText.innerHTML = `وه! مصرف باعث شد <strong>۱ خانه</strong> به عقب بروید.`;
            newPosition -= 1;
        } else if (targetSpace.classList.contains('inventory')) {
            ui.infoText.innerHTML = `عالی! گدام تان منظم است. <strong>۱ خانه</strong> جایزه پیش بروید.`;
            newPosition += 1;
        }

        // Final boundary check
        if (newPosition < 0) newPosition = 0;
        if (newPosition > endPosition) newPosition = endPosition;

        playerPosition = newPosition;
        updatePiecePosition();
        
        // Check for win condition
        if (playerPosition === endPosition) {
            setTimeout(winGame, 800);
        }
    }
    
    function updatePiecePosition() {
        const targetSpace = ui.spaces[playerPosition];
        const targetRect = targetSpace.getBoundingClientRect();
        const boardRect = ui.playerPiece.parentElement.getBoundingClientRect();
        
        const top = targetRect.top - boardRect.top + (targetRect.height / 2) - (ui.playerPiece.offsetHeight / 2);
        const right = boardRect.right - targetRect.right + (targetRect.width / 2) - (ui.playerPiece.offsetWidth / 2);
        
        ui.playerPiece.style.transform = `translate(${-right}px, ${top}px)`;
        playSound(ui.sounds.move);
    }
    
    function rollDice() {
        if (isRolling) return;
        isRolling = true;
        
        playSound(ui.sounds.roll);
        ui.diceButton.classList.add('rolling');
        
        const rollResult = Math.floor(Math.random() * 3) + 1; // Roll between 1 and 3
        ui.infoText.innerHTML = `شما <strong>${rollResult}</strong> انداختید!`;
        
        setTimeout(() => {
            ui.diceButton.classList.remove('rolling');
            movePlayer(rollResult);
            isRolling = false;
        }, 500); // Wait for animation to finish
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

    // --- Event Listeners ---
    ui.diceButton.addEventListener('click', rollDice);
    
    // --- Initialize Game ---
    // A small delay to ensure layout is calculated
    setTimeout(updatePiecePosition, 100);
});