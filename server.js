const express = require('express');
const path = require('path');
const app = express();
const paypal = require('paypal-rest-sdk');


paypal.configure({
    'mode': 'sandbox',
    'client_id': process.env.AWS_CLIENT_ID,
    'client_secret': process.env.AWS_CLIENT_SECRET
});

app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/' , (req , res) => {
    res.redirect('/index.html');
});

app.get('/buy' , ( req , res ) => {
    // create payment object
    let payment = {
        "intent": "authorize",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://127.0.0.1:3000/success",
            "cancel_url": "http://127.0.0.1:3000/err"
        },
        "transactions": [{
            "amount": {
                "total": 1.00,
                "currency": "USD"
            },
            "description": " a book on mean stack "
        }]
    };

    createPay( payment )
        .then( ( transaction ) => {
            let id = transaction.id;
            let links = transaction.links;
            let counter = links.length;
            while( counter -- ) {
                if ( links[counter].method === 'REDIRECT') {
                    // redirect to paypal where user approves the transaction
                    return res.redirect( links[counter].href )
                }
            }
        })
        .catch( ( err ) => {
            console.log( err );
            res.redirect('/err');
        });
});

app.get('/success' , (req ,res ) => {
    console.log(req.query);
    res.redirect('/success.html');
});

app.get('/err' , (req , res) => {
    console.log(req.query);
    res.redirect('/err.html');
});

app.listen( 3000 , () => {
    console.log('app listening on 3000 ');
});

const createPay = ( payment ) => {
    return new Promise((resolve, reject) => {
        paypal.payment.create(payment, function (err, payment) {
            if (err) {
                reject(err);
            }
            else {
                resolve(payment);
            }
        });
    });
};
	