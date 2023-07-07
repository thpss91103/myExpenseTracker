const bcrypt = require('bcryptjs')
const { User, Account, Record, Category, sequelize } = require('../models')
const helpers = require('../_helpers')
const { Op } = require('sequelize')

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
  accounts: async (req, res, next) => {
    try {
      const userId = helpers.getUser(req).id
      const accounts = await Account.findAll({ 
        raw: true,
        where: { User_id: userId } 
      })

      return res.render('accounts', {accounts})
    } catch(err) {
      next(err)
    }
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    return res.redirect('/signin')
  },
  createAccount: async (req, res, next) => {
    try {
      const userId = helpers.getUser(req).id
      const { name, date } = req.body
      await Account.create({ name, date, UserId: userId })
      return res.redirect('/accounts')
    } catch (err) {
      next(err)
    }
  },
  editAccount: async (req, res, next) => {
    try {
      const accountId = req.params.id
      const { name, date} = req.body

      const account = await Account.findByPk(accountId)

      if(!account) { throw new Error('沒有此帳戶')}

      await account.update({
        name: name || account.name,
        date: date || account.date
      })

      req.flash('success_messages', '已更新成功！')
      return res.redirect('/accounts')
    } catch(err) {
      next(err)
    }
  },
  deleteAccount: async (req, res, next) => {
    try {
      const accountId = req.params.id
      const account = await Account.findByPk(accountId)

      if (!account) { throw new Error('沒有此帳戶') }

      //要連此帳戶的紀錄一起刪
      await Record.destroy({
        where: { AccountId: accountId }
      })

      await Account.destroy({
        where: { id: accountId }
      })

      return res.redirect('/accounts')
    } catch (err) {
      next(err)
    }
  },
  userProfile: async (req, res, next) => {
    try {
      const userId = helpers.getUser(req).id

      const userData = await User.findByPk(userId)

      res.render('user-profile', {
        id: userId,
        name: userData.name,
        email: userData.email
      })
    } catch (err) {
      next(err)
    }
  },
  userEdit: async (req, res, next) => {
    try {
      const userId = helpers.getUser(req).id
      const { name, email, password, confirmPassword } = req.body
      const saltNumber = 10

      const [user, isEmailExist] = await Promise.all([
        User.findByPk(userId), //isEmailExist找出email有無重複
        User.findOne({ where: { email: email }})
      ])

      if (!user) { throw new Error('找不到此用戶！')}

      if (user.email !== email && isEmailExist) {
        throw new Error('該email已存在！')
      }

      if(name?.length > 10) throw new Error('名字勿超過10字！')

      if (password !== confirmPassword) throw new Error('密碼不一致!')
      let hashedPassword = 0
      if (password) {
        const salt = bcrypt.genSaltSync(saltNumber)
        hashedPassword = bcrypt.hashSync(password, salt)
      }

      await user.update({
        name: name || user.name,
        email: email || user.email,
        password: hashedPassword || user.password
      })

      req.flash('success_messages', '已更新成功！')
      return res.redirect('/accounts')
    } catch (err) {
      next(err)
    }
  },
  getAccountRecord: async (req, res, next) => {
    try {
      const accountId = req.params.id
      const currentDate = new Date()
      
      const currentMonth = currentDate.getMonth() + 1 // 月份從0开始，需要加1
      const currentYear = currentDate.getFullYear()

      const [ records, categories, totalAmount ] = await Promise.all([
        Record.findAll({
          raw: true,
          nest: true,
          where: { 
            [Op.and]: [
              { date: {
                [Op.and]: [
                  { [Op.gte]: new Date(currentYear, currentMonth - 1, 1)},
                  { [Op.lt]: new Date(currentYear, currentMonth, 1)}
                ]
              }
              },
              { AccountId: accountId }
            ]},
          include: [ Category ],
          order: [['date', 'DESC']]
        }),
        Category.findAll({
          raw: true
        }),
        Record.findAll({
          attributes: [
            [sequelize.fn('sum', sequelize.col('amount')), 'total_amount'],
          ],
          where: {
            [Op.and]: [
              {
                date: {
                  [Op.and]: [
                    { [Op.gte]: new Date(currentYear, currentMonth - 1, 1) },
                    { [Op.lt]: new Date(currentYear, currentMonth, 1) }
                  ]
                }
              },
              { AccountId: accountId }
            ]
          },
          group: ['Account_id'],
          raw: true
        })
      ])

      return res.render('records', {
        records,
        categories,
        accountId,
        totalAmount,
        month: currentMonth,
        year: currentYear
      })
    } catch (err) {
      next(err)
    }
  },
  postRecord: async (req, res, next) => {
    try {
      const accountId = req.params.id
      const { name, amount, date, category} = req.body
      const referer = req.headers.referer
      
      await Record.create({
        name,
        amount,
        date,
        AccountId: accountId,
        CategoryId: category
      })

      res.redirect(referer)
    } catch (err) {
      next(err)
    }
  },
  getRecord: async (req, res, next) => {
    try {
      const recordId = req.params.id
      
      const record = await Record.findByPk(recordId)
      const categories = await Category.findAll({
        raw: true
      })
      console.log(record.date)

      res.render('record', {
        id: recordId,
        name: record.name,
        amount: record.amount,
        date: record.date,
        category: record.CategoryId,
        categories
      })
    } catch (err) {
      next(err)
    }
  },
  updateRecord: async (req, res, next) => {
    try {
      const recordId = req.params.id
      const { name, amount, date, category } = req.body
      const referer = req.headers.referer

      const record = await Record.findByPk(recordId)
      if ( !record ) throw new Error('沒有此消費紀錄！')

      const accountId = record.AccountId

      await record.update({
        name: name || record.name,
        amount: amount || record.amount,
        date: date || record.date,
        CategoryId: category || record.CategoryId
      })

      res.redirect(`/accounts/${accountId}`)
    } catch (err) {
      next(err)
    }
  },
  deleteRecord: async (req, res, next) => {
    try {
      const recordId = req.params.id

      const record = await Record.findByPk(recordId)
      if (!record) throw new Error('沒有此消費紀錄！')

      const accountId = record.AccountId

      await record.destroy()

      res.redirect(`/accounts/${accountId}`)
    } catch (err) {
      next(err)
    }
  },
  getPrevMonth: async (req, res, next) => {
    try {
      const { month, year } = req.query
      const accountId = req.params.id
      
      let targetMonth = 0 
      let targetYear = 0

      targetMonth = Number(month) - 1
      targetYear = Number(year)
      if (targetMonth === 0) {
        targetMonth = 12
        targetYear--
      }

      const [records, categories, totalAmount] = await Promise.all([
        Record.findAll({
          raw: true,
          nest: true,
          where: {
            [Op.and]: [
              {
                date: {
                  [Op.and]: [
                    { [Op.gte]: new Date(targetYear, targetMonth - 1, 1) },
                    { [Op.lt]: new Date(targetYear, targetMonth, 1) }
                  ]
                }
              },
              { AccountId: accountId }
            ]
          },
          include: [Category],
          order: [['date', 'DESC']]
        }),
        Category.findAll({
          raw: true
        }),
        Record.findAll({
          attributes: [
            [sequelize.fn('sum', sequelize.col('amount')), 'total_amount'],
          ],
          where: {
            [Op.and]: [
              {
                date: {
                  [Op.and]: [
                    { [Op.gte]: new Date(targetYear, targetMonth - 1, 1) },
                    { [Op.lt]: new Date(targetYear, targetMonth, 1) }
                  ]
                }
              },
              { AccountId: accountId }
            ]
          },
          group: ['Account_id'],
          raw: true
        })
      ])

      res.render('records', {
        month: targetMonth,
        year: targetYear,
        accountId,
        records,
        categories,
        totalAmount
      })
    } catch (err) {
      next(err)
    }
  },
  getNextMonth: async (req, res, next) => {
    try {
      const { month, year } = req.query
      const accountId = req.params.id

      let targetMonth = 0
      let targetYear = 0

      targetMonth = Number(month) + 1
      targetYear = Number(year)
      if (targetMonth === 13) {
        targetMonth = 1
        targetYear++
      }

      const [records, categories, totalAmount] = await Promise.all([
        Record.findAll({
          raw: true,
          nest: true,
          where: {
            [Op.and]: [
              {
                date: {
                  [Op.and]: [
                    { [Op.gte]: new Date(targetYear, targetMonth - 1, 1) },
                    { [Op.lt]: new Date(targetYear, targetMonth, 1) }
                  ]
                }
              },
              { AccountId: accountId }
            ]
          },
          include: [Category],
          order: [['date', 'DESC']]
        }),
        Category.findAll({
          raw: true
        }),
        Record.findAll({
          attributes: [
            [sequelize.fn('sum', sequelize.col('amount')), 'total_amount'],
          ],
          where: {
            [Op.and]: [
              {
                date: {
                  [Op.and]: [
                    { [Op.gte]: new Date(targetYear, targetMonth - 1, 1) },
                    { [Op.lt]: new Date(targetYear, targetMonth, 1) }
                  ]
                }
              },
              { AccountId: accountId }
            ]
          },
          group: ['Account_id'],
          raw: true
        })
      ])

      res.render('records', {
        month: targetMonth,
        year: targetYear,
        accountId,
        records,
        categories,
        totalAmount
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = userController