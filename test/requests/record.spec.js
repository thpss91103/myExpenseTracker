const chai = require('chai')
const request = require('supertest')
const sinon = require('sinon')
const app = require('../../app')
const helpers = require('../../_helpers')
const should = chai.should()
const expect = chai.expect
const db = require('../../models')

describe('# record request', () => {
  context('# record page', () => {
    describe('user not login', () => {
      before(done => {
        done()
      })

      it('will redirect to login page', done => {
        request(app)
          .get('/accounts')
          .set('Accept', 'application/json')
          .expect(302)
          .end(function (err, res) {
            if (err) return done(err)
            return done()
          })
      })
    })

    describe('user login', () => {
      before(async () => {
        // 模擬登入資料
        this.ensureAuthenticated = sinon
          .stub(helpers, 'ensureAuthenticated')
          .returns(true)
        this.getUser = sinon
          .stub(helpers, 'getUser')
          .returns({ id: 1 })
        // 在測試資料庫中，新增 mock 資料
        await db.User.create({})
        await db.Account.create({ UserId: 1, name: 'account1' })
        await db.Record.create({ AccountId: 1, name: 'expense1', date: '2023-07-13'})
      })

      it('can render record page', done => {
        request(app)
          .get('/accounts/1')
          .set('Accept', 'application/json')
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err)
            res.text.should.include('expense1')
            return done()
          })
      })

      after(async () => {
        this.ensureAuthenticated.restore()
        this.getUser.restore()
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
        await db.User.destroy({ where: {}, truncate: true, force: true })
        await db.Account.destroy({ where: {}, truncate: true, force: true })
        await db.Record.destroy({ where: {}, truncate: true, force: true })
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
      })
    })
  })

  context('# create', () => {
    describe('create successfully', () => {
      before(async () => {
        // 模擬登入資料
        this.ensureAuthenticated = sinon
          .stub(helpers, 'ensureAuthenticated')
          .returns(true)
        this.getUser = sinon
          .stub(helpers, 'getUser')
          .returns({ id: 1 })
        // 在測試資料庫中，新增 mock 資料
        await db.User.create({})
        await db.Account.create({ UserId: 1, name: 'account1' })
      })

      it('POST /record/1', done => {
        request(app)
          .post('/record/1')
          .send('name=expense1')
          .set('Accept', 'application/json')
          .expect(302)
          .end(function (err, res) {
            db.Record.findOne({where: {AccountId: 1}}).then(record => {
              record.name.should.equal('expense1')
              done()
            }).catch(err => {
              done(err)
            })
          })
      })

      after(async () => {
        this.ensureAuthenticated.restore()
        this.getUser.restore()
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
        await db.User.destroy({ where: {}, truncate: true, force: true })
        await db.Account.destroy({ where: {}, truncate: true, force: true })
        await db.Record.destroy({ where: {}, truncate: true, force: true })
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
      })
    })

    describe('when failed without login', () => {
      before(async () => {
        //無登入資料
      })

      it('will redirect login', done => {
        request(app)
          .post('/record/1')
          .send('name=expense1')
          .set('Accept', 'application/json')
          .expect(302)
          .end(function (err, res) {
            if (err) return done(err)
            return done(err)
          })
      })

      after(async () => {
        //不需清除
      })
    })

    describe('when failed without validation', () => {
      before(async () => {
        // 模擬登入資料
        this.ensureAuthenticated = sinon
          .stub(helpers, 'ensureAuthenticated')
          .returns(true)
        this.getUser = sinon
          .stub(helpers, 'getUser')
          .returns({ id: 1 })
        // 在測試資料庫中，新增 mock 資料
        await db.User.create({})
        await db.Account.create({ UserId: 1, name: 'account1' })
      })

      it('name input more than 10 chart', done => {
        request(app)
          .post('/record/1')
          .send('name=01234567890')
          .set('Accept', 'application/json')
          .expect(302)
          .end(function (err, res) {
            db.Record.findAll({ where: { AccountId: 1 } }).then(records => {
              expect(records).to.be.an('array').that.is.empty
              done()
            }).catch(err => {
              done(err)
            })
          })
      })

      after(async () => {
        this.ensureAuthenticated.restore()
        this.getUser.restore()
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
        await db.User.destroy({ where: {}, truncate: true, force: true })
        await db.Account.destroy({ where: {}, truncate: true, force: true })
        await db.Record.destroy({ where: {}, truncate: true, force: true })
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
      })
    })
  })

  context('# update', () => {
    describe('PUT /record/1', () => {
      before(async () => {
        // 模擬登入資料
        this.ensureAuthenticated = sinon
          .stub(helpers, 'ensureAuthenticated')
          .returns(true)
        this.getUser = sinon
          .stub(helpers, 'getUser')
          .returns({ id: 1 })
        // 在測試資料庫中，新增 mock 資料
        await db.User.create({})
        await db.Account.create({ UserId: 1, name: 'account1' })
        await db.Record.create({ AccountId: 1, name: 'expense1', date: '2023-07-13' })
      })

      it('can render edit page', done => {
        request(app)
          .get('/record/1')
          .set('Accept', 'application/json')
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err)
            res.text.should.include('expense1')
            done()
          })
      })

      it('can edit record', done => {
        request(app)
          .put('/record/1')
          .send('name=expense2')
          .set('Accept', 'application/json')
          .expect(302)
          .end(function (err, res) {
            db.Record.findOne({ where: {AccountId: 1}}).then(record => {
              record.name.should.equal('expense2')
              done()
            }).catch(err => {
              done(err)
            })
          })
      })

      it('name input more than 10 chart', done => {
        request(app)
          .put('/record/1')
          .send('name=01234567890')
          .set('Accept', 'application/json')
          .expect(302)
          .end(function (err, res) {
            db.Record.findByPk(1).then(record => {
              record.name.should.equal('expense2')
              done()
            }).catch(err => {
              done(err)
            })
          })
      })

      after(async () => {
        this.ensureAuthenticated.restore()
        this.getUser.restore()
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
        await db.User.destroy({ where: {}, truncate: true, force: true })
        await db.Account.destroy({ where: {}, truncate: true, force: true })
        await db.Record.destroy({ where: {}, truncate: true, force: true })
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
      })
    })
  })

  context('# delete', () => {
    describe('delete record', () => {
      before(async () => {
        // 模擬登入資料
        this.ensureAuthenticated = sinon
          .stub(helpers, 'ensureAuthenticated')
          .returns(true)
        this.getUser = sinon
          .stub(helpers, 'getUser')
          .returns({ id: 1 })
        // 在測試資料庫中，新增 mock 資料
        await db.User.create({})
        await db.Account.create({ UserId: 1, name: 'account1' })
        await db.Record.create({ AccountId: 1, name: 'expense1', date: '2023-07-13' })
      })

      it('if wrong id cant delete', done => {
        request(app)
          .delete('/record/2/delete')
          .expect(302)
          .end(function (err, res) {
            db.Record.findByPk(1).then(record => {
              expect(record).to.not.be.null
              done()
            }).catch(err => {
              done(err)
            })
          })
      })

      it('DELETE /record/1', done => {
        request(app)
          .delete('/record/1/delete')
          .expect(302)
          .end(function (err, res) {
            db.Record.findByPk(1).then(record => {
              expect(record).to.be.null
              done()
            }).catch(err => {
              done(err)
            })
          })
      })

      after(async () => {
        this.ensureAuthenticated.restore()
        this.getUser.restore()
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
        await db.User.destroy({ where: {}, truncate: true, force: true })
        await db.Account.destroy({ where: {}, truncate: true, force: true })
        await db.Record.destroy({ where: {}, truncate: true, force: true })
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
      })
    })
  })

  context('# search', () => {
    describe('search prevmonth', () => {
      before(async () => {
        // 模擬登入資料
        this.ensureAuthenticated = sinon
          .stub(helpers, 'ensureAuthenticated')
          .returns(true)
        this.getUser = sinon
          .stub(helpers, 'getUser')
          .returns({ id: 1 })
        // 在測試資料庫中，新增 mock 資料
        await db.User.create({})
        await db.Account.create({ UserId: 1, name: 'account1', date: 10 })
        await db.Record.create({ AccountId: 1, name: 'expense1', date: '2023-06-13' })
      })

      it('search prevMonth', done => {
        request(app)
          .get('/accounts/1/prevMonth')
          .query({ month: 7, year: 2023 }) //數入現在月份
          .set('Accept', 'application/json')
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err)
            res.text.should.include('2023年6月13日')
            done()
          })
      })

      after(async () => {
        this.ensureAuthenticated.restore()
        this.getUser.restore()
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
        await db.User.destroy({ where: {}, truncate: true, force: true })
        await db.Account.destroy({ where: {}, truncate: true, force: true })
        await db.Record.destroy({ where: {}, truncate: true, force: true })
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
      })
    })

    describe('search nextMonth', () => {
      before(async () => {
        // 模擬登入資料
        this.ensureAuthenticated = sinon
          .stub(helpers, 'ensureAuthenticated')
          .returns(true)
        this.getUser = sinon
          .stub(helpers, 'getUser')
          .returns({ id: 1 })
        // 在測試資料庫中，新增 mock 資料
        await db.User.create({})
        await db.Account.create({ UserId: 1, name: 'account1', date: 10 })
        await db.Record.create({ AccountId: 1, name: 'expense1', date: '2023-08-13' })
      })

      it('search nextMonth', done => {
        request(app)
          .get('/accounts/1/nextMonth')
          .query({ month: 7, year: 2023 }) //數入現在月份
          .set('Accept', 'application/json')
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err)
            res.text.should.include('2023年8月13日')
            done()
          })
      })

      after(async () => {
        this.ensureAuthenticated.restore()
        this.getUser.restore()
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
        await db.User.destroy({ where: {}, truncate: true, force: true })
        await db.Account.destroy({ where: {}, truncate: true, force: true })
        await db.Record.destroy({ where: {}, truncate: true, force: true })
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
      })
    })
  })

  context('#SUM', () => {
    describe('sum current month amount', () => {
      before(async () => {
        // 模擬登入資料
        this.ensureAuthenticated = sinon
          .stub(helpers, 'ensureAuthenticated')
          .returns(true)
        this.getUser = sinon
          .stub(helpers, 'getUser')
          .returns({ id: 1 })
        // 在測試資料庫中，新增 mock 資料
        await db.User.create({})
        await db.Account.create({ UserId: 1, name: 'account1', date: 10 })
        await db.Record.create({ AccountId: 1, name: 'expense1', amount: 333, date: '2023-07-13' })
        await db.Record.create({ AccountId: 1, name: 'expense2', amount: 444, date: '2023-07-13' })
      })
      
      it('render records page total amount', done => {
        request(app)
          .get('/accounts/1')
          .set('Accept', 'application/json')
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err)
            res.text.should.include('777')
            done()
          })
      })

      after(async () => {
        this.ensureAuthenticated.restore()
        this.getUser.restore()
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
        await db.User.destroy({ where: {}, truncate: true, force: true })
        await db.Account.destroy({ where: {}, truncate: true, force: true })
        await db.Record.destroy({ where: {}, truncate: true, force: true })
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
      })
    })

    describe('sum previous month amount', () => {
      before(async () => {
        // 模擬登入資料
        this.ensureAuthenticated = sinon
          .stub(helpers, 'ensureAuthenticated')
          .returns(true)
        this.getUser = sinon
          .stub(helpers, 'getUser')
          .returns({ id: 1 })
        // 在測試資料庫中，新增 mock 資料
        await db.User.create({})
        await db.Account.create({ UserId: 1, name: 'account1', date: 10 })
        await db.Record.create({ AccountId: 1, name: 'expense1', amount: 111, date: '2023-06-13' })
        await db.Record.create({ AccountId: 1, name: 'expense2', amount: 222, date: '2023-06-13' })
      })

      it('render records page total amount', done => {
        request(app)
          .get('/accounts/1/prevMonth')
          .query({ month: 7, year: 2023 }) //數入現在月份
          .set('Accept', 'application/json')
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err)
            res.text.should.include('333')
            done()
          })
      })

      after(async () => {
        this.ensureAuthenticated.restore()
        this.getUser.restore()
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
        await db.User.destroy({ where: {}, truncate: true, force: true })
        await db.Account.destroy({ where: {}, truncate: true, force: true })
        await db.Record.destroy({ where: {}, truncate: true, force: true })
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
      })
    })

    describe('sum next month amount', () => {
      before(async () => {
        // 模擬登入資料
        this.ensureAuthenticated = sinon
          .stub(helpers, 'ensureAuthenticated')
          .returns(true)
        this.getUser = sinon
          .stub(helpers, 'getUser')
          .returns({ id: 1 })
        // 在測試資料庫中，新增 mock 資料
        await db.User.create({})
        await db.Account.create({ UserId: 1, name: 'account1', date: 10 })
        await db.Record.create({ AccountId: 1, name: 'expense1', amount: 555, date: '2023-08-13' })
        await db.Record.create({ AccountId: 1, name: 'expense2', amount: 666, date: '2023-08-13' })
      })

      it('render records page total amount', done => {
        request(app)
          .get('/accounts/1/nextMonth')
          .query({ month: 7, year: 2023 }) //數入現在月份
          .set('Accept', 'application/json')
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err)
            res.text.should.include('1221')
            done()
          })
      })

      after(async () => {
        this.ensureAuthenticated.restore()
        this.getUser.restore()
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
        await db.User.destroy({ where: {}, truncate: true, force: true })
        await db.Account.destroy({ where: {}, truncate: true, force: true })
        await db.Record.destroy({ where: {}, truncate: true, force: true })
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
      })
    })
  })
})