const { Router } = require('express');
const router = Router()

router.get('/signup', async (req, res) => { })
router.post('/signup', async (req, res) => {  })
router.get('/login', async (req, res) => { res.render('login') })
router.post('/login', async (req, res) => {
    const { username, password } = req.body
    console.log('username', username);
    console.log('password', password);
    res.json({
        username,
        password
    })
})

module.exports = router