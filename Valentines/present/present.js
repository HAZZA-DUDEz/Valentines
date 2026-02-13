// present.js
(() => {
  const giftBtn = document.getElementById("giftBtn");
  const revealWrap = document.getElementById("revealWrap");
  const toast = document.getElementById("toast");

  if(!giftBtn || !revealWrap) return;

  let open = false;

  function setToast(msg){
    if(!toast) return;
    toast.textContent = msg;
    clearTimeout(setToast._t);
    setToast._t = setTimeout(() => (toast.textContent = ""), 2200);
  }

  function centerOf(el){
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width/2, y: r.top + r.height/2 };
  }

  function spawnParticlesAt(x, y, count = 22){
    const emojis = ["💖","✨","💘","🌸","💝","🎁"];
    for(let i=0;i<count;i++){
      const p = document.createElement("div");
      p.className = "particle";
      p.textContent = emojis[Math.floor(Math.random()*emojis.length)];

      const angle = Math.random() * Math.PI * 2;
      const power = 70 + Math.random() * 110;
      const dx = Math.cos(angle) * power;
      const dy = Math.sin(angle) * power - (40 + Math.random()*70);

      p.style.left = `${x}px`;
      p.style.top = `${y}px`;
      p.style.setProperty("--dx", `${dx}px`);
      p.style.setProperty("--dy", `${dy}px`);
      p.style.fontSize = `${16 + Math.random()*18}px`;

      document.body.appendChild(p);
      setTimeout(()=> p.remove(), 980);
    }
  }

  giftBtn.addEventListener("click", () => {
    open = !open;

    giftBtn.classList.toggle("open", open);
    revealWrap.classList.toggle("show", open);

    const c = centerOf(giftBtn);

    if(open){
      spawnParticlesAt(c.x, c.y, 26);
      setToast("SURPRISEEE 🎁💖");
    }else{
      spawnParticlesAt(c.x, c.y, 12);
      setToast("Close it… then open again 😈");
    }
  });
})();