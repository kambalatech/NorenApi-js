const Api = require("./lib/RestApi");
const cred = require("./cred"); 

// Initialize API
const api = new Api({ 
  Access_token: cred.Access_token,
  UID: cred.UID,
  AID: cred.Account_ID
});


// ==================== WEBSOCKET ====================


// function websocketExample() {
//     function receiveQuote(data) {
//         console.log("Quote ::", data);
//     }

//     function receiveOrders(data) {
//         console.log("Order Update ::", data);
//     }

//     function onSocketOpen() {
//         const instruments = 'NSE|22#BSE|500400'; // replace with your tokens
//         api.subscribe(instruments);
//         console.log("Subscribed to ::", instruments);
//     }

//     api.start_websocket({
//         socket_open: onSocketOpen,
//         quote: receiveQuote,
//         order: receiveOrders
//     });
// }



// ==================== PLACE ORDER ====================


function placeOrderExample() {
    const orderParams = {
        buy_or_sell: 'B',
        product_type: 'C',
        exchange: 'NSE',
        tradingsymbol: 'INFY-EQ',
        quantity: 1,
        discloseqty: 0,
        price_type: 'LMT',
        price: 175.0
    };

    api.place_order(orderParams)
        .then(reply => console.log("Placed Order Reply:", reply))
        .catch(err => console.error("Place Order Error:", err));
}


// ==================== MODIFY ORDER ====================


// function modifyOrderExample(orderNo) {
//     const modifyParams = {
//         orderno: orderNo,  
//         exchange: 'NSE',
//         tradingsymbol: 'TCS-EQ',
//         newquantity: 2,
//         newprice_type: 'LMT',
//         newprice: 176.0
//     };

//     api.modify_order(modifyParams)
//         .then(reply => console.log("Modified Order Reply:", reply))
//         .catch(err => console.error("Modify Order Error:", err));
// }



// ==================== CANCEL ORDER ====================


// function cancelOrderExample(orderNo) {
//     api.cancel_order(orderNo)
//         .then(reply => console.log("Cancel Order Reply:", reply))
//         .catch(err => console.error("Cancel Order Error:", err));
// }



// ==================== GET ORDER BOOK ====================


function getOrderBookExample() {
    api.get_orderbook()
        .then(reply => console.log("Order Book:", reply))
        .catch(err => console.error("Order Book Error:", err));
}



// ==================== CALL EXAMPLES ====================

// websocketExample();
 placeOrderExample();
// modifyOrderExample('25101600000348');  // replace with actual order no
// cancelOrderExample('25101600000348');  // replace with actual order no
 getOrderBookExample();
