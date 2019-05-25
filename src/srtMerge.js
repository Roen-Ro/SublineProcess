#!/usr/bin/env node

/**
 * Module dependencies.
 */

var fs = require('fs');
var srtParser = require('./srtParser.js');
var basicUtil = require('./basicUtil.js');
var path = require('path');
/*
linesMergeTo: 要合并到的字幕
linesMergeFrom: 被合并的字幕
orgLan: linesMergeTo中字幕语言
toMergeLan: linesMergeFrom中字幕语言
//srt字幕对象结构
{
  start:10.022,
  end:12.21,
  content:'this is the content'
}
*/
let fixMark = '[fix]'
function mergeSrtLines(linesMergeTo,linesMergeFrom,orgLan,toMergeLan) {

  let tolerance = 0.3;
  let tmpSrc = linesMergeFrom;
  let lastMatchIndex = 0; //上一次匹配的“合并来源”字幕索引

  let orgPrefix;
  if(orgLan)
    orgPrefix = '['+orgLan+':]';
  let toMergePrefix;
  if(toMergeLan)
    toMergePrefix = '['+toMergeLan+':]';

  for(var i=0; i<linesMergeTo.length; i++) {
    let ln1 = linesMergeTo[i];
    if(orgPrefix) {
      if(!ln1.content.startsWith(orgPrefix))
        ln1.content = orgPrefix+ln1.content;
    }

    for(var j=lastMatchIndex; j<tmpSrc.length; j++) {
      let ln2 = tmpSrc[j];
      let toAddContent;

      if(toMergePrefix) {
        if(!ln2.content.startsWith(toMergePrefix))
          ln2.content = toMergePrefix+ln2.content;
      }

      let startDeltaT = ln2.start-ln1.start;
      let endDeltaT = ln2.end-ln1.end;

      if(Math.abs(startDeltaT) < tolerance 
      || Math.abs(endDeltaT) < tolerance ) {
        
        toAddContent = ln2.content;

        if(endDeltaT > tolerance) { //需要手动调整标记
          toAddContent += fixMark;
        }
        else  if(endDeltaT < -tolerance) { //被合并字幕的那一句时间更短, 要检查是不是应该多句合并到一句

          //读取下一句的结束时间，如此循环往复
          let m = j+1;
          for(;m < tmpSrc.length; m++) {
            let ln3 = tmpSrc[m];
            if(ln3.end - ln1.end < tolerance) {
              toAddContent += ' ' + ln3.content;
              j++;
              console.log('MERGE:'+ln3.content);
            }
            else
              break;
          } // for 3
          toAddContent += fixMark;
        }
      }
      // else if(Math.abs(endDeltaT) < tolerance ) {

      // }

      if(toAddContent)
        ln1.content += '\n' + toAddContent;
      else {

      }
    } //for2

  }// for 1

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


/*
读取merge.json文件
@para mergeJsonFilePath merge.json文件地址
*/
async function mergeWithMergeFile(mergeJsonFilePath,callBack) {

    var mergeInfo = await basicUtil.objectFromJsonFile(mergeJsonFilePath);

   // console.log(JSON.stringify(mergeInfo));
    let key = mergeInfo['origin'];
    if(!key) {
      return console.error('no origin key or value was specified in the merge.json file');
    }
    var fname = mergeInfo[key];
    var _pth = path.resolve(mergeJsonFilePath, '../'+fname);
    let orgLines =  await srtParser.parseSrtFromFile(_pth);
    var lanKeys = mergeInfo;
    delete lanKeys["origin"];
    delete lanKeys["output"];
    delete lanKeys[key];
    var keys = Object.keys(lanKeys);

    for(var i=0; i<keys.length; i++) {
      var key2 = keys[i];
      fname = mergeInfo[key2];
      if(fname.length == 0)
        continue;

      _pth = path.resolve(mergeJsonFilePath, '../'+fname);
      let lines =  await srtParser.parseSrtFromFile(_pth);
      mergeSrtLines(orgLines,lines,key,key2);
    }

    fname = mergeInfo['output'];
    if(!fname)
      fname = 'merged.srt';
    _pth = path.resolve(mergeJsonFilePath, '../'+fname);

    putSrtLinesToFile(orgLines,_pth,(error,data) => {
      if(error)
        console.error('Failed write merged srt to file '+_pth);
      else
        console.log('Merge finished! new merge file is: '+_pth);
    })
  
}

module.exports.mergeSrtLines = mergeSrtLines;
module.exports.putSrtLinesToFile = putSrtLinesToFile;
module.exports.formartSrtFromLines = formartSrtFromLines;
module.exports.mergeWithMergeFile = mergeWithMergeFile;