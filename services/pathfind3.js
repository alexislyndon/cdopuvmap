const dbPool = require("./db");
const { v4: uuidv4 } = require('uuid');
const getNearestVertexID = require("./getNearestVertexID");
const getNearestVertexID2 = require("./getNearestVertexID2");


module.exports = async (olon, olat, dlon, dlat, maxwalk = 300) => {
    let db = null
    let nofound = false;
    try {
        var itinerary = []
        db = await dbPool.connect();
        var uuid = await uuidv4();
        // const uuid = await uuidv4().replace(/-/g,'');
        uuidNoHyphen = 'x' + uuid.replace(/-/g, '').replace(/[^A-Za-z]/g, '').substring(0, 3)
        // uuidNoHyphen = 'xyzxyz'
        console.log(uuidNoHyphen);
        //
        const result = await db.query(`
        
                select distinct route_code,route_id, route_name, the_geom, xx*cosd($4), leg1, leg99
                from
                    (select *  from routes) r
                INNER JOIN lateral --ST_Length(ST_Transform(leg1,26986))
                    ST_Distance(ST_Transform(st_setsrid(st_makepoint($3, $4),4326),3857), ST_Transform(r.the_geom,3857)) xx
                on xx*cosd($4) < ${maxwalk} 
                INNER JOIN
                ST_ShortestLine(st_setsrid(st_makepoint($1,$2),4326), r.the_geom) leg1
                on xx*cosd($4) < ${maxwalk}
                INNER JOIN
                ST_ShortestLine(r.the_geom, st_setsrid(st_makepoint($3,$4),4326)) leg99
                on xx*cosd($4) < ${maxwalk}
    
                `, [olon, olat, dlon, dlat]);

        var rows = result.rows;
        if(!rows[0]) {
            console.log('no rows');
            nofound = true
            return
        }


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
        if(nofound) {return -1}
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
        return itinerary.slice(0,3)
    }

}