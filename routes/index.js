const express = require('express')
const router = express.Router()
const userController = require('../controllers/user-controller')
const { generalErrorHandler } = require('../middleware/error-handler')

router.get('/signup', (req, res) => res.render('signup'))
router.post('/users/register', userController.signup)
router.get('/signin', (req, res) => res.render('signin'))

router.get('/', (req, res) => res.redirect('/signin'))
router.use('/', generalErrorHandler)

module.exports = router