const express = require('express');
const app = express()

const cookieParser = require("cookie-parser");
const authRoutes = require('./routes/auth')
const mapRoutes = require('./routes/map')
const adminRoutes = require('./routes/admin')

const path = require('path');
const authMW = require('./middleware/authMW');

const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});
app.use(authRoutes)
app.use(mapRoutes)
app.use('/admin', authMW, adminRoutes)

app.listen(port, () => {
    console.log(`App listening on port: ${port}`);
});