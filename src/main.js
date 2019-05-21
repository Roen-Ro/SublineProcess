#!/usr/bin/env node

/**
 * Module dependencies.
 */

//https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String JS字符处理
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
var srtPath = '/Users/lolaage/Desktop/MyProj/SublineProcess/res/InTheHeartOfTheSun/ChineseSimplified-test.srt';//inputPara[2];

const rl = readline.createInterface({
  input: fs.createReadStream(srtPath) //直接读取文件流，有可能会遇到编码问题，所以input要为解码后的字符
});

//var isLastBlankLine = true;
var lines = new Array()
var lastLineType = 'b'
var currentLineType = 'b';//b=blank,i=index,t=time,c=content,n=unknown
var lastContent;
var index;
var srtLine = null;
rl.on('line', (line) => {
  
  let len = line.trim().length;
  if(len == 0){
    currentLineType = 'b';
    var tLine = srtLine;
    addLine(tLine);
    srtLine = null;
  }
  else if(lastLineType == 'b') {
    index = parseInt(line);
    if(index > 0){
      srtLine = {};//create new line
      srtLine.idx = index;
      currentLineType = 'i';
    }
    else
      currentLineType = 'n';
  }
  else if(lastLineType == 'i') {
    //(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})
    var times = line.split(' --> ');
    currentLineType = 't';
    srtLine.start = times[0];
    srtLine.end = times[1];
  }
  else if(lastLineType == 't') {
   // console.log(`${line}`);
    currentLineType = 'c';
    srtLine.content = line;
  }
  else if(lastLineType == 'c') {
    srtLine.content = srtLine.content + ' ' + line;
  }

  lastLineType = currentLineType;

});



if(srtLine)
  addLine(srtLine);

function addLine(srtLine) {
  if(srtLine){
    lines.push(srtLine);
    console.log('push '+ JSON.stringify(srtLine));
  }
    
}

for(i=0; i< lines.length; i++) {

  l = lines[i];
  console.log(l);
}

// parseSrtFromFile(srtPath)
// .then((srts) => {
//   console.log(srts);
// })
// .catch( err => { //这样写的话，外部永远都不会抓取到异常了，但是!这对通过 await 调用就很方便了, 永远只需要拿返回值，然后通过返回值的error字段，判断是否有异常
//   console.error('parseSrtFromFile error: ' + err.message);
// });