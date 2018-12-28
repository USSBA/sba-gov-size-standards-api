/* eslint-env mocha */
let chai = require('chai')
chai.should()
let sinon = require('sinon')
let handler = require('./question.js')
let _ = require('lodash')
let testData = require('./naics.test.json')

function runTest (event, expectedAnswer, done) {
  handler.handler(event, null, (err, result) => {
    if (err) {
      err.should.equal(expectedAnswer)
    } else {
      let resultBody = JSON.parse(result.body)
      resultBody.should.equal(expectedAnswer)
    }
    done()
  })
}

function makeEvent (queryStringParameters) {
  let event = {
    queryStringParameters: queryStringParameters
  }
  return event
}

describe('# Question Lambda', function () {
  let getDataStub
  before(() => {
    getDataStub = sinon.stub(handler, 'getData')
    getDataStub.returns(testData)
  })

  describe('/isSmallBusiness', function () {
    it('should return the an error when the naics code is not provided', function (done) {
      let event = makeEvent({
        revenueLimit: 1
      })
      runTest(event, 'Required query parameter id is missing', done)
    })
    it('should return an error if the naics code requires a revenue limit but none is provided', function (done) {
      let event = makeEvent({
        id: '222220'
      })
      runTest(event, 'Required query parameter revenue is missing', done)
    })
    it('should return an error if the naics code requires an employee count but none is provided', function (done) {
      let event = makeEvent({
        id: '222221'
      })
      runTest(event, 'Required query parameter employeeCount is missing', done)
    })
    it('should respond with true when the business revenue is below the limit', function (done) {
      let limit = _.find(testData, {
        id: '112120'
      }).revenueLimit
      let event = makeEvent({
        id: '112120',
        revenue: (limit * 1000000) - 1
      })
      runTest(event, 'true', done)
    })
    it('should respond with true when the business revenue is exactly equal to the limit', function (done) {
      let limit = _.find(testData, {
        id: '112120'
      }).revenueLimit
      let event = makeEvent({
        id: '112120',
        revenue: (limit * 1000000)
      })
      runTest(event, 'true', done)
    })
    it('should respond with false when the required revenue limit is exceeded', function (done) {
      let limit = _.find(testData, {
        id: '112120'
      }).revenueLimit
      let event = makeEvent({
        id: '112120',
        revenue: (limit * 1000000) + 1
      })
      runTest(event, 'false', done)
    })
    it('should respond with true when the employee count is below the limit', function (done) {
      let limit = _.find(testData, {
        id: '112120'
      }).employeeCountLimit
      let event = makeEvent({
        id: '222221',
        employeeCount: limit - 1
      })
      runTest(event, 'true', done)
    })
    it('should respond with false when the required employee count limit is exceeded', function (done) {
      let limit = _.find(testData, {
        id: '112120'
      }).employeeCountLimit
      let event = makeEvent({
        id: '222221',
        employeeCount: limit + 1
      })
      runTest(event, 'true', done)
    })
    it('should respond with true when the business employee count is exactly equal to the limit', function (done) {
      let limit = _.find(testData, {
        id: '222221'
      }).employeeCountLimit
      let event = makeEvent({
        id: '222221',
        employeeCount: limit
      })
      runTest(event, 'true', done)
    })
  })
})
