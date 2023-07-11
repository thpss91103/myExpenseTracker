const chai = require('chai')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
chai.use(require('sinon-chai'))

const { expect } = require('chai')
const { sequelize, Sequelize } = require('sequelize-test-helpers')

const db = require('../../models')

describe('# Category Model', () => {
  const { DataTypes } = Sequelize
  const CategoryFactory = proxyquire('../../models/category', {
    sequelize: Sequelize
  })

  let Category

  before(() => {
    Category = CategoryFactory(sequelize, DataTypes)
  })

  after(() => {
    Category.init.resetHistory()
  })

  context('properties', () => {
    it('called Category.init with the correct parameters', () => {
      expect(Category.init).to.have.been.calledWithMatch({
        name: DataTypes.STRING
      })
    })
  })

  context('associations', () => {
    const Record = 'Record'
    before(() => {
      Category.associate({ Record })
    })

    it('should have many records', done => {
      expect(Category.hasMany).to.have.been.calledWith(Record)
      done()
    })
  })

  context('action', () => {
    let data = null
    it('create', done => {
      db.Category.create({}).then(category => {
        data = category
        done()
      })
    })
    it('read', done => {
      db.Category.findByPk(data.id).then(category => {
        expect(data.id).to.be.equal(category.id)
        done()
      })
    })
    it('update', done => {
      db.Category.update({}, { where: { id: data.id } }).then(() => {
        db.Category.findByPk(data.id).then(category => {
          expect(data.updatedAt).to.be.not.equal(category.updatedAt)
          done()
        })
      })
    })
    it('delete', done => {
      db.Category.destroy({ where: { id: data.id } }).then(() => {
        db.Category.findByPk(data.id).then(category => {
          expect(category).to.be.equal(null)
          done()
        })
      })
    })
  })
})