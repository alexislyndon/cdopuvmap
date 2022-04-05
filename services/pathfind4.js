const dbPool = require("./db");
const { v4: uuidv4 } = require('uuid');
const getNearestVertexID = require("./getNearestVertexID");
const getNearestVertexID2 = require("./getNearestVertexID2");


module.exports = async (olon, olat, dlon, dlat, maxwalk = 300) => {
    let db = null
    try {
        var itinerary = []
        db = await dbPool.connect();
        var uuid = await uuidv4();
        // const uuid = await uuidv4().replace(/-/g,'');
        uuidNoHyphen = 'x' + uuid.replace(/-/g, '').replace(/[^A-Za-z]/g, '').substring(0, 4)
        // uuidNoHyphen = 'xyzxyz'
        console.log(uuidNoHyphen);
        //
        const result = await db.query(`
        
        WITH 
        --Make a start point
        start_pt as (
                select st_setsrid(st_makepoint(124.7499918937683,8.500831949030873), 4326) as starting),
        --Make a End Point
        end_pt as (
                select st_setsrid(st_makepoint(124.62920665740968,8.488172857640734), 4326) as ending),
        --Select Closest source node and its geom for start point
        source_code AS (
                select source, the_geom from routes_noded order by st_distance(the_geom, (select starting from start_pt)) limit 1),
        --Select closest target node and its geom for end point
        target_code AS (
                select target, the_geom  from routes_noded order by st_distance(the_geom, (select ending from end_pt)) limit 1), 
        --Route Union from pgr_trsp()
        route as (
                SELECT route_name, the_geom, st_length(ST_Transform(the_geom, 4326)::geography)/10 as length from (
                    SELECT route_name,the_geom FROM pgr_trsp(
                        'SELECT id, source, target, distance cost, rcost reverse_cost, the_geom FROM routes_noded',
                        (select source from source_code)::integer, (select target from target_code)::integer, true, true
                        ) as di JOIN routes_noded
                    ON di.id2 = routes_noded.id) as foo)
    select * from route
    --Finaly snap the route to precisely matach our start and end point  
    select  route_name,length, ST_LineSubstring (the_geom,
                                ST_LineLocatePoint(the_geom, (select starting from start_pt)),
                                ST_LineLocatePoint(the_geom, (select ending from end_pt)))
                                    from route
    
                `, [olon, olat, dlon, dlat]);

        var rows = result.rows;


        for await (const row of rows) {
            console.log(row.route_code);
            await db.query(`BEGIN;`)
            var t = await db.query(`
            CREATE TABLE if not exists "${uuidNoHyphen}" (
                id serial PRIMARY KEY,
                route_id integer,
                route_code varchar(8),
                the_geom geometry(Geometry,4326),
                route_name varchar,
                leg_type varchar,
                distance float,
                uuid uuid 
                );
	    
                
                insert into ${uuidNoHyphen} (route_id, route_code, route_name, the_geom, leg_type, uuid) values
                (${row.route_id}, '${row.route_code}', '${row.route_name}', '${row.leg1}'::geometry, 'walk1', '${uuid}'::uuid), --leg1
                (${row.route_id}, '${row.route_code}', '${row.route_name}', '${row.leg99}'::geometry, 'walk99', '${uuid}'::uuid), --leg99
                (${row.route_id}, '${row.route_code}', '${row.route_name}', '${row.the_geom}'::geometry, 'route', '${uuid}'::uuid); --route
                SELECT pgr_nodeNetwork('${uuidNoHyphen}', 0.0005, 'id', 'the_geom', 'noded');
                commit;
                SELECT pgr_createTopology('${uuidNoHyphen}_noded', 0.00005, clean:=true);
                begin;
                ALTER TABLE ${uuidNoHyphen}_noded ADD COLUMN IF NOT EXISTS distance FLOAT8;
                ALTER TABLE ${uuidNoHyphen}_noded ADD COLUMN IF NOT EXISTS rcost FLOAT8;
                ALTER TABLE ${uuidNoHyphen}_noded ADD COLUMN IF NOT EXISTS leg_type character varying;
                ALTER TABLE ${uuidNoHyphen}_noded ADD COLUMN IF NOT EXISTS route_name character varying;
                ALTER TABLE ${uuidNoHyphen}_noded ADD COLUMN IF NOT EXISTS itinerary integer;
                ALTER TABLE ${uuidNoHyphen}_noded ADD COLUMN IF NOT EXISTS route_code character varying;

                
                UPDATE ${uuidNoHyphen}_noded n
                SET 
                route_code=o.route_code,
                leg_type=o.leg_type,
                route_name=o.route_name,
                itinerary=o.route_id
                FROM ${uuidNoHyphen} o
                WHERE n.old_id=o.id;
                
                UPDATE ${uuidNoHyphen}_noded SET distance = ST_Length(ST_Transform(the_geom, 4326)::geography) / 1000 where leg_type='route';
                UPDATE ${uuidNoHyphen}_noded SET rcost = 99999;
                UPDATE ${uuidNoHyphen}_noded SET distance = ST_Length(ST_Transform(the_geom, 4326)::geography) / 250 where leg_type LIKE 'walk%';
                commit;
            `);
            console.log('noded');
            const o = await getNearestVertexID2(olon, olat, uuidNoHyphen);
            const d = await getNearestVertexID2(dlon, dlat, uuidNoHyphen);
            console.log(`vertices: ${o.id} ${d.id}`);

            o
            d

            var dijkstra = await db.query(`
        
                SELECT jsonb_build_object(
                    'type',     'FeatureCollection',
                    'features', jsonb_agg(features.feature)
                    ) json
                FROM (
                SELECT jsonb_build_object(
                'type',       'Feature',
                'id',         id,
                'geometry',   ST_AsGeoJSON(the_geom)::jsonb,
                'properties', to_jsonb(inputs) - 'id' - 'the_geom'
                ) feature
                FROM (
                    
                    SELECT * FROM pgr_dijkstra('SELECT id,source,target,distance cost, rcost reverse_cost FROM ${uuidNoHyphen}_noded',${o.id},${d.id},true) dijkstra
                    left join ${uuidNoHyphen}_noded t_n
                    on t_n.id= dijkstra.edge
                        
                ) inputs 
                ) features;
            `);
            console.log('dijkstra-ed');
            itinerary.push(dijkstra.rows[0]);
            // await db.query(`ROLLBACK;`);
            await db.query(`
            DROP TABLE ${uuidNoHyphen};
            DROP TABLE ${uuidNoHyphen}_noded;
            DROP TABLE ${uuidNoHyphen}_noded_vertices_pgr;
            `);
        }
    } catch (err) {
        await db.query(`ROLLBACK;`);
        console.log(err);
        console.log('rolled back');
        return JSON.stringify(itinerary)

    } finally {
        // console.log(itinerary);
        // console.log('itinerary');
        // console.log(JSON.stringify(itinerary));
        itinerary.forEach(r => {
            var le = r.json.features.length
            console.log(`route:${r.json.features[0].properties.route_code} cost: ${r.json.features[le-1].properties.agg_cost}`);
        })
        itinerary.sort((a, b) => {
            var l = a.json.features.length
            var ll = b.json.features.length
            return (a.json.features[l - 1].properties.agg_cost > b.json.features[ll - 1].properties.agg_cost)  ? 1 : -1
        });
        console.log(`\n`);
        itinerary.forEach(r => {
            var le = r.json.features.length
            console.log(`route:${r.json.features[0].properties.route_code} cost: ${r.json.features[le-1].properties.agg_cost}`);
        })
        // console.log(itinerary);
        return itinerary
    }
str = `    WITH 
--Make a start point
start_pt as (
        select st_setsrid(st_makepoint(124.7499918937683,8.500831949030873), 4326) as starting),
--Make a End Point
end_pt as (
        select st_setsrid(st_makepoint(124.62920665740968,8.488172857640734), 4326) as ending),
--Select Closest source node and its geom for start point
source_code AS (
        select source, the_geom from routes_noded order by st_distance(the_geom, (select starting from start_pt)) limit 1),
--Select closest target node and its geom for end point
target_code AS (
        select target, the_geom  from routes_noded order by st_distance(the_geom, (select ending from end_pt)) limit 1), 
--Route Union from pgr_trsp()
route as (
        SELECT seq,agg_cost,edge,route_name, the_geom, st_length(ST_Transform(the_geom, 4326)::geography)/10 as length from (
            SELECT seq,agg_cost,edge,route_name,the_geom FROM pgr_KSP(
                'SELECT id, source, target, distance cost, rcost reverse_cost, the_geom FROM routes_noded',
                (select source from source_code)::integer, (select target from target_code)::integer, 2, true, true
                ) as di left JOIN routes_noded
            ON di.edge = routes_noded.id) as foo)
-- select SUM(CASE WHEN edge=-1 THEN 1 ELSE 0 END) OVER (ORDER BY seq) as grp,* from route
SELECT
    SUM(CASE WHEN next_id=-1 THEN 1 ELSE 0 END) OVER (ORDER BY seq) as grp, *
FROM (
    SELECT
        LAG(edge) OVER (ORDER BY seq) as next_id, *
    FROM route r
) s
`
}