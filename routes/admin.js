const { Router } = require('express');
const authMW = require('../middleware/authMW');
const router = Router()
const adminGETReports = require('../services/adminGETReports')
const adminGETRoutes = require('../services/adminGETRoutes');
const adminUPDATEReport = require('../services/adminUPDATEReport');
const adminUPDATERoutes = require('../services/adminUPDATERoutes');

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
router.post('/reports/:id', async (req, res) => {
    const { id } = req.params;
    const {status} = req.body
    const data = await adminUPDATEReport(id, status);
    res.sendStatus(200);
})
router.post('/routes/:id', async (req, res) => {
    const { id } = req.params;
    const data = await adminUPDATERoutes(id, req.body);
    res.sendStatus(200);
})

module.exports = router