const grid = document.querySelector(".grid");
let colList = [];
let currentMode = "draw";

// Populate the given row with columns equal to the specified density
function createCols(row, density) {
  for (let j = 0; j < density; j++) {
    const col = document.createElement("div");
    col.classList.add("col");
    // Append the column to the row
    row.appendChild(col);
    // Register the column
    registerCol(col);
  }
}

// Add the given column to the list of columns and register its event listeners
function registerCol(col) {
  // Add the column to the colList
  colList.push(col);
  // Add the event listener to the column
  col.addEventListener("", function () {
    //TODO: Handle mouseover event depending on the current mode
    switch (currentMode) {
      case "erase":
        break;
      case "shade":
        break;
      case "rainbow":
        break;
      case "color":
        break;
      default:
        break;
    }
  });
}
