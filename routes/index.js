const express = require('express')
const passport = require('../config/passport')
const router = express.Router()
const userController = require('../controllers/user-controller')
const { generalErrorHandler } = require('../middleware/error-handler')
const { authenticated } = require('../middleware/auth')

router.get('/signup', (req, res) => res.render('signup'))
router.post('/users/register', userController.signup)
router.get('/signin', (req, res) => res.render('signin'))
router.post(
  '/signin',
  passport.authenticate('user', {
    successRedirect: '/accounts',
    failureRedirect: '/signin'
  }),
  userController.signIn
)
router.get('/logout', userController.logout)

router.get('/accounts', authenticated, userController.accounts)
router.post('/accounts', authenticated, userController.createAccount)
router.post('/accounts/:id/edit', authenticated, userController.editAccount)
router.delete('/accounts/:id/delete', authenticated, userController.deleteAccount)

router.get('/', (req, res) => res.redirect('/accounts'))
router.use('/', generalErrorHandler)

module.exports = router