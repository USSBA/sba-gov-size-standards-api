'use strict';
var _ = require('lodash')

// load the master data, but do so with an export so it can be mocked
let masterData = require("./naics.json");
module.exports.getData = function() {
  return masterData;
}

const ONE_MILLION = 1000000;

exports.handler = (event, context, callback) => {
  if (event && event.params) {
    let query = event.params.querystring;
    let data = module.exports.getData();
    let result = null;
    let error = null;
    if (query && query.id) {
      let found = _.find(data, {
        id: query.id
      });
      if (found) {
        if (found.revenueLimit) {
          let revenueLimitInDollars = found.revenueLimit * ONE_MILLION;
          if (query.revenue) {
            result = `${query.revenue <= revenueLimitInDollars}`
          } else {
            error = "Required query parameter revenue is missing";
          }
        } else if (found.employeeCountLimit) {
          if (query.employeeCount) {
            result = `${query.employeeCount <= found.employeeCountLimit}`
          } else {
            error = "Required query parameter employeeCount is missing";
          }
        }
      } else {
        error = "Invalid ID - No NAICS exists for the given id";
      }
    } else {
      error = "Required query parameter id is missing";
    }
    callback(error, result)
  } else {
    callback("Unsupported method or request")
  }
};
