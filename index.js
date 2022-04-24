const express = require('express');
const app = express()

const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const authRoutes = require('./routes/auth')
const mapRoutes = require('./routes/map')
const adminRoutes = require('./routes/admin')
const bcrypt = require('bcrypt')

const path = require('path');

const port = process.env.PORT || 8080;

const oneDay = 1000 * 60 * 60 * 24;
app.use(express.json());
app.use(sessions({
    secret: "thequickbrownfox",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
}));
app.use(express.urlencoded())
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});
app.use(authRoutes)
app.use(mapRoutes)
app.use('/admin', adminRoutes)

app.listen(port, () => {
    console.log(`App listening on port: ${port}`);
});