document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    const startScreen = document.getElementById('start-screen');
    const endScreen = document.getElementById('end-screen');
    const startButton = document.getElementById('start-button');
    const timerEl = document.getElementById('timer');
    
    // Game state variables
    let score = 0;
    let timeLeft = 30;
    let gameInterval;
    let timerInterval;
    let draggedItem = null;

    const assets = {
        purchase: { img: 'https://i.imgur.com/sC5bWdI.png', value: 150 },
        sale: { img: 'https://i.imgur.com/83mJ5nO.png', value: 250 },
        inventory: { img: 'https://i.imgur.com/wA2P8oV.png', value: 1 }
    };

    const ui = {
        salesTotal: document.getElementById('sales-total'),
        purchasesTotal: document.getElementById('purchases-total'),
        inventoryTotal: document.getElementById('inventory-total'),
        finalTitle: document.getElementById('end-title'),
        finalScore: document.getElementById('final-score'),
        finalMessage: document.getElementById('end-message') // Get the message element
    };
    
    const targets = {
        purchase: document.getElementById('target-purchase'),
        sale: document.getElementById('target-sale'),
        inventory: document.getElementById('target-inventory')
    };

    // --- GAME LOGIC ---
    function createItem() {
        const itemTypes = Object.keys(assets);
        const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        const item = document.createElement('div');
        item.className = 'item';
        item.style.backgroundImage = `url(${assets[type].img})`;
        item.style.left = `${Math.random() * (window.innerWidth - 60)}px`;
        item.style.top = `-100px`;
        item.dataset.type = type;
        item.dataset.value = assets[type].value;

        const fallDuration = Math.random() * 4000 + 4000;
        item.animate([ { top: '-100px' }, { top: `${window.innerHeight + 100}px` } ], { duration: fallDuration, easing: 'linear' });
        
        gameContainer.appendChild(item);
        setTimeout(() => { if (item) item.remove(); }, fallDuration);
        
        item.addEventListener('mousedown', () => { draggedItem = item; item.classList.add('dragging'); });
    }

    // --- MOUSE/TOUCH EVENT LISTENERS ---
    function onMouseMove(e) {
        if (draggedItem) {
            const touch = e.touches ? e.touches[0] : e;
            draggedItem.style.left = `${touch.clientX - 30}px`;
            draggedItem.style.top = `${touch.clientY - 30}px`;
        }
    }

    function onMouseUp(e) {
        if (!draggedItem) return;

        const touch = e.changedTouches ? e.changedTouches[0] : e;
        const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
        const itemType = draggedItem.dataset.type;

        if (dropTarget && dropTarget.id === `target-${itemType}`) {
            score += parseInt(draggedItem.dataset.value, 10);
            updateDashboard(itemType, parseInt(draggedItem.dataset.value, 10));
            draggedItem.remove();
        }
        
        draggedItem.classList.remove('dragging');
        draggedItem = null;
        Object.values(targets).forEach(t => t.classList.remove('hover'));
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchend', onMouseUp);

    Object.values(targets).forEach(target => {
        target.addEventListener('mouseenter', () => target.classList.add('hover'));
        target.addEventListener('mouseleave', () => target.classList.remove('hover'));
    });

    function updateDashboard(type, value) {
        let el;
        switch (type) {
            case 'sale': el = ui.salesTotal; break;
            case 'purchase': el = ui.purchasesTotal; break;
            case 'inventory': el = ui.inventoryTotal; break;
        }
        if (el) {
            let current = parseFloat(el.textContent.replace(/,/g, '')) || 0;
            el.textContent = (current + value).toLocaleString('en-US');
            el.style.color = '#00BFA5';
            setTimeout(() => { el.style.color = '#212529'; }, 300);
        }
    }

    function startGame() {
        score = 0; timeLeft = 30;
        gameContainer.innerHTML = '';
        ui.salesTotal.textContent = '0';
        ui.purchasesTotal.textContent = '0';
        ui.inventoryTotal.textContent = '0';

        startScreen.classList.remove('show');
        startScreen.classList.add('hidden'); // Force hide
        
        gameInterval = setInterval(createItem, 900);
        
        timerInterval = setInterval(() => {
            timeLeft--;
            timerEl.textContent = timeLeft;
            if (timeLeft <= 0) endGame();
        }, 1000);
    }

    function endGame() {
        clearInterval(gameInterval);
        clearInterval(timerInterval);
        ui.finalTitle.textContent = "وقت تمام شد!";
        ui.finalScore.textContent = score.toLocaleString('en-US');
        ui.finalMessage.textContent = "روزنامچه حسابات شما را همیشه منظم نگه میدارد.";
        endScreen.classList.add('show');
    }
    
    startButton.addEventListener('click', startGame);
});