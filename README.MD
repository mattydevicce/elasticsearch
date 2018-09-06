### Welcome to a tribute to the greatest API in the world

#####To see permissions in action, you can search name fred and see there is no fred durst which was seeded into elasticsearch with the index of false_index. fred flintstone was seeded as foo_index and fred rogers was seeded as bar_index.

#### To run this app, one may need a couple of things...

1.  A browser
2.  Node
3.  npm (should come with node)
4.  Postgresql (connected to port 5432, I also use the datbase name tribute but you can set whatever db you want with the env variable DATABASE_URL)
5.  Elasticsearch (connected to port 9200)

#### To run this app, follow these steps

1.  when in directory, create a config file like the example config, `cp config.example.json config.json` and fill in credentials
1.  run this command install npm packages used for this project: `npm i`
2.  start elasticsearch data store
3.  start postgresql and create a database called `tribute`
4.  run `node index.js`
5.  open a browser and go to `http://localhost:3000` and search `fred`