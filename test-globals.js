var argv = require('minimist')(process.argv.slice(2));
let chai = require('chai')
chai.should()
let chaiAsPromised = require('chai-as-promised')

let expect = chai.expect

var chaiSubset = require('chai-subset');
chai.use(chaiSubset);

// require('sinon-as-promised');
chai.use(chaiAsPromised)

let sinon = require('sinon')
