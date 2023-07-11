const chai = require('chai')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
chai.use(require('sinon-chai'))

const { expect } = require('chai')
const { sequelize, Sequelize } = require('sequelize-test-helpers')

const db = require('../../models')

describe('# User Model', () => {
  const { DataTypes } = Sequelize
  const UserFactory = proxyquire('../../models/user', {
    sequelize: Sequelize
  })

  let User

  before(() => {
    User = UserFactory(sequelize, DataTypes)
  })

  after(() => {
    User.init.resetHistory()
  })

  context('properties', () => {
    it('called User.init with the correct parameters', () => {
      expect(User.init).to.have.been.calledWithMatch({
        name: DataTypes.STRING
      })
    })
  })

  context('associations', () => {
    const Account = 'Account'
    before(() => {
      User.associate({ Account })
    })

    it('should have many accounts', done => {
      expect(User.hasMany).to.have.been.calledWith(Account)
      done()
    })
  })

  context('action', () => {
    let data = null
    it('create', done => {
      db.User.create({}).then(user => {
        data = user
        done()
      })
    })
    it('read', done => {
      db.User.findByPk(data.id).then(user => {
        expect(data.id).to.be.equal(user.id)
        done()
      })
    })
    it('update', done => {
      db.User.update({}, { where: { id: data.id } }).then(() => {
        db.User.findByPk(data.id).then(user => {
          expect(data.updatedAt).to.be.not.equal(user.updatedAt)
          done()
        })
      })
    })
    it('delete', done => {
      db.User.destroy({ where: { id: data.id } }).then(() => {
        db.User.findByPk(data.id).then(user => {
          expect(user).to.be.equal(null)
          done()
        })
      })
    })
  })
})