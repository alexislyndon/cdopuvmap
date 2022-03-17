const { Pool } = require("pg");

const db = new Pool({
  user: "postgres",
  host: "localhost",
  port: "5432",
  password: "1233",
  database: "puv",
});

// console.log(`${db}`)

module.exports = db;
