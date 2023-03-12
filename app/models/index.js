const dbConfig = require('../config/dbConfig.js');
require('dotenv').config()
const { Sequelize } = require('sequelize');


const sequelize = new Sequelize(process.env.MYSQL_DB, process.env.USER, process.env.PASS, {
  host: process.env.HOST,
  port: process.env.DB_PORT,
  dialect:'mysql' ,
  operatorsAliases: 0,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./userModel")(sequelize, Sequelize);
db.products = require("./productModel")(sequelize, Sequelize);
//db.image = require("./imageModel")(sequelize, Sequelize);

db.sequelize.sync({ force: false})

const User = db.user;
const Product = db.products;
//const Image = db.image;

User.hasMany(Product, {
  foreignKey: 'id'
});
Product.belongsTo(User, {
  foreignKey: 'id'
});

// Product.hasMany(Image, {
//   foreignKey: 'prod_id',
//   onDelete:'CASCADE'
// });
// Image.belongsTo(Product, {
//   foreignKey: 'prod_id'
// });

module.exports = db;