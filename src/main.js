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
    var parser = new srtParser(path);
      parser.doParse((lines) => {
        if(lines.length > 0) {
          console.log('parsed '+lines.length+' lines from ' + path);
          resolve(lines);
        }
        else{
          console.error('failed srt parse from ' + path);
          reject({message:'no lrc data'});
        }
          
      });
  });
}

console.log('inputed parameters are: '+ inputPara);
var dir = '/Users/lolaage/Desktop/MyProj/SublineProcess/res/InTheHeartOfTheSun/';//'/Users/jiangwenbin/Desktop/GitHubOpenSources/SublineProcess/res/InTheHeartOfTheSun/';
var orgSrtPath = dir + 'ChineseSimplified-test.srt';//
var srtPath1 = dir + 'English-test.srt';//
var srtPath2 = dir + 'Korean-test.srt';
var mergedSrtPath = dir + 'merged.srt';

async function doParseAndMerge() {

  let orgLines = await parseSrtFromFile(orgSrtPath);
  let subLines1 = await parseSrtFromFile(srtPath1);
  let subLines2 = await parseSrtFromFile(srtPath2);

  mergeSrtLine(orgLines,subLines1);
  mergeSrtLine(orgLines,subLines2);

  putSrtLinesToFile(orgLines,mergedSrtPath,(error, data) => {
    if(error)
      console.error(error.message);
    else
      console.log('finished write data to file '+mergedSrtPath);
  });
  // mergeLrcLines(mergeInfo,'zh');
}

/*
linesMergeTo: 要合并到的字幕
linesMergeFrom: 合并的字幕来源
//srt字幕对象结构
{
  start:10.022,
  end:12.21,
  content:'this is the content'
}
*/
let fixMark = '[fix]'
function mergeSrtLine(linesMergeTo,linesMergeFrom) {

  let tolerance = 0.3;
  let tmpSrc = linesMergeFrom;
  let lastMatchIndex = 0; //上一次匹配的“合并来源”字幕索引
  for(var i=0; i<linesMergeTo.length; i++) {
    let ln1 = linesMergeTo[i];

    for(var j=lastMatchIndex; j<tmpSrc.length; j++) {
      let ln2 = tmpSrc[j];
      let toAddContent;
      if(Math.abs(ln2.start-ln1.start) < tolerance ) {

        let deltaT = ln2.end-ln1.end;
        toAddContent = ln2.content;

        if(deltaT > tolerance) { //需要手动调整标记
          toAddContent += fixMark;
        }
        else  if(deltaT < -tolerance) { //被合并字幕的那一句时间更短, 要检查是不是应该多句合并到一句

          //读取下一句的结束时间，如此循环往复
          let m = j+1;
          for(;m < tmpSrc.length; m++) {
            let ln3 = tmpSrc[m];
            if(ln3.end - ln1.end < tolerance) {
              toAddContent += ' ' + ln3.content;
              j++;
            }
            else
              break;
          }
          toAddContent += fixMark;
        }
      }

      if(toAddContent)
        ln1.content += '\n' + toAddContent;
    }
  }

}

//OK 
function formartSrtFromLines(srtLines) {
  let finalText = '';
  for(var i=0,j=1; i<srtLines.length; i++,j++) {
    var line = srtLines[i];
    var str = j+ '\n' + srtParser.formartTime(line.start,line.end) + '\n' + line.content + '\n\n';
    finalText += str;
  }

  return finalText;
}

function putSrtLinesToFile(srtLines,destPath, callBack) {

  fs.writeFile(destPath,formartSrtFromLines(srtLines),callBack);
}

doParseAndMerge();

// parseSrtFromFile(srtPath)
// .then((srts) => {
//   console.log(srts);
// })
// .catch( err => { //这样写的话，外部永远都不会抓取到异常了，但是!这对通过 await 调用就很方便了, 永远只需要拿返回值，然后通过返回值的error字段，判断是否有异常
//   console.error('parseSrtFromFile error: ' + err.message);
// });