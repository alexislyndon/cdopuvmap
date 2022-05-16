const db = require("./db");

module.exports = async (username) => {
  const result = await db.query(`
  
  UPDATE users set totp_secret=null, totp_temp=false, totp_status=false where username=$1
  
  `, [username]);
  const data = result.rows[0];

  return data;
  //res.render("index", { people: data });
};
