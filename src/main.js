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
var path = require('path');

console.log('inputed parameters are: '+ inputPara);
var dir = '/Users/lolaage/Desktop/MyProj/SublineProcess/res/InTheHeartOfTheSun/';//'/Users/jiangwenbin/Desktop/GitHubOpenSources/SublineProcess/res/InTheHeartOfTheSun/';

var mergeJsonFilePath = inputPara[2];
if(!mergeJsonFilePath)
    mergeJsonFilePath = path.resolve(__dirname, '../res/InTheHeartOfTheSun/merge.json');

srtMerge.mergeWithMergeFile(mergeJsonFilePath);
