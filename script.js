document.addEventListener('DOMContentLoaded', () => {
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

    let userPosition = 0;
    let computerPosition = 0;
    const endPosition = ui.spaces.length - 1;
    let isUserTurn = true;
    let isMoving = false;

    function updatePiecePosition(piece, position) {
        const targetSpace = ui.spaces[position];
        if (!targetSpace) return;
        const boardRect = targetSpace.closest('.board').getBoundingClientRect();
        const targetRect = targetSpace.getBoundingClientRect();
        const top = targetRect.top - boardRect.top + (targetRect.height / 2) - (piece.offsetHeight / 2);
        const left = targetRect.left - boardRect.left + (targetRect.width / 2) - (piece.offsetWidth / 2);
        piece.style.transform = `translate(${left}px, ${top}px)`;
    }
    
    function animateMove(piece, currentPos, steps) {
        if (steps <= 0) {
            setTimeout(() => handleSpaceEffect(piece, currentPos), 400);
            return;
        }
        let nextPos = currentPos + 1;
        if (nextPos > endPosition) nextPos = endPosition;
        
        updatePiecePosition(piece, nextPos);
        playSound(ui.sounds.move);
        
        setTimeout(() => animateMove(piece, nextPos, steps - 1), 300);
    }

    function handleSpaceEffect(piece, position) {
        const space = ui.spaces[position];
        space.classList.add('animate-bounce');
        setTimeout(() => space.classList.remove('animate-bounce'), 500);

        let effectMessage = '';
        let newPosition = position;
        let sound = null;

        if (space.classList.contains('expense')) {
            newPosition = Math.max(0, position - 2);
            effectMessage = 'وه! یک مصرف باعث شد ۲ خانه به عقب بروید.';
            sound = ui.sounds.penalty;
        } else if (space.classList.contains('profit')) {
            newPosition = Math.min(endPosition, position + 3);
            effectMessage = 'عالی! مفاد خالص شما را ۳ خانه پیش برد.';
            sound = ui.sounds.bonus;
        }

        if (newPosition !== position) {
            ui.infoBox.textContent = effectMessage;
            playSound(sound);
            setTimeout(() => {
                updatePiecePosition(piece, newPosition);
                if (piece === ui.playerPieceUser) userPosition = newPosition;
                else computerPosition = newPosition;
                checkWinOrSwitchTurn(piece);
            }, 1000);
        } else {
            checkWinOrSwitchTurn(piece);
        }
    }

    function checkWinOrSwitchTurn(piece) {
        const currentPosition = (piece === ui.playerPieceUser) ? userPosition : computerPosition;
        if (currentPosition >= endPosition) {
            setTimeout(() => endGame(piece === ui.playerPieceUser), 500);
        } else {
            isUserTurn = !isUserTurn;
            setTimeout(nextTurn, 1000);
        }
    }

    function rollDice() {
        if (isMoving) return;
        isMoving = true;
        ui.diceButton.disabled = true;
        
        playSound(ui.sounds.roll);
        ui.diceButton.classList.add('rolling');
        
        const rollResult = Math.floor(Math.random() * 3) + 1;
        
        setTimeout(() => {
            ui.diceButton.classList.remove('rolling');
            ui.infoBox.textContent = `شما ${rollResult} انداختید!`;
            animateMove(ui.playerPieceUser, userPosition, rollResult);
            userPosition = Math.min(endPosition, userPosition + rollResult);
        }, 500);
    }
    
    function computerTurn() {
        const rollResult = Math.floor(Math.random() * 2) + 1; // Computer is slightly less lucky
        ui.infoBox.textContent = `حریف ${rollResult} انداخت!`;
        animateMove(ui.playerPieceComputer, computerPosition, rollResult);
        computerPosition = Math.min(endPosition, computerPosition + rollResult);
    }

    function nextTurn() {
        if (isUserTurn) {
            ui.infoBox.textContent = 'نوبت شماست، زار را بیندازید!';
            ui.diceButton.disabled = false;
        } else {
            ui.infoBox.textContent = 'حریف در حال بازی است...';
            setTimeout(computerTurn, 1000);
        }
    }

    function endGame(userWon) {
        if (userWon) {
            ui.finalTitle.textContent = "شما برنده شدید!";
            ui.finalMessage.textContent = "روزنامچه به شما کمک میکند تا همیشه در کسب و کارتان برنده باشید.";
            playSound(ui.sounds.win);
        } else {
            ui.finalTitle.textContent = "حریف برنده شد!";
            ui.finalMessage.textContent = "نگران نباشید، با روزنامچه میتوانید دوباره امتحان کنید و موفق شوید.";
            playSound(ui.sounds.lose);
        }
        ui.finalScreen.classList.add('show');
    }

    function playSound(sound) {
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log("Audio play failed:", e));
        }
    }

    ui.diceButton.addEventListener('click', rollDice);
    
    // Initial placement of the pieces
    setTimeout(() => {
        updatePiecePosition(ui.playerPieceUser, userPosition);
        updatePiecePosition(ui.playerPieceComputer, computerPosition);
    }, 200);
});