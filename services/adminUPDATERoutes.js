const { disable, disabled } = require("express/lib/application");
const db = require("./db");

module.exports = async (id,{route_code,route_name,shortname,signage,color,path}) => {
  // if(color == '#000000') color == null
  // console.log(color);
  const result = await db.query(`
  
  UPDATE routescopy SET 
  route_code=$2,
  route_name=$3,
  shortname=$4,
  signage=$5,
  color=$6,
  path=$7
  where id=$1
  
  `, [id,route_code,route_name,shortname,signage,(color == '#000000') ? null:color,path]);
  const data = result.rows;

  return data;
  //res.render("index", { people: data });
};