const Api = require("./lib/NorenRestApi");

let { authparams } = require("./cred");

api = new Api({});

function receiveTick(data) {
    console.log("receiveTick:::::", data);
}

function open(data) {
    console.log("app websocket is open");
}



api.login(authparams)
.then((res) => {        
        //cons//ole.log('Reply: ', res);
        params = {
          'socket_open' : open,
          'tick' : receiveTick,          
        }

        //api.start_websocket(params);

        //return;
        //search scrip example
        //api.searchscrip('NFO', 'NIFTY DEC CE');
        
        //get quote example
        //api.get_quotes('NSE', '22')
        //place order
        let orderparams = {
            'buy_or_sell' : 'B',
            'product_type' : 'C',
            'exchange' : 'NSE',
            'tradingsymbol'  :  'CANBK-EQ',
            'quantity' : 1,
            'discloseqty' : 0,
            'price_type' : 'LMT',
            'price' : 175.0
        };

        api.place_order(orderparams)
            .then((reply) => { 
                console.log(reply);            

        let modifyparams = {
            'orderno' : reply.norenordno,
            'exchange' : 'NSE',
            'tradingsymbol' : 'CANBK-EQ',
            'newquantity' : 2,
            'newprice_type' : 'LMT',
            'newprice' : 176.00
        }

        api.modify_order(modifyparams)
            .then((modreply) => { 
                    console.log(modreply);
                    api.cancel_order(modreply.result);
                });
        });

        //api.get_orderbook()
        //api.get_tradebook()
        api.get_holdings()
        //api.get_positions()
        .then((reply) => { 
            console.log(reply);
        });
        
    }).catch((err) => {
        console.error(err);
    });

