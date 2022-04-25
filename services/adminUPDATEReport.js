const db = require("./db");

module.exports = async (id, status) => {
  const result = await db.query(`
  
  UPDATE reports SET status=$2 where id=$1
  
  `, [id, status]);
  const data = result.rows;

  return data;
  //res.render("index", { people: data });
};