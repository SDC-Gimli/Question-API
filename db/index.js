const pgp = require('pg-promise')();
const key = require('../config.js');

const setup = {
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: key
}

const db = pgp(setup);

module.exports = db;

