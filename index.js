'use strict';
const express = require('express')
const app 	  = express()

app.use('/static', express.static('static'))

app.set('view engine', 'pug')
app.set('views', './templates')

const Controller = require('./controller');
var db = require('./db/models');

// All GET Routes
app.get('/', (req, res) => {
	var car_type = req.query.car_type || 'Truck'	
	var allowed_cars = ['Truck', 'Sport']

	if(allowed_cars.indexOf(car_type) == -1){
		res.status(400).send('Bad Request')
		return
	}
	var place_holder = Controller.list_entries(req, res, car_type);
})

app.get('/price', (req, res) => {})

// All POST Routes
app.post('/populate', Controller.populate)

// All delete Routes
app.delete('/teardown', (req, res) => res.send('Tore down the structure'))

app.listen(5000, ()=> {
	db.sequelize.sync();
	console.log('Server started, listening on port 5000')
})