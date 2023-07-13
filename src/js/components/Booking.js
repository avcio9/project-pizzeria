import { templates, select, settings, classNames } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import utils from '../utils.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import app from '../app.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.addEventListeners();
  }
  render(element) {
    const thisBooking = this;
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.tablesWrapper = thisBooking.dom.wrapper.querySelector(select.booking.tablesWrapper);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.formSubmit);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
  }
  initWidgets() {
    const thisBooking = this;
    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });
  }
  addEventListeners() {
    const thisBooking = this;
    thisBooking.dom.tablesWrapper.addEventListener('click', function (event) {
      const tableNumber = event.target.getAttribute(settings.booking.tableIdAttribute);

      // return if not clicked on a table
      if (!tableNumber) return;

      // block clicking on booked table
      if (thisBooking.booked[thisBooking.date]
        && thisBooking.booked[thisBooking.date][thisBooking.hour]
        && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(Number(tableNumber))) {
        return;
      }

      // unselect a table and return
      if (thisBooking.activeTable == tableNumber) {
        event.target.classList.remove(classNames.booking.selected);
        delete thisBooking.activeTable;
        return;
      }


      // loop through tables and unselect all that dont match the number
      thisBooking.unselectTables(tableNumber);

      thisBooking.activeTable = tableNumber;
      event.target.classList.add(classNames.booking.selected);
    });

    thisBooking.dom.form.addEventListener('click', function (event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });

    thisBooking.dom.phone.addEventListener('input', function () {
      const isValid = utils.validateForm(thisBooking.dom.phone.value, 'phone');
      isValid ? thisBooking.dom.phone.classList.remove('error') : thisBooking.dom.phone.classList.add('error');
      thisBooking.isPhoneValid = isValid;
    });
    thisBooking.dom.address.addEventListener('input', function () {
      const isValid = utils.validateForm(thisBooking.dom.address.value, 'address');
      isValid ? thisBooking.dom.address.classList.remove('error') : thisBooking.dom.address.classList.add('error');
      thisBooking.isAddressValid = isValid;
    });
  }

  sendBooking() {
    const thisBooking = this;
    if (!thisBooking.validateBooking()) {
      console.log('Error: Invalid contact input');
      return;
    }
    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table:  Number(thisBooking.activeTable),
      duration:  Number(thisBooking.hoursAmountWidget.value),
      ppl: Number(thisBooking.peopleAmountWidget.value),
      starters: [],
      address: thisBooking.dom.address.value,
    };

    for (const starter of thisBooking.dom.starters){
      starter.checked? payload.starters.push(starter.value) : null;
    }
    app.API.sendPayload(payload, settings.db.url + '/' + settings.db.booking);
    console.log(thisBooking.hourPicker.value);
    thisBooking.makeBooked(thisBooking.datePicker.value, thisBooking.hourPicker.value, thisBooking.hoursAmountWidget.value, Number(thisBooking.activeTable));
    thisBooking.updateDOM();
  }
  validateBooking() {
    const thisBooking = this;

    // remove and add error class with small intervals as a hint to fix the form
    if (!thisBooking.isAddressValid) {
      const interval = 125;
      for (let x = 1;x <= 4; x++) {
        setTimeout(function(){
          thisBooking.dom.address.classList.toggle('error');
        },interval * x);
      }
    }

    if (!thisBooking.isPhoneValid) {
      const interval = 125;
      for (let x = 1;x <= 4; x++) {
        setTimeout(function(){
          thisBooking.dom.phone.classList.toggle('error');
        },interval * x);
      }
    }
    return !isNaN(thisBooking.activeTable) && thisBooking.isAddressValid && thisBooking.isPhoneValid;
  }
  unselectTables(tableNumber = 0) {
    const thisBooking = this;
    thisBooking.dom.tables.forEach(table => {
      if (table.getAttribute(settings.booking.tableIdAttribute) != tableNumber) {
        table.classList.remove(classNames.booking.selected);
      }
    });
    if (!tableNumber) delete thisBooking.activeTable;
  }
  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);


    const params = {
      booking: [
        startDateParam,
        endDateParam
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam
      ],
    };

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking
        + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event
        + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event
        + '?' + params.eventsRepeat.join('&')
    };
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      }).then(function ([bookings, eventsCurrent, eventsRepeat]) {
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1))
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
      }
    }

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;
    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      if (typeof thisBooking.booked[date] == 'undefined') {
        thisBooking.booked[date] = {};
      }

      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = thisBooking.hourPicker.value;
    if (isNaN(thisBooking.hour)) {
      thisBooking.hour = utils.hourToNumber(thisBooking.hour);
    }

    let allAvailable = false;
    if (typeof thisBooking.booked[thisBooking.date] == 'undefined' || typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined') {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (!allAvailable && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
    // unselect all tables
    thisBooking.unselectTables();
  }
}

export default Booking;