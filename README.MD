### Welcome to a tribute to the greatest API in the world

#### To run this app, one may need a couple of things...

1.  A browser
2.  Node
3.  npm (should come with node)
4.  Postgresql (connected to port 5432, I also use the datbase name signafiretht but you can set whatever db you want with the env variable DATABASE_URL)
5.  Elasticsearch (connected to port 9200)

#### To run this app, follow these steps

1.  run this command install npm packages used for this project: `npm i`
2.  start elasticsearch data store
3.  start postgresql and create a database called `signafiretht`
4.  run `node index.js`
5.  open a browser and go to `http://localhost:3000`