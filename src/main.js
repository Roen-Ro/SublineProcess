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
else if(cmd == '-setstart') {
    let _pth = inputPara[3];
    let start = inputPara[4];

    if( isNaN(start)) {
        console.error('invalid start time \'' + second +'\', it must be a valid float value');
        return;
    }
    
    addSrtStartTime(_pth,start);
}
else if(cmd == '-setallstart') {
    let dir = inputPara[3];
    let start = inputPara[4];

    setStartTimeInDir(dir,start);
}
else if(cmd == '-splittime') {
    let _pth = inputPara[3];
    splitSrtLines(_pth, inputPara.slice(4));
}
else if(cmd == '-detectsplitpoint') {
    let _pth = inputPara[3];
    let second = inputPara[4];
    splitTimeDetect(_pth, second);
}
else if(cmd == '-addlan') {
    
}
else {
    console.log('available commands: ');
    console.log('-cleantags srtpath: clean \'< >\', \'{ }\' tags with output file named xxx_clean.srt');
    console.log('-merge merge.json: merge many srt files into one with specified json file ');
    console.log('-addlan add.json: 添加翻译字幕，现在直接使用\'-merge\'命令即可 ');
    console.log('-offset srtpath second: put all srt lines\' time forward or backward in seconds, for example -1.5 forward 1.5 second; 2.1 backward 1.5 second');
    console.log('-setstart srtpath second: set srt files\' start time to second, all lines\' time will be adjusted automatically');
    console.log('-setallstart srtDirectory second: set all srt files\' start time in srtDirectory to second, all lines\' time will be adjusted automatically');
    console.log('-splittime path times[](time must in hh:mm:ss.dd format): to split srt file by input times');
    console.log('-detectsplitpoint path time: to get suggestion split time points, where \'time\' is the minimum interval between the line end time and the next line\'s begin time\n检测适合分割的时间点 \'time\'参数用来设定前一句字幕结束时间和下一句字幕开始时间之间的最小时间间隔');
}


async function cleanSrtTags(srtpath) {

    var fname = path.basename(srtpath,'.srt');
    var destPath = path.resolve(srtpath,'../'+fname+'_clean.srt');
    let parseResult =  await srtParser.parseSrtFromFile(srtpath);
    let lines = parseResult.lines;

    srtMerge.putSrtLinesToFile(lines,destPath,parseResult.heads,(error) => {
        if(error)
            console.log('error:' + error);
        else
            console.log('finished clean tags to file ' + destPath);
    });
}

async function addSrtTimeOffset(srtpath, second) {

    if( isNaN(second)) {
        console.error('invalid offset time \'' + second +'\', it must be a valid float value');
        return;
    }

    let sec = parseFloat(second);

    let fname = path.basename(srtpath,'.srt');
    let destPath = path.resolve(srtpath,'../'+fname+'_offset.srt');
    let parseResult =  await srtParser.parseSrtFromFile(srtpath);
    let lines = parseResult.lines;

    let len = lines.length;
    for(var i=0; i<len; i++) {
        var line = lines[i];
        line.start += sec;
        line.end += sec;
    }

    srtMerge.putSrtLinesToFile(lines,destPath,parseResult.heads,(error) => {
        if(error)
            console.log('error:' + error);
        else
            console.log('finished add ' + second + ' second offset with output file '+ destPath);
    });
}

function setStartTimeInDir(dir, second) {

    if( isNaN(second)) {
        console.error('invalid start time \'' + second +'\', it must be a valid float value');
        return;
    }

    fs.readdir(dir,(err, files) => {

        if(err)
            console.warn(err);
        else {

            files.forEach((filename) => {
                if(filename.endsWith('srt') || filename.endsWith('srtx')) {
                    //获取当前文件的绝对路径
                    var srtpath = path.join(dir, filename);
                    addSrtStartTime(srtpath,second);

                }
                
            });
        }
    });
}

async function addSrtStartTime(srtpath, second) {

    let start = parseFloat(second);

    let fname = path.basename(srtpath,'.srt');
    let destPath = srtpath;//path.resolve(srtpath,'../'+fname+'_start_'+start+'.srt');
    let parseResult =  await srtParser.parseSrtFromFile(srtpath);
    let lines = parseResult.lines;

    let offset = start - lines[0].start;
    if(offset < 0.001 && offset > -0.01)
     {
        console.log('start time at '+srtpath+' is the same as '+start+' no need to reset');
     }
     else {

        let len = lines.length;
        for(var i=0; i<len; i++) {
            var line = lines[i];
            line.start += offset;
            line.end += offset;
        }
    
        srtMerge.putSrtLinesToFile(lines,destPath,parseResult.heads,(error) => {
            if(error)
                console.log('error:' + error);
            else
                console.log('finished set start time with ' + second + ' second for output file '+ destPath);
        });
     }
}

async function splitSrtLines(srtpath, times) {

    let parseResult =  await srtParser.parseSrtFromFile(srtpath);
    let lines = parseResult.lines;

    let t_len = times.length;
    let l_len = lines.length;
    let t0 = 0, t1 = 0;
    let preIdx = 0;
    let j = 0;
    let line_ = {};
    let groups = [];

    for(var i=0; i <= t_len; i++) {

        if(i<t_len)
            t1 = srtParser.parseSrtTime(times[i]);
        else {
            t1 = lines[l_len-1].end + 1;
        }
            
        console.log(i+': split: '+ t0 + '->'+t1);

        for(; j < l_len; j++) {
            line_ = lines[j];
            if(line_.start >= t1) {
                let a_len = j-preIdx;
                let sub_lines = lines.slice(preIdx, j);
                groups[i] = sub_lines;
                console.log('finished group:'+i+' preIdx:'+preIdx+' j=' + j + ' len:' + a_len);
                preIdx = j;
                break;
            }
            line_.start -= t0;
            line_.end -= t0;
        }
        t0 = t1;
    }

    groups[t_len] = lines.slice(preIdx);

    groups.forEach((a, idx) => {

        let fname = path.basename(srtpath,'.srt');
        let destPath = path.resolve(srtpath,'../'+fname+'_'+idx+'.srt');

        srtMerge.putSrtLinesToFile(a,destPath,parseResult.heads,(error) => {
            if(error)
                console.log('error:' + error);
            else
                console.log('Finished split line to path: ' + destPath);
        });
    });

}

//检测哪些时间适合分割 检测规则是前一句字幕结束时间和后一句字幕开始时间间隔大于second秒,
async function  splitTimeDetect(srtpath, second)  {

    if( isNaN(second)) {
        second = 3;
    }

    let parseResult =  await srtParser.parseSrtFromFile(srtpath);
    let lines = parseResult.lines;

    let preEnd = 0;
    let interval = 0;
    lines.forEach((l, idx) => {
        interval = l.start - preEnd;
        if(interval>= second) {
            console.log(idx + ': [' + interval + '] ' + srtParser.formartTimeValue(l.start));
        }
        preEnd = l.end;

    });
}