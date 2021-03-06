const Sequelize = require('sequelize');
const config = require('./config/config.json');

const sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, {
	host: config.db.host,
	dialect: 'postgres',
	operatorsAliases: false,

	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000
	},

	// turning off
	define: {
		timestamps: false // true by default
	},

	logging: false
});

// Testing db connection
sequelize
	.authenticate()
	.then(() => {
		console.log('Connection has been established successfully.');
	})
	.catch(err => {
		console.error('Unable to connect to the database:', err);
	});


// Creating the model for a user
const User = sequelize.define('user', {
	id: {
		type: Sequelize.INTEGER,
		allowNull: false,
		primaryKey: true,
		autoIncrement: true		
	},
	name: {
		type: Sequelize.STRING
	}
});

// Creating the model for the permissions
const Permission = sequelize.define('permission', {
	name: {
		type: Sequelize.STRING
	},
	access: {
		type: Sequelize.BOOLEAN
	}
});


module.exports = { sequelize };
