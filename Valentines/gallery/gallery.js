// gallery.js
(() => {
  const imgEl = document.getElementById("photo");
  const frameBtn = document.getElementById("frameBtn");

  if(!imgEl || !frameBtn) return;

  const images = [
    "../images/myriam.jpg",
    "../images/ph1.jpeg",
    "../images/ph2.jpeg",
    "../images/ph3.jpeg",
    "../images/ph4.jpeg",
    "../images/ph5.jpeg",
    "../images/ph6.jpeg",
    "../images/ph7.jpeg",
    "../images/ph8.jpeg",
    "../images/ph9.png",
    "../images/ph10.jpeg",
    "../images/ph11.jpeg",
    "../images/ph12.jpeg",
    "../images/ph13.jpg",
    "../images/ph14.png",
    "../images/ph15.jpg",
    "../images/ph16.png",                              
  ];

  let i = 0;

function render(){
  const src = images[i];

  // load image first to get natural size
  const temp = new Image();
  temp.onload = () => {
    // Set frame ratio to match the image (so it fits perfectly)
    frameBtn.style.setProperty("--frame-ratio", `${temp.naturalWidth} / ${temp.naturalHeight}`);

    // Now set the real image
    imgEl.src = src;
  };
  temp.onerror = () => {
    imgEl.src = src; // still try, error handler below will show message
  };
  temp.src = src;
}

  function next(){
    i = (i + 1) % images.length;
    render();
  }

  frameBtn.addEventListener("click", next);

  render();

  imgEl.addEventListener("error", () => {
    imgEl.alt = "Image not found";
  });
})();