'use strict';

var AWS = require('aws-sdk');
var s3 = new AWS.S3();

let masterData = require("./naics.json");
module.exports.getData = function() {
  return masterData;
}

exports.handler = (event, context, callback) => {
  console.log("event =", event);
  if (event && event.params) {
    let query = event.params.query;
    let path = event.params.path;
    let data = module.exports.getData();
    // if (path && path !== {}) {
    //
    // } else {}
    callback(null, data)
  } else {
    callback("Unsupported method or request")
  }
};


function filterUsingQuery(results, query) {

}
