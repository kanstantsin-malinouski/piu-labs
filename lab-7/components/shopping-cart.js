const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{ display:block; font-family:system-ui, Arial, sans-serif; }
    .box{
      border:1px solid #e5e7eb; border-radius:14px; background:#fff;
      box-shadow:0 8px 24px rgba(0,0,0,0.06);
      padding:14px;
      position:sticky; top:90px;
    }
    h3{ margin:0 0 10px; font-size:16px; }
    .empty{ color:#6b7280; font-size:13px; }
    ul{ list-style:none; padding:0; margin:10px 0 0; display:grid; gap:8px; }
    li{
      display:grid; grid-template-columns: 1fr auto; gap:10px; align-items:center;
      border:1px solid #e5e7eb; border-radius:12px; padding:8px 10px;
    }
    .name{ font-weight:650; color:#111827; }
    .price{ color:#0f766e; font-weight:700; font-size:13px; }
    button{
      border:1px solid #e5e7eb; background:#fff; cursor:pointer;
      border-radius:10px; padding:6px 10px; font-weight:650;
    }
    .sum{
      margin-top:12px; padding-top:12px; border-top:1px solid #e5e7eb;
      display:flex; justify-content:space-between; align-items:center;
      font-weight:700;
    }
  </style>

  <div class="box">
    <h3>Koszyk</h3>
    <div class="empty" id="empty">Brak produktów w koszyku.</div>
    <ul id="list"></ul>
    <div class="sum">
      <span>Suma</span>
      <span id="total">0,00 zł</span>
    </div>
  </div>
`;

export default class ShoppingCart extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this._items = [];

    this.$ = {
      empty: this.shadowRoot.getElementById("empty"),
      list: this.shadowRoot.getElementById("list"),
      total: this.shadowRoot.getElementById("total"),
    };
  }

  set items(value) {
    this._items = Array.isArray(value) ? value : [];
    this._render();
  }
  get items() {
    return this._items;
  }

  addItem(item) {
    this._items = [...this._items, item];
    this._render();
  }

  removeByIndex(index) {
    this._items = this._items.filter((_, i) => i !== index);
    this._render();
  }

  _render() {
    const items = this._items;

    this.$.list.innerHTML = "";
    this.$.empty.style.display = items.length ? "none" : "block";

    let total = 0;

    items.forEach((p, index) => {
      const li = document.createElement("li");

      const left = document.createElement("div");
      const name = document.createElement("div");
      name.className = "name";
      name.textContent = p.name;

      const price = document.createElement("div");
      price.className = "price";
      price.textContent = `${Number(p.price).toFixed(2).replace(".", ",")} ${p.currency ?? "zł"}`;

      left.append(name, price);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "Usuń";
      btn.addEventListener("click", () => this.removeByIndex(index));

      li.append(left, btn);
      this.$.list.appendChild(li);

      total += Number(p.price) || 0;
    });

    const currency = items[0]?.currency ?? "zł";
    this.$.total.textContent = `${total.toFixed(2).replace(".", ",")} ${currency}`;
  }
}

customElements.define("shopping-cart", ShoppingCart);
