const db = require("./db");

module.exports = async ({ summary, desc, type, name, email }) => {
console.log('asdf');
    const result = await db.query(`
  
  INSERT INTO reports (summary, descrip, type, name, email, resolved)
  values ($1,$2,$3,$4,$5, true)
  
  `, [
        summary || null,
        desc || null,
        type || null,
        name || null,
        email || null
    ]);
    const data = result.rows;

    return data;
    //res.render("index", { people: data });
};