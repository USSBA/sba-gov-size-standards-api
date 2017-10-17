/* eslint-env mocha */
let sinon = require('sinon')
let handler = require('./index.js')
let _ = require('lodash');
let testData = require('../test-data/test-naics.json');

function runTest(event, assertions, count, done) {
  handler.handler(event, null, (err, result) => {
    if (err) {
      done(new Error(err))
    }
    if (count) {
      result.should.have.lengthOf(count);
    }
    if (assertions) {
      assertions(result);
    }
    done()
  });
}

function makeEvent(queryString, path) {
  let event = {
    params: {
      path: path || {},
      querystring: queryString || {},
      header: {}
    }
  }
  return event;
}

describe('# Lambda Handler', function() {
  let getDataStub;
  before(() => {
    getDataStub = sinon.stub(handler, "getData");
    getDataStub.returns(testData);
  })


  describe('/naics', function() {
    it('should return all matching records when no filters are given', function(done) {
      let event = makeEvent();
      let assertions = (result) => {}
      runTest(event, assertions, 7, done)
    })
    it('should return all matching records when filters are null', function(done) {
      let event = {
        params: {
          path: null,
          querystring: null,
          header: {}
        }
      }
      let assertions = (result) => {}
      runTest(event, assertions, 7, done)
    })
    it('should return all matching records when filtered on sectorId', function(done) {
      let event = makeEvent({
        sectorId: "22"
      });
      let assertions = (result) => {
        result[0].should.have.property('sectorId', "22");
        result[1].should.have.property('sectorId', "22");
        result[2].should.have.property('sectorId', "22");
      }
      runTest(event, assertions, 3, done)
    })
    it('should return all matching records when filtered on sectorId as a number (not a string)', function(done) {
      let event = makeEvent({
        sectorId: 22
      });
      let assertions = (result) => {
        result[0].should.have.property('sectorId', "22");
        result[1].should.have.property('sectorId', "22");
        result[2].should.have.property('sectorId', "22");
      }
      runTest(event, null, 3, done)
    })
    it('should return no matching records when filtered on sectorId that does not exist', function(done) {
      let event = makeEvent({
        sectorId: "88"
      });
      let assertions = (result) => {}
      runTest(event, assertions, 0, done)
    })
    it('should return the only matching record when filtered on a sectorId with only one naics', function(done) {
      let event = makeEvent({
        sectorId: "99"
      });
      let assertions = (result) => {
        result[0].should.have.property('id', "9931210");
      }
      runTest(event, assertions, 1, done)
    })
    it('should return the matching records when filtered on sectorId including exceptions', function(done) {
      let event = makeEvent({
        subsectorId: "11"
      });
      let assertions = (result) => {
        result[0].should.have.property('id', "111110");
        result[1].should.have.property('id', "112120");
        result[2].should.have.property('id', "112120_a_except");
      }
      runTest(event, assertions, 3, done)
    })
    it('should return the matching records when filtered on subsectorId', function(done) {
      let event = makeEvent({
        subsectorId: "111"
      });
      let assertions = (result) => {
        result[0].should.have.property('id', "111110");
      }
      runTest(event, assertions, 1, done)
    })
    it('should return the matching records when filtered on subsectorId as number, not a string', function(done) {
      let event = makeEvent({
        subsectorId: 111
      });
      let assertions = (result) => {
        result[0].should.have.property('id', "111110");
      }
      runTest(event, assertions, 1, done)
    })
    it('should return the matching records when filtered on subsectorId including exceptions', function(done) {
      let event = makeEvent({
        subsectorId: "112"
      });
      let assertions = (result) => {
        result[0].should.have.property('id', "112120");
        result[1].should.have.property('id', "112120_a_except");
      }
      runTest(event, assertions, 2, done)
    })
    it('should return the matching record when filtered on id', function(done) {
      let event = makeEvent({
        id: "222220"
      });
      let assertions = (result) => {
        result[0].should.have.property('id', "222220");
      }
      runTest(event, assertions, 1, done)
    })
    it('should return the matching record when filtered on id (no exception because it does not match)', function(done) {
      let event = makeEvent({
        id: "112120"
      });
      let assertions = (result) => {
        result[0].should.have.property('id', "112120");
      }
      runTest(event, assertions, 1, done)
    })
    it('should return the matching records when filtered on id with a wildcard', function(done) {
      let event = makeEvent({
        id: "*11*"
      });
      let assertions = (result) => {
        result[0].should.have.property('id', "111110");
        result[1].should.have.property('id', "112120");
        result[2].should.have.property('id', "112120_a_except");
        result[3].should.have.property('id', "2231110");
      }
      runTest(event, assertions, 4, done)
    })
    it('should return the matching records when filtered on id that has an exception'), function(done) {
      let event = makeEvent({
        id: "112120*"
      });
      let assertions = (result) => {
        result[0].should.have.property('id', "112120");
        result[1].should.have.property('id', "112120_a_except");
      }
      runTest(event, assertions, 2, done)
    })
    it('should return the matching records when filtered on id as a number, not a string', function(done) {
      let event = makeEvent({
        id: 112120
      });
      let assertions = (result) => {
        result[0].should.have.property('id', "112120");
      }
      runTest(event, assertions, 1, done)
    })
    it('should return nothing when conflicting or impossible queries are given', function(done) {
      let event = makeEvent({
        id: "112120",
        sectorId: "22"
      });
      let assertions = (result) => {}
      runTest(event, assertions, 0, done)
    })
    it('should return the matching records when filtered on sector description', function(done) {
      let event = makeEvent({
        sectorDescription: "Forestry"
      });
      let assertions = (result) => {
        result[0].should.have.property('id', "111110");
        result[1].should.have.property('id', "112120");
        result[2].should.have.property('id', "112120_a_except");
      }
      runTest(event, assertions, 3, done)
    })
    it('should return the matching records when filtered on sector description and no exceptions', function(done) {
      let event = makeEvent({
        sectorDescription: "Forestry",
        parent: null
      });
      let assertions = (result) => {
        result[0].should.have.property('id', "111110");
        result[1].should.have.property('id', "112120");
      }
      runTest(event, assertions, 2, done)
    })
    it('should return the matching records when filtered on subsector description', function(done) {
      let event = makeEvent({
        subsectorDescription: "Speeder Construction"
      });
      let assertions = (result) => {
        result[0].should.have.property('id', "2231110");
      }
      runTest(event, assertions, 1, done)
    })
    it('should return the matching records when filtered on subsector description without a wildcard or matching string', function(done) {
      let event = makeEvent({
        subsectorDescription: "Speeder"
      });
      let assertions = (result) => {}
      runTest(event, assertions, 0, done)
    })
    it('should return the matching records when filtered on subsector description with a wildcard', function(done) {
      let event = makeEvent({
        subsectorDescription: "*Speeder*"
      });
      let assertions = (result) => {
        result[0].should.have.property('id', "2231110");
      }
      runTest(event, assertions, 1, done)
    })
    it('should return the matching records when filtered on naics description', function(done) {
      let event = makeEvent({
        description: "R4 Droid Construction"
      });
      let assertions = (result) => {
        result[0].should.have.property('id', "222221");
      }
      runTest(event, assertions, 1, done)
    })
    it('should return the matching records when filtered on naics description with a wildcard', function(done) {
      let event = makeEvent({
        description: "R* Droid Construction"
      });
      let assertions = (result) => {
        result[0].should.have.property('id', "222220");
        result[1].should.have.property('id', "222221");
      }
      runTest(event, assertions, 2, done)
    })
  })
  describe('/naics/{id}', function() {
    it('should return the naics record with id as given parameter', function(done) {
      let event = makeEvent(null, {
        id: "222220"
      });
      let assertions = (result) => {
        result.should.equal(testData[3]);
      }
      runTest(event, assertions, 1, done)
    })
    it('should return an error when no naics record exists with that id', function(done) {
      let event = makeEvent(null, {
        id: "888888"
      });
      let assertions = (result) => {
        result.should.equal("Invalid NAICS Code")
      }
      runTest(event, assertions, null, done)
    })
  })
  describe('/naics/{id}/{property}', function() {
    it('should return the string value of the property', function(done) {
      let event = makeEvent(null, {
        id: "222220",
        property: "description"
      });
      let assertions = (result) => {
        result.should.equal("R2 Droid Construction");
      }
      runTest(event, assertions, 1, done)
    })
    it('should return an error message when no naics record exists with that id', function(done) {
      let event = makeEvent(null, {
        id: "888888",
        description: "DoesNotMatter"
      });
      let assertions = (result) => {
        result.should.equal("Invalid NAICS Code")
      }
      runTest(event, assertions, null, done)
    })
    it('should return an error message when a naics record exists with that id, but does not have the requested property', function(done) {
      let event = makeEvent(null, {
        id: "222220",
        property: "midichlorians"
      });
      let assertions = (result) => {
        result.should.equal("Invalid Property")
      }
      runTest(event, assertions, null, done)
    })
  })
  describe('/isSmallBusiness', function() {
    it('should return the an error when the naics code is not provided', function(done) {
      let event = makeEvent({
        revenueLimit: 1
      });
      let assertions = (result) => {
        result.should.equal("Required query parameter id is missing");
      }
      runTest(event, assertions, 1, done)
    })
    it('should return an error if the naics code requires a revenue limit but none is provided', function(done) {
      let event = makeEvent(null, {
        id: "222220"
      });
      let assertions = (result) => {
        result.should.equal("Required query parameter revenueLimit is missing")
      }
      runTest(event, assertions, null, done)
    })
    it('should return an error if the naics code requires an employee count but none is provided', function(done) {
      let event = makeEvent(null, {
        id: "222221"
      });
      let assertions = (result) => {
        result.should.equal("Required query parameter employeeCount is missing")
      }
      runTest(event, assertions, null, done)
    })
    it('should respond with true when the business revenue is below the limit', function(done) {
      let limit = _.find(testData, {id: "112120"}).revenueLimit;
      let event = makeEvent(null, {
        id: "112120",
        revenue: (limit * 1000000) - 1
      });
      let assertions = (result) => {
        result.should.equal("true")
      }
      runTest(event, assertions, null, done)
    })
    it('should respond with true when the business revenue is exactly equal to the limit', function(done) {
      let limit = _.find(testData, {id: "112120"}).revenueLimit;
      let event = makeEvent(null, {
        id: "112120",
        revenue: (limit * 1000000)
      });
      let assertions = (result) => {
        result.should.equal("true")
      }
      runTest(event, assertions, null, done)
    })
    it('should respond with false when the required revenue limit is exceeded', function(done) {
      let limit = _.find(testData, {id: "112120"}).revenueLimit;
      let event = makeEvent(null, {
        id: "112120",
        revenue: (limit * 1000000) + 1
      });
      let assertions = (result) => {
        result.should.equal("false")
      }
      runTest(event, assertions, null, done)
    })
    it('should respond with true when the employee count is below the limit', function(done) {
      let limit = _.find(testData, {id: "112120"}).employeeCountLimit;
      let event = makeEvent(null, {
        id: "222221",
        employeeCount: limit -1
      });
      let assertions = (result) => {
        result.should.equal("true")
      }
      runTest(event, assertions, null, done)
    })
    it('should respond with false when the required employee count limit is exceeded', function(done) {
      let event = makeEvent(null, {
        id: "222221",
        employeeCount: limit + 1
      });
      let assertions = (result) => {
        result.should.equal("false")
      }
      runTest(event, assertions, null, done)
    })
    it('should respond with true when the business employee count is exactly equal to the limit', function(done) {
      let event = makeEvent(null, {
        id: "222221",
        revenue: limit
      });
      let assertions = (result) => {
        result.should.equal("true")
      }
      runTest(event, assertions, null, done)
    })
  })
})
