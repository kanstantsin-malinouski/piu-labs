import { store } from "./store.js";

const shapeElements = new Map();

export function initUI() {
  const board = document.getElementById("board");
  const cntSquares = document.getElementById("cntSquares");
  const cntCircles = document.getElementById("cntCircles");
  const cntTotal = document.getElementById("cntTotal");

  document.getElementById("btnAddSquare").onclick = () =>
    store.addShape("square");

  document.getElementById("btnAddCircle").onclick = () =>
    store.addShape("circle");

  document.getElementById("btnRecolorSquares").onclick = () =>
    store.recolorByType("square");

  document.getElementById("btnRecolorCircles").onclick = () =>
    store.recolorByType("circle");

  board.addEventListener("click", (e) => {
    const el = e.target.closest(".shape");
    if (!el) return;
    store.removeShape(el.dataset.id);
  });

  store.subscribe((state) => {
    syncShapes(board, state.shapes);

    const { squares, circles, total } = store.getCounts(state);
    cntSquares.textContent = squares;
    cntCircles.textContent = circles;
    cntTotal.textContent = total;
    board.classList.toggle("is-empty", total === 0);
  });
}

function syncShapes(board, shapes) {
  const desiredIds = new Set(shapes.map((s) => s.id));

  for (const [id, el] of shapeElements.entries()) {
    if (!desiredIds.has(id)) {
      el.remove();
      shapeElements.delete(id);
    }
  }

  for (const s of shapes) {
    let el = shapeElements.get(s.id);

    if (!el) {
      el = document.createElement("div");
      el.className = "shape";
      el.dataset.id = s.id;
      shapeElements.set(s.id, el);
      board.appendChild(el);
    }

    el.classList.toggle("square", s.type === "square");
    el.classList.toggle("circle", s.type === "circle");
    el.style.backgroundColor = s.color;
  }
}
