'use strict';

var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var ses = new AWS.SES();

let data = require("./naics.json");
console.log('Loading function');

exports.handler = (event, context, callback) => {
  console.log("event =", event);
  if(event && event.params){
      let query = event.params.query;
      let path event.params.path;
      if(path && path !== {}){

      }else{
          // plain naics


      }
  }else{
      callback("Unsupported method or request")
  }
};


function filterUsingQuery(results, query){

}
