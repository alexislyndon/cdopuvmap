## PostgreSQL Spatial Database Setup

PostGIS 3.2.0 bundle for PostgreSQL database includes 3 vital components that extend the functionality of PostgreSQL server. It includes the PostGIS extension and the pgrouting extension that enabled spatial and geographical capabilities for the database. A command line tool called ogr2ogr is also included.

The ogr2ogr command line tool was used to insert rows to the edges table. The command below was executed on all 55 geojson files that were created during the data transformation stage. The geojson properties object was also imported by referencing their keys by name. The properties as well as the most important column, `the_geom`, was imported into the SQL database. Each row corresponded to a jeepney route. The table and data created with this method would be later used as-is by the Admin User and the Commuter User on the web app.



```
ogr2ogr -select route_code,route_id,route_name,file_name,remarks,VIA,STRUCTURE,start_end -lco GEOMETRY_NAME=the_geom -lco FID=id -f PostgreSQL PG:"dbname=puvroutemap user=postgres password=1233" -nln routes 31.geojson
```