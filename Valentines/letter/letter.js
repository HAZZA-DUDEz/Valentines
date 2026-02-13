// letter.js
(() => {
  const sealCard = document.getElementById("sealCard");
  const waxSeal = document.getElementById("waxSeal");
  const scroll = document.getElementById("scroll");
  const closeBtn = document.getElementById("closeLetter");
  const toast = document.getElementById("toast");

  if(!sealCard || !scroll) return;

  function setToast(msg){
    if(!toast) return;
    toast.textContent = msg;
    clearTimeout(setToast._t);
    setToast._t = setTimeout(() => (toast.textContent = ""), 2200);
  }

  function openLetter(){
    // little seal pop
    waxSeal?.classList.remove("pop");
    void waxSeal?.offsetWidth;
    waxSeal?.classList.add("pop");

    // swap views
    sealCard.classList.add("hide");
    scroll.classList.add("open");
    setToast("A secret letter… 💌");
  }

  function closeLetter(){
    scroll.classList.remove("open");
    // allow the open animation to reset
    setTimeout(() => {
      sealCard.classList.remove("hide");
      setToast("Sealed again ✨");
    }, 80);
  }

  sealCard.addEventListener("click", openLetter);
  closeBtn?.addEventListener("click", closeLetter);

  // optional: ESC closes
  window.addEventListener("keydown", (e) => {
    if(e.key === "Escape" && scroll.classList.contains("open")){
      closeLetter();
    }
  });
})();