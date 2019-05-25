#!/usr/bin/env node

/**
 * Module dependencies.
 */
//https://www.cnblogs.com/mengff/p/9753867.html //路径path处理


process.env.NODE_ENV = 'development';//部署的时候设置成 production

var inputPara = process.argv;//输入的参数 数组，注意参数是从第3个元素开始的（index为2），第一个元素为node执行器目录地址，第二个为js执行文件地址

var fs = require('fs');
var srtParser = require('./srtParser.js');
var srtMerge = require('./srtMerge.js');


console.log('inputed parameters are: '+ inputPara);
var dir = '/Users/lolaage/Desktop/MyProj/SublineProcess/res/InTheHeartOfTheSun/';//'/Users/jiangwenbin/Desktop/GitHubOpenSources/SublineProcess/res/InTheHeartOfTheSun/';

var mergeJsonFilePath = dir + 'merge.json';

// async function doParseAndMerge() {

//   let orgLines = await parseSrtFromFile(orgSrtPath);
//   let subLines1 = await parseSrtFromFile(srtPath1);
//   let subLines2 = await parseSrtFromFile(srtPath2);

//   srtMerge.mergeSrtLine(orgLines,subLines1);
//   //srtMerge.mergeSrtLine(orgLines,subLines2);

//   srtMerge.putSrtLinesToFile(orgLines,mergedSrtPath,(error, data) => {
//     if(error)
//       console.error(error.message);
//     else
//       console.log('finished write data to file '+mergedSrtPath);
//   });
//   // mergeLrcLines(mergeInfo,'zh');
// }


srtMerge.mergeWithMergeFile(mergeJsonFilePath);

//doParseAndMerge();

// parseSrtFromFile(srtPath)
// .then((srts) => {
//   console.log(srts);
// })
// .catch( err => { //这样写的话，外部永远都不会抓取到异常了，但是!这对通过 await 调用就很方便了, 永远只需要拿返回值，然后通过返回值的error字段，判断是否有异常
//   console.error('parseSrtFromFile error: ' + err.message);
// });