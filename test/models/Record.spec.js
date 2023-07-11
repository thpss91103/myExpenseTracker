const chai = require('chai')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
chai.use(require('sinon-chai'))

const { expect } = require('chai')
const { sequelize, Sequelize } = require('sequelize-test-helpers')

const db = require('../../models')

describe('# Record Model', () => {
  const { DataTypes } = Sequelize
  const ReocrdFactory = proxyquire('../../models/record', {
    sequelize: Sequelize
  })

  let Record

  before(() => {
    Record = ReocrdFactory(sequelize, DataTypes)
  })

  after(() => {
    Record.init.resetHistory()
  })

  context('properties', () => {
    it('called Record.init with the correct parameters', () => {
      expect(Record.init).to.have.been.calledWithMatch({
        name: DataTypes.STRING
      })
    })
  })

  context('associations', () => {
    const Account = 'Account'
    const Category = 'Category'
    before(() => {
      Record.associate({ Account })
      Record.associate({ Category })
    })

    it('should belong to accounts', done => {
      expect(Record.belongsTo).to.have.been.calledWith(Account)
      done()
    })
    it('should belong to categories', done => {
      expect(Record.belongsTo).to.have.been.calledWith(Category)
      done()
    })
  })

  context('action', () => {
    let data = null
    it('create', done => {
      db.Record.create({}).then(record => {
        data = record
        done()
      })
    })
    it('read', done => {
      db.Record.findByPk(data.id).then(record => {
        expect(data.id).to.be.equal(record.id)
        done()
      })
    })
    it('update', done => {
      db.Record.update({}, { where: { id: data.id } }).then(() => {
        db.Record.findByPk(data.id).then(record => {
          expect(data.updatedAt).to.be.not.equal(record.updatedAt)
          done()
        })
      })
    })
    it('delete', done => {
      db.Record.destroy({ where: { id: data.id } }).then(() => {
        db.User.findByPk(data.id).then(record => {
          expect(record).to.be.equal(null)
          done()
        })
      })
    })
  })
})