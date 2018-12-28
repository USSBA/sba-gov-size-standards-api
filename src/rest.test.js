/* eslint-env mocha */
let chai = require('chai')
chai.should()
let sinon = require('sinon')
let handler = require('./rest.js')
let testData = require('./naics.test.json')

function runTest (event, assertions, count, done) {
  handler.handler(event, null, (err, result) => {
    let resultBody = JSON.parse(result.body)
    if (err) {
      if (assertions) {
        assertions(err)
      }
    } else {
      if (count) {
        resultBody.should.have.lengthOf(count)
      }
      if (assertions) {
        assertions(resultBody)
      }
    }
    done()
  })
}

function makeEvent (queryStringParameters, path) {
  let event = {
    path: path || '/naics',
    queryStringParameters: queryStringParameters || {}
  }
  return event
}

describe('# ReST Lambda', function () {
  let getDataStub
  before(() => {
    getDataStub = sinon.stub(handler, 'getData')
    getDataStub.returns(testData)
  })

  describe('/naics', function () {
    it('should return all matching records when no filters are given', function (done) {
      let event = makeEvent()
      let assertions = (result) => {}
      runTest(event, assertions, 7, done)
    })
    it('should return all matching records when filters are null', function (done) {
      let event = makeEvent({})
      let assertions = (result) => {}
      runTest(event, assertions, 7, done)
    })
    it('should return all matching records when filtered on sectorId', function (done) {
      let event = makeEvent({
        sectorId: '22'
      })
      let assertions = (result) => {
        result[0].should.have.property('sectorId', '22')
        result[1].should.have.property('sectorId', '22')
        result[2].should.have.property('sectorId', '22')
      }
      runTest(event, assertions, 3, done)
    })
    it('should return all matching records when filtered on sectorId as a number (not a string)', function (done) {
      let event = makeEvent({
        sectorId: 22
      })
      let assertions = (result) => {
        result[0].should.have.property('sectorId', '22')
        result[1].should.have.property('sectorId', '22')
        result[2].should.have.property('sectorId', '22')
      }
      runTest(event, assertions, 3, done)
    })
    it('should return no matching records when filtered on sectorId that does not exist', function (done) {
      let event = makeEvent({
        sectorId: '88'
      })
      let assertions = (result) => {}
      runTest(event, assertions, 0, done)
    })
    it('should return the only matching record when filtered on a sectorId with only one naics', function (done) {
      let event = makeEvent({
        sectorId: '99'
      })
      let assertions = (result) => {
        result[0].should.have.property('id', '9931210')
      }
      runTest(event, assertions, 1, done)
    })
    it('should return the matching records when filtered on sectorId including exceptions', function (done) {
      let event = makeEvent({
        sectorId: '11'
      })
      let assertions = (result) => {
        result[0].should.have.property('id', '111110')
        result[1].should.have.property('id', '112120')
        result[2].should.have.property('id', '112120_a_except')
      }
      runTest(event, assertions, 3, done)
    })
    it('should return the matching records when filtered on subsectorId', function (done) {
      let event = makeEvent({
        subsectorId: '111'
      })
      let assertions = (result) => {
        result[0].should.have.property('id', '111110')
      }
      runTest(event, assertions, 1, done)
    })
    it('should return the matching records when filtered on subsectorId as number, not a string', function (done) {
      let event = makeEvent({
        subsectorId: 111
      })
      let assertions = (result) => {
        result[0].should.have.property('id', '111110')
      }
      runTest(event, assertions, 1, done)
    })
    it('should return the matching records when filtered on subsectorId including exceptions', function (done) {
      let event = makeEvent({
        subsectorId: '112'
      })
      let assertions = (result) => {
        result[0].should.have.property('id', '112120')
        result[1].should.have.property('id', '112120_a_except')
      }
      runTest(event, assertions, 2, done)
    })
    it('should return the matching record when filtered on id', function (done) {
      let event = makeEvent({
        id: '222220'
      })
      let assertions = (result) => {
        result[0].should.have.property('id', '222220')
      }
      runTest(event, assertions, 1, done)
    })
    it('should return the matching record when filtered on id (no exception because it does not match)', function (done) {
      let event = makeEvent({
        id: '112120'
      })
      let assertions = (result) => {
        result[0].should.have.property('id', '112120')
      }
      runTest(event, assertions, 1, done)
    })
    it('should return the matching records when filtered on id with a wildcard', function (done) {
      let event = makeEvent({
        id: '*11*'
      })
      let assertions = (result) => {
        result[0].should.have.property('id', '111110')
        result[1].should.have.property('id', '112120')
        result[2].should.have.property('id', '112120_a_except')
        result[3].should.have.property('id', '2231110')
      }
      runTest(event, assertions, 4, done)
    })
    it('should return the matching records when filtered on id with wildcard that has an exception', function (done) {
      let event = makeEvent({
        id: '112120*'
      })
      let assertions = (result) => {
        result[0].should.have.property('id', '112120')
        result[1].should.have.property('id', '112120_a_except')
      }
      runTest(event, assertions, 2, done)
    })
    it('should return the matching records when filtered on id as a number, not a string', function (done) {
      let event = makeEvent({
        id: 112120
      })
      let assertions = (result) => {
        result[0].should.have.property('id', '112120')
      }
      runTest(event, assertions, 1, done)
    })
    it('should return nothing when conflicting or impossible queries are given', function (done) {
      let event = makeEvent({
        id: '112120',
        sectorId: '22'
      })
      let assertions = (result) => {}
      runTest(event, assertions, 0, done)
    })
    it('should return the matching records when filtered on sector description', function (done) {
      let event = makeEvent({
        sectorDescription: 'Agriculture, Forestry, Fishing and Hunting'
      })
      let assertions = (result) => {
        result[0].should.have.property('id', '111110')
        result[1].should.have.property('id', '112120')
        result[2].should.have.property('id', '112120_a_except')
      }
      runTest(event, assertions, 3, done)
    })
    it('should return the matching records when filtered on sector description', function (done) {
      let event = makeEvent({
        sectorDescription: 'Forestry'
      })
      let assertions = (result) => {}
      runTest(event, assertions, 0, done)
    })
    it('should return the matching records when filtered on sector description with wildcard', function (done) {
      let event = makeEvent({
        sectorDescription: '*Forestry*'
      })
      let assertions = (result) => {
        result[0].should.have.property('id', '111110')
        result[1].should.have.property('id', '112120')
        result[2].should.have.property('id', '112120_a_except')
      }
      runTest(event, assertions, 3, done)
    })
    it('should return the matching records when filtered on sector description with wildcard and no exceptions', function (done) {
      let event = makeEvent({
        sectorDescription: '*Forestry*',
        parent: null
      })
      let assertions = (result) => {
        result[0].should.have.property('id', '111110')
        result[1].should.have.property('id', '112120')
      }
      runTest(event, assertions, 2, done)
    })
    it('should return the matching records when filtered on subsector description', function (done) {
      let event = makeEvent({
        subsectorDescription: 'Speeder Manufacturing'
      })
      let assertions = (result) => {
        result[0].should.have.property('id', '2231110')
      }
      runTest(event, assertions, 1, done)
    })
    it('should return the matching records when filtered on subsector description without a wildcard or matching string', function (done) {
      let event = makeEvent({
        subsectorDescription: 'Speeder'
      })
      let assertions = (result) => {}
      runTest(event, assertions, 0, done)
    })
    it('should return the matching records when filtered on subsector description with a wildcard', function (done) {
      let event = makeEvent({
        subsectorDescription: '*Speeder*'
      })
      let assertions = (result) => {
        result[0].should.have.property('id', '2231110')
      }
      runTest(event, assertions, 1, done)
    })
    it('should return the matching records when filtered on naics description', function (done) {
      let event = makeEvent({
        description: 'R4 Droid Construction'
      })
      let assertions = (result) => {
        result[0].should.have.property('id', '222221')
      }
      runTest(event, assertions, 1, done)
    })
    it('should return the matching records when filtered on naics description with a wildcard', function (done) {
      let event = makeEvent({
        description: 'R* Droid Construction'
      })
      let assertions = (result) => {
        result[0].should.have.property('id', '222220')
        result[1].should.have.property('id', '222221')
      }
      runTest(event, assertions, 2, done)
    })
  })
  describe('/naics/{id}', function () {
    it('should return the naics record with id as given parameter', function (done) {
      let event = makeEvent(null, '/naics/222220')
      let assertions = (result) => {
        result.should.eql(testData[3])
      }
      runTest(event, assertions, null, done)
    })
    it('should return an error when no naics record exists with that id', function (done) {
      let event = makeEvent(null, '/naics/888888')
      let assertions = (result) => {
        result.should.equal('Invalid ID - No NAICS exists for the given id')
      }
      runTest(event, assertions, null, done)
    })
  })
  describe('/naics/{id}/{property}', function () {
    it('should return the string value of the property', function (done) {
      let event = makeEvent(null, '/naics/222220/description')
      let assertions = (result) => {
        result.should.equal('R2 Droid Construction')
      }
      runTest(event, assertions, null, done)
    })
    it('should return an error message when no naics record exists with that id', function (done) {
      let event = makeEvent(null, '/naics/888888/DoesNotMatter')
      let assertions = (result) => {
        result.should.equal('Invalid ID - No NAICS exists for the given id')
      }
      runTest(event, assertions, null, done)
    })
    it('should return an error message when a naics record exists with that id, but does not have the requested property', function (done) {
      let event = makeEvent(null, '/naics/222220/midichlorians')
      let assertions = (result) => {
        result.should.equal('Invalid Property - The Requested property does not exist: midichlorians')
      }
      runTest(event, assertions, null, done)
    })
  })
})
