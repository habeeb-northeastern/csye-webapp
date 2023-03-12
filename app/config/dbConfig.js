require('dotenv').config()
module.exports = {
  HOST: 'localhost',
  USER: 'csye6225',
  PASS: 'Coffeebites1$',
  MYSQL_DB: 'csye6225',
  dialect: 'mysql',

  pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
  }
}