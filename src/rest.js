'use strict'
var _ = require('lodash')

// load the master data, but do so with an export so it can be mocked
let masterData = require('./naics.json')
module.exports.getData = function () {
  return masterData
}

exports.handler = (event, context, callback) => {
  let result = []
  let error = null
  if (event && event.params) {
    let query = event.params.querystring
    let path = event.params.path
    let data = module.exports.getData()
    if (path && !_.isEmpty(path)) {
      if (path.id && !path.property) {
        result = _.find(data, {
          id: path.id
        })
        if (!result) {
          error = 'Invalid ID - No NAICS exists for the given id'
        }
      } else if (path.id && path.property) {
        let found = result = _.find(data, {
          id: path.id
        })
        if (!found) {
          error = 'Invalid ID - No NAICS exists for the given id'
        } else {
          result = found[path.property]
          if (result === undefined) {
            error = 'Invalid Property - The Requested property does not exist: ' + path.property
          }
        }
      } else {
        error = 'Unsupported path variables'
      }
    } else {
      result = filterUsingQuery(data, query)
    }
  } else {
    error = 'Unsupported method or request'
  }
  callback(error, result)
}

function filterUsingQuery (data, query) {
  let queryWithStringValues = _.mapValues(query, item => '' + item)
  let queryWithRegexValues = _.mapValues(queryWithStringValues, item => item ? '^' + item.split('*').join('.*') + '$' : item)
  let result = _.filter(data, item => {
    return _.isMatchWith(item, queryWithRegexValues, (a, b) => {
      // console.log("b",b)
      let regex = new RegExp(b)
      return regex.test(a)
    })
  })
  return result
}
