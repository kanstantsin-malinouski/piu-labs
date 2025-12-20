import productsData from "../data.json" with { type: "json" };
import "./product-card.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host{ display:block; }
    .grid{
      display:grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap:16px;
    }
  </style>

  <section class="grid" id="grid"></section>
`;

export default class ProductList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.$grid = this.shadowRoot.getElementById("grid");
  }

  connectedCallback() {
    this.render(productsData);
  }

  render(products) {
    this.$grid.innerHTML = "";
    for (const p of products) {
      const card = document.createElement("product-card");
      // właściwość, nie atrybut:
      card.product = p;
      this.$grid.appendChild(card);
    }
  }
}

customElements.define("product-list", ProductList);
