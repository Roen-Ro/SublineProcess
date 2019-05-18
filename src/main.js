#!/usr/bin/env node

/**
 * Module dependencies.
 */


process.env.NODE_ENV = 'development';//部署的时候设置成 production

var inputPara = process.argv;//输入的参数 数组，注意参数是从第3个元素开始的（index为2），第一个元素为node执行器目录地址，第二个为js执行文件地址

var fs = require('fs');
var readline = require('readline');
var iconv = require('iconv-lite'); //字符编码处理，支持gbk

function parseSrtFromFile(path) {

  return new Promise( (resolve, reject) => {
    fs.readFile(path, (error, data) => {
      if(error)
         reject(error);
      else {
        var srtString = data.toString();
        resolve(srtString);
      }
    });
   
  });
  
}

console.log('inputed parameters are: '+ inputPara);
var srtPath = inputPara[2];

// const rl = readline.createInterface({
//  // input: fs.createReadStream(srtPath) //直接读取文件流，有可能会遇到编码问题，所以input要为解码后的字符
// });

// rl.on('line', (line) => {
//   console.log(`Line：${line}`);
// });


parseSrtFromFile(srtPath)
.then((srts) => {
  console.log(srts);
})
.catch( err => { //这样写的话，外部永远都不会抓取到异常了，但是!这对通过 await 调用就很方便了, 永远只需要拿返回值，然后通过返回值的error字段，判断是否有异常
  console.error('parseSrtFromFile error: ' + err.message);
});;