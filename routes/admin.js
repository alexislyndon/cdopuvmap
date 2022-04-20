const { Router } = require('express')
const router = Router()
const adminGETReports = require('../services/adminGETReports')
const adminGETRoutes = require('../services/adminGETRoutes')

router.get('/', async (req, res) => {
    res.render("admin");
});

router.get('/routes', async (req, res) => {
    const data = await adminGETRoutes()
    res.render("routes/index", { routes: data });
})

router.get('/reports', async (req, res) => {
    const data = await adminGETReports()
    res.render("reports/index", { reports: data });
})

module.exports = router