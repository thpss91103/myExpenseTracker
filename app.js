// require packages used in the project
const express = require('express')
const handlebars = require('express-handlebars')
const routes = require('./routes')
const handlebarsHelpers = require('./helpers/handlebars-helpers')
const app = express()
const port = 3000

app.engine('hbs', handlebars({ defaultLayout: 'main', extname: '.hbs', helpers: handlebarsHelpers }))
app.set('view engine', 'hbs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))


app.use(routes)

// start and listen on the Express server
app.listen(port, () => {
  console.log(`Express is listening on localhost:${port}`)
})

module.exports = app