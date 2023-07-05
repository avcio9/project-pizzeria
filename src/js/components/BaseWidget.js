import { settings } from '../settings.js';

class BaseWidget {
  constructor(wrapperElement, initialValue = settings.amountWidget.defaultValue){
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;

    thisWidget.correctValue = initialValue;
  }
  get value(){
    const thisWidget = this;

    return thisWidget.correctValue;
  }

  set value(value) {
    const thisWidget = this;
    const newValue = thisWidget.parseValue(value);

    // verify if quantity is in range of settings
    if (!thisWidget.isValid(newValue)) {
      thisWidget.renderValue();
      return;
    }

    // verify if the input is a correct number and if its not the same as current value
    if (thisWidget.correctValue == value) {
      thisWidget.dom.input.value = thisWidget.correctValue;
      return;
    }
    thisWidget.correctValue = newValue;
    thisWidget.renderValue();
    thisWidget.announce();
  }

  setValue(value){
    const thisWidget = this;
    thisWidget.value = value;
  }

  parseValue(value) {
    return parseInt(value);
  }

  isValid(value) {
    return !isNaN(value);
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.wrapper.innerHTML = thisWidget.correctValue;
  }

  announce() {
    const thisWidget = this;
    const event = new Event('updated', {
      bubbles: true
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;