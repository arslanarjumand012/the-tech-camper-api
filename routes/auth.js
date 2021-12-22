const express = require('express');

const { register  , login ,getMe , ForgetPassword , resetPassword , updateDetails, updatePassword, logout} = require('../controllers/auth');

const { protect  , authorize} = require('../middleware/auth')

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me',protect, getMe);
router.post('/forgetpassword', ForgetPassword);
router.put('/resetPassword/:resettoken', resetPassword);
router.put('/updatedetails',protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.get('/logout', logout);

module.exports = router;