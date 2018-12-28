'use strict'

// load the master data, but do so with an export so it can be mocked
let masterData = require('./naics.json')
module.exports.getData = function () {
  return masterData
}

const ONE_MILLION = 1000000

exports.handler = (event, context, callback) => {
  console.log(JSON.stringify(event))
  let result = null
  let error = null
  if (event && event.queryStringParameters) {
    let query = event.queryStringParameters
    let data = module.exports.getData()
    if (query && query.id) {
      let found = data.find(item => Number(item.id) === Number(query.id))
      if (found) {
        if (found.revenueLimit) {
          let revenueLimitInDollars = found.revenueLimit * ONE_MILLION
          if (query.revenue) {
            result = `${query.revenue <= revenueLimitInDollars}`
          } else {
            error = 'Required query parameter revenue is missing'
          }
        } else if (found.employeeCountLimit) {
          if (query.employeeCount) {
            result = `${query.employeeCount <= found.employeeCountLimit}`
          } else {
            error = 'Required query parameter employeeCount is missing'
          }
        }
      } else {
        error = 'Invalid ID - No NAICS exists for the given id'
      }
    } else {
      error = 'Required query parameter id is missing'
    }
  } else {
    error = 'Unsupported method or request'
  }
  callback(null, {
    statusCode: error ? 400 :200,
    body: error? JSON.stringify(error) : JSON.stringify(result)
  })
}
