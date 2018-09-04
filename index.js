const express = require('express');
const request = require('request');
const pg = require('pg');
const async = require('async');
const elasticsearch = require('elasticsearch');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/signafiretht';

const app = express();

app.use(express.static('public'));

// Connect to the database
const dbClient = new pg.Client(connectionString);
dbClient.connect();
dbClient.query('CREATE TABLE IF NOT EXISTS users(name VARCHAR(40), index VARCHAR(40) UNIQUE, access boolean)');

// Connect to elasticsearch
var elasticsearchClient = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

app.get('/users/:userName', function(req, res) {
	return dbClient.query('select index from users where name = $1::text and access = true', [req.params.userName], (err, userIndicies) => {
		return res.json(userIndicies.rows);
	});
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