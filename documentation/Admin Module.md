# CH4

## Development(Coding)

### Admin Module

The admin module is available via the protected `GET /admin` route. An unauthorized user attempting to access the `/admin` route will be redirected to the Login Page. Upon successful login, an HTML is rendered to the front-end that wiil have access to the `GET /admin/routes` and `GET /admin/reports` endpoints. Bot of these GET endpoints return an HTML that will render data to the page via Javascript - SPA style. The same Routes and Reports view expose the ability to update the `routes` and `reports` tables via the `POST /admin/routes` and `POST /admin/reports` endpoints. 

Information about the routes are available to the admin in table format. The table contains information about the Route Code, Route Name, Short Name, Path, Signage, Length, and Color of a Route. Other information like the Well Known Binary (WKB) representation of the Geometry information is not available. To edit the information on the table, the edit button transforms the table data into input elements. When the admin user is satisfied with the changes, clicking the save button will update the values in the database. Editable fields for the Routes table are Route Code, Route Name, Shortname, Path, Signage, and Color. The Path field is an array that will be used for the search function on the front-end. Adding keywords like "cogon" will allow users to view routes with the "cogon" keyword in the path array. 

The Reports table afford the same functionality for editing records but only allow the status to be edited. The status may be edited to New, Resolved, or Unactionable.
The information available on the Reports table are the Date/Time, Status, Summary/Subject, Description, Type, Reporter Name, and Email Address. Clicking Edit

[Screenshot sa Routes ug Reports here]