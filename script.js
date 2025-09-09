const board = document.getElementById("board");
const rollBtn = document.getElementById("roll-btn");
const diceResult = document.getElementById("dice-result");
const finalScreen = document.getElementById("final-screen");

// Define spaces (grid-like path)
const spacesData = [
  { x: 50, y: 350, label: "شروع" },
  { x: 100, y: 350, label: "فروش" },
  { x: 150, y: 350, label: "گدام" },
  { x: 200, y: 350, label: "مصرف" },
  { x: 250, y: 350, label: "فروش" },
  { x: 300, y: 350, label: "کرایه" },
  { x: 350, y: 350, label: "فروش" },
  { x: 350, y: 300, label: "گدام" },
  { x: 350, y: 250, label: "مصرف" },
  { x: 350, y: 200, label: "مفاد!" } // End
];

// Draw spaces
spacesData.forEach((space, i) => {
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", space.x);
  circle.setAttribute("cy", space.y);
  circle.setAttribute("r", 20);
  circle.setAttribute("fill", i === 0 ? "#FFD700" : "#ccc");
  circle.setAttribute("stroke", "#000");
  board.appendChild(circle);

  const text = document.createElementNS("http://www.w3.org/2000/svg", "tex
