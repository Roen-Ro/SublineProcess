#!/usr/bin/env node

/**
 * Module dependencies.
 */

var fs = require('fs');
var srtParser = require('./srtParser.js');
var basicUtil = require('./basicUtil.js');
var path = require('path');
/*
linesMergeTo: 要合并到的字幕，称它为父字幕
linesMergeFrom: 被合并的字幕，称它为子字幕
orgLan: linesMergeTo中字幕语言
toMergeLan: linesMergeFrom中字幕语言
//srt字幕对象结构
{
  start:10.022,
  end:12.21,
  content:'this is the content'
}
返回:没有被合并的字幕数组
*/
let fixMark = '[fix]'
function mergeSrtLines(linesMergeTo,linesMergeFrom,orgLan,toMergeLan) {

  let tolerance = 0.4;
  let tmpSrc = linesMergeFrom;
  let lastMatchIndex = 0; //上一次被合并到的索引，父字幕的索引

  let orgPrefix; //不要赋值
  if(orgLan)
    orgPrefix = '['+orgLan+':]';
  let toMergePrefix = ''; //赋默认值
  if(toMergeLan)
    toMergePrefix = '['+toMergeLan+':]';

  let unMergedLines = new Array();
  let mergeToIndex;
  let maxTimeLap = 0;
  let maxTimeLapIndex = -1;
  for(var j=0; j<tmpSrc.length; j++) { //Loop A

    let srcLine = tmpSrc[j];

    maxTimeLap = 0;
    maxTimeLapIndex = -1;
    mergeToIndex = -1;

    for(var i=lastMatchIndex; i<linesMergeTo.length; i++) { //Loop B
      let tgtLine = linesMergeTo[i];
      if(orgPrefix) {
        if(!tgtLine.content.startsWith(orgPrefix))
          tgtLine.content = orgPrefix+tgtLine.content;
      }

      let startDeltaT = srcLine.start - tgtLine.start;
      let endDeltaT = srcLine.end - tgtLine.end; 
      if( (Math.abs(startDeltaT) < tolerance && Math.abs(endDeltaT) < tolerance)
        ||  (startDeltaT >= 0 && endDeltaT <= 0) ) { // if A (完美匹配)

        mergeToIndex = i;
        break;
      } // if A
      else  { //else A

        //合并到重叠时间最长的那句字幕

        //计算重叠时间
        var timeLap = Math.min(tgtLine.end,srcLine.end) - Math.max(tgtLine.start,srcLine.start);

        if(timeLap > 0 && timeLap > maxTimeLap) {
          maxTimeLap = timeLap;
          maxTimeLapIndex = i;
         // console.log('mx:'+timeLap);
        }
        else {
         // console.log('--: '+timeLap);
        }

        // 确定一个重叠时间最大

        if(tgtLine.start > srcLine.end)
          break;

      }//esle A

    } //Loop B for(var i=lastMatchIndex; i<linesMergeTo.length; i++)

    let mark = false;
    if(mergeToIndex < 0 && maxTimeLapIndex >= 0) {
      mergeToIndex = maxTimeLapIndex;
      mark = true;
    }
      
    if(mergeToIndex >= 0) {
      let targetLine = linesMergeTo[mergeToIndex];
      if(targetLine.merged)
        targetLine.content += ' ' + srcLine.content;
      else {
          targetLine.content += '\n' + toMergePrefix + srcLine.content;
      }
      
      if(mark)
        targetLine.content += fixMark;

      targetLine.merged = true;
      
      lastMatchIndex = mergeToIndex;
    }
    else {
      //没有找到匹配的合适
      unMergedLines.push(srcLine);
    }
      
  } //Loop A  for(var j=0; j<tmpSrc.length; j++)

  //clear .merged flag 
  for(var x = 0; x<linesMergeTo.length; x++){
    let l = linesMergeTo[x];
    l.merged = false;
  }

  return unMergedLines;
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
      let unmergedLines = mergeSrtLines(orgLines,lines,key,key2);

      console.log(unmergedLines.length + ' Lines not merged for '+fname);
      //将没有被合并的字幕输出到unmerged-xxxxx.srt文件
      if(unmergedLines && unmergedLines.length > 0) { 
        let _pt1 = path.resolve(mergeJsonFilePath, '../unmerged-'+fname);
        putSrtLinesToFile(unmergedLines,_pt1,()=>{});
      }
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


module.exports.mergeSrtLines = mergeSrtLines;
module.exports.putSrtLinesToFile = putSrtLinesToFile;
module.exports.formartSrtFromLines = formartSrtFromLines;
module.exports.mergeWithMergeFile = mergeWithMergeFile;