#!/usr/bin/env node

/**
 * Module dependencies.
 */
//https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String JS字符处理

var fs = require('fs');
var readline = require('readline');
const printf = require('printf')
const iconv = require('iconv-lite');

class SrtParser {

  constructor(path) {
    this.path = path;
    this.lastLineType = 'b';
    this.currentLineType = 'b';//b=blank,i=index,t=time,c=content,n=unknown
    this.srtLine = null;
   // console.log('constructor this: ' + JSON.stringify(this));
  }

 //callback([]); 第一个参数是数组，第二个参数是错误信息
  doParse(callback) {

    this.lines = new Array();
    this.lineReader = readline.createInterface({
        input: fs.createReadStream(this.path) //直接读取文件流，有可能会遇到编码问题，所以input要为解码后的字符
      });

   // this.lineReader.on('line', this.lineEventHandler); //这样写的话，lineEventHandler方法中的this指向了lineReader;

    this.lineReader.on('line', (line) => {
      this.lineEventHandler(line);
    });
    this.lineReader.on('close', () => {
      this.pushLine();
      if(callback) {
          callback(this.lines);
      }
    });
  }

  //读取完一行数据事件
  lineEventHandler(line) {
  
   // console.log(line);
    let len = line.trim().length;
    if(len == 0){
      this.currentLineType = 'b';
      this.pushLine();
      this.srtLine = null;
    }
    else if(this.lastLineType == 'b') {
      var index = parseInt(line);
      if(index > 0){
        this.srtLine = {};//create new line
        this.srtLine.idx = index;
        this.currentLineType = 'i';
      }
      else
        this.currentLineType = 'n';
    }
    else if(this.lastLineType == 'i') {
      //(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})
      var times = line.split(' --> ');
      if(times.length == 2) {
        this.currentLineType = 't';
        var s = SrtParser.parseSrtTime(times[0]);//开始时间
        var e = SrtParser.parseSrtTime(times[1]);//结束时间
        if(s != null && e != null) {
          this.srtLine.start = s;
          this.srtLine.end = e;
        }
        else
          this.currentLineType = 'n';
      }
      else
        this.currentLineType = 'n';
  
    }
    else if(this.lastLineType == 't') {
     // console.log(`${line}`);
      this.currentLineType = 'c';
      this.srtLine.content = line;
    }
    else if(this.lastLineType == 'c') {
      this.srtLine.content += ' ' + line;
    }
  
    this.lastLineType = this.currentLineType;
  }

  pushLine() {
    var tLine = this.srtLine;
    if(tLine && tLine.content) {
      this.lines.push(tLine);
     // console.log('push '+ JSON.stringify(tLine));
    }
  }

  //解析srt中的时间标签，格式 00:00:23,265 时分秒+毫秒
  static parseSrtTime (timeStr) {

    var eles = timeStr.split(',');
    var secValue = null;
    if(eles.length == 2) {
      var t = eles[0]; //时分秒
      var tEles = t.split(':').reverse();
      if(tEles.length > 1) {
        var l = Math.min(tEles.length,3);
        for (var i=0; i<l; i++) {
          if(i == 0)
            secValue = parseInt(tEles[i]);
          else if(i == 1)
            secValue += parseInt(tEles[i])*60;
          else if(i == 2)
            secValue += parseInt(tEles[i])*3600;
        }
        var msec = parseFloat(eles[1]); //毫秒
        secValue += msec/1000;
      }
    }
    return secValue;
  }

}

 function parseSrtFromFile(path) {

  return new Promise( (resolve, reject) => {
    var parser = new SrtParser(path);
      parser.doParse((lines) => {
        if(lines.length > 0) {
          console.log('parsed '+lines.length+' lines from ' + path);
          resolve(lines);
        }
        else{
          console.error('failed parse srt from ' + path);
          reject({message:'no lrc data'});
        }

      });
  });
}


  function formartTimeValue(t) {
    var sec = parseInt(t);
    var h = parseInt(sec/3600);
    var m = parseInt((sec - h*3600)/60);
    var s = parseInt(sec%60);
    var ms = (t*1000)%1000;
    return printf('%02d:%02d:%02d,%03d',h,m,s,ms);
  }
  
  function formartTime(start, end) {
    var s = formartTimeValue(start);
    var e = formartTimeValue(end);
    return s + ' --> ' + e;
  } 

/*
{
  idx:1
  start:10.022,
  end:12.21,
  content:'this is the content'
}
*/

//module.exports = SrtParser;
module.exports.parseSrtFromFile = parseSrtFromFile;
module.exports.formartTimeValue = formartTimeValue;
module.exports.formartTime = formartTime;