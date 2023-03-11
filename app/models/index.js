const dbConfig = require('../config/dbConfig.js');

const { Sequelize } = require('sequelize');


const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: 0,
  dialectOptions: dbConfig.dialectOptions,
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

db.sequelize.sync({ force: false})

const User = db.user;
const Product = db.products;

User.hasMany(Product, {
  foreignKey: 'id'
});
Product.belongsTo(User, {
  foreignKey: 'id'
});

module.exports = db;