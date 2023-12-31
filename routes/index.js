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

router.get('/accounts/:id', authenticated, userController.getAccountRecord)
router.get('/accounts/:id/prevMonth', authenticated, userController.getPrevMonth)
router.get('/accounts/:id/nextMonth', authenticated, userController.getNextMonth)

router.get('/accounts', authenticated, userController.accounts)
router.post('/accounts', authenticated, userController.createAccount)
router.post('/accounts/:id/edit', authenticated, userController.editAccount)
router.delete('/accounts/:id/delete', authenticated, userController.deleteAccount)

router.get('/record/:id', authenticated, userController.getRecord)
router.post('/record/:id', authenticated, userController.postRecord)
router.put('/record/:id', authenticated, userController.updateRecord)
router.delete('/record/:id/delete', authenticated, userController.deleteRecord)

router.get('/user/:id', authenticated, userController.userProfile)
router.put('/user/:id/edit', authenticated, userController.userEdit)

router.get('/', (req, res) => res.redirect('/accounts'))
router.use('/', generalErrorHandler)

module.exports = router