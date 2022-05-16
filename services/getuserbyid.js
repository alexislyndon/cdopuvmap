const db = require("./db");

module.exports = async (id) => {
  const result = await db.query(`
  
  SELECT username, active, totp_secret, totp_status from users where id=$1
  
  `, [id]);
  const data = result.rows[0];

  return data;
  //res.render("index", { people: data });
};
