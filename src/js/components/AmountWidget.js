import { select, settings } from "../settings.js";

class AmountWidget {
    constructor(element, amount = undefined) {
      const thisWidget = this;

      thisWidget.getElements(element);
      thisWidget.setValue(amount ? amount : settings.amountWidget.defaultValue)
      thisWidget.initActions();
    }
    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    setValue(value) {
      const thisWidget = this;
      const newValue = parseInt(value);

      // verify if quantity is in range of settings
      if (newValue < settings.amountWidget.defaultMin || newValue > settings.amountWidget.defaultMax) {
        thisWidget.input.value = thisWidget.value;
        return;
      }

      // verify if the input is a correct number and if its not the same as current value
      if (thisWidget.value == value || isNaN(newValue)) {
        thisWidget.input.value = thisWidget.value;
        return;
      }
      thisWidget.value = newValue;
      thisWidget.input.value = thisWidget.value;
      thisWidget.announce();
    }
    initActions() {
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1)
      })
      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1)
      })
    }
    announce() {
      const thisWidget = this;
      const event = new Event('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }
  }

  export default AmountWidget;