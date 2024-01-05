const router = require('express').Router();
const config = require('../config/config.json');
const { users } = require('../controllers/user');
const jwtCheck = require('../middlewares/Auth');
const { NotFound } = require('../utils/NotFound');

const url = config.default_url;

// Get Twitter authorization link
router.get(`/${url}/gettwiterlink`, users.getTwiterLink); 

// Add nickname and photo
router.post(`/${url}/settwitter`, users.setTwitter); 

// Check cookies (authorization)
router.use(jwtCheck); 

// Get referral link
router.get(`/${url}/referrallink`, users.referralLink); 

// Enter wallet
router.post(`/${url}/addwallet`, users.addWallet); 

// Enter referral code
router.post(`/${url}/addreferralcode`, users.addReferralCode); 

// Get user data
router.get(`/${url}/me`, users.getInfo);

// Sign out
router.delete(`/${url}/signout`, users.signOut); 

router.use(`*`, NotFound); // ? Return a 404 error if there is no such listener

module.exports = router;
