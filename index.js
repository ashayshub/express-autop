/*jslint node: true */
/*jshint esversion: 6 */

'use strict';

const express = require('express');
const paginate = require('express-paginate');

const app 	  = express();
app.use('/static', express.static('static'));
app.use(paginate.middleware(10, 50));

app.set('view engine', 'pug');
app.set('views', './templates');

const Controller = require('./controller');
var db = require('./db/models');

// All GET Routes
app.get('/', (req, res, next) => {
	try {
		var car_type = req.query.car_type || 'Truck';
		var allowed_cars = ['Truck', 'Sport'];

		if(allowed_cars.indexOf(car_type) == -1){
			res.status(400).send('Bad Request');
			return;
		}
		Controller.list_entries(req, res, car_type, paginate);
	} catch (err){
		next(err);
	}
});

app.get('/price', (req, res) => {
	const query = req.query.price_query || undefined;
	if (!query)
    	return res.status(400).status('Bad Request');

    var url_prefix = 'http://www.nydailynews.com/autos/';
    var price_url = url_prefix + query;
    Controller.request_price(req, res, price_url);
});

// All POST Routes
app.post('/populate', Controller.populate);

// All delete Routes
app.delete('/teardown', Controller.teardown);

app.listen(5000, "0.0.0.0", ()=> {
	db.sequelize.sync();
	console.log('Server started, listening on port 5000');
});