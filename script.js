document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const ui = {
        playerPieceUser: document.getElementById('player-piece-user'),
        playerPieceComputer: document.getElementById('player-piece-computer'),
        diceButton: document.getElementById('dice-roll-button'),
        infoBox: document.getElementById('info-box'),
        finalScreen: document.getElementById('final-screen'),
        finalTitle: document.getElementById('final-title'),
        finalMessage: document.getElementById('final-message'),
        sounds: {
            roll: document.getElementById('sound-roll'),
            move: document.getElementById('sound-move'),
            win: document.getElementById('sound-win'),
            lose: document.getElementById('sound-lose'),
            bonus: document.getElementById('sound-bonus'),
            penalty: document.getElementById('sound-penalty'),
        },
        spaces: Array.from(document.querySelectorAll('.space[data-space]')).sort((a, b) =>
            parseInt(a.dataset.space, 10) - parseInt(b.dataset.space, 10)
        )
    };

    // --- Game State ---
    let userPosition = 0;
    let computerPosition = 0;
    const endPosition = ui.spaces.length - 1;
    let isUserTurn = true;
    let isMoving = false; // Flag to prevent clicks during animation

    // --- Game Logic ---
    function updatePiecePosition(piece, position) {
        const targetSpace = ui.spaces[position];
        if (!targetSpace) return;
        const boardRect = targetSpace.closest('.board').getBoundingClientRect();
        const targetRect = targetSpace.getBoundingClientRect();
        const top = targetRect.top - boardRect.top + (targetRect.height / 2) - (piece.offsetHeight / 2);
        const left = targetRect.left - boardRect.left + (targetRect.width / 2) - (piece.offsetWidth / 2);
        piece.style.transform = `translate(${left}px, ${top}px)`;
    }

    function animateMove(piece, currentPos, stepsLeft) {
        if (stepsLeft <= 0) {
            // Movement finished, now check for special space effects.
            setTimeout(() => handleSpaceEffect(piece, currentPos), 400);
            return;
        }

        let nextPos = currentPos + 1;
        if (nextPos > endPosition) {
            nextPos = endPosition; // Can't move past the end
            stepsLeft = 0; // Stop further movement
        }

        updatePiecePosition(piece, nextPos);
        playSound(ui.sounds.move);

        // Recursively call for the next step after a delay
        setTimeout(() => animateMove(piece, nextPos, stepsLeft - 1), 300);
    }

    function handleSpaceEffect(piece, position) {
        const space = ui.spaces[position];
        space.classList.add('animate-bounce');
        setTimeout(() => space.classList.remove('animate-bounce'), 500);

        let effectMessage = '';
        let newPosition = position;
        let sound = null;

        if (space.classList.contains('expense')) {
            newPosition = Math.max(0, position - 2); // Move back 2, but not before start
            effectMessage = 'وه! یک مصرف باعث شد ۲ خانه به عقب بروید.';
            sound = ui.sounds.penalty;
        } else if (space.classList.contains('profit')) {
            newPosition = Math.min(endPosition, position + 3); // Move forward 3
            effectMessage = 'عالی! مفاد خالص شما را ۳ خانه پیش برد.';
            sound = ui.sounds.bonus;
        }

        if (newPosition !== position) {
            ui.infoBox.textContent = effectMessage;
            playSound(sound);
            // Update the player's actual position after the effect
            if (piece === ui.playerPieceUser) userPosition = newPosition;
            else computerPosition = newPosition;

            // Animate the piece to the new position after the effect
            setTimeout(() => {
                updatePiecePosition(piece, newPosition);
                checkWinOrSwitchTurn(piece);
            }, 1200); // Wait longer so user can read the message
        } else {
            // No special effect, just switch turns
            checkWinOrSwitchTurn(piece);
        }
    }

    function checkWinOrSwitchTurn(piece) {
        const currentPosition = (piece === ui.playerPieceUser) ? userPosition : computerPosition;
        if (currentPosition >= endPosition) {
            // Game over
            setTimeout(() => endGame(piece === ui.playerPieceUser), 500);
        } else {
            // Switch to the next player's turn
            isUserTurn = !isUserTurn;
            setTimeout(nextTurn, 1000); // Wait a second before the next turn starts
        }
    }

    function rollDice() {
        if (isMoving) return; // Prevent rolling while animating
        isMoving = true; // Lock the controls
        ui.diceButton.disabled = true;

        playSound(ui.sounds.roll);
        ui.diceButton.classList.add('rolling');

        const rollResult = Math.floor(Math.random() * 3) + 1; // Roll between 1 and 3

        setTimeout(() => {
            ui.diceButton.classList.remove('rolling');
            ui.infoBox.textContent = `شما ${rollResult} انداختید!`;
            
            const startPosition = userPosition;
            userPosition = Math.min(endPosition, userPosition + rollResult); // Update position immediately for logic
            
            animateMove(ui.playerPieceUser, startPosition, rollResult);
        }, 500);
    }

    function computerTurn() {
        const rollResult = Math.floor(Math.random() * 2) + 1; // Computer rolls 1 or 2
        ui.infoBox.textContent = `حریف ${rollResult} انداخت!`;

        const startPosition = computerPosition;
        computerPosition = Math.min(endPosition, computerPosition + rollResult);

        animateMove(ui.playerPieceComputer, startPosition, rollResult);
    }

    function nextTurn() {
        if (isUserTurn) {
            ui.infoBox.textContent = 'نوبت شماست، زار را بیندازید!';
            isMoving = false; // <<< UNLOCK THE CONTROLS FOR THE USER
            ui.diceButton.disabled = false;
        } else {
            ui.infoBox.textContent = 'حریف در حال بازی است...';
            setTimeout(computerTurn, 1200); // Give user time to read before computer moves
        }
    }

    function endGame(userWon) {
        // ... (this function is unchanged and correct) ...
    }

    function playSound(sound) {
        // ... (this function is unchanged and correct) ...
    }

    // --- Event Listeners & Initialization ---
    ui.diceButton.addEventListener('click', rollDice);

    // Initial placement of the pieces on the board
    setTimeout(() => {
        updatePiecePosition(ui.playerPieceUser, userPosition);
        updatePiecePosition(ui.playerPieceComputer, computerPosition);
    }, 200);
});