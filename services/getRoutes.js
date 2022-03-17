const db = require("./db");

module.exports = async () => {
  const result = await db.query(`
  
  SELECT * FROM edges
  
  `);
  const data = result.rows;

  return data;
  //res.render("index", { people: data });
};
