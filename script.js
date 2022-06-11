const optionsHandle = document.getElementById("options-handle");
const optionsBar = document.getElementById("options-bar");
const optionsBarPin = document.getElementById("pin");
const optionsBarPinPath = optionsBarPin.querySelector("path");
const color = document.getElementById("color");
const sizeSlider = document.getElementById("size-slider");
const sizeText = document.getElementById("size-text");
const drawButtons = document.querySelectorAll("#draw-tools .option-button");
const gridButtons = document.querySelectorAll("#grid-tools .option-button");

const clearGridBtn = document.getElementById("clear-grid");
const fillGridBtn = document.getElementById("fill-grid");
const toggleGridBtn = document.getElementById("toggle-grid");
const resetGridBtn = document.getElementById("reset-grid");

const main = document.getElementById("main");
const grid = document.getElementById("grid");

const DEFAULT_TOOL = "pen";
const DEFAULT_SIZE = 16;
let currentTool = DEFAULT_TOOL;
let currentSize = DEFAULT_SIZE;
let isExpanded = 0;
let isPinned = 0;
let isClicking = 0;
let isGridded = 0;
let origPixelColor = "";
let mostRecentPixel = null;

//Set up the grid and the size slider.
window.onload = () => {
  sizeSlider.value = DEFAULT_SIZE; //Set this avoid the slider being positioned by a cached value from a previous visit.
  sizeText.textContent = `${DEFAULT_SIZE}\u00d7${DEFAULT_SIZE}`;

  populateGrid(DEFAULT_SIZE);
  toggleGrid();
};

function populateGrid(size) {
  currentSize = size;
  grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  grid.style.gridTemplateRows = `repeat(${size}, 1fr)`;

  for (let i = 0; i < size ** 2; i++) {
    const pixel = document.createElement("div");
    if (isGridded) pixel.classList.add("shade-bordered");
    registerPixel(pixel);
    grid.appendChild(pixel);
  }
}

function depopulateGrid() {
  unregisterPixels(grid.childNodes);
  while (grid.firstChild) grid.removeChild(grid.firstChild);
}

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

function expandBar() {
  if (isPinned) return;
  optionsBar.classList.remove("shrunk");
  optionsBar.classList.add("expanded");
  optionsBarPin.classList.add("shown");
  optionsBarPin.classList.remove("hidden");
}

function shrinkBar() {
  if (isPinned) return;
  optionsBar.classList.remove("expanded");
  optionsBar.classList.add("shrunk");
  optionsBarPin.classList.remove("shown");
  optionsBarPin.classList.add("hidden");
}

function pinBar() {
  if (!optionsBar.classList.contains("expanded")) return;

  if (isPinned) {
    isPinned = 0;
    optionsBarPinPath.style.fill = "red";
    return;
  }

  isPinned = 1;
  optionsBarPinPath.style.fill = "limegreen";
}

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

function drawPixel(e) {
  const pixel = e.target ? e.target : e; //If e has a target, get the target. Otherwise, assume it is a pixel.
  if (!isClicking) return;
  if (currentTool !== "shade") pixel.style.filter = "";

  switch (currentTool) {
    case "pen":
      usePen(pixel);
      break;
    case "rainbow":
      useRainbow(pixel);
      break;
    case "erase":
      useErase(pixel);
      break;
    case "shade":
      useShade(pixel);
      break;
  }

  mostRecentPixel = pixel;
}

function forceDraw(pixel) {
  if (!isClicking) isClicking++;

  drawPixel(pixel);
  isClicking--;
}

function usePen(pixel) {
  pixel.style.backgroundColor = color.value;
}

function useRainbow(pixel) {
  let h = Math.random() * 360;
  let s = Math.random() * 100;
  let l = Math.random() * 40 + 20;
  pixel.style.backgroundColor = `hsl(${h}, ${s}%, ${l}%)`;
}

function useErase(pixel) {
  pixel.style.backgroundColor = "";
  pixel.style.filter = "";
}

function useShade(pixel) {
  const shade = pixel.style.filter;
  if (pixel.style.backgroundColor === "") return;
  if (shade === "brightness(0)") return;
  if (shade == "") pixel.style.filter = "brightness(90%)";

  const newShade = +shade.replace(/\D/g, "") - 10; //Remove all non-numeric characters.
  pixel.style.filter = `brightness(${newShade}%)`;
}

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

function modifyGrid(target) {
  switch (target.textContent.toLowerCase()) {
    case "clear":
      clearGrid();
      break;
    case "fill":
      fillGrid();
      break;
    case "show grid": //This is called fall-through. Equivalent to || operation.
    case "hide grid":
      toggleGrid();
      break;
    case "reset":
      resetGrid();
      break;
  }
}

function clearGrid() {
  if (!confirm("Are you sure you want to clear the grid?")) return;

  grid.childNodes.forEach((pixel) => {
    useErase(pixel);
  });
}

function fillGrid() {
  if (!confirm("Are you sure you want to fill the grid?")) return;

  grid.childNodes.forEach((pixel) => {
    if (pixel.style.backgroundColor !== "" && currentTool !== "shade") return;
    forceDraw(pixel);
  });
}

function toggleGrid() {
  if (isGridded) {
    grid.childNodes.forEach((pixel) => {
      pixel.classList.remove("shade-bordered");
      toggleGridBtn.classList.remove("active-button");
      toggleGridBtn.textContent = "Show Grid";
    });
    isGridded--;
  } else {
    grid.childNodes.forEach((pixel) => {
      pixel.classList.add("shade-bordered");
      toggleGridBtn.classList.add("active-button");
      toggleGridBtn.textContent = "Hide Grid";
    });
    isGridded++;
  }
}

function resetGrid() {
  if (!confirm("Are you sure you want to reset the grid?")) return;

  sizeSlider.value = DEFAULT_SIZE;
  sizeText.textContent = `${DEFAULT_SIZE}\u00d7${DEFAULT_SIZE}`;
  depopulateGrid();
  populateGrid(DEFAULT_SIZE);
}

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

optionsHandle.addEventListener("mouseover", expandBar);
main.addEventListener("mouseover", shrinkBar);
optionsBarPin.addEventListener("click", pinBar);

document.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return;
  isClicking++;
});
document.addEventListener("mouseup", (e) => {
  if (isClicking) isClicking--;
});

drawButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    currentTool = e.target.textContent.toLowerCase();
    drawButtons.forEach((button) => {
      button.classList.remove("active-button");
    });
    e.target.classList.add("active-button");
  });
});

gridButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    modifyGrid(e.target);
  });
});

function registerPixel(pixel) {
  pixel.addEventListener("mousedown", forceDraw);
  pixel.addEventListener("mouseenter", drawPixel);
  // pixel.addEventListener("mouseout", restoreColor);
}

function unregisterPixels(pixels) {
  pixels.forEach((pixel) => {
    pixel.removeEventListener("mousedown", forceDraw);
    pixel.removeEventListener("mouseover", drawPixel);
    // pixel.removeEventListener("mouseout", restoreColor);
  });
}

// function colorOnHover(pixel) {
//   origPixelColor = pixel.style.backgroundColor;
//   pixel.style.backgroundColor = color.value;
// }

// function restoreColor(e) {
//   if (isClicking) return;
//   if (e.target === mostRecentPixel) return;
//   e.target.style.backgroundColor = origPixelColor;
// }

sizeSlider.addEventListener("input", (e) => {
  sizeText.textContent = `${e.target.value}\u00d7${e.target.value}`;
});

sizeSlider.addEventListener("change", (e) => {
  if (!confirm("Are you sure you want to change the size of the grid?")) {
    sizeSlider.value = currentSize;
    sizeText.textContent = `${currentSize}\u00d7${currentSize}`;
    return;
  }
  depopulateGrid();
  populateGrid(e.target.value);
});
