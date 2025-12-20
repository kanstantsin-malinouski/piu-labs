const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host { display:block; font-family:system-ui, Arial, sans-serif; }
    .card{
      width:280px; border:1px solid #e5e7eb; border-radius:14px; overflow:hidden;
      background:#fff; display:grid; grid-template-rows:170px auto;
      box-shadow:0 8px 24px rgba(0,0,0,0.06);
    }
    .media{ position:relative; background:#f3f4f6; display:grid; place-items:center; }
    img{ width:100%; height:100%; object-fit:cover; display:block; }
    .promo{
      position:absolute; top:10px; left:10px; background:#111827; color:#fff;
      font-size:12px; padding:6px 10px; border-radius:999px; display:none;
    }
    :host([has-promo]) .promo{ display:inline-flex; }
    .content{ padding:14px 14px 12px; display:grid; gap:10px; }
    .name{ font-size:16px; font-weight:650; color:#111827; line-height:1.2; min-height:38px; }
    .price{ font-size:16px; font-weight:700; color:#0f766e; }
    .row{ display:none; gap:8px; align-items:center; flex-wrap:wrap; }
    :host([has-colors]) .row.colors{ display:flex; }
    :host([has-sizes]) .row.sizes{ display:flex; }
    .label{ font-size:12px; color:#6b7280; min-width:54px; }
    .swatches{ display:inline-flex; gap:6px; align-items:center; flex-wrap:wrap; }
    .dot{ width:14px; height:14px; border-radius:999px; border:1px solid rgba(0,0,0,.12); display:inline-block; }
    .sizes{ display:inline-flex; gap:6px; flex-wrap:wrap; }
    .size{ font-size:12px; padding:4px 8px; border-radius:10px; border:1px solid #e5e7eb; background:#fff; }
    button{
      border:none; border-radius:12px; padding:10px 12px; font-weight:650; cursor:pointer;
      background:#111827; color:#fff;
    }
    button:active{ transform:translateY(1px); }
  </style>

  <article class="card">
    <div class="media">
      <div class="promo" id="promo"></div>
      <img id="img" alt="" />
    </div>

    <div class="content">
      <div>
        <div class="name" id="name"></div>
        <div class="price" id="price"></div>
      </div>

      <div>
        <div class="row colors">
          <span class="label">Kolory</span>
          <div class="swatches" id="colors"></div>
        </div>

        <div class="row sizes">
          <span class="label">Rozmiary</span>
          <div class="sizes" id="sizes"></div>
        </div>
      </div>

      <button type="button" id="addBtn">Do koszyka</button>
    </div>
  </article>
`;

export default class ProductCard extends HTMLElement {
  static get observedAttributes() {
    return ["name", "price", "currency", "image", "promo"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this._product = null;

    this.$ = {
      img: this.shadowRoot.getElementById("img"),
      promo: this.shadowRoot.getElementById("promo"),
      name: this.shadowRoot.getElementById("name"),
      price: this.shadowRoot.getElementById("price"),
      colors: this.shadowRoot.getElementById("colors"),
      sizes: this.shadowRoot.getElementById("sizes"),
      addBtn: this.shadowRoot.getElementById("addBtn"),
    };
  }

  connectedCallback() {
    this.$.addBtn.addEventListener("click", this._onAdd);
    // pierwszy render (z atrybutów lub z wcześniej ustawionej właściwości)
    this._render();
  }

  disconnectedCallback() {
    this.$.addBtn.removeEventListener("click", this._onAdd);
  }

  attributeChangedCallback() {
    // jeśli karta jest sterowana atrybutami, a nie właściwością:
    if (!this._product) this._renderFromAttributes();
  }

  set product(value) {
    this._product = value;
    this._renderFromProduct();
  }
  get product() {
    return this._product;
  }

  _onAdd = () => {
    const p = this._product ?? this._getProductFromAttributes();
    if (!p) return;

    this.dispatchEvent(
      new CustomEvent("add-to-cart", {
        bubbles: true,
        composed: true,
        detail: {
          id: p.id,
          name: p.name,
          price: p.price,
          currency: p.currency ?? "zł",
        },
      })
    );
  };

  _render() {
    if (this._product) this._renderFromProduct();
    else this._renderFromAttributes();
  }

  _getProductFromAttributes() {
    const name = this.getAttribute("name") ?? "";
    const priceStr = this.getAttribute("price") ?? "";
    const price = Number(priceStr);
    const currency = this.getAttribute("currency") ?? "zł";
    const image = this.getAttribute("image") ?? "";
    const promo = this.getAttribute("promo") ?? "";

    return {
      id: this.getAttribute("id") ?? undefined,
      name: name.trim(),
      price: Number.isFinite(price) ? price : priceStr,
      currency,
      image,
      promo,
      colors: [],
      sizes: [],
    };
  }

  _renderFromAttributes() {
    const p = this._getProductFromAttributes();
    this._applyBase(p);

    // z atrybutów nie będziemy mapować tablic (zgodnie z treścią zadania)
    this.toggleAttribute("has-colors", false);
    this.toggleAttribute("has-sizes", false);
  }

  _renderFromProduct() {
    const p = this._product;
    if (!p) return;

    this._applyBase(p);

    // colors
    this.$.colors.innerHTML = "";
    const hasColors = Array.isArray(p.colors) && p.colors.length > 0;
    this.toggleAttribute("has-colors", hasColors);
    if (hasColors) {
      for (const c of p.colors) {
        const dot = document.createElement("span");
        dot.className = "dot";
        dot.style.background = c;
        dot.title = c;
        this.$.colors.appendChild(dot);
      }
    }

    // sizes
    this.$.sizes.innerHTML = "";
    const hasSizes = Array.isArray(p.sizes) && p.sizes.length > 0;
    this.toggleAttribute("has-sizes", hasSizes);
    if (hasSizes) {
      for (const s of p.sizes) {
        const chip = document.createElement("span");
        chip.className = "size";
        chip.textContent = s;
        this.$.sizes.appendChild(chip);
      }
    }
  }

  _applyBase(p) {
    this.$.img.src = p.image ?? "";
    this.$.img.alt = p.name ?? "";

    this.$.name.textContent = p.name ?? "";

    const currency = p.currency ?? "zł";
    // jeśli cena jest stringiem, też pokażemy
    this.$.price.textContent =
      typeof p.price === "number"
        ? `${p.price.toFixed(2).replace(".", ",")} ${currency}`
        : `${p.price} ${currency}`;

    const promoText = (p.promo ?? "").trim();
    this.$.promo.textContent = promoText;
    this.toggleAttribute("has-promo", promoText.length > 0);
  }
}

customElements.define("product-card", ProductCard);
