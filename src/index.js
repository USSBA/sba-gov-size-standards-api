'use strict';
var _ = require('lodash')

// load the master data, but do so with an export so it can be mocked
let masterData = require("./naics.json");
module.exports.getData = function() {
  return masterData;
}

function matchUsingWildcard(needle, haystack) {
  let regexString = needle.split("*").join(".*");
  let regex = new RexExp(regexString);
  return regex.match(haystack);
}

function limitResultsMatchingId(id, prefiltered) {
  let filtered = []
  if (id.includes && id.includes("*")) {
    filtered = _.filter(data, item => matchUsingWildcard(id, item.id));
  } else {
    filtered = _.filter(data, {
      id: id
    });
  }
  return filtered;
}

exports.handler = (event, context, callback) => {
  console.log("event =", event);
  if (event && event.params) {
    let query = event.params.query;
    let path = event.params.path;
    let data = module.exports.getData();
    let result = [];
    let error = null;
    if (path && !_.isEmpty(path)) {
      if (path.id) {
        result = _.find(data, {
          id: path.id
        });
        if(!result){
          error = "Invalid NAICS Code";
        }
      } else if (path.id && path.property) {
        let found = result = _.find(data, {
          id: path.id
        });
        result = _.pick(found, path.property);
        if (result === undefined) {
          error = "Unknown property: " + path.property;
        }
      } else {
        error = "Unsupported path variables"
      }
    } else {
      result = filterUsingQuery(data, query)
    }
    callback(error, result)
  } else {
    callback("Unsupported method or request")
  }
};


function filterUsingQuery(data, query) {
  return data;
}
