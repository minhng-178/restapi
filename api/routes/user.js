const express = require('express');
const router = express.Router();
const UserController = require('../controllers/users');

router.post('/signup', UserController.sign_up);
router.post('/login', UserController.log_in);
router.delete('/:userId', UserController.delete_user);

module.exports = router;
