const db = require("./db");

module.exports = async (username, hashedPassword) => {
  const result = await db.query(`
  
  INSERT INTO users(
	username, password)
	VALUES ($1, $2);
  
  `, [username, hashedPassword]);
  const data = result.rows;

  return data;
  //res.render("index", { people: data });
};
