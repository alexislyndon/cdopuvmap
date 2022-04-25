# CH 4
## Coding
### PostgreSQL Spatial Database Setup

PostGIS 3.2.0 bundle for PostgreSQL database includes 3 vital components that extend the functionality of PostgreSQL server. It includes the PostGIS extension and the pgrouting extension that enabled spatial and geographical capabilities for the database. A command line tool called ogr2ogr is also included.

The ogr2ogr command line tool was used to insert rows to the edges table. The command below was executed on all 55 geojson files that were created during the data transformation stage. The geojson properties object was also imported by referencing their keys by name. The properties as well as the most important column, `the_geom`, was imported into the SQL database. Each row corresponded to a jeepney route. The table and data created with this method would be later used as-is by the Admin User and the Commuter User on the web app.

The length of each geometry in each row is calculated after it is inserted. This is done by running an update query for the whole table. 

```
UPDATE routes SET length = ST_Length(ST_Transform(the_geom, 4326)::geography) / 1000
```

PostGIS functions table

| PostGIS functions used | Description |
| --- | --- |
| ST_SetSRID | Sets the SRID on a geometry to a particular integer value. |
| ST_MakePoint | Creates a 2D,3DZ or 4D point geometry. |
| ST_AsGeoJSON | Return the geometry as a GeoJSON element. |
| ST_ShortestLine | Returns the 2-dimensional shortest line between two geometries |
| ST_ClosestPoint | Returns the 2-dimensional point on g1 that is closest to g2. This is the first point of the shortest line. |
| ST_Length | Returns the 2d length of the geometry if it is a linestring or multilinestring. |
| ST_Transform | Returns a new geometry with its coordinates transformed to the SRID referenced by the integer parameter. |
| <--> | distance operator  |

pgrouting functions table

| PostGIS functions used | Description |
| --- | --- |
| pgr_dijkstra | Dijkstra’s algorithm for the shortest paths. |
| pgr_nodeNetwork | to create nodes for a  non-noded edge table |
| pgr_createTopology | to create a topology based on the geometry |
| pgr_trsp | Turn Restriction Shortest Path (TRSP) |

```
ogr2ogr -select route_code,route_id,route_name,file_name,remarks,VIA,STRUCTURE,start_end -lco GEOMETRY_NAME=the_geom -lco FID=id -f PostgreSQL PG:"dbname=puvroutemap user=postgres password=1233" -nln routes 31.geojson
```