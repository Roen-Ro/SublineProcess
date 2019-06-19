#!/usr/bin/env node

/**
 * Module dependencies.
 */
//https://www.cnblogs.com/mengff/p/9753867.html //路径path处理


process.env.NODE_ENV = 'development';//部署的时候设置成 production

var inputPara = process.argv;//输入的参数 数组，注意参数是从第3个元素开始的（index为2），第一个元素为node执行器目录地址，第二个为js执行文件地址

var fs = require('fs');
var basUtil = require('./basicUtil.js');
var srtParser = require('./srtParser.js');
var srtMerge = require('./srtMerge.js');
var path = require('path');

console.log('inputed parameters are: '+ inputPara);

var cmd = inputPara[2];

if(cmd == '-cleantags') {

    let _pth = inputPara[3];
    cleanSrtTags(_pth);
}
else if(cmd == '-merge') {

    var mergeJsonFilePath = inputPara[3];
    //  if(!mergeJsonFilePath)
    //      mergeJsonFilePath = path.resolve(__dirname, '../res/InTheHeartOfTheSun/merge.json');

    srtMerge.mergeWithMergeFile(mergeJsonFilePath);
}
else if(cmd == '-offset') {
    let _pth = inputPara[3];
    let second = inputPara[4];
    addSrtTimeOffset(_pth,second);
}
// else if(cmd == '-addlan') {
    
// }
else {
    console.log('available commands: ');
    console.log('-cleantags srtpath: clean \'< >\', \'{ }\' tags with output file named xxx_clean.srt');
    console.log('-merge merge.json: merge many srt files into one with specified json file ');
    console.log('-offset srtpath second: put all srt lines\' time forward or backward in seconds, -1.5 forward 1.5 second; 2.1 backward 1.5 second');
}


async function cleanSrtTags(srtpath) {

    var fname = path.basename(srtpath,'.srt');
    var destPath = path.resolve(srtpath,'../'+fname+'_clean.srt');
    let lines =  await srtParser.parseSrtFromFile(srtpath);

    srtMerge.putSrtLinesToFile(lines,destPath,null,(error) => {
        if(error)
            console.log('error:' + error);
        else
            console.log('finished clean tags to file ' + destPath);
    });
}

async function addSrtTimeOffset(srtpath, second) {

    if( isNaN(second)) {
        console.error('invalid offset time value, it must be a valid float value');
        return;
    }

    let sec = parseFloat(second);

    let fname = path.basename(srtpath,'.srt');
    let destPath = path.resolve(srtpath,'../'+fname+'_offset.srt');
    let lines =  await srtParser.parseSrtFromFile(srtpath);

    let len = lines.length;
    for(var i=0; i<len; i++) {
        var line = lines[i];
        line.start += sec;
        line.end += sec;
    }

    srtMerge.putSrtLinesToFile(lines,destPath,null,(error) => {
        if(error)
            console.log('error:' + error);
        else
            console.log('finished add ' + second + ' offset second with output file '+ destPath);
    });
}