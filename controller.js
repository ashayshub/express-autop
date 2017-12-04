const Car = require('./db/models').Car;


var getYearwiseUrlList = ($) => {
	var urlList = [];
	var curr_year = (new Date()).getFullYear().toString();
	$('ul[class="dropdown-menu"]').find('a').each((index, element) => {
		if (curr_year == $(element).attr('href'))
			return;
		urlList.push($(element).attr('href'));
	});
	return urlList;
};

var format_list = ($, carType) => {
	carList = []
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
	return {'car_list': carList, 'year_list': getYearwiseUrlList($), 'car_type': carType};
};


var initializeCarList = (url, carType) => {
	return new Promise ((resolve, reject) => {
		const urlPrefix = 'http://www.nydailynews.com';
		var cheerio = require('cheerio');
		console.log('URL: '+ url);
	  	r = require('request');
	  	r.get(url, {}, (err, res, body) =>{
	  		if (err) {
	  			console.log('Some Error: ' + err);
	  			return reject(err);
	  		}
			$ = cheerio.load(body);
			return resolve(format_list($, carType));
	  	});
	});
};


module.exports = {

	list_entries: (req, res, car_type) =>{
		Car.findAll({
			'order': ['car_type', 'title']
		})
		.then(data => {
			var response = {
				'page': 1,
				'per_page': 10,
				'car_type': car_type,
				'cars': data
			}
			res.render('main', response);
		})
		.catch(error => {
			console.log('Error: '+ error);
			res.status(500).render('main', {})
		})
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
			  	var year_list = []
			  	var car_type = '';
				Object.keys(info).map(index => {			
					carList.push.apply(carList, info[index]['car_list']);
					year_list.push.apply(year_list, info[index]['year_list']);
					car_type = info[index]['car_type'];
				});

				var innerCarListProms = Object.keys(year_list).map(index2 =>{
					return initializeCarList(urlPrefix + year_list[index2], car_type);
				});
				return Promise.all(innerCarListProms)

			}).then(info2 => {
						Object.keys(info2).map(index3 =>{
							carList.push.apply(carList, info2[index3]['car_list']);
						});

						console.log('Length: '+ Object.keys(carList).length);
						return Car.bulkCreate(carList, {individualHooks: true})

			}).then(status =>{
				res.status(201).send('Populated');
			})
			.catch(error => {
				console.log(error);
				res.status(500).send('Error quering information from remote source');
			});
			}
};
