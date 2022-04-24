const { Pool, Client } = require("pg");

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

const db = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:1233@localhost:5432/puvroutemap',
  ssl: false 
})

module.exports = db;