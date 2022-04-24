# The NodeJS Back-end
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

The admin module is accessible thru the `/admin` endpoints which are login protected. 