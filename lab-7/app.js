import "./components/product-list.js";
import "./components/shopping-cart.js";

document.addEventListener("add-to-cart", (e) => {
  const cart = document.querySelector("shopping-cart");
  if (!cart) return;

  cart.addItem(e.detail);
});
