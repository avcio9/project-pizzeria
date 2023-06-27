import { templates, select, settings, classNames } from "../settings.js";
import utils from "../utils.js";
import app from "../app.js";
import CartProduct from "./CartProduct.js";

class Cart {
    constructor(element) {
      const thisCart = this;

      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();
    }

    getElements(element) {
      const thisCart = this;

      thisCart.isAddressValid = false;
      thisCart.isPhoneValid = false;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    }
    initActions() {
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function () {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      })
      thisCart.dom.productList.addEventListener('updated', function () {
        thisCart.update();
      })
      thisCart.dom.productList.addEventListener('remove', function (event) {
        thisCart.remove(event.detail.cartProduct);
      })
      thisCart.dom.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisCart.sendOrder();
      })

      thisCart.dom.phone.addEventListener('input', function () {
        const isValid = thisCart.validateForm(thisCart.dom.phone.value, 'phone')
        isValid ? thisCart.dom.phone.classList.remove('error') : thisCart.dom.phone.classList.add('error');
        thisCart.isPhoneValid = isValid
      })
      thisCart.dom.address.addEventListener('input', function () {
        const isValid = thisCart.validateForm(thisCart.dom.address.value, 'address')
        isValid ? thisCart.dom.address.classList.remove('error') : thisCart.dom.address.classList.add('error');
        thisCart.isAddressValid = isValid
      })
    }

    sendOrder() {
      const thisCart = this;
      if (!thisCart.validateCart()) {
        console.log('Error: Invalid contact input')
        return;
      }
      const payload = {
        address: thisCart.dom.address.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.totalPrice - settings.cart.defaultDeliveryFee,
        deliveryFee: settings.cart.defaultDeliveryFee,
        products: []
      }

      for (let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }


      app.API.sendPayload(payload);
    }

    validateForm(input, type) {
      switch (type) {
        case 'address':
          return input.includes('@') && input.includes('.') && input.length > 3;
        case 'phone': {
          let allowedLength = 9;
          if (input.includes('+')) allowedLength += 2;
          input = input.replaceAll(' ', '').replace('+','')
          return parseInt(input).toString().length == allowedLength && input.length == allowedLength;
        }
      }
    }

    validateCart() {
      const thisCart = this;

      // remove and add error class with small intervals as a hint to fix the form
      if (!thisCart.isAddressValid) {
        const interval = 125;
        for (let x = 1;x <= 4; x++) {
          setTimeout(function(){
            thisCart.dom.address.classList.toggle('error')
          },interval * x)
        }
      }

      if (!thisCart.isPhoneValid) {
        const interval = 125;
        for (let x = 1;x <= 4; x++) {
          setTimeout(function(){
            thisCart.dom.phone.classList.toggle('error')
          },interval * x)
        }
      }
      return thisCart.isAddressValid && thisCart.isPhoneValid && thisCart.products.length > 0
    }

    cleanCart() {
      const thisCart = this;
      for (let product of thisCart.products) {
        product.dom.wrapper.remove();
      }
      thisCart.products = [];
      thisCart.update();
    }

    add(menuProduct) {
      const thisCart = this;

      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML)
      thisCart.dom.productList.appendChild(generatedDOM);
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      thisCart.update();
    }
    update() {
      const thisCart = this;

      let deliveryFee = settings.cart.defaultDeliveryFee;
      let totalNumber = 0;
      let totalSubPrice = 0;
      thisCart.products.forEach(product => {
        totalSubPrice += product.price;
        totalNumber += product.amount
      });
      if (totalSubPrice <= 0) deliveryFee = 0;
      thisCart.totalPrice = totalSubPrice + deliveryFee;
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      thisCart.dom.subtotalPrice.innerHTML = totalSubPrice;
      for (let totalPrice of thisCart.dom.totalPrice) {
        totalPrice.innerHTML = totalSubPrice + deliveryFee
      }
      thisCart.dom.totalNumber.innerHTML = totalNumber;

      // add lowered opacity class on total price and number and remove it after 0.5s
      const price = thisCart.dom.wrapper.querySelector('.cart__total-price');
      price.classList.add('cart__total-number-transition')
      thisCart.dom.totalNumber.classList.add('cart__total-number-transition')
      setTimeout(function() {
        price.classList.add('cart__total-number-transition-drop')
        thisCart.dom.totalNumber.classList.add('cart__total-number-transition-drop')
      },200)
      setTimeout(function () {
        price.classList.remove('cart__total-number-transition')
        thisCart.dom.totalNumber.classList.remove('cart__total-number-transition')
        price.classList.remove('cart__total-number-transition-drop')
        thisCart.dom.totalNumber.classList.remove('cart__total-number-transition-drop')
      }, 400)
    }
    remove(cartProduct) {
      const thisCart = this;
      const index = thisCart.products.indexOf(cartProduct)
      if (index < 0) return;
      thisCart.products.splice(index, 1);
      cartProduct.dom.wrapper.remove();
      thisCart.update();
    }
  }

  export default Cart;