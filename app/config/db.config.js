const { Client } = require('pg');

const client = new Client({
  user: process.env['dbUsername'],
  host: process.env['dbHost'],
  database: process.env['dbName'],
  password: process.env['dbPassword'],
  port: process.env['dbPort'],
});

client.connect();

module.exports = client;