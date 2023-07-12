const chai = require('chai')
const request = require('supertest')
const sinon = require('sinon')
const app = require('../../app')
const helpers = require('../../_helpers')
const should = chai.should()
const db = require('../../models')

describe('# user request', () => {
  context('# user profile', () => {
    before(async () => {
      // 模擬登入資料
      this.ensureAuthenticated = sinon.stub(
        helpers, 'ensureAuthenticated'
      ).returns(true)
      this.getUser = sinon.stub(
        helpers, 'getUser'
      ).returns({ id: 1 })

      // 確保清除了測試資料庫中的 User 資料
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
      await db.User.destroy({ where: {}, truncate: true, force: true })
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
      // 在測試資料庫中，新增 mock 資料
      await db.User.create({name: 'user1'})
    })

    describe('go to user profile', () => {
      it('can render user profile', (done) => {
        request(app)
          .get('/user/1')
          .set('Accept', 'application/json') //設置HTTP請求的Accept標頭，表示接受JSON格式的回應
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err)
            res.text.should.include('user1')
            return done()
          })
      })
    })

    after(async () => {
      // 清除登入及測試資料庫資料
      this.ensureAuthenticated.restore()
      this.getUser.restore()
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
      await db.User.destroy({ where: {}, truncate: true, force: true })
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
    })
  })

  context('# update', () => {
    before(async () => {
      // 模擬登入資料
      this.ensureAuthenticated = sinon.stub(
        helpers, 'ensureAuthenticated'
      ).returns(true)
      this.getUser = sinon.stub(
        helpers, 'getUser'
      ).returns({ id: 1 })

      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true })
      await db.User.destroy({ where: {}, truncate: true, force: true })
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
      await db.User.create({ name: 'user1' })
    })

    describe('update successfully', () => {
      it('will change user profile', (done) => {
        request(app)
          .put('/user/1/edit')
          .send('name=user2')
          .set('Accept', 'application/json')
          .expect(302)
          .end(function (err, res) {
            if (err) return done(err)
            db.User.findByPk(1).then(user => {
              user.name.should.equal('user2')
            })
            return done()
          })
      })
    })

    after(async () => {
      this.ensureAuthenticated.restore()
      this.getUser.restore()
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true})
      await db.User.destroy({where: {}, truncate:true, force: true})
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
    })
  })
})