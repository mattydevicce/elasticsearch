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
models.user.belongsTo(models.permission, {foreignKey: 'id', targetKey: 'userId'});
models.permission.hasMany(models.user);
db.sequelize.sync({force: true}).then(() => {

	models.user.create({
		name: 'foo'
	});

	models.permission.bulkCreate([{
		name: 'foo_index',
		access: true,
		userId: 1
	},{
		name: 'bar_index',
		access: true,
		userId: 1
	},{
		name: 'false_index',
		access: false,
		userId: 1
	}]);
});


// Connect to elasticsearch
var elasticsearchClient = new elasticsearch.Client({
	host: 'localhost:9200',
	log: 'trace'
});

app.get('/users/:userName', function(req, res) {
	return models.user.findOne({
		where: {
			name: req.params.userName
		},
		include: [{
			model: models.permission
		}]
	}).then(user => {
		console.log(user)
		return res.json(user.permissions)
	}).catch(err => {
		console.log(err)
	})
});

app.get('/search/:userName', function(req, res) {
	// Checking for a blank search term
	if (req.query.searchParam) {

		return dbClient.query('select index from users where name = $1::text and access = true', [req.params.userName], (err, userIndicies) => {
			if (userIndicies.rows.length > 0) {

				// Not sure how we can search for more than one index so I will make a loop
				const returnResults = [];
				async.forEach(userIndicies.rows, (index, eachIndex) => {
					const response = elasticsearchClient.search({
						index: index.index,
						body: {
							query: {
								match: {
									"first_name": req.query.searchParam
								}
							}
						}
					}).then(body => {
						body.hits.hits.forEach(e => {
							returnResults.push({
								"full_name": e._source.first_name + ' ' + e._source.last_name,
								"location": e._source.location,
								"id": e._id
							});
						});
						return eachIndex();
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


app.listen(3000, () => console.log('Example app listening on port 3000!'))