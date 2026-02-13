// catch-hearts.js
(() => {
  const canvas = document.getElementById("game");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const scorePill = document.getElementById("scorePill");
  const bestPill  = document.getElementById("bestPill");
  const timePill  = document.getElementById("timePill");

  const startBtn = document.getElementById("startBtn");
  const hardBtn  = document.getElementById("hardBtn");
  const easyBtn  = document.getElementById("easyBtn");

  const toast = document.getElementById("toast");

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function setToast(msg){
    if(!toast) return;
    toast.textContent = msg;
    clearTimeout(setToast._t);
    setToast._t = setTimeout(() => (toast.textContent = ""), 2200);
  }

  // Retina-safe sizing (CSS size drives the real canvas)
  function resizeCanvasToCSS(){
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    canvas.width  = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);

    ctx.setTransform(dpr,0,0,dpr,0,0);

    catcher.x = cssW / 2;
    catcher.y = cssH - 62;
  }
  window.addEventListener("resize", resizeCanvasToCSS);

  // Game state
  let best = Number(localStorage.getItem("catch_hearts_best") || 0);
  if (bestPill) bestPill.textContent = `Best: ${best}`;

  let running = false;
  let score = 0;
  let timeLeft = 30;
  let difficulty = 1.0;

  const catcher = { x: 0, y: 0, w: 160, h: 22 };
  const hearts = [];
  const sparks = [];

function spawnHeart(){
  const baseW = 900;
  const scale = canvas.clientWidth / baseW;

  const size = (18 + Math.random()*14) * scale;

  hearts.push({
    x: Math.random() * (canvas.clientWidth - size) + size/2,
    y: -30,
    r: size/2,
    vy: (2.2 + Math.random()*2.2) * difficulty * (0.85 + 0.3*scale),
    wiggle: Math.random()*Math.PI*2,
    rot: (Math.random()*0.8 - 0.4)
  });
}

  function spawnSparks(x,y){
    for(let i=0;i<10;i++){
      sparks.push({
        x, y,
        vx: (Math.random()*2 - 1) * 2.4,
        vy: (Math.random()*2 - 1) * 2.4,
        life: 26 + Math.random()*12
      });
    }
  }

  function drawHeart(x, y, s, rot=0){
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);

    // glow
    ctx.shadowColor = "rgba(255,89,183,.45)";
    ctx.shadowBlur = 14;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(0, -3, -5, -3, -5, 0);
    ctx.bezierCurveTo(-5, 4, 0, 5.5, 0, 8);
    ctx.bezierCurveTo(0, 5.5, 5, 4, 5, 0);
    ctx.bezierCurveTo(5, -3, 0, -3, 0, 0);
    ctx.closePath();

    // inverted look: white fill, pink stroke
    ctx.fillStyle = "rgba(255,255,255,.95)";
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255,89,183,.95)";
    ctx.lineWidth = 0.9;
    ctx.stroke();

    ctx.restore();
  }

  function roundRect(x, y, w, h, r){
    r = Math.min(r, w/2, h/2);
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.arcTo(x+w, y, x+w, y+h, r);
    ctx.arcTo(x+w, y+h, x, y+h, r);
    ctx.arcTo(x, y+h, x, y, r);
    ctx.arcTo(x, y, x+w, y, r);
    ctx.closePath();
  }

  function draw(){
    ctx.clearRect(0,0,canvas.clientWidth, canvas.clientHeight);

    // faint drifting hearts
    for(let i=0;i<12;i++){
      const x = (i * 95 + (performance.now()/16)) % canvas.clientWidth;
      const y = (i * 63 + (performance.now()/28)) % canvas.clientHeight;
      drawHeart(x, y, 0.75, 0);
    }

    // catcher bar
    const cx = catcher.x - catcher.w/2;
    const cy = catcher.y;

    ctx.fillStyle = "rgba(255,255,255,.12)";
    ctx.strokeStyle = "rgba(255,255,255,.65)";
    ctx.lineWidth = 2;
    roundRect(cx, cy, catcher.w, catcher.h, 999);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,.95)";
    ctx.font = "600 13px 'Playfair Display', serif";
    ctx.fillText("Catch hearts for kisses", cx + 14, cy - 10);

    // falling hearts
    const baseW = 900; // the canvas width you designed it for originally
    const scale = canvas.clientWidth / baseW;

    for (const h of hearts) {
        drawHeart(h.x, h.y, (h.r / 6) * scale, h.rot);
    }

    // sparkles
    for(const s of sparks){
      const a = clamp(s.life/38, 0, 1);
      ctx.fillStyle = `rgba(255,209,225,${a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 2, 0, Math.PI*2);
      ctx.fill();
    }

    // overlay when idle
    if(!running){
      ctx.fillStyle = "rgba(0,0,0,.10)";
      ctx.fillRect(0,0,canvas.clientWidth, canvas.clientHeight);

      ctx.fillStyle = "rgba(255,255,255,.98)";
      ctx.font = "700 22px 'Playfair Display', serif";
      ctx.fillText("Click Start 💘", 28, 54);

      ctx.font = "400 14px 'Playfair Display', serif";
      ctx.fillText("Every heart caught = a kiss.", 28, 80);
    }
  }

  function update(){
    if(!running) return;

    if (Math.random() < 0.06 * difficulty) spawnHeart();

    // hearts update
    for(let i=hearts.length-1; i>=0; i--){
      const h = hearts[i];
      h.wiggle += 0.05;
      h.x += Math.sin(h.wiggle) * 0.75 * difficulty;
      h.y += h.vy;

      const left = catcher.x - catcher.w/2;
      const right = catcher.x + catcher.w/2;

      // collision
      if (h.x > left && h.x < right && h.y + h.r > catcher.y && h.y - h.r < catcher.y + catcher.h){
        hearts.splice(i,1);
        score += 1;
        if(scorePill) scorePill.textContent = `Score: ${score}`;
        spawnSparks(h.x, catcher.y);
        continue;
      }

      // missed
      if (h.y > canvas.clientHeight + 60){
        hearts.splice(i,1);
        score = Math.max(0, score - 1);
        if(scorePill) scorePill.textContent = `Score: ${score}`;
      }
    }

    // sparkles update
    for(let i=sparks.length-1;i>=0;i--){
      const s = sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vx *= 0.98;
      s.vy *= 0.98;
      s.life -= 1;
      if(s.life <= 0) sparks.splice(i,1);
    }
  }

  // input
  function setCatcherX(clientX){
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    catcher.x = clamp(x, catcher.w/2 + 10, canvas.clientWidth - catcher.w/2 - 10);
  }
  canvas.addEventListener("mousemove", (e)=> setCatcherX(e.clientX));
  canvas.addEventListener("touchmove", (e)=>{
    if(e.touches && e.touches[0]) setCatcherX(e.touches[0].clientX);
  }, { passive:true });

  // timer
  let timer = null;
  function startGame(){
    running = true;
    score = 0;
    timeLeft = 30;
    hearts.length = 0;
    sparks.length = 0;

    if(scorePill) scorePill.textContent = `Score: ${score}`;
    if(timePill) timePill.textContent = `Time: ${timeLeft}s`;

    clearInterval(timer);
    timer = setInterval(() => {
      timeLeft -= 1;
      if(timePill) timePill.textContent = `Time: ${timeLeft}s`;
      if(timeLeft <= 0) endGame();
    }, 1000);

    setToast("Go go go 💗");
  }

  function endGame(){
    running = false;
    clearInterval(timer);
    timer = null;

    if(score > best){
      best = score;
      localStorage.setItem("catch_hearts_best", String(best));
      if(bestPill) bestPill.textContent = `Best: ${best}`;
      setToast("NEW BEST 💘");
    } else {
      const msgs = [
        "Okay wow… adorable.",
        "Official diagnosis: too lovable.",
        "Redeem 1 forehead kiss.",
        "Harry is proud (and dramatic)."
      ];
      setToast(msgs[Math.floor(Math.random()*msgs.length)]);
    }
  }

  // difficulty buttons
  startBtn?.addEventListener("click", startGame);
  hardBtn?.addEventListener("click", () => {
    difficulty = Math.min(2.2, difficulty + 0.2);
    setToast(`Difficulty: ${difficulty.toFixed(1)} 😈`);
  });
  easyBtn?.addEventListener("click", () => {
    difficulty = Math.max(0.7, difficulty - 0.2);
    setToast(`Difficulty: ${difficulty.toFixed(1)} 😇`);
  });

  // run
  resizeCanvasToCSS();
  (function loop(){
    update();
    draw();
    requestAnimationFrame(loop);
  })();
})();