const express = require('express');
const router = express.Router();
const {Signup, GetUsers, Login} = require('../controller/UserController');




router.get('/', GetUsers);
router.post('/signup', Signup);
router.post('/login', Login);



module.exports = router;