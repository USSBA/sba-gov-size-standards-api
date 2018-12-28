'use strict'
var _ = require('lodash')

// load the master data, but do so with an export so it can be mocked
let masterData = require('./naics.json')
module.exports.getData = function() {
  return masterData
}

exports.handler = (event, context, callback) => {
  let result = []
  let error = null
  if (event && event.path) {
    let query = event.queryStringParameters
    let { first: resource, second: id, third: property } = splitAsObject(event.path)

    let data = module.exports.getData()
    if (resource && !_.isEmpty(id)) {
      if (id && !property) {
        result = _.find(data, {
          id: id
        })
        if (!result) {
          error = {
            statusCode: 404,
            body: JSON.stringify('Invalid ID - No NAICS exists for the given id')
          }
        }
      }
      else if (id && property) {
        let found = result = _.find(data, {
          id: id
        })
        if (!found) {
          error = {
            statusCode: 404,
            body: JSON.stringify('Invalid ID - No NAICS exists for the given id')
          }
        }
        else {
          result = found[property]
          if (result === undefined) {
            error = {
              statusCode: 404,
              body: JSON.stringify('Invalid Property - The Requested property does not exist: ' + property)
            }
          }
        }
      }
      else {
        error = {
          statusCode: 400,
          body: JSON.stringify('Unsupported path variables')
        }
      }
    }
    else {
      result = filterUsingQuery(data, query)
    }
  }
  else {
    error = {
      statusCode: 400,
      body: JSON.stringify('Unsupported method or request')
    }
  }


  callback(null, error || {
    statusCode: 200,
    body: JSON.stringify(result),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

function filterUsingQuery(data, query) {
  let queryWithStringValues = _.mapValues(query, item => '' + item)
  let queryWithRegexValues = _.mapValues(queryWithStringValues, item => item ? '^' + item.split('*').join('.*') + '$' : item)
  let result = _.filter(data, item => {
    return _.isMatchWith(item, queryWithRegexValues, (a, b) => {
      let regex = new RegExp(b)
      return regex.test(a)
    })
  })
  return result
}

function splitAsObject(string) {
  let second = null;
  let third = null;
  
  let split = string.split('/')
  let first = split[1]
  if (split.length > 2) {
    second = split[2]
  }
  if (split.length > 3) {
    third = split[3]
  }
  let result =  { first, second, third }
  return result;
}
