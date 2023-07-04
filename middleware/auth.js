const helpers = require('../_helpers')

const authenticated = (req, res, next) => {
  if (helpers.ensureAuthenticated(req)) {
    return next()
  } else {
    req.flash('error_messages', '請先登入!')
    return res.redirect('/signin')
  }
}

module.exports = {
  authenticated
}