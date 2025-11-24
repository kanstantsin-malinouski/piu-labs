import { createId, randomPastelHsl, safeReadJSON, safeWriteJSON } from "./helper.js";

const STORAGE_KEY = "shapes-app-state-v1";

class Store {
  constructor() {
    this.subscribers = new Set();
    this.state = safeReadJSON(STORAGE_KEY, { shapes: [] });
  }

  subscribe(fn) {
    this.subscribers.add(fn);
    fn(this._clone());
    return () => this.subscribers.delete(fn);
  }

  _notify() {
    const snapshot = this._clone();
    for (const fn of this.subscribers) fn(snapshot);
  }

  _update(mutator) {
    mutator(this.state);
    safeWriteJSON(STORAGE_KEY, this.state);
    this._notify();
  }

  _clone() {
    return JSON.parse(JSON.stringify(this.state));
  }

  addShape(type) {
    this._update((s) => {
      s.shapes.push({
        id: createId(type),
        type,
        color: randomPastelHsl(),
      });
    });
  }

  removeShape(id) {
    this._update((s) => {
      s.shapes = s.shapes.filter((x) => x.id !== id);
    });
  }

  recolorByType(type) {
    this._update((s) => {
      for (const shape of s.shapes) {
        if (shape.type === type) {
          shape.color = randomPastelHsl();
        }
      }
    });
  }

  getCounts(state = this.state) {
    const squares = state.shapes.filter((s) => s.type === "square").length;
    const circles = state.shapes.filter((s) => s.type === "circle").length;
    return {
      squares,
      circles,
      total: squares + circles,
    };
  }
}

export const store = new Store();
