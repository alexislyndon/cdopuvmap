# Map display
    The leaflet map can be instantiated
# GeoJSON
    Routes found in the application are stored in the database as GeoJSON format.

    GeoJSON is based in JSON format. Unlike the generic JSON file, GeoJSON has a well-specified format. The reason for its specified format is that GeoJSON is designed for representing simple geographical features and should typically contain spatial data consisting of simple geographic features and attributes. 

    In the context of the PUV route map application, aside from actual vertices, nodes, and map coordinates; route name, route code (number), and route colors of each corresponding route are also stored in the GeoJSON file.

    These stored routes along with their data are retrieved through SQL queries initiated by the web application and will be then aggregated into a GeoJSON object by leaflet.

# Layers

    In leaflet, anything that can be added and rendered to the map is a layer. The layer can be anything from circles and polygons to map markers and popups. GeoJSON data from the SQL query results will be added and rendered to the map as a layer. As a result, each route from the database will be represented as layers on the map.

    Leaflet layers will have methods such as layer.remove(), layer.addto(), layer.getbounds(), etc.. These methods including the other ones that are not mentioned will be used/called by the client-side JavaScript functions to present geographical data on the map itself. 

# Location tracking
    Leaflet plugins are available for developers to use. One of the available plugins is the location tracking plugin. Location control will then be added to the map as a layer. 

    On mobile devices, the location tracking uses GPS coordinates to determine the user’s location. However, GPS capabilities are unavailable on most PCs and Macs. As an alternative, the user’s location will be determined using IP addresses

# HTML controls
    Depending on the task, route layers will be represented as html buttons in the user interface and will be rendered to the web application dynamically. These buttons will contain basic information about each route.