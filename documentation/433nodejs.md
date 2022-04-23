# The NodeJS Back-end
Node.js is a JavaScript runtime built on Chrome's V8 Javascript engine. NodeJS Server allowed us to write a both the back-end and the front-end in the JavaScript programming language. Node also allowed the use of the largest Software Registry, npm. We didn't have to write our own implementations because we could find free to use packages for our needs.

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