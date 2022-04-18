const { Router } = require('express')
const router = Router()

router.get('/routes', (req, res) => {
    res.send('admin/routes route')
})



module.exports = router