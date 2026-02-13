// heart-clicker.js
(() => {
  const heartsPill = document.getElementById("heartsPill");
  const hpsPill = document.getElementById("hpsPill");
  const totalPill = document.getElementById("totalPill");

  const bigHeartBtn = document.getElementById("bigHeartBtn");
  const toast = document.getElementById("toast");

  const costNoteEl = document.getElementById("costNote");
  const costChocoEl = document.getElementById("costChoco");
  const costFlowersEl = document.getElementById("costFlowers");
  const costBoostEl = document.getElementById("costBoost");

  const buyNote = document.getElementById("buyNote");
  const buyChoco = document.getElementById("buyChoco");
  const buyFlowers = document.getElementById("buyFlowers");
  const buyBoost = document.getElementById("buyBoost");

  if(!heartsPill || !bigHeartBtn) return;

  const SAVE_KEY = "heart_clicker_save_v1";

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

  function pulse(el){
    el.classList.remove("pulse");
    void el.offsetWidth;
    el.classList.add("pulse");
  }

  function flashShopItem(el){
    el.classList.remove("flash");
    void el.offsetWidth;
    el.classList.add("flash");
  }

  function celebrateTiny(){
    document.body.classList.add("celebrate");
    setTimeout(() => document.body.classList.remove("celebrate"), 260);
  }

  function spawnParticlesAt(x, y, count = 14, kind = "heart"){
    for(let i=0;i<count;i++){
      const p = document.createElement("div");
      p.className = "particle";

      const emojis = kind === "buy"
        ? ["💖","✨","💘","🌸","💝"]
        : ["💗","💖","💘","✨"];

      p.textContent = emojis[Math.floor(Math.random()*emojis.length)];

      const angle = Math.random() * Math.PI * 2;
      const power = 60 + Math.random() * 90;
      const dx = Math.cos(angle) * power;
      const dy = Math.sin(angle) * power - (40 + Math.random()*60);

      p.style.left = `${x}px`;
      p.style.top = `${y}px`;
      p.style.setProperty("--dx", `${dx}px`);
      p.style.setProperty("--dy", `${dy}px`);
      p.style.fontSize = `${14 + Math.random()*14}px`;

      document.body.appendChild(p);
      setTimeout(()=> p.remove(), 980);
    }
  }

  function floatPlus(x,y,text="+1"){
    const el = document.createElement("div");
    el.className = "floatText";
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.color = "rgba(255,255,255,.98)";
    document.body.appendChild(el);
    setTimeout(()=> el.remove(), 900);
  }

  function load(){
    try{
      const raw = localStorage.getItem(SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    }catch{
      return null;
    }
  }
  function save(state){
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  const state = load() || {
    hearts: 0,
    totalClicks: 0,
    clickPower: 1,
    upgrades: {
      note:   { count: 0, baseCost: 25,  hps: 1  },
      choco:  { count: 0, baseCost: 120, hps: 5  },
      flowers:{ count: 0, baseCost: 420, hps: 18 },
      boost:  { count: 0, baseCost: 300, mult: 2 }
    }
  };

  function upgradeCost(base, count){
    return Math.floor(base * Math.pow(1.18, count));
  }

  function computeHPS(){
    const u = state.upgrades;
    return (u.note.count * u.note.hps)
         + (u.choco.count * u.choco.hps)
         + (u.flowers.count * u.flowers.hps);
  }

  function refresh(){
    const hps = computeHPS();

    heartsPill.textContent = `Hearts: ${Math.floor(state.hearts)}`;
    hpsPill.textContent = `Hearts/sec: ${hps}`;
    totalPill.textContent = `Total clicks: ${state.totalClicks}`;

    const cNote = upgradeCost(state.upgrades.note.baseCost, state.upgrades.note.count);
    const cChoco = upgradeCost(state.upgrades.choco.baseCost, state.upgrades.choco.count);
    const cFlowers = upgradeCost(state.upgrades.flowers.baseCost, state.upgrades.flowers.count);
    const cBoost = upgradeCost(state.upgrades.boost.baseCost, state.upgrades.boost.count);

    costNoteEl.textContent = cNote;
    costChocoEl.textContent = cChoco;
    costFlowersEl.textContent = cFlowers;
    costBoostEl.textContent = cBoost;

    buyNote.disabled = state.hearts < cNote;
    buyChoco.disabled = state.hearts < cChoco;
    buyFlowers.disabled = state.hearts < cFlowers;
    buyBoost.disabled = state.hearts < cBoost;
  }

  // CLICK
  bigHeartBtn.addEventListener("click", () => {
    const gain = state.clickPower;
    state.hearts += gain;
    state.totalClicks += 1;

    refresh();
    save(state);

    pulse(bigHeartBtn);
    const c = centerOf(bigHeartBtn);
    spawnParticlesAt(c.x, c.y, 14, "heart");
    floatPlus(c.x, c.y, `+${gain}`);
  });

  // BUY buttons
  buyNote.addEventListener("click", () => {
    const cost = upgradeCost(state.upgrades.note.baseCost, state.upgrades.note.count);
    if(state.hearts < cost) return;

    state.hearts -= cost;
    state.upgrades.note.count += 1;

    refresh(); save(state);
    setToast("Love Note purchased 💌");
    flashShopItem(document.getElementById("itemNote"));
    const c = centerOf(buyNote);
    spawnParticlesAt(c.x, c.y, 18, "buy");
  });

  buyChoco.addEventListener("click", () => {
    const cost = upgradeCost(state.upgrades.choco.baseCost, state.upgrades.choco.count);
    if(state.hearts < cost) return;

    state.hearts -= cost;
    state.upgrades.choco.count += 1;

    refresh(); save(state);
    setToast("Chocolate Box acquired 🍫");
    flashShopItem(document.getElementById("itemChoco"));
    const c = centerOf(buyChoco);
    spawnParticlesAt(c.x, c.y, 20, "buy");
  });

  buyFlowers.addEventListener("click", () => {
    const cost = upgradeCost(state.upgrades.flowers.baseCost, state.upgrades.flowers.count);
    if(state.hearts < cost) return;

    state.hearts -= cost;
    state.upgrades.flowers.count += 1;

    refresh(); save(state);
    setToast("Bouquet unlocked 🌸");
    flashShopItem(document.getElementById("itemFlowers"));
    const c = centerOf(buyFlowers);
    spawnParticlesAt(c.x, c.y, 22, "buy");
    celebrateTiny();
  });

  buyBoost.addEventListener("click", () => {
    const cost = upgradeCost(state.upgrades.boost.baseCost, state.upgrades.boost.count);
    if(state.hearts < cost) return;

    state.hearts -= cost;
    state.upgrades.boost.count += 1;
    state.clickPower *= state.upgrades.boost.mult;

    refresh(); save(state);
    setToast("Engagement Energy activated 💍");
    flashShopItem(document.getElementById("itemBoost"));
    const c = centerOf(buyBoost);
    spawnParticlesAt(c.x, c.y, 26, "buy");
    celebrateTiny();
  });

  // passive income loop
  setInterval(() => {
    const hps = computeHPS();
    if(hps > 0){
      state.hearts += hps / 2; // twice per second
      refresh();
      save(state);
    } else {
      refresh();
    }
  }, 500);

  refresh();
})();