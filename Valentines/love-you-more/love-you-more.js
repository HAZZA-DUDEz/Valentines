// love-you-more.js
(() => {
  const arena = document.getElementById("arena");
  const btn = document.getElementById("loveBtn");
  const toast = document.getElementById("toast");

  if (!arena || !btn) return;

  let dodgeLevel = 1;

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function setToast(msg){
    if(!toast) return;
    toast.textContent = msg;
    clearTimeout(setToast._t);
    setToast._t = setTimeout(() => (toast.textContent = ""), 2200);
  }

  function placeButton(x, y){
    btn.style.left = `${x}px`;
    btn.style.top  = `${y}px`;
  }

  function randomPos(awayFromX = null, awayFromY = null){
    const a = arena.getBoundingClientRect();
    const b = btn.getBoundingClientRect();

    const pad = 12;

    // If button is larger than arena (mobile / zoom), still keep it usable
    const maxX = Math.max(pad, a.width  - b.width  - pad);
    const maxY = Math.max(pad, a.height - b.height - pad);

    let x = pad + Math.random() * (maxX - pad);
    let y = pad + Math.random() * (maxY - pad);

    if (awayFromX !== null && awayFromY !== null){
      const dx = x - awayFromX;
      const dy = y - awayFromY;
      const mag = Math.hypot(dx, dy) || 1;

      x = clamp(x + (dx / mag) * 140 * dodgeLevel, pad, maxX);
      y = clamp(y + (dy / mag) *  80 * dodgeLevel, pad, maxY);
    }

    placeButton(x, y);
  }

  // initial placement
  requestAnimationFrame(() => randomPos());

  // dodge when mouse gets close
  arena.addEventListener("mousemove", (e) => {
    const a = arena.getBoundingClientRect();

    const mx = e.clientX - a.left;
    const my = e.clientY - a.top;

    const b = btn.getBoundingClientRect();
    const bx = (b.left - a.left) + b.width / 2;
    const by = (b.top  - a.top)  + b.height / 2;

    const dist = Math.hypot(mx - bx, my - by);
    if (dist < 140) randomPos(mx, my);
  });

  // touch support: if they tap near it, it dodges
  arena.addEventListener("touchstart", (e) => {
    const t = e.touches && e.touches[0];
    if(!t) return;

    const a = arena.getBoundingClientRect();
    const mx = t.clientX - a.left;
    const my = t.clientY - a.top;

    randomPos(mx, my);
  }, { passive: true });

  btn.addEventListener("click", () => {
    setToast("Sorry… but that’s just impossible 😌💘");
    dodgeLevel = Math.min(2.5, dodgeLevel + 0.12);
    randomPos();
  });

  // keeps it behaving after resize/zoom
  window.addEventListener("resize", () => randomPos());
})();