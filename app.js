const Api = require("./lib/NorenRestApi");

let { authparams } = require("./cred");

api = new Api({});

function receiveQuote(data) {
    console.log("Quote ::", data);
}

function receiveOrders(data) {
    console.log("Order ::", data);
}

function open(data) {
    let instruments = 'NSE|22#BSE|500400';
    //api.subscribe(instruments)
    console.log("subsribing to :: ", instruments);
}



api.login(authparams)
.then((res) => {        
        console.log('Reply: ', res);
        
        params = {
          'socket_open' : open,
          'quote' : receiveQuote,   
          'order' : receiveOrders       
        }

        //search scrip example
        api.searchscrip('NFO', 'NIFTY DEC CE').then((reply) => { console.log(reply); });
        
        //get quote example
        api.get_quotes('NSE', '22').then((reply) => { console.log(reply); });

        api.get_orderbook().then((reply) => { console.log(reply); });

        api.get_tradebook().then((reply) => { console.log(reply); });

        api.get_holdings().then((reply) => { console.log(reply); });
        
        api.get_positions().then((reply) => { console.log(reply); });

        api.start_websocket(params);

        return;
        
        
    }).catch((err) => {
        console.error(err);
    });

