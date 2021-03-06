/*jslint node: true */
/*jshint esversion: 6 */
'use strict';

const db = require('./db/models');
const Car = db.Car;
const cheerio = require('cheerio');
const r = require('request');

// const util = require('util')

var getYearwiseUrlList = ($, carType) => {
	var urlList = [];
	var curr_year = (new Date()).getFullYear().toString();
	$('ul[class="dropdown-menu"]').find('a').each((index, element) => {
		if (curr_year == $(element).attr('href'))
			return;
		urlList.push({
			'uri': $(element).attr('href'),
			'carType': carType
		});
	});
	return urlList;
};

var format_list = ($, carType) => {
	var carList = [];

	$('div[class="rtww"]').find('a').each((index, element) => {
		var title = $(element).find('h3').text();
		var carInfo = title.split(" ");
		var year = carInfo[0];
		var carMake = carInfo[1];
		var carModel = carInfo.slice(2).join(" ");

		carList.push({
			'title':       title,
			'year':        carInfo[0],
			'car_type':    carType,
			'car_model':   carInfo.slice(2).join(" "),
			'car_make':    carInfo[1],
			'summary':     $(element).find('p').text(),
			'image':       $(element).find('img').attr('src'),
			'price_query': carMake + '/' + carMake + '-' + carModel.split(" ").join("-") + 
							'-' + 'year' + '-' + $(element).attr('data-l-cid')
		});
	});
	return {'car_list': carList, 'year_list': getYearwiseUrlList($, carType)};
};


var initializeCarList = (url, carType) => {
	return new Promise ((resolve, reject) => {
		const urlPrefix = 'http://www.nydailynews.com';
	  	r.get({uri: url, gzip: true}, (err, res, body) =>{
	  		if (err) {
	  			console.log('Some Error: ' + err);
	  			return reject(err);
	  		}
	  		console.log('URL: '+ url);
			var $ = cheerio.load(body);
			return resolve(format_list($, carType));
	  	});
	});
};

var getTrimId = (url) => {
	return new Promise ((resolve, reject) => {
	  	r.get({uri: url, gzip: true}, (err, res, body) =>{
	  		if (err) {
	  			console.log('Some Error: ' + err);
	  			return reject(err);
	  		}
			var $ = cheerio.load(body);
			return resolve($('div[id="ra-wrap"]').attr('data-trimid'));
	  	});
	});
};

var getPrice = trimId => {
	return new Promise ((resolve, reject) => {
    	const apiEndpoint = 'http://api.edmunds.com/api/vehicle/v2/styles/';
    	const partUri = '?view=full&fmt=json&api_key=';
    	const apiKey = 'b72ndgbvxw4vp92eugantyr4';
		const url = apiEndpoint + trimId + partUri + apiKey;

	  	r.get({uri: url, gzip: true}, (err, res, body) =>{
	  		if (err) {
	  			console.log('Some Error: ' + err);
	  			return reject(err);
	  		}
			return resolve(JSON.parse(body));
	  	});
	});
};


module.exports = {

	list_entries: (req, res, car_type, p) =>{
		return Promise.all([
			Car.findAll({
				'offset': req.skip,
				'limit': req.query.limit,
				'order': ['car_type', 'title'],
				'where': {
					'car_type': car_type
				}
			}),
      		Car.count({
      			'where': {
      				'car_type': car_type
      			}
      		})
    	])
		.then(([results, itemCount]) => {
			// console.log('Got skip: '+ req.skip);
			var pageCount =  Math.ceil(itemCount / req.query.limit);
			var response = {
				'cars': results,
				'offset': req.skip,
				'pageCount': pageCount,
				'itemCount': itemCount,
				'limit':  req.query.limit,
				'pages': p.getArrayPages(req)(3, pageCount, req.query.page),
				'car_type': car_type,
			};
			res.render('main', response);
		})
		.catch(error => {
			console.log('Error: '+ error);
			var response = {
				'cars': {},
				'offset': req.skip,
				'pageCount': 0,
				'itemCount': 0,
				'limit':  req.query.limit,
				'pages': [],
				'car_type': car_type,
			};
			res.status(500).render('main', response);
		});
	},

	request_price: (req, res, url) =>{
		return getTrimId(url)
				.then(trimId =>{
					// console.log('Got TrimID: '+ trimId);
					return getPrice(trimId);
				})
				.then(priceObj =>{
					// console.log('Got Price' + priceObj.price.baseMSRP);
					res.json(priceObj.price);
				})
				.catch(error =>{
					console.log('Error while querying the price: '+ error);
					res.status(500).send('Internal server error');
				});
	},

	populate: (req, res) => {
		const urlList = {
			'Truck': 'http://www.nydailynews.com/autos/types/truck',
			'Sport': 'http://www.nydailynews.com/autos/types/sports-car'
		};

		var carList = [];
		var carListProms = Object.keys(urlList).map(carType => {  		
			return initializeCarList (urlList[carType], carType);
		});

		return Promise.all(carListProms)
			.then(info => {
			  	const urlPrefix = 'http://www.nydailynews.com';
			  	var year_list = [];

				Object.keys(info).map(index => {			
					carList.push.apply(carList, info[index].car_list);
					year_list.push.apply(year_list, info[index].year_list);
				});
					
				var innerCarListProms = Object.keys(year_list).map(index2 =>{
					var url = urlPrefix + year_list[index2].uri;
					var car_type = year_list[index2].carType;
					return initializeCarList(url, car_type);
				});
				return Promise.all(innerCarListProms);

			})
			.then(info2 => {
				Object.keys(info2).map(index3 =>{
					carList.push.apply(carList, info2[index3].car_list);
				});

				// Create table if not already
				db.sequelize.sync();

				return Car.bulkCreate(carList, {individualHooks: true});

			})
			.then(resp =>{
				// console.log(resp);
				res.status(201).send('Populated the data into database');
			})
			.catch(error => {
				console.log(error);
				res.status(500).send('Error while populating data');
			});
	},

	teardown: (req, res) => {
		return Car.drop()
				.then( status => {

					// Create the table after teardown
					db.sequelize.sync();

					res.send('Tore down the structure');
				})
				.catch(error => {
					res.status(500).send('Error dropping table');
				});
	}
};
