if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const { Router } = require('express');
const insertUser = require('../services/insertUser');
const router = Router()
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const getUser = require('../services/getUser');


router.get('/signup', async (req, res) => { })
router.post('/signup', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const result = await insertUser(req.body.username, hashedPassword)
        res.status(201).send()
    } catch (err) {
        console.log(err);
        res.status(500).send(err.detail)
    }
})
router.get('/login', async (req, res) => { res.render('login') })
router.post('/login', async (req, res) => {
    const { username, password } = req.body
    // if (!username || !password) { res.status(401); return }
    const data = await getUser(username)
    if(!data) {res.send(403); return;}
    const maxAge = 15 * 60// 15s

    try {
        if (await bcrypt.compare(password, data.password)) {
            const accessToken = jwt.sign({ username }, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: maxAge
            })
            req.user = data
            res.cookie('jwt', accessToken, { httpOnly: true, maxAge: maxAge * 1000 })
            res.json({ user: req.user.id })
            // res.render("admin");
        } else {
            res.send(403)
        }
    } catch (error) {
        console.log(error);
        res.status(500).send()
    }
})

module.exports = router