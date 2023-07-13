
import { classNames, select } from './settings.js';
import Product from './components/Product.js';
import API from './components/Api.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';


const app = {
  initPages: function () {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;

    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    const idFromHash = window.location.hash.replace('#/', '');
    let pageMatchingHash = thisApp.pages[0].id;
    for (let page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }
    thisApp.activatePage(pageMatchingHash);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        const clickedElement = this;
        event.preventDefault();
        const id = clickedElement.getAttribute('href').replace('#', '');

        thisApp.activatePage(id);

        // change URL hash
        window.location.hash = '#/' + id;
      });
    }
    thisApp.activateCarousel();
  },
  activateCarousel: function () {
    const thisApp = this;
    const elem = document.querySelector('.main-carousel');
    // eslint-disable-next-line no-undef
    thisApp.carousel = new Flickity(elem, {
      cellAlign: 'left',
      contain: true,
      autoPlay: true
    });
  },

  activatePage: function (pageId) {
    const thisApp = this;

    // add class 'active' to matching pages, remove non-matching

    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    // add class 'active' to matching links, remove non matching

    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.pages.active,
        link.getAttribute('href') == '#' + pageId
      );
    }

  },
  initMenu: function () {
    const thisApp = this;
    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },
  initHome: function () {
    const thisApp = this;
    const links = document.querySelector('.options-container');
    for (const a of links.children){
      const href = a.getAttribute('href');

      // skip if not a link
      if (!href) return;
      a.addEventListener('click', function(){
        thisApp.activatePage(href.replace('#', ''));
      });
    }
  },
  initAPI: function () {
    const thisApp = this;
    thisApp.API = new API();
  },
  initData: function () {
    const thisApp = this;
    thisApp.data = {};
    thisApp.API.getProducts();
  },
  initBooking: function () {
    const thisApp = this;
    const bookingWrapper = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(bookingWrapper);
  },
  init: function () {
    const thisApp = this;
    thisApp.initAPI();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initPages();
    thisApp.initBooking();
    thisApp.initHome();
  },
  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('addToCart', function (event) {
      app.cart.add(event.detail.product);
    });
  }

};
app.init();

export default app;
