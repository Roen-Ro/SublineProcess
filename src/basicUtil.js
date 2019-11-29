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

String.prototype.stringtrimmedwithtags = function (beginTag,endTag) {

  let sIdx = -1;
  let eIdx = -1;
  let tmpStr = this.toString();

  while(1) {

    sIdx = tmpStr.indexOf(beginTag);
    eIdx = tmpStr.indexOf(endTag);
    let len = tmpStr.length;
    if(sIdx >= 0 && eIdx >= 0 && eIdx > sIdx) {
      var tmsStr1 = '';
      if(sIdx > 0)
        tmsStr1 = tmpStr.substring(0,sIdx);

      if(eIdx < len-1)
        tmsStr1 += tmpStr.substring(eIdx+1,len);

      tmpStr = tmsStr1;
    }
    else
      break;
  }
  return tmpStr;
}

String.prototype.replaceAll= function (a,b) {
  let tmpStr = this.toString();
  let eles = tmpStr.split(a);
  let retStr = eles[0];
  for(var i=1; i<eles.length; i++) {
    retStr += (b + eles[i]);
  }
  return retStr;
}

String.prototype.containsString = function (a) {
  let tmpStr = this.toString();
  let i = tmpStr.indexOf(a);
  if(i == -1)
    return false;
  return true;
}

exports.objectFromJsonFile = objectFromJsonFile;