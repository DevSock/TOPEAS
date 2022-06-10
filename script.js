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
let isExpanded, isPinned, currentTool, isClicking, isGridded, currentSize;

window.onload = () => {
  currentTool = DEFAULT_TOOL;
  currentSize = DEFAULT_SIZE;
  isExpanded = 0;
  isPinned = 0;
  isClicking = 0;
  isGridded = 0;

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
    isPinned = false;
    optionsBarPinPath.style.fill = "red";
    return;
  }
  isPinned = true;
  optionsBarPinPath.style.fill = "limegreen";
}

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

function drawPixel(e) {
  if (!isClicking) return;
  const pixel = e.target ? e.target : e;
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
  pixel.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, ${
    Math.random() * 40 + 30
  }%)`;
}

function useErase(pixel) {
  pixel.style.backgroundColor = "";
}

function useShade(pixel) {
  const shade = pixel.style.filter;
  if (pixel.style.backgroundColor === "") return;
  if (shade === "brightness(0)") return;

  if (shade == "") {
    pixel.style.filter = "brightness(0.9)";
    return;
  } else {
    const newShade = +shade.replace(/\D/g, "") - 1;
    pixel.style.filter = `brightness(0.${newShade})`;
  }
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
    pixel.style.backgroundColor = "";
    pixel.style.filter = "";
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

document.addEventListener("mousedown", () => isClicking++);
document.addEventListener("mouseup", () => isClicking--);

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
  pixel.addEventListener("mouseover", drawPixel);
}

function unregisterPixels(pixels) {
  pixels.forEach((pixel) => {
    pixel.removeEventListener("mousedown", forceDraw);
    pixel.removeEventListener("mouseover", drawPixel);
  });
}
////////////////////////////////////////////////////////
// const grid = document.querySelector(".grid");
// const colorElement = document.querySelector(".color");
// let colList = [];
// let currentMode = "draw";
// let currentColor = colorElement.value;
// let isClicking = false;

// const setCurrentMode = (mode) => (currentMode = mode);

// // Populate the grid with the specified density
// function populateGrid(density) {
//   grid.innerHTML = "";
//   colList = [];
//   createRows(grid, density);
// }

// // Populate the grid with rows equal to the specified density
// function createRows(grid, density) {
//   for (let i = 0; i < density; i++) {
//     const row = document.createElement("div");
//     row.classList.add("row");
//     createCols(row, density);
//     grid.appendChild(row);
//   }
// }

// // Populate the given row with columns equal to the specified density
// function createCols(row, density) {
//   for (let j = 0; j < density; j++) {
//     const col = document.createElement("div");
//     col.classList.add("col");
//     row.appendChild(col);
//     registerCol(col);
//   }
// }

// // Add the given column to the list of columns and register its event listeners
// function registerCol(col) {
//   colList.push(col);
//   col.addEventListener("mouseover", () => {
//     if (!isClicking) return;
//     draw(col, currentMode);
//   });
//   col.addEventListener("mousedown", () => draw(col, currentMode));
// }

// // Apply styles to the given column depending upon the current mode
// function draw(col, mode) {
//   if (mode != "shade") col.style.filter = "";
//   switch (mode) {
//     case "erase":
//       erase(col);
//       break;
//     case "shade":
//       shade(col);
//       break;
//     case "rainbow":
//       rainbow(col);
//       break;
//     default:
//       color(col);
//       break;
//   }
// }

// const erase = (col) => (col.style.backgroundColor = "");
// const color = (col) => (col.style.backgroundColor = currentColor);
// const rainbow = (col) => (col.style.backgroundColor = randomColor());

// //Reduce the brightness of a column by 10% per function call
// function shade(col) {
//   const shade = col.style.filter;
//   if (shade == "") {
//     col.style.filter = "brightness(0.9)";
//   } else {
//     if (shade <= 0) return;
//     //Replace all non-numerical digits with empty space
//     //(ex: "brightness(0.9)" becomes "09")
//     //Javascript drops the 0, then we subtract 1 to subtract 10% of the brightness.
//     const newShade = +shade.replace(/\D/g, "") - 1;
//     col.style.filter = `brightness(0.${newShade})`;
//   }
// }

// //Generate a random RGB value using Math.random
// function randomColor() {
//   const r = Math.floor(Math.random() * 256);
//   const g = Math.floor(Math.random() * 256);
//   const b = Math.floor(Math.random() * 256);

//   return `rgb(${r}, ${g}, ${b})`;
// }

// //Fill the grid with the current selected color.
// function fillGrid() {
//   const confirmed = confirm("Are you sure you want to fill the entire grid?");
//   if (!confirmed) return;
//   colList.forEach((col) => {
//     if (col.style.backgroundColor == "") {
//       col.style.backgroundColor = currentColor;
//     }
//   });
// }

// //Toggle the grid outline
// function toggleGrid() {
//   colList.forEach((col) => col.classList.toggle("boxShade"));
// }

// //Wipe the grid clean
// function clearGrid() {
//   const confirmed = confirm("Are you sure you want to clear the entire grid?");
//   if (!confirmed) return;
//   colList.forEach((col) => {
//     col.style.backgroundColor = "";
//     col.style.filter = "";
//   });
// }

// function resetGrid() {
//   const confirmed = confirm(
//     "Are you sure you want to reset the grid to default?"
//   );
//   if (!confirmed) return;
//   populateGrid(16);
// }

// colorElement.addEventListener("change", (e) => (currentColor = e.target.value));
// document.addEventListener("mousedown", () => (isClicking = true));
// document.addEventListener("mouseup", () => (isClicking = false));

// setCurrentMode("draw");
// populateGrid(16);
