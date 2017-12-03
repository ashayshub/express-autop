'use strict';
const express = require('express')
const app 	  = express()

app.use('/static', express.static('static'))

app.set('view engine', 'pug')
app.set('views', './templates')

// All GET Routes
app.get('/', (req, res) => {
	var car_type = req.query.car_type || 'Truck'	
	var allowed_cars = ['Truck', 'Sport']

	if(allowed_cars.indexOf(car_type) == -1){
		res.status(400).send('Bad Request')
		return
	}
	var place_holder = {
		'car_type': car_type,
		'page': 1,
		'per_page': 10,
		'cars': [
			{
				'car_type': 'Truck',
				'title': 'Some Car',
				'summary': 'A good car',
				'price_query': 'test'
			}
		]
	}
	res.render('main', place_holder)
})

app.get('/price', (req, res) => {})

// All POST Routes
app.post('/populate', (req, res) => {
	res.send('Populated the data into database')
})

// All delete Routes
app.get('/teardown', (req, res) => res.send('Tore down the structure'))

app.listen(5000, ()=> console.log('Server started, listening on port 5000'))