const chai = require('chai')
const request = require('supertest')
const sinon = require('sinon')
const app = require('../../app')
const helpers = require('../../_helpers')
const should = chai.should()
const expect = chai.expect
const db = require('../../models')

describe('# account request', () => {
  context('# account page', () => {
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
      })

      it('can render account page', done => {
        request(app)
          .get('/accounts')
          .set('Accept', 'application/json')
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err)
            res.text.should.include('account1')
            return done()
          })
      })

      after(async () => {
        this.ensureAuthenticated.restore()
        this.getUser.restore()
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
        await db.User.destroy({ where: {}, truncate: true, force: true })
        await db.Account.destroy({ where: {}, truncate: true, force: true })
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
      })
      it('POST /accounts', done => {
        request(app)
          .post('/accounts')
          .send('name=account1')
          .set('Accept', 'application/json')
          .expect(302)
          .end(function (err, res) {
            db.Account.findOne({ where: { UserId: 1}}).then(account => {
              account.name.should.equal('account1')
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
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
      })
    })

    describe('when failed without login', () => {
      before(async () => {
        //無登入資料
      })

      it('will redirect login', done => {
        request(app)
          .post('/accounts')
          .send('name=account1')
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
      })

      it('name input more than 10 chart', done => {
        request(app)
          .post('/accounts')
          .send('name=01234567890')
          .set('Accept', 'application/json')
          .expect(302)
          .end(function (err, res) {
            if (err) return done(err)
            return done()
          })
      })

      it('cant create account', done => {
        db.Account.findAll({ where: { UserId: 1 } }).then(accounts => {
          expect(accounts).to.be.an('array').that.is.empty
          done()
        }).catch(err => {
          done(err)
        })
      })

      it('date input more than 31', done => {
        request(app)
          .post('/accounts')
          .send('name=account&date=33')
          .set('Accept', 'application/json')
          .expect(302)
          .end(function (err, res) {
            if (err) return done(err)
            done()
          })
      })

      it('cant create account', done => {
        db.Account.findAll({ where: { UserId: 1 } }).then(accounts => {
          expect(accounts).to.be.an('array').that.is.empty
          done()
        }).catch(err => {
          done(err)
        })
      })

      after(async () => {
        this.ensureAuthenticated.restore()
        this.getUser.restore()
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
        await db.User.destroy({ where: {}, truncate: true, force: true })
        await db.Account.destroy({ where: {}, truncate: true, force: true })
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
      })
    })
  })

  context('# update', () => {
    describe('POST /accounts/:id/edit', () => {
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
        await db.Account.create({ UserId: 1, name: 'account1', date: 1 })
      })

      it('edit account', done => {
        request(app)
          .post('/accounts/1/edit')
          .send('name=account2&date=2')
          .set('Accept', 'application/json')
          .expect(302)
          .end(function(err, res) {
            db.Account.findByPk(1).then(account => {
              account.name.should.equal('account2')
              account.date.should.equal(2)
              done()
            }).catch(err => {
              done(err)
            })
          })
      })

      it('name input more than 10 chart', done => {
        request(app)
          .post('/accounts/1/edit')
          .send('name=01234567890')
          .set('Accept', 'application/json')
          .expect(302)
          .end(function (err, res) {
            db.Account.findByPk(1).then(account => {
              account.name.should.equal('account2')
              done()
            }).catch(err => {
              done(err)
            })
          })
      })

      it('date input more than 31', done => {
        request(app)
          .post('/accounts/1/edit')
          .send('date=33')
          .set('Accept', 'application/json')
          .expect(302)
          .end(function (err, res) {
            db.Account.findByPk(1).then(account => {
              account.date.should.equal(2)
              done()
            }).catch(err => {
              done(err)
            })
          })
      })

      it('cant update account', done => {
        db.Account.findByPk(1).then(account => {
          account.name.should.equal('account2')
          account.date.should.equal(2)
          done()
        }).catch(err => {
          done(err)
        })
      })

      after(async () => {
        this.ensureAuthenticated.restore()
        this.getUser.restore()
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
        await db.User.destroy({ where: {}, truncate: true, force: true })
        await db.Account.destroy({ where: {}, truncate: true, force: true })
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
      })
    })
  })

  context('# delete', () => {
    describe('delete account', () => {
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
        await db.Account.create({ UserId: 1, name: 'account1', date: 1 })
      })

      it('if wrong id cant delete', done => {
        request(app)
          .delete('/accounts/2/delete')
          .expect(302)
          .end(function (err, res) {
            db.Account.findByPk(1).then(account => {
              expect(account).to.not.be.null
              done()
            }).catch (err => {
              done(err)
            })
          })
      })

      it('can delete account', done => {
        request(app)
          .delete('/accounts/1/delete')
          .expect(302)
          .end(function (err, res) {
            db.Account.findByPk(1).then(account => {
              expect(account).to.be.null
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
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
      })
    })
  })
})