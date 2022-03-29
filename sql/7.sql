  SELECT pgr_nodeNetwork('tedges', 0.00005, 'id', 'the_geom', 'noded', 'uuid=''e1414040-aa8a-4403-a9c8-df2f2393b400''')
  SELECT pgr_createTopology('tedges_noded', 0.00005);
  
  ALTER TABLE tedges_noded ADD COLUMN IF NOT EXISTS distance FLOAT8;
  ALTER TABLE tedges_noded ADD COLUMN IF NOT EXISTS rcost FLOAT8;
  UPDATE tedges_noded SET distance = ST_Length(ST_Transform(the_geom, 4326)::geography) / 1000;
  UPDATE tedges_noded SET rcost = 99999;

  UPDATE tedges_noded AS n
  SET route_code=o.route_code
  FROM tedges as o
  WHERE n.old_id=o.id;