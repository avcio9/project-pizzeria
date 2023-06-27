import {settings} from '../settings.js';
import app from '../app.js';

class API {
    getProducts(){
      const thisApi = this;
      const url = settings.db.url + '/' + settings.db.products;


      fetch(url).then(function (rawResponse) {
        if (!thisApi.catchErrors(url, rawResponse)) return;
        return rawResponse.json();
      })
        .then(function (parsedResponse) {
          app.data.products = parsedResponse;
          app.initMenu();
        })
    }

    sendPayload(payload){
      const thisApi = this;
      const url = settings.db.url + '/' + settings.db.orders;
      const options = {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        }
      }
      fetch(url, options).then(function (response) {
        if (!thisApi.catchErrors(url, response)) return;
        return response.json();
      }).then(function(parsedResponse){
        app.cart.cleanCart();
        console.log('parsedResponse', parsedResponse)
      })
    }

    catchErrors(url, response){
      if (!response.ok) {
        console.log(`Request failed ${url}. Error, ${response.status}`, response);
        return false
      } else return true;
    }
  }

  export default API;