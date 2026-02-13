// vinyl.js

function setToast(msg){
  const toast = document.getElementById("toast");
  if(!toast) return;
  toast.textContent = msg;
  clearTimeout(setToast._t);
  setToast._t = setTimeout(()=> toast.textContent = "", 2400);
}

function spawnParticlesAt(){ /* optional: keep your particles if you want */ }

(() => {
  const player = document.getElementById("scPlayer");
  const nowPlaying = document.getElementById("nowPlaying");
  const vinyls = document.querySelectorAll(".vinyl");
  const dropZone = document.getElementById("dropZone");
  const stopBtn = document.getElementById("stopBtn");

  const turntable = document.getElementById("turntable");
  const recordLabelImg = document.getElementById("recordLabelImg");

  if(!player || !nowPlaying || !vinyls.length || !dropZone || !stopBtn || !turntable || !recordLabelImg) return;

  let currentVinyl = null;

  function setPlaying(isPlaying){
    turntable.classList.toggle("isPlaying", isPlaying);
    if(currentVinyl) currentVinyl.classList.toggle("isPlaying", isPlaying);
  }

  function stop(){
    player.src = "";
    nowPlaying.textContent = "Now Playing: —";
    setPlaying(false);
    if(currentVinyl){
      currentVinyl.classList.remove("isPlaying");
      currentVinyl = null;
    }
    setToast("Stopped ⏹️");
  }

  function playFromVinyl(v){
    const url = v.getAttribute("data-soundcloud");
    const label = v.getAttribute("data-label") || v.querySelector(".vinylLabel")?.textContent || "Song";

    if(!url){
      setToast("No SoundCloud embed URL found 😅");
      return;
    }

    // Update current vinyl
    if(currentVinyl && currentVinyl !== v){
      currentVinyl.classList.remove("isPlaying");
    }
    currentVinyl = v;

    // Set turntable label art from the vinyl's label image
    const art = v.querySelector(".vinylArt");
    recordLabelImg.src = art?.getAttribute("src") || "";
    recordLabelImg.alt = "";

    nowPlaying.textContent = `Now Playing: ${label}`;
    player.src = url;

    setPlaying(true);
    setToast(`Playing: ${label} 🎶`);
  }

  // Drag support
  vinyls.forEach(v => {
    v.addEventListener("dragstart", (e) => {
      v.setAttribute("aria-grabbed", "true");
      try{
        e.dataTransfer.setData("text/plain", "vinyl");
        e.dataTransfer.effectAllowed = "move";
      }catch{}
      setToast("Drop it on the player 💿");
    });

    v.addEventListener("dragend", () => {
      v.setAttribute("aria-grabbed", "false");
    });

    // Mobile tap fallback
    v.addEventListener("click", () => playFromVinyl(v));
  });

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("isOver");
    try{ e.dataTransfer.dropEffect = "move"; }catch{}
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("isOver");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("isOver");

    // play the vinyl that is currently grabbed (simple approach: pick the one aria-grabbed=true)
    const grabbed = [...vinyls].find(v => v.getAttribute("aria-grabbed") === "true");
    if(!grabbed){
      setToast("Drag a vinyl from the shelf first 💿");
      return;
    }
    playFromVinyl(grabbed);
    grabbed.setAttribute("aria-grabbed", "false");
  });

  stopBtn.addEventListener("click", stop);
})();
