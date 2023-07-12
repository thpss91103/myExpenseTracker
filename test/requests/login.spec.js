const chai = require('chai')
const request = require('supertest')
const sinon = require('sinon')
const should = chai.should()
const expect = chai.expect
const bcrypt = require('bcrypt-nodejs')

const app = require('../../app')
const helpers = require('../../_helpers')
const db = require('../../models')

describe('# login request', () => {
  context('go to login page', () => {
    before(async () => {
      await db.User.create({
        email: 'user1',
        password: bcrypt.hashSync('user1', bcrypt.genSaltSync(10)),
        name: 'user1'
      })
    })

    it('can render login page', done => {
      request(app)
        .get('/signin')
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err)
          return done()
        })
    })

    it('login successfully', done => {
      request(app)
        .post('/signin')
        .send('email=user1&password=user1')
        .set('Accept', 'application/json')
        .expect(302)
        .expect('Location', '/accounts')
        .end(function (err, res) {
          if (err) return done(err)
          return done()
        })
    })

    it('login fail', done => {
      request(app)
        .post('/signin')
        .send('')
        .set('Accept', 'application/json')
        .expect(302)
        .expect('Location', '/signin')
        .end(function (err, res) {
          if (err) return done(err)
          return done()
        })
    })

    after(async () => {
      // 清除測試 db 中的 User 資料
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { //暫時禁用資料庫的外部鍵檢查
        raw: true
      })
      await db.User.destroy({ where: {}, truncate: true, force: true })
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, {
        raw: true
      })
    })
  })

  context('go to signup page', () => {
    describe('if user want to signup', () => {
      it('can render singnup page', done => {
        request(app)
          .get('/signup')
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err)
            return done(err)
          })
      })

      it('signup successfully', done => {
        request(app)
          .post('/users/register')
          .send(
            'name=user1&email=user1@example.com&password=user1&confirmPassword=user1')
          .set('Accept', 'application/json')
          .expect(302)
          .expect('Location', '/signin')
          .end(function (err, res) {
            if (err) return done(err)
            return done()
          })
      })

      after(async () => {
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, {
          raw: true
        })
        await db.User.destroy({ where: {}, truncate: true, force: true })
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, {
          raw: true
        })
      })
    })
  })
})