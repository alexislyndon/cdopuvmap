const db = require("./db");

module.exports = async (username) => {
  const result = await db.query(`
  
  SELECT username, active, totp_secret, totp_status from users where username=$1
  
  `, [username]);
  const data = result.rows[0];

  return data;
  //res.render("index", { people: data });
};
