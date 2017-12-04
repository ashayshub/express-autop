'use strict';
const express = require('express')
const paginate = require('express-paginate');

const app 	  = express()
app.use('/static', express.static('static'))
app.use(paginate.middleware(10, 50));

app.set('view engine', 'pug')
app.set('views', './templates')

const Controller = require('./controller');
var db = require('./db/models');

// All GET Routes
app.get('/', (req, res, next) => {
	try {
		var car_type = req.query.car_type || 'Truck'
		var allowed_cars = ['Truck', 'Sport']

		if(allowed_cars.indexOf(car_type) == -1){
			res.status(400).send('Bad Request')
			return
		}
		var place_holder = Controller.list_entries(req, res, car_type);
	} catch (err){
		next(err);
	}

})

app.get('/price', (req, res) => {})

// All POST Routes
app.post('/populate', Controller.populate)

// All delete Routes
app.delete('/teardown', Controller.teardown)

app.listen(5000, ()=> {
	db.sequelize.sync();
	console.log('Server started, listening on port 5000')
})