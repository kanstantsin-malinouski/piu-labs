const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      font-family: system-ui, Arial, sans-serif;
    }

    .card {
      width: 280px;
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      overflow: hidden;
      background: #fff;
      display: grid;
      grid-template-rows: 170px auto;
      box-shadow: 0 8px 24px rgba(0,0,0,0.06);
    }

    .media {
      position: relative;
      background: #f3f4f6;
      display: grid;
      place-items: center;
    }

    ::slotted([slot="image"]) {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .promo {
      position: absolute;
      top: 10px;
      left: 10px;
      background: #111827;
      color: #fff;
      font-size: 12px;
      padding: 6px 10px;
      border-radius: 999px;
      display: none;
    }

    :host([has-promo]) .promo {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .content {
      padding: 14px 14px 12px;
      display: grid;
      gap: 10px;
    }

    .top {
      display: grid;
      gap: 6px;
    }

    .name {
      font-size: 16px;
      font-weight: 650;
      color: #111827;
      line-height: 1.2;
      min-height: 38px;
    }

    .price {
      font-size: 16px;
      font-weight: 700;
      color: #0f766e;
    }

    .meta {
      display: grid;
      gap: 8px;
    }

    .row {
      display: none;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }

    :host([has-colors]) .row.colors { display: flex; }
    :host([has-sizes])  .row.sizes  { display: flex; }

    .label {
      font-size: 12px;
      color: #6b7280;
      min-width: 54px;
    }

    /* sloty colors/sizes – stylujemy “dzieci” */
    ::slotted([slot="colors"]) {
      display: inline-flex;
      gap: 6px;
      align-items: center;
      flex-wrap: wrap;
    }
    ::slotted([slot="sizes"]) {
      display: inline-flex;
      gap: 6px;
      align-items: center;
      flex-wrap: wrap;
    }

    .actions {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
      margin-top: 2px;
    }

    button {
      border: none;
      border-radius: 12px;
      padding: 10px 12px;
      font-weight: 650;
      cursor: pointer;
      background: #111827;
      color: #fff;
    }

    button:active { transform: translateY(1px); }
  </style>

  <article class="card">
    <div class="media">
      <div class="promo"><slot name="promo"></slot></div>
      <slot name="image"></slot>
    </div>

    <div class="content">
      <div class="top">
        <div class="name"><slot name="name"></slot></div>
        <div class="price"><slot name="price"></slot></div>
      </div>

      <div class="meta">
        <div class="row colors">
          <span class="label">Kolory</span>
          <slot name="colors"></slot>
        </div>

        <div class="row sizes">
          <span class="label">Rozmiary</span>
          <slot name="sizes"></slot>
        </div>
      </div>

      <div class="actions">
        <button type="button" id="addBtn">Do koszyka</button>
      </div>
    </div>
  </article>
`;

export default class ProductCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    const hasPromo  = this.querySelector('[slot="promo"]')  !== null;
    const hasColors = this.querySelector('[slot="colors"]') !== null;
    const hasSizes  = this.querySelector('[slot="sizes"]')  !== null;

    this.toggleAttribute("has-promo",  hasPromo);
    this.toggleAttribute("has-colors", hasColors);
    this.toggleAttribute("has-sizes",  hasSizes);

    this.shadowRoot.getElementById("addBtn").addEventListener("click", () => {
      const name = (this.querySelector('[slot="name"]')?.textContent || "").trim();
      const price = (this.querySelector('[slot="price"]')?.textContent || "").trim();

      this.dispatchEvent(
        new CustomEvent("add-to-cart", {
          bubbles: true,
          composed: true,
          detail: { name, price }
        })
      );
    });
  }
}

customElements.define("product-card", ProductCard);
