document.addEventListener('DOMContentLoaded', () => {
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
        // Create an array of the spaces in their numbered order
        spaces: Array.from(document.querySelectorAll('.space[data-space]')).sort((a, b) => 
            parseInt(a.dataset.space, 10) - parseInt(b.dataset.space, 10)
        )
    };

    let playerPosition = 0;
    const endPosition = ui.spaces.length - 1;
    let isMoving = false;

    function movePlayerOneStep() {
        if (playerPosition < endPosition) {
            playerPosition++;
            updatePiecePosition();
            playSound(ui.sounds.move);
        }
    }
    
    function animateMove(steps) {
        if (steps <= 0) {
            isMoving = false;
            ui.diceButton.disabled = false;
            ui.infoBox.textContent = 'دوباره زار بیندازید!';
            return;
        }
        movePlayerOneStep();
        setTimeout(() => animateMove(steps - 1), 400); // 400ms delay per step
    }
    
    function updatePiecePosition() {
        const targetSpace = ui.spaces[playerPosition];
        if (!targetSpace) return;

        const boardRect = targetSpace.closest('.board').getBoundingClientRect();
        const targetRect = targetSpace.getBoundingClientRect();
        
        const top = targetRect.top - boardRect.top + (targetRect.height / 2) - (ui.playerPiece.offsetHeight / 2);
        const left = targetRect.left - boardRect.left + (targetRect.width / 2) - (ui.playerPiece.offsetWidth / 2);
        
        ui.playerPiece.style.transform = `translate(${left}px, ${top}px)`;

        if (playerPosition >= endPosition) {
            setTimeout(winGame, 600);
        }
    }
    
    function rollDice() {
        if (isMoving) return;
        isMoving = true;
        ui.diceButton.disabled = true;
        
        playSound(ui.sounds.roll);
        ui.diceButton.classList.add('rolling');
        
        const rollResult = Math.floor(Math.random() * 3) + 1; // Roll 1, 2, or 3
        
        setTimeout(() => {
            ui.infoBox.innerHTML = `شما <strong>${rollResult}</strong> انداختید!`;
            ui.diceButton.classList.remove('rolling');
            animateMove(rollResult);
        }, 500);
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

    ui.diceButton.addEventListener('click', rollDice);
    
    // Initial placement of the piece
    setTimeout(updatePiecePosition, 200);
});