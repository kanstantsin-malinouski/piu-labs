export function randomPastelHsl() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 75%, 70%)`;
}

export function createId(prefix = "shape") {
  if (crypto?.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now().toString(16)}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

export function safeReadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function safeWriteJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
