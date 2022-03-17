const db = require('./db')

module.exports = () => {
    const result = await db.query(`
 
    select leg1, the_geom
    from (
    SELECT *
    FROM edges
    ORDER BY the_geom <-> st_setsrid(st_makepoint(124.64343309402464, 8.47716876512738),4326)
    ) e
    left join lateral
    ST_ShortestLine(st_setsrid(st_makepoint(124.64343309402464, 8.47716876512738),4326),e.the_geom) leg1
    on true
    where (select ST_Length(ST_Transform(leg1,26986)) <= 3500	)
    order by id desc
    
    `);
};

//query above will draw lines from a point to all routes that are less than 3500 meters away on the closest point/edge