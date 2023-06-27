
import { select } from './settings.js';
import Product from './components/Product.js';
import API from './components/Api.js';
import Cart from './components/Cart.js';


const app = {
  initMenu: function () {
    const thisApp = this;
    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },
  initAPI: function () {
    const thisApp = this
    thisApp.API = new API();
  },
  initData: function () {
    const thisApp = this;
    thisApp.data = {};
    thisApp.API.getProducts();
  },
  init: function () {
    const thisApp = this;
    thisApp.initAPI();
    thisApp.initData();
    thisApp.initCart();
  },
  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('addToCart', function(event){
      app.cart.add(event.detail.product);
    })
  }
  
};
app.init();

export default app;
