# CH5

## Conclusion
Not only does CDO not have a physical map of these routes accessible to the public, but it also doesn’t have digital copies of these route maps online. This, therefore, is the problem we have solved by creating an Online Interactive Route Map for Public Utility Vehicles (Jeepneys) currently servicing Cagayan de Oro City. The web application may be viewed by navigating to cdopuv.org.  

The project has so far met all of the objectives. The study was successful in creating an application that let users view the individual routes and information pertaining to it. The Journey Planning feature ranked as the most important feature that users want to use, therefore, it was also implemented - although with a few issues that couldn't be overcome within the timeframe of this project. A password protected admin module is also available for the management of the data generated and served by the web application.

The Journey Planning feature of the application returned the correct output of Jeepney Route Suggestions when fed with a set of start and end coordinates. It was sufficiently fast, returning results within two to four seconds from request. Although it always returned a somewhat correct output, it didn't always return the most logical one. This is due to the limitations of the database functions available and the availability of a properly processed spatial dataset which takes months to build and a team to work with it. Furthermore, and due to the aforementioned constraints, the Journey Planner does not support transfers when routing; it will always only calculate the route to a destination using only 1 ride.

## Future Recommended Works

### Improvements to the Spatial Dataset for Routing
Being a Core feature of the PUV Route Map, the researchers recommend improvements to the Journey Planning feature. The Journey Planning feature relies on the underlying dataset that the Shortest Path Algorithms use to route against. There are two approaches to this recommendation: the first approach is to improve the dataset; while the other is to improve the routing algorithm used or write one from scratch. 

The first approach of improving the dataset involves the processing of extensive road data available from the OpenStreetMap Foundation. This spatial data contains information about the roads, elevations, crossings, bridges, sidewalks, lifts, and other geographical features. The data needs to be analyzed, sanitized, processed and inserted into a database for use in routing or pathfinding. This could unlock the system for use in multi-modal, muti-tranfer, and multi-stop routing.

The other approach, although not exclusive to the other, is equally complex and would require extensive knowledge of Graph Theory, Geographical Information Systems, and Database Systems. It involves the creation of new functions and algorithms in the pgrouting library that our application used. 

### Usability Improvements
Respondents from our users and experts group noted some usability issues with the application. One notable issue the researchers identified was that the users didn't connect with the application. For the users, it was not clear what actions were permissible. This was especially difficult to do because map applications are complex on their own and more information and guidance pushed to the user incur memory overhead that elicit disatisfaction. Furthermore, the mapping application was already cramp and low on space, especially on mobile so instructions couldn't be pushed to the users effectively on such small and cramped screens. The researchers recommend more studies about displaying maps on screens to ascertain the proper way of displaying information without needing additional instructions for propper usage.

### User Experience tailored for CDO Commuting
The researchers recommend that the application be matched to the real needs of commuters of Cagayan de Oro. An example of this would be to match the color of the lines in the web app to those of the signage color of the jeepney routes - which is currently not possible with the LeafletJS Library used. The same could be recommended for Motorela's color coding scheme. At the moment, although the application is called "CDO PUV MAP", it doesn't actually provides information about all the ways to commute in Cagayan de Oro. More functionalities could also be included like multi-transfer, or multi-modal routing that happens in actuality. The application could also include a user forum for discussion of the routes with commuters to improve velocity of change.

### A Complete and Separate Application for Administrators
Currently, the admin module is served by the same server that serves the mapping application. This exposes the app to reliability and security issues. Furthermore, the admin module only allows operations be made to the text data of the application and not to the geometry data. The researchers recommend that a complete management and administration application be made that includes updating of geometry of routes without the need for a trained GIS professional. 
