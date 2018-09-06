const express = require('express');
const Sequelize = require('sequelize');
const async = require('async');
const elasticsearch = require('elasticsearch');
const config = require('./config/config.json');
const db = require('./db');
const models = db.sequelize.models;
const app = express();

app.use(express.static('public'));

// sync and seed the db
models.permission.belongsTo(models.user);
models.user.hasMany(models.permission);
db.sequelize.sync({force: true}).then(() => {
	models.user.create({
		name: 'foo'
	}).then(user => {
		models.permission.bulkCreate([{
			name: 'foo_index',
			access: true,
			userId: user.id
		},{
			name: 'bar_index',
			access: true,
			userId: user.id
		},{
			name: 'false_index',
			access: false,
			userId: user.id
		}]);
		
	});
});


// Connect to elasticsearch
var elasticsearchClient = new elasticsearch.Client({
	host: 'localhost:9200',
	log: false
});

// Seed elasticsearch
elasticsearchClient.indices.delete({
	index: 'foo_index',
	ignore: [404]
}).then(body => {
	return elasticsearchClient.indices.delete({
		index: 'bar_index',
		ignore: [404]
	}).then(body => {
		return elasticsearchClient.indices.delete({
			index: 'false_index',
			ignore: [404]
		}).then(body => {
			return elasticsearchClient.bulk({
				body: [
					{ delete: { _index: 'foo_index', _type: '_doc', _id: 1 } },
					{ delete: { _index: 'bar_index', _type: '_doc', _id: 2 } },
					{ delete: { _index: 'false_index', _type: '_doc', _id: 3 } },
					{ index:  { _index: 'foo_index', _type: '_doc', _id: 1 } },
					{ first_name: 'fred', last_name: 'flintstone', location: 'bedrock'},
					{ index:  { _index: 'bar_index', _type: '_doc', _id: 1 } },
					{ first_name: 'fred', last_name: 'rodgers', location: 'land of make-believe'},
					{ index:  { _index: 'false_index', _type: '_doc', _id: 1 } },
					{ first_name: 'fred', last_name: 'durst', location: 'I pack a chainsaw'},
				]
			}).then((a) => {
				console.log("finished seeding")
			}) 
		});
	});
}).catch(err => {
	console.log(err);
});

app.get('/users/:userName', (req, res) => {
	return models.user.find({
		where: {
			name: req.params.userName
		},
		include: [{
			model: models.permission
		}]
	}).then(user => {
		return res.json(user);
	}).catch(err => {
		console.log(err);
	});
});

app.get('/search/:userName', (req, res) => {
	// Checking for a blank search term
	console.log(req.query.searchParam)
	if (req.query.searchParam) {
		models.user.find({
			where: {
				name: req.params.userName
			},
			include: [{
				model: models.permission,
				where: {
					access: true
				}
			}]
		}).then(user => {
			if (user) {
				// Not sure how we can search for more than one index so I will make a loop
				const returnResults = [];
				async.forEach(user.permissions, (permission, eachPermission) => {
					const response = elasticsearchClient.search({
						index: permission.name,
						body: {
							query: {
								match: {
									"first_name": req.query.searchParam
								}
							}
						}
					}).then(body => {
						console.log(body)
						body.hits.hits.forEach(e => {
							returnResults.push({
								"full_name": e._source.first_name + ' ' + e._source.last_name,
								"location": e._source.location,
								"id": e._id
							});
						});
						return eachPermission();
					})
				}, err => {
					if (err) {
						return res.json();
					};
					return res.json(returnResults);
				});
			} else {
				return res.json();
			}
		});
	} else {
		return res.json();
	};
});


// added if we want to work on it later
// app.post('/es/create', (req, res) => {
// 	return elasticsearch.create({
// 		index: req.body.index,
// 		body: {
// 			first_name: req.body.firstName,
// 			last_name: req.body.lastName,
// 			location: req.body.location
// 		}
// 	}).then(body => {
// 		return res.json(body);
// 	}).catch(err => {
// 		console.log(err);
// 	});
// });


app.listen(3000, () => console.log('Example app listening on port 3000!'))