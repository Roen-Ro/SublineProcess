#!/usr/bin/env node

/**
 * Module dependencies.
 */

//https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String JS字符处理
process.env.NODE_ENV = 'development';//部署的时候设置成 production

var inputPara = process.argv;//输入的参数 数组，注意参数是从第3个元素开始的（index为2），第一个元素为node执行器目录地址，第二个为js执行文件地址

var fs = require('fs');
var srtParser = require('./srtLineParser.js');

function parseSrtFromFile(path) {

  return new Promise( (resolve, reject) => {
    var parser = new srtParser(srtPath);
      parser.doParse((lines) => {
        if(lines.length > 0)
          resolve(lines);
        else
          reject('no lrc data');
      });
  });
  
}

console.log('inputed parameters are: '+ inputPara);
var dir = '/Users/jiangwenbin/Desktop/GitHubOpenSources/SublineProcess/res/InTheHeartOfTheSun/';
var srtPath = '/Users/jiangwenbin/Desktop/GitHubOpenSources/SublineProcess/res/InTheHeartOfTheSun/ChineseSimplified-test.srt';//'/Users/lolaage/Desktop/MyProj/SublineProcess/res/InTheHeartOfTheSun/ChineseSimplified-test.srt';//inputPara[2];

async function parseAllSrtLines() {

}

//var isLastBlankLine = true;


parseSrtFromFile(srtPath)
.then((srts) => {
  console.log(srts);
})
.catch( err => { //这样写的话，外部永远都不会抓取到异常了，但是!这对通过 await 调用就很方便了, 永远只需要拿返回值，然后通过返回值的error字段，判断是否有异常
  console.error('parseSrtFromFile error: ' + err.message);
});