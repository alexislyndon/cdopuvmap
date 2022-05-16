const { Router } = require('express');
const authMW = require('../middleware/authMW');
const router = Router()
const speakeasy = require('speakeasy')
var QRCode = require('qrcode');
const adminGETReports = require('../services/adminGETReports')
const adminGETRoutes = require('../services/adminGETRoutes');
const adminUPDATEReport = require('../services/adminUPDATEReport');
const adminUPDATERoutes = require('../services/adminUPDATERoutes');
const getusertotp = require('../services/getusertotp');
const updatetotp = require('../services/updatetotp');
const settotp = require('../services/settotp');
const disabletotp = require('../services/disabletotp');

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

router.get('/account', async (req, res) => {
    const { username } = req.user
    const user = await getusertotp(username)
    res.render("account/index", { user });

})
router.post('/gen2fa', async (req, res) => {
    const user = req.user.username
    const temp_secret = speakeasy.generateSecret()
    const result = await updatetotp(user,temp_secret.base32)
    console.log(req.user);
    QRCode.toDataURL(temp_secret.otpauth_url.replace('SecretKey','CDOPUVMAP'), function (err, data_url) {
        // console.log(data_url);

        // Display this data URL to the user in an <img> tag
        // Example:
        // write('<img src="' + data_url + '">');
        res.json({ secret: temp_secret, qr: data_url })
    });
})

router.post('/ver2fa', async (req, res) => {
    const { otp } = req.body
    const username = req.user.username
    const { totp_secret } = await getusertotp(username)
    var verified = speakeasy.totp.verify({
        secret: totp_secret,
        encoding: 'base32',
        token: otp
    });

    if(verified){
        const result = await settotp(username, totp_secret)
    }
    console.log(verified);
    res.json({verified})
})

router.post('/disable2fa', async (req,res) => {
    const username = req.user.username
    const result = await disabletotp(username)
    res.json({success:true})
})

module.exports = router