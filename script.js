/* Roznamcha - Gamified board with engagement mechanics
   - copy these three files into your project folder and open index.html
   - mobile-first behavior: vibration, simple sounds, localStorage persistence
*/

(() => {
  const spacesData = [
    {type:'start', label:'شروع', xPct:10, yPct:92},
    {type:'sale', label:'فروش', xPct:26, yPct:92},
    {type:'inventory', label:'گدام', xPct:42, yPct:92},
    {type:'expense', label:'مصرف', xPct:58, yPct:92},
    {type:'sale', label:'فروش', xPct:74, yPct:92},
    {type:'expense', label:'کرایه', xPct:90, yPct:92},
    {type:'sale', label:'فروش', xPct:90, yPct:74},
    {type:'inventory', label:'گدام', xPct:90, yPct:56},
    {type:'sale', label:'فروش', xPct:90, yPct:38},
    {type:'end', label:'مفاد!', xPct:90, yPct:20}
  ];

  // DOM
  const board = document.getElementById('board');
  const piece = document.getElementById('piece');
  const rollBtn = document.getElementById('roll-btn');
  const diceFace = document.getElementById('dice');
  const infoText = document.getElementById('info-text');
  const coinsEl = document.getElementById('coins');
  const levelEl = document.getElementById('level');
  const streakEl = document.getElementById('streak');
  const progressBar = document.getElementById('progress-bar');
  const confettiCanvas = document.getElementById('confetti-canvas');
  const winModal = document.getElementById('win-modal');
  const winText = document.getElementById('win-text');
  const closeWin = document.getElementById('close-win');

  // sounds
  const sfxRoll = document.getElementById('sfx-roll');
  const sfxMove = document.getElementById('sfx-move');
  const sfxWin = document.getElementById('sfx-win');
  const sfxBonus = document.getElementById('sfx-bonus');

  // state
  const LAST_INDEX = spacesData.length - 1;
  let currentIndex = 0;
  let rolling = false;
  let rollTimer = null;
  let coins = 0;
  let streak = 0;
  let level = 1;

  // confetti simple engine
  const confetti = (() => {
    const ctx = confettiCanvas.getContext('2d');
    let W = window.innerWidth, H = window.innerHeight;
    confettiCanvas.width = W; confettiCanvas.height = H;
    let particles = [];

    window.addEventListener('resize', ()=>{
      W = window.innerWidth; H = window.innerHeight;
      confettiCanvas.width = W; confettiCanvas.height = H;
    });

    function spawn(n=40, colors=['#F9A825','#FF7043','#66BB6A','#5E35B1']) {
      for(let i=0;i<n;i++){
        particles.push({
          x: Math.random()*W,
          y: -10 - Math.random()*200,
          vx: (Math.random()-0.5)*6,
          vy: 2+Math.random()*6,
          size: 6+Math.random()*8,
          color: colors[Math.floor(Math.random()*colors.length)],
          rot: Math.random()*360,
          life: 120+Math.random()*80
        });
      }
      run();
    }

    let raf=0;
    function run(){
      if(raf) return;
      (function loop(){
        raf = requestAnimationFrame(loop);
        ctx.clearRect(0,0,W,H);
        for(let i=particles.length-1;i>=0;i--){
          const p = particles[i];
          p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.rot += 6;
          p.life--;
          ctx.save();
          ctx.translate(p.x,p.y);
          ctx.rotate(p.rot * Math.PI / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
          ctx.restore();
          if(p.y > H+50 || p.life <= 0) particles.splice(i,1);
        }
        if(particles.length===0){
          cancelAnimationFrame(raf); raf=0;
        }
      })();
    }

    return { spawn };
  })();

  // helpers
  function saveState(){ localStorage.setItem('roz_coins', coins); localStorage.setItem('roz_streak', streak); }
  function loadState(){
    coins = Number(localStorage.getItem('roz_coins')||0);
    streak = Number(localStorage.getItem('roz_streak')||0);
  }

  function updateHUD(){
    coinsEl.textContent = coins;
    streakEl.textContent = streak;
    level = Math.floor(coins/50) + 1;
    levelEl.textContent = level;
    const pct = Math.round((currentIndex / LAST_INDEX) * 100);
    progressBar.style.width = pct + '%';
  }

  function vibrate(ms=30){
    if(navigator.vibrate) navigator.vibrate(ms);
  }

  // draw board tiles
  function drawBoard(){
    board.innerHTML = '';
    const bw = board.clientWidth;
    const bh = board.clientHeight;

    spacesData.forEach((s, i) => {
      const el = document.createElement('div');
      el.className = 'tile type-'+s.type;
      el.textContent = s.label;
      // position by percent of container
      const left = Math.round((s.xPct/100) * bw);
      const top  = Math.round((s.yPct/100) * bh);
      el.style.left = left + 'px';
      el.style.top  = top + 'px';
      el.dataset.index = i;
      board.appendChild(el);
    });

    // position piece on initial tile
    positionPieceToIndex(currentIndex, false);
  }

  // convert index to DOM co-ords
  function getTileCoords(idx){
    // each tile is positioned with CSS using left/top as px; read first
    const tile = board.querySelector(`.tile[data-index="${idx}"]`);
    if(!tile) return {x:20,y:20};
    const rect = tile.getBoundingClientRect();
    const boardRect = board.getBoundingClientRect();
    const cx = rect.left - boardRect.left + rect.width/2;
    const cy = rect.top - boardRect.top + rect.height/2;
    return {x:cx, y:cy};
  }

  // piece movement with hop animation
  function positionPieceToIndex(idx, hop=true){
    const pos = getTileCoords(idx);
    piece.style.left = pos.x + 'px';
    piece.style.top  = pos.y + 'px';
    if(hop){
      piece.classList.add('hop');
      setTimeout(()=> piece.classList.remove('hop'), 300);
    }
  }

  // play small step reward depending on tile type
  function applyTileEffect(idx){
    const t = spacesData[idx].type;
    let delta = 0;
    if(t === 'sale') delta = 3;
    else if(t === 'inventory') delta = 1;
    else if(t === 'expense') delta = -1;
    else if(t === 'end') delta = 0;
    coins = Math.max(0, coins + delta);
    if(delta>0) sfxBonus.play().catch(()=>{});
    updateHUD(); saveState();
  }

  // jackpot / variable reward mechanic
  function maybeGiveBonus(){
    // 12% chance to trigger small jackpot or bonus
    const r = Math.random();
    if(r < 0.12){
      const bonus = 6 + Math.floor(Math.random()*10); // 6-15
      coins += bonus;
      updateHUD(); saveState();
      infoText.textContent = `!جکپات! +${bonus} سکه`;
      confetti.spawn(60);
      try { sfxBonus.play(); } catch(e){}
      return true;
    }
    return false;
  }

  // show near-miss animation (player almost reached end)
  function nearMissEffect(){
    infoText.textContent = 'نزدیک بودی! یک قدم دیگر...';
    confetti.spawn(14,['#ffe082','#ff8a65','#fff59d']);
    vibrate(120);
  }

  // main movement function - steps is number of tiles to move (from dice)
  function moveSteps(steps){
    if(steps <= 0) return;
    rollBtn.disabled = true;
    let target = Math.min(currentIndex + steps, LAST_INDEX);
    // if overshoot (not exact), create near-miss effect
    const overshoot = (currentIndex + steps) > LAST_INDEX;

    let i = currentIndex;
    const interval = setInterval(()=>{
      if(i < target){
        i++;
        positionPieceToIndex(i, true);
        try{ sfxMove.play(); } catch(e){}
        // reward per landed tile
        applyTileEffect(i);
      } else {
        clearInterval(interval);
        currentIndex = i;
        // show special handling if overshoot (simulate near miss: bounce to end then back)
        if(overshoot && currentIndex === LAST_INDEX && (currentIndex !== LAST_INDEX || (currentIndex === LAST_INDEX && (currentIndex - steps) < LAST_INDEX))){
          // we actually got to end (because min used). We want to show near-miss if original sum > LAST_INDEX
          // show bounce-back: briefly show "almost" then move player back one tile (if available)
          if(currentIndex > 0){
            // quick celebration but then bounce back one to create 'almost' sensation
            confetti.spawn(18);
            setTimeout(()=>{
              positionPieceToIndex(LAST_INDEX, true);
              setTimeout(()=>{
                const backTo = Math.max(0, LAST_INDEX - 1);
                positionPieceToIndex(backTo, true);
                currentIndex = backTo;
                infoText.textContent = 'نزدیک بودی! یک قدم کم بود.';
                vibrate(180);
                updateHUD(); saveState();
                rollBtn.disabled = false;
              }, 350);
            }, 250);
          } else {
            rollBtn.disabled = false;
          }
        } else {
          // normal end-of-move
          // check for jackpot/bonus
          const bonus = maybeGiveBonus();
          if(!bonus && currentIndex===LAST_INDEX){
            // win
            setTimeout(winGame, 450);
          } else {
            rollBtn.disabled = false;
            infoText.textContent = 'دوباره تاس بزنید!';
          }
        }
        updateHUD();
      }
    }, 360);
  }

  // win
  function winGame(){
    sfxWin.play().catch(()=>{});
    confetti.spawn(80);
    infoText.textContent = 'شما به مفاد رسیدید! 🎉';
    // increment streak and coins bonus
    streak = (streak||0) + 1;
    coins += 20 + Math.floor(Math.random()*20);
    saveState();
    updateHUD();
    // show modal (download link)
    winText.textContent = `تبریک! شما سطح ${level} — ${coins} سکه دارید. نسخه کامل در دسترس است.`;
    winModal.classList.add('show');
  }

  // dice logic: tap to start rolling, tap again to stop (illusion of control)
  function handleRollTap(){
    if(rolling){
      // stop
      stopRollingAndResolve();
      return;
    }
    // start rolling
    rolling = true;
    rollBtn.classList.add('active');
    sfxRoll.play().catch(()=>{});
    diceFace.textContent = '...';
    infoText.textContent = 'برای توقف دوباره بزنید';
    let faceIdx = 0;
    rollTimer = setInterval(()=>{
      faceIdx = Math.floor(Math.random()*6);
      diceFace.textContent = ['⚀','⚁','⚂','⚃','⚄','⚅'][faceIdx];
    }, 90);

    // auto-stop after 1500ms if user doesn't tap
    setTimeout(()=>{ if(rolling) stopRollingAndResolve(); }, 1500);
  }

  function stopRollingAndResolve(){
    if(!rolling) return;
    rolling = false;
    clearInterval(rollTimer);
    rollBtn.classList.remove('active');
    // final dice value with a tiny bias to encourage progress a bit (soft, subtle)
    // but keep it mostly fair
    let dice = Math.floor(Math.random()*6)+1;
    // small 6% chance to slightly bias towards a bigger roll (variable reward effect)
    if(Math.random()<0.06) dice = Math.min(6, dice + 1);
    diceFace.textContent = ['⚀','⚁','⚂','⚃','⚄','⚅'][dice-1];
    infoText.textContent = `شما ${dice} انداختید!`;
    vibrate(60);
    // apply steps with small delay to build anticipation
    setTimeout(()=> moveSteps(dice), 260);
  }

  // tiny helper: toast (quick micro-feedback)
  function toast(msg, duration=1200){
    const el = document.createElement('div');
    el.style.position='fixed'; el.style.zIndex=999; el.style.right='14px'; el.style.bottom='90px';
    el.style.background='rgba(0,0,0,0.75)'; el.style.color='#fff'; el.style.padding='8px 12px'; el.style.borderRadius='10px';
    el.style.fontSize='13px'; el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(()=> { el.style.opacity=0; el.style.transition='opacity 300ms'; setTimeout(()=>el.remove(),300); }, duration);
  }

  // init
  function init(){
    loadState();
    updateHUD();
    drawBoard();
    bindEvents();
  }

  function bindEvents(){
    rollBtn.addEventListener('click', handleRollTap);
    // also allow tapping the dice face to stop if rolling
    diceFace.addEventListener('click', ()=>{ if(rolling) stopRollingAndResolve(); });

    window.addEventListener('resize', ()=> drawBoard());
    document.getElementById('reset-btn').addEventListener('click', ()=>{
      localStorage.removeItem('roz_coins'); localStorage.removeItem('roz_streak');
      coins = 0; streak = 0; currentIndex = 0; saveState(); updateHUD(); drawBoard();
      infoText.textContent = 'بازی ریست شد.';
      toast('بازی ریست شد');
    });

    closeWin.addEventListener('click', ()=>{
      winModal.classList.remove('show');
      // reset board to play again
      currentIndex = 0; drawBoard(); infoText.textContent = 'دوباره بازی را شروع کنید!';
    });

    // small accessibility: space/enter also roll
    document.addEventListener('keydown', (e)=>{ if(e.code==='Space' || e.key==='Enter') handleRollTap(); });
  }

  // start
  init();

})();
