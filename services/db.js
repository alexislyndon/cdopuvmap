const { Pool, Client } = require("pg");

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

const db = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:1233@localhost:5432/puvroutemap',
  //ssl: process.env.DATABASE_URL ? true : false
  ssl: process.env.DATABASE_URL && process.env.NODE_ENV ? true : false
})


// console.log(`${db}`)



// const client = new Client({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false
//   }
// });

// client.connect();

// client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
//   if (err) throw err;
//   for (let row of res.rows) {
//     console.log(JSON.stringify(row));
//   }
//   client.end();
// });

module.exports = db;