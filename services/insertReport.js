const db = require("./db");

module.exports = async ({ summary, desc, type, name, email, status }) => {
console.log('asdf');
    const result = await db.query(`
  
  INSERT INTO reports (summary, descrip, type, name, email, resolved, status)
  values ($1,$2,$3,$4,$5, false, 'New')
  
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