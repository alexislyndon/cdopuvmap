
# CH 4
## Coding
### Shortest Path Algorithm
Calculation of the suggested Jeepney routes from 2 arbitrary points, origin and destination, are enabled by the Postgres Spatial Database Server with the PostGIS and pgrouting extensions. PostGIS provides functions to prepare the data for routing while `pgrouting` provides the functions to calculate for the shortest path, given a prepared and valid graph.

At the core of the Algorithm is the `pgr_dijkstra()` function from the pgrouting extension which takes a `source` and `target` points which are then used to calculate the shortest path on a graph represented by a table of edges and nodes on the Postgres Spatial Database.

The process starts with the user requesting for Journey Planning between 2 points, this translates to the server receiving 2 sets of coordinates. The http server sends the data to the database for the calculations and the nodejs server receives the an array of jeepney suggestions called itineraries. 

The functions, operators, and data types afforded by the database were not sufficient to calculate the shortest path output in the desired way so a custom algorithm had to be made.

Steps
1. Find all routes (from the routes table) nearest to the destination, excluding routes more than 300 meters away. 
```
SELECT * FROM routes where ST_Distance(ST_Transform(st_setsrid(st_makepoint(<dest longitude>, dest.latitude),4326),3857) < 300 order by <->
```
For each route found by above, do below:
1. Draw a line From origin point to the closest point of the geometry
```
ST_ShortestLine(st_setsrid(st_makepoint($1,$2),4326), r.the_geom) leg1
````
2. Draw a line From destination point to the closest point of the geometry

```
ST_ShortestLine(st_setsrid(st_makepoint($4,$4),4326), r.the_geom) leg99
```

3. Insert the output of the previous steps to another `temporarytable` table.
4. Insert the Jeepney route (for this iteration) into the same temporary table
5. Run pgr_nodeNetwork
6. Run pgr_createTopology
7. Calculate the lengths of all 3 segments inside the table for use as the "cost" parameter for later
8. Set reverse_cost to a really high number like 99999
9. find the start and end nodes rows from the noded table
10. run pgr_dijkstra
```
SELECT * FROM pgr_dijkstra('SELECT id,source,target,distance cost, rcost reverse_cost FROM temporarytable_noded',start_node,end_node,true)
```
11. convert the result of the dijkstra function to a FeatureCollection json
12. push the json to an array
13. Drop the temporary tables 
(end of iteration)

Sort array by lowest aggregate cost first and return to the client as a response. 
(End of Algorithm)

