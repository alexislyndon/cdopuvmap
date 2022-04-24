if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')

module.exports = async (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null) return res.render('login/index')
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,user) => {
        if(err) return res.render('login/index')
        req.user = user
        next()
    })
    // try {
    //     const salt = await bcrypt.genSalt()
    //     const hashedPassword = await bcrypt.hash(req.body.password)
    // } catch (error) {
        
    // }
  };
  