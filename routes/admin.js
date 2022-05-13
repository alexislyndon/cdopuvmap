const { Router } = require('express');
const authMW = require('../middleware/authMW');
const router = Router()
const speakeasy = require('speakeasy')
var QRCode = require('qrcode');
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
    const { status } = req.body
    const data = await adminUPDATEReport(id, status);
    res.sendStatus(200);
})
router.post('/routes/:id', async (req, res) => {
    const { id } = req.params;
    const data = await adminUPDATERoutes(id, req.body);
    res.sendStatus(200);
})

router.get('/account', (req, res) => {
    res.render("account/index");

})
router.post('/gen2fa', (req,res) => {
    const temp_secret = speakeasy.generateSecret()
    console.log(req.user);
    QRCode.toDataURL(temp_secret.otpauth_url, function(err, data_url) {
        console.log(data_url);
      
        // Display this data URL to the user in an <img> tag
        // Example:
        // write('<img src="' + data_url + '">');
        res.json({ secret: temp_secret, qr:data_url })
    });
})

module.exports = router