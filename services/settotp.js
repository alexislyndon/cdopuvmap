const db = require("./db");

module.exports = async (username,secret) => {
  const result = await db.query(`
  
  UPDATE users set totp_secret=$2, totp_temp=false, totp_status=true where username=$1
  
  `, [username, secret]);
  const data = result.rows[0];

  return data;
  //res.render("index", { people: data });
};
