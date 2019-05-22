#!/usr/bin/env node

/**
 * Module dependencies.
 */

var fs = require('fs');
var readline = require('readline');

class SrtParser {

  constructor(path) {
    this.path = path;
    this.lines = new Array();
    this.lastLineType = 'b';
    this.currentLineType = 'b';//b=blank,i=index,t=time,c=content,n=unknown
    this.srtLine = null;
    console.log('constructor this: ' + JSON.stringify(this));
  }

  pushLine() {
    var tLine = this.srtLine;
    if(tLine){
      this.lines.push(tLine);
      console.log('push '+ JSON.stringify(tLine));
    }
  }

  doParse() {
    
    this.lineReader = readline.createInterface({
        input: fs.createReadStream(this.path) //直接读取文件流，有可能会遇到编码问题，所以input要为解码后的字符
      });

   // this.lineReader.on('line', this.lineEventHandler); //这样写的话，lineEventHandler方法中的this指向了lineReader;

    this.lineReader.on('line', (line) => {
      this.lineEventHandler(line);
    });
    this.lineReader.on('close', () => {
      this.pushLine();
    });
  }

  //读取完一行数据事件
  lineEventHandler(line) {
  
   // console.log('this: ' + JSON.stringify(this));
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
        var start = parseSrtTime(times[0]);
        var end = parseSrtTime(times[1]);
        if(start != null && end != null) {
          this.srtLine.startSec = start;
          this.srtLine.endSec = end;
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
      this.srtLine.content = this.srtLine.content + ' ' + line;
    }
  
    this.lastLineType = this.currentLineType;
  }

}

//解析srt中的时间标签，格式 00:00:23,265 时分秒+毫秒
function parseSrtTime (timeStr) {

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

module.exports = SrtParser;