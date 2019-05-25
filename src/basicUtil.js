#!/usr/bin/env node

/**
 * Module dependencies.
 */
//https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String JS字符处理

var fs = require('fs');

function objectFromJsonFile(jsionFilePath) {

  return new Promise( (resolve, reject) => {

    fs.readFile(jsionFilePath, function(err,data){
      if(err)
          reject(err);
      else {
        var jsonStr = data.toString();//将二进制的数据转换为字符串
        var obj = JSON.parse(jsonStr);//将字符串转换为json对象
        resolve(obj);
      }
    });
  });
}

exports.objectFromJsonFile = objectFromJsonFile;