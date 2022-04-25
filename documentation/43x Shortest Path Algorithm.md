# Shortest Path Algorithm
Calculation of the suggested Jeepney routes from 2 arbitrary points, origin and destination, are enabled by the Postgres Spatial Database Server with the PostGIS and pgrouting extensions. 

At the core of the Algorithm is the `pgr_dijkstra()` function from the pgrouting extension which takes a `source` and `target` points which are then used to calculate the shortest path on a graph represented by a table of edges and nodes on the Postgres Spatial Database.

The process starts with the user requesting for Journey Planning between 2 points, this translates to the server receiving 2 sets of coordinates. The http server sends the data to the database for the calculations and the nodejs server receives the an array of jeepney suggestions called itineraries. 

