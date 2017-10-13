/* eslint-env mocha */
let sinon = require('sinon')
let handler = require('./index.js')


function runTest(event, assertions, count, done) {
  handler.handler(event, null, (err, result) => {
    if (err) {
      done(err)
    }
    if (assertions) {
      assertions(result);
    }
    if (count) {
      result.length.should.equal(count);
    }
    done()
  });
}

describe('# Lambda Handler', function() {
  describe('/naics ', function() {
    it('should return the matching records when filtered on sectorId', function(done) {
      let event = {
        params: {
          path: {},
          querystring: {
            sectorId: 11
          },
          header: {}
        }
      }
      runTest(event, null, 100 done)
    })
    it('should return the matching records when filtered on sectorId', function(done) {
      let event = {
        params: {
          path: {},
          querystring: {
            code: "611699"
          },
          header: {}
        }
      }
      let expected = {
        code: "611699"
      }
      let assertions = (result)=>{
          result[0].should.have.property('code');
          result[0].code.should.equal(611699);
      }
      runTest(event, assertions, 1, done)
    })
  })
})
