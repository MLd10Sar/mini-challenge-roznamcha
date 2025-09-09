const board = document.getElementById("board");
const rollBtn = document.getElementById("roll-btn");
const diceResult = document.getElementById("dice-result");
const diceEl = document.getElementById("dice");
const finalScreen = document.getElementById("final-screen");

// Unicode dice faces
const diceFaces = ["⚀","⚁","⚂","⚃","⚄","⚅"];

// Define spaces (arranged in a square-like path)
const spacesData = [
  { x: 60, y: 440, label: "شروع" },
  { x: 120, y: 440, label: "فروش" },
  { x: 180, y: 440, label: "گدام" },
  { x: 240, y: 440, label: "مصرف" },
  { x: 300, y: 440, label: "فروش" },
  { x: 360, y: 440, label: "کرایه" },
  { x: 440, y: 440, label: "فروش" },
  { x: 440, y: 360, label: "گدام" },
  { x: 440, y: 280, label: "مصرف" },
  { x: 440, y: 200, label: "مفاد!" }
];

// Draw spaces
spacesData.forEach((space, i) => {
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", space.x);
  circle.setAttribute("cy", space.y);
  circle.setAttribute("r", 25);
  circle.setAttribute("fill", i === 0 ? "#FFD700" : "#eee");
  circle.setAttribute("stroke", "#333");
  circle.setAttribute("stroke-width", "2");
  board.appendChild(circle);

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", space.x);
  text.setAttribute("y", space.y + 5);
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("font-size", "12");
  text.setAttribute("font-weight", "bold");
  text.textContent = space.label;
  board.appendChild(text);
});

// Player piece
const piece = document.createElementNS("http://www.w3.org/2000/svg", "circle");
piece.setAttribute("cx", spacesData[0].x);
piece.setAttribute("cy", spacesData[0].y);
piece.setAttribute("r", 15);
piece.setAttribute("fill", "blue");
piece.setAttribute("stroke", "black");
piece.setAttribute("stroke-width", "2");
board.appendChild(piece);

let currentIndex = 0;

// Roll button logic
rollBtn.addEventListener("click", () => {
  // Start rolling animation
  diceEl.classList.add("roll");

  let rollCount = 0;
  const rolling = setInterval(() => {
    diceEl.textContent = diceFaces[Math.floor(Math.random() * 6)];
    rollCount++;
  }, 100);

  setTimeout(() => {
    clearInterval(rolling);
    diceEl.classList.remove("roll");

    // Final dice result
    const dice = Math.floor(Math.random() * 6) + 1;
    diceEl.textContent = diceFaces[dice - 1];
    diceResult.textContent = `نتیجه: ${dice}`;

    // Move piece
    let steps = dice;
    const moveInterval = setInterval(() => {
      if (steps > 0 && currentIndex < spacesData.length - 1) {
        currentIndex++;
        piece.setAttribute("cx", spacesData[currentIndex].x);
        piece.setAttribute("cy", spacesData[currentIndex].y);
        steps--;
      } else {
        clearInterval(moveInterval);
        if (currentIndex === spacesData.length - 1) {
          document.querySelector(".game-container").style.display = "none";
          finalScreen.style.display = "block";
        }
      }
    }, 400);
  }, 1500); // dice roll duration
});
