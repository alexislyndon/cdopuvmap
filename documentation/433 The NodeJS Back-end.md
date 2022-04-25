# CH 4
## Coding
### The NodeJS Back-end
Node.js is a JavaScript runtime built on Chrome's V8 Javascript engine. A NodeJS Server allowed us to write a both the back-end and the front-end in the JavaScript programming language. Node also allowed the use of the largest Software Registry, npm, to install our dependencies.

The ExpressJS framework enabled HTTP capabilities of the server, able to respond to HTTP GET and HTTP POST request from the client.

The below code snippet allowed us to respond to a Homepage request from the client on the "/" endpoint. A GET /routes endpoint is also exposed to serve the mapping client application with all the route data available.


```
const express = require('express')
const app = express()
const getallRoutes = require('../services/getallRoutes');
const port = 3000

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/index.html'));
})

app.get("/routes", async (req, res) => {
    var startTime = process.hrtime();
    const routes = await getallRoutes();

    res.json(Object.values(routes)[0]);
    var elapsedSeconds = parseHrtimeToSeconds(process.hrtime(startTime));
    console.log('/routes ' + elapsedSeconds + 'seconds');
})

app.listen(port, () => {
  console.log(`App running on ${port}`)
})
```

Server side rendering (SSR) was enabled by the ejs depencency. EJS allowed us to create views from the server and send the templates via http to the client. EJS allowed javascript-like code to be written in HTML to enable control structures like if-statements and loops. 

EJS not used in the main map application but in the admin module. 

```
<span>
  <div class="success-msg" hidden>This is a success message.</div>
</span>
<h2>Reports</h2>
<table class="main-tbl" id="reports">
  <thead>
    <tr>
      <th>Summary</th>
      <th>Description</th>
      <th>Type</th>
      <th>Reported by</th>
      <th>Email Address</th>
      <th>Resolved</th>
      <th>Actions <button class="add">Add new</button></th>
    </tr>
  </thead>
  <tbody>
    <% reports?.map((i) =>{ %>
    <tr data-id="<%= i.id%>">
      <td><%= i.summary %></td>
      <td><%= i.desc %></td>
      <td><%= i.type %></td>
      <td><%= i.name %></td>
      <td><%= i.email %></td>
      <td><%= i.resolved %></td>
      <td>
        <button class="save">Save</button>
        <button class="edit">Edit</button>
        <button class="delete">Delete</button>
      </td>
    </tr>
    <% }) %>
  </tbody>
</table>

```

For communicating with the database, the pg package from npm was used. It allowed the use of a `Pool` object that allowed the server to "pool" limited database connections for reusability. A method from this libraby, query(), attached to the connection pool object was used to query the database server with custom SQL queries. An ORM or Object Relational Mapping library could not be used because of the complex nature of spatial database queries.

```
const { Pool } = require("pg");

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

const db = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:1233@localhost:5432/puvroutemap',
  ssl: false 
})

module.exports = db;
```

The NodeJS server exposed three unprotected endpoints: a `GET /routes` endpoint that returned all the data about each individual jeepney route, a `GET /itineraries` endpoint that returns itinerary suggestions from an input of 2 coordinates, and a `POST /reports` endpoint that allows users to send the app admins suggestions or report missing routes.

The admin module is accessible thru the `/admin` endpoints - which are login protected. There are five (5) endpoints under `/admin`. A root `/` endpoint that renders a page, a `GET /routes` endpoint that fetches the routes from the database for display in a table, a `GET /reports` endpoint that fetches reports made by users, a `POST /reports/:id` endpoint to update the status of reports to New | Resolved | Unactionable, and a `POST /routes/:id` endpoint to update a jeepney route's information.

A `GET /login` endpoint is available for users to log into the app. By supplying the correct username and password and posting it to `POST /login`, a user is granted access to the admin module. A `POST /signup` endpoint also exist for creation of admin users but there is no front-end for it and a front-end will never be made for it.

TABLE OF ENDPOINTS (HTTP)


| Endpoint | Takes | Returns | Protected | Remarks |
| ------ | ------ | ------- | ------- | ------ |
| GET / | nothing | html of web map app | no | Gets the web app from server |
| GET /itineraries | origin & destination coordinates | ARRAY of type FeatureCollection to display features on a map | no | FeatureCollection array for immediate consumption by the Leaflet library front-end |
| POST /reports | subject,desc,type,name,email | nothing | no | Allows users to send reports about bugs or missing info |
| GET /admin | jwt auth cookie | admin HTML | yes | Allows users in when login is valid, redirects to login page when invalid |
| GET /admin/routes | nothing | routes info | yes | Renders info into an editable table |
| GET /admin/reports | nothing | table of reports | yes | Renders info into an editable table |
| POST /admin/routes/:id | id,route_code,route_name,shortname,path,color,signage | nothing | yes | Updates info of the jeepney routes in database |
| POST /admin/reports/:id | id,status | nothing | yes | Updates a report's status |
| GET /login | nothing | login page html  | no | Unauthenticated requests to /admin will be redirected to this endpoint |
| POST /login | username,password | jwt cookie  | no | Returns a jwt cookie that expires in 12hours |


