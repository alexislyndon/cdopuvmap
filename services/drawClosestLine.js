const db = require("./db");

module.exports = async (point, line) => {
  const point_geom = point.the_geom;
  const line_geom = line.the_geom;
  const result = await db.query(`
  
  SELECT ST_ShortestLine(point,line) AS the_geom
	
FROM 
(
	SELECT 
	$1::geometry AS point,
	$2::geometry AS line
	  
) As fooo;
  
  `, [point_geom, line_geom]);
  const leg1 = result.rows[0];

  return leg1;
  //res.render("index", { people: data });
};

// ST_ClosestPoint(line2,line1) As cp_line_21,
// (select the_geom from edges_noded where id=1) as g1,
// (select the_geom from edges_noded where id=2) as g2