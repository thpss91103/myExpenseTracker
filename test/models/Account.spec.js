const chai = require('chai')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
chai.use(require('sinon-chai'))

const { expect } = require('chai')
const { sequelize, Sequelize } = require('sequelize-test-helpers')

const db = require('../../models')

describe('# Account Model', () => {
  const { DataTypes } = Sequelize
  const AccountFactory = proxyquire('../../models/account', {
    sequelize: Sequelize
  })

  let Account

  before(() => {
    Account = AccountFactory(sequelize, DataTypes)
  })

  after(() => {
    Account.init.resetHistory()
  })

  context('properties', () => {
    it('called Account.init with the correct parameters', () => {
      expect(Account.init).to.have.been.calledWithMatch({
        name: DataTypes.STRING
      })
    })
  })

  context('associations', () => {
    const User = 'User'
    const Record = 'Record'
    before(() => {
      Account.associate({ User })
      Account.associate({ Record })
    })

    it('should belong to users', done => {
      expect(Account.belongsTo).to.have.been.calledWith(User)
      done()
    })
    it('should have many records', done => {
      expect(Account.hasMany).to.have.been.calledWith(Record)
      done()
    })
  })

  context('action', () => {
    let data = null
    it('create', done => {
      db.Account.create({}).then(account => {
        data = account
        done()
      })
    })
    it('read', done => {
      db.Account.findByPk(data.id).then(account => {
        expect(data.id).to.be.equal(account.id)
        done()
      })
    })
    it('update', done => {
      db.Account.update({}, { where: { id: data.id } }).then(() => {
        db.Account.findByPk(data.id).then(account => {
          expect(data.updatedAt).to.be.not.equal(account.updatedAt)
          done()
        })
      })
    })
    it('delete', done => {
      db.Account.destroy({ where: { id: data.id } }).then(() => {
        db.Account.findByPk(data.id).then(account => {
          expect(account).to.be.equal(null)
          done()
        })
      })
    })
  })
})