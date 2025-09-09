// script.js
document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    const startScreen = document.getElementById('start-screen');
    const endScreen = document.getElementById('end-screen');
    const startButton = document.getElementById('start-button');
    const timerEl = document.getElementById('timer');
    
    // Game state
    let score = 0;
    let timeLeft = 30;
    let gameInterval;
    let timerInterval;

    const assets = {
        purchase: { img: 'https://i.imgur.com/sC5bWdI.png', value: 150 }, // receipt
        sale: { img: 'https://i.imgur.com/83mJ5nO.png', value: 250 }, // coin
        inventory: { img: 'https://i.imgur.com/wA2P8oV.png', value: 1 } // box
    };

    const ui = {
        salesTotal: document.getElementById('sales-total'),
        purchasesTotal: document.getElementById('purchases-total'),
        inventoryTotal: document.getElementById('inventory-total'),
        finalTitle: document.getElementById('end-title'),
        finalScore: document.getElementById('final-score')
    };

    let draggedItem = null;

    function createItem() {
        const itemTypes = Object.keys(assets);
        const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        const item = document.createElement('div');
        item.className = 'item';
        item.style.backgroundImage = `url(${assets[type].img})`;
        item.style.left = `${Math.random() * (window.innerWidth - 60)}px`;
        item.style.top = `-${Math.random() * 100 + 60}px`;
        item.dataset.type = type;
        item.dataset.value = assets[type].value;

        // Animate falling
        const fallDuration = Math.random() * 4000 + 4000; // 4-8 seconds
        item.animate([
            { top: '-60px' },
            { top: `${window.innerHeight}px` }
        ], {
            duration: fallDuration,
            easing: 'linear'
        });
        
        gameContainer.appendChild(item);
        
        // Remove item if it goes off-screen
        setTimeout(() => { item.remove(); }, fallDuration);
        
        // Drag and Drop listeners
        item.addEventListener('mousedown', (e) => {
            draggedItem = item;
            item.classList.add('dragging');
        });
    }

    window.addEventListener('mousemove', (e) => {
        if (draggedItem) {
            draggedItem.style.left = `${e.clientX - 30}px`;
            draggedItem.style.top = `${e.clientY - 30}px`;
        }
    });

    window.addEventListener('mouseup', (e) => {
        if (draggedItem) {
            const targetId = e.target.id;
            const itemType = draggedItem.dataset.type;
            
            if (targetId === `target-${itemType}`) {
                // Correct drop
                score += parseInt(draggedItem.dataset.value);
                updateDashboard(itemType, parseInt(draggedItem.dataset.value));
                draggedItem.remove();
            }
            draggedItem.classList.remove('dragging');
            draggedItem = null;
        }
    });

    function updateDashboard(type, value) {
        let el;
        switch (type) {
            case 'sale': el = ui.salesTotal; break;
            case 'purchase': el = ui.purchasesTotal; break;
            case 'inventory': el = ui.inventoryTotal; break;
        }
        if (el) {
            let current = parseFloat(el.textContent) || 0;
            el.textContent = current + value;
            el.style.color = '#00BFA5';
            setTimeout(() => { el.style.color = '#212529'; }, 300);
        }
    }

    function startGame() {
        score = 0;
        timeLeft = 30;
        gameContainer.innerHTML = '';
        ui.salesTotal.textContent = '0';
        ui.purchasesTotal.textContent = '0';
        ui.inventoryTotal.textContent = '0';

        startScreen.classList.add('hidden');
        
        gameInterval = setInterval(createItem, 800); // Create a new item every 0.8 seconds
        
        timerInterval = setInterval(() => {
            timeLeft--;
            timerEl.textContent = timeLeft;
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }

    function endGame() {
        clearInterval(gameInterval);
        clearInterval(timerInterval);
        ui.finalTitle.textContent = "وقت تمام شد!";
        ui.finalScore.textContent = score;
        endScreen.classList.remove('hidden');
    }
    
    startButton.addEventListener('click', startGame);
});