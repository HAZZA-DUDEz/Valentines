// canvas.js
(() => {
  const c = document.getElementById("paintCanvas");
  const swatchesEl = document.getElementById("swatches");
  const brushSizeEl = document.getElementById("brushSize");
  const brushPill = document.getElementById("brushPill");
  const clearBtn = document.getElementById("clearPaint");
  const saveBtn = document.getElementById("savePaint");
  const toast = document.getElementById("toast");

  if(!c || !swatchesEl || !brushSizeEl || !brushPill || !clearBtn || !saveBtn) return;

  const ctx = c.getContext("2d");

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

  function spawnParticlesAt(x, y, count = 14){
    const emojis = ["💖","✨","💘","🎨","🌸"];
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

  // Fit canvas to CSS size (retina-safe)
  function resizePaint(){
    const cssW = c.clientWidth;
    const cssH = c.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    c.width = Math.floor(cssW * dpr);
    c.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);

    // soft paper fill
    ctx.fillStyle = "rgba(255,255,255,.02)";
    ctx.fillRect(0,0,cssW,cssH);
  }
  window.addEventListener("resize", resizePaint);
  resizePaint();

  // Palette
  const palette = [
    "#ffffff",
    "#ffb8e0",
    "#ff59b7",
    "#ff2aa0",
    "#ffd1e1",
    "#ffdd6e",
    "#80c7ff",
    "#b8ffcf",
    "#111111"
  ];

  let color = "#ff59b7";
  let brush = Number(brushSizeEl.value);

  function setActiveSwatch(hex){
    [...swatchesEl.querySelectorAll(".swatch")].forEach(s =>
      s.classList.toggle("active", s.dataset.color === hex)
    );
  }

  palette.forEach((hex)=>{
    const b = document.createElement("button");
    b.className = "swatch";
    b.type = "button";
    b.dataset.color = hex;
    b.style.background = hex;
    b.addEventListener("click", ()=>{
      color = hex;
      setActiveSwatch(hex);
      setToast(`Color selected ✨`);
    });
    swatchesEl.appendChild(b);
  });
  setActiveSwatch(color);

  brushSizeEl.addEventListener("input", ()=>{
    brush = Number(brushSizeEl.value);
    brushPill.textContent = String(brush);
  });

  let drawing = false;
  let last = null;

  function posFromEvent(e){
    const r = c.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
    return { x, y };
  }

  function strokeLine(a,b){
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = brush;
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.restore();
  }

  // Mouse
  c.addEventListener("mousedown", (e)=>{
    drawing = true;
    last = posFromEvent(e);
  });
  c.addEventListener("mousemove", (e)=>{
    if(!drawing) return;
    const p = posFromEvent(e);
    strokeLine(last, p);
    last = p;
  });
  window.addEventListener("mouseup", ()=>{
    drawing = false;
    last = null;
  });

  // Touch
  c.addEventListener("touchstart", (e)=>{
    drawing = true;
    last = posFromEvent(e);
  }, { passive:true });

  c.addEventListener("touchmove", (e)=>{
    if(!drawing) return;
    const p = posFromEvent(e);
    strokeLine(last, p);
    last = p;
  }, { passive:true });

  c.addEventListener("touchend", ()=>{
    drawing = false;
    last = null;
  });

  clearBtn.addEventListener("click", ()=>{
    resizePaint();
    const mid = centerOf(clearBtn);
    spawnParticlesAt(mid.x, mid.y, 16);
    setToast("Clean slate 🧼🎨");
  });

  saveBtn.addEventListener("click", ()=>{
    const link = document.createElement("a");
    link.download = "myriam_art_corner.png";
    link.href = c.toDataURL("image/png");
    link.click();

    const mid = centerOf(saveBtn);
    spawnParticlesAt(mid.x, mid.y, 18);
    setToast("Saved 💾💘");
  });
})();