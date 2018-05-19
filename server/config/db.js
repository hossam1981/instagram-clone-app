const Sequelize = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASS, {
    host: env.DB_HOST,
    port: env.DB_PORT,
    dialect: 'postgres',
    define: {
        underscored: true
    }
})

// connect all the models/tables in database to a db object
// so everything is accesible via one object
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models/tables
db.users = require('../models/users.js')(sequelize, Sequelize);
db.pics = require('../models/pics.js')(sequelize, Sequelize);

module.exports = db;