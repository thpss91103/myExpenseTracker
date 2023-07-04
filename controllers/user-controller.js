const bcrypt = require('bcryptjs')
const { User } = require('../models')
const helpers = require('../_helpers')

const userController = {
  signup: async (req, res, next) => {
    try {
      const { name, email, password, confirmPassword } = req.body
      const errors = []
      
      if (!name || !email || !password || !confirmPassword) {
        errors.push('所有欄位皆為必填')
      }

      const findUser = await User.findOne({
        where: { email }
      })

      if (findUser && findUser.email === email) {
        errors.push('此Email已被註冊')
      }
      if (name.length > 10) {
        errors.push('名稱不能超過 10 個字')
      }
      if (password !== confirmPassword) {
        errors.push('兩次輸入的密碼不相同')
      }
      if (errors.length > 0) {
        return res.render('signup', {
          error_messages: errors.join('\n & \n'),
          name,
          email,
          password
        })
      }

      const hash = await bcrypt.hash(req.body.password, 10)
      await User.create({ name, email, password: hash })

      req.flash('success_messages', '成功註冊帳號！')
      return res.redirect('/signin')
    } catch (err) {
      next(err)
    }
  },
  signIn: (req, res, next) => {
    req.flash('success_messages', '成功登入！')
    return res.redirect('/accounts')
  },
  accounts: (req, res) => {
    return res.render('accounts')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    return res.redirect('/signin')
  }
}

module.exports = userController