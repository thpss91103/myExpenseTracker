if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

// require packages used in the project
const express = require('express')
const handlebars = require('express-handlebars')
const routes = require('./routes')
const handlebarsHelpers = require('./helpers/handlebars-helpers')
const flash = require("connect-flash")
const methodOverride = require('method-override')
const session = require('express-session')
const passport = require('./config/passport')
const helpers = require('./_helpers')
const app = express()
const PORT = process.env.PORT || 3000
const SESSION_SECRET = process.env.SESSION_SECRET || 'ThisIsMySecret'

app.engine('hbs', handlebars({ defaultLayout: 'main', extname: '.hbs', helpers: handlebarsHelpers }))
app.set('view engine', 'hbs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true
  })
)
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use(methodOverride('_method'))
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = helpers.getUser(req)
  next()
})

app.use(routes)

// start and listen on the Express server
app.listen(PORT, () => {
  console.log(`Express is listening on localhost:${PORT}`)
})

module.exports = app