const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')

module.exports = async (req, res, next) => {
    try {
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(req.body.password)
    } catch (error) {
        
    }
  };
  