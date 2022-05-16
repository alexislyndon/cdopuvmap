if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const { Router } = require('express');
const insertUser = require('../services/insertUser');
const router = Router()
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const speakeasy = require('speakeasy')
const getUser = require('../services/getUser');
const getuserbyid = require('../services/getuserbyid');

const maxAge = 60 * 60 * 5// 15s


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
    if (!data) { res.send(403); return; }
    const maxAge = 60 * 60 * 5// 15s

    try {
        if (await bcrypt.compare(password, data.password)) {
            const accessToken = jwt.sign({ username }, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: maxAge
            })
            req.user = data
            if (!data.totp_status) {
                res.cookie('jwt', accessToken, { httpOnly: true, maxAge: maxAge * 1000 })
                res.json({ user: req.user.id, totp: data.totp_status })
            } else {
                res.json({ user: req.user.id, totp: data.totp_status })
            }
            // res.render("admin");
        } else {
            res.send(403)
        }
    } catch (error) {
        console.log(error);
        res.status(500).send()
    }
})

router.get('/logout', function (req, res) {
    cookie = req.cookies;
    res.clearCookie("jwt");
    console.log('logged out');
    res.redirect('/admin');
});

router.post('/verify', async (req, res) => {
    const { otp,userid } = req.body
    // const username = req.user.username
    const { totp_secret, username } = await getuserbyid(userid)
    var verified = speakeasy.totp.verify({
        secret: totp_secret,
        encoding: 'base32',
        token: otp
    });

    if (verified) {
        const accessToken = jwt.sign({ username }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: maxAge
        })
        res.cookie('jwt', accessToken, { httpOnly: true, maxAge: maxAge * 1000 })
    }

    console.log(verified);
    res.json({ verified })
})


module.exports = router