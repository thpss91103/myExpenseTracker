// require packages used in the project
const express = require('express')
const app = express()
const port = 3000

// routes setting
app.get('/', (req, res) => {
  res.send('This is my movie list built with Express')
})

// start and listen on the Express server
app.listen(port, () => {
  console.log(`Express is listening on localhost:${port}`)
})