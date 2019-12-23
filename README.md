# SublineProcess
Parse and merge srt files.
## 源码打包 (不想看可跳过)
`nodejs`打包的工具参考[这里](https://blog.csdn.net/weixin_33975951/article/details/86787858)。
这里使用`pkg`工具对我们项目进行打包:
- 下载源码
- 检查你的电脑是否安装了nodejs引擎(怎么安装网上搜索)
- 检查你的电脑是否安装了pkg(网上搜索)
```
//执行安装 pkg
$ cnpm install pkg -g
```
- 切换到`src`目录
  ```
  $ cd xxxx/SublineProcess⁩/src
  ```
- 安装依赖，在`src`目录下执行
  ```
  $ npm install
  或者
  $ cnpm install
  ```
- 执行`pkg`命令
     ```
  $ pkg .
  ```
打包完成了,在`src`目录下可以看到新增了三个文件
```
subline-process-linux
subline-process-macos
subline-process-win.exe
```
找到你要用的对应平台文件，把文件名改成`subline-process`

## 使用
### 文件编码
#### 支持的编码
目前本工具只能处理`utf-8`字符文件，所以在转换前需要将所有文件转换成utf8格式.   
如何进行文件转码参考<https://segmentfault.com/a/1190000007073776?_ea=1252426>

#### 转换成`utf-8`
最简单的办法：
1. 将无法打开或乱码文件，拖动到Chrome浏览器，强大的chrome能够解码目前我遇到的所有编码
2. 将浏览器显示的文本复制再粘贴到txt文件

##### 使用`enca`转换
 安装`enca`
 mac 直接终端输入
    ```
    $ brew install enca
    ```

将当前目录下的所有文件都转换成`utf-8`编码，并覆盖原文件
```
$ enca -x utf-8 *
```
>上面这样有可能操作失败，可以尝试下面的`iconv`,或用`enca`的其他选项,[这里](https://segmentfault.com/a/1190000007073776?_ea=1252426)有比较具体的介绍
##### 使用`iconv`转换
- 在终端使用`file`命令可以查看文件编码
    ```
   $ file Youth-zh.srt
    Youth-zh.srt: Little-endian UTF-16 Unicode text, with CRLF, CR line terminators
    ```
- 使用`iconv`对文件进转码:`iconv -f fromcode -t tocode file1 > file2`
  ```
  $ iconv -f UTF-16 -t utf-8  Youth-zh.srt > Youth-zh-utf8.srt
  ```
    >`fromcode`表示原文件编码,`tocode`表示目标编码, `file1`表示原文件，`file2`表示输出目标文件.

    中文如果遇到转换失败，那就试试用`GB2312`做参数试试
    >注: 有时候`file`查看到的文件编码，输入到`iconv`命令中，并不能识别，下面列出一些常用到的语言编码，如果遇到转换不了可以使用下面的编码来替换
    > 1. ISO-8859 子集列表<https://baike.baidu.com/item/ISO-8859/834118?fr=aladdin>
    > 1. 中文 `GB2312`
    > 1. 日耳曼语系  `ISO-8859-1`或`CP850`(法语试过)

### 命令工具生成
程序员可以自己下载代码打包，当然工程目录中有现成的打包好的可执行文件
- 在项目`build`目录下，找到你需要的可执行文件`subline-process`,把它拷贝到你想要的目录下

### 字幕合并

#### 多语言字幕合并 -merge
- Put all `.srt` files that you wish to be merged in to the same folder.
- Create a `json` file named `merge.json` in the same folder along with the srt files with content like:
```json
{
    "origin":"zh",
    "output":"merged.srt",
    "zh":"ChineseSimplified.srt", 
    "en":"English.srt", 
    "fre":"French.srt", 
    "ar":"Arabic.srt",
    "de":"German.srt",
    "es":"Spanish.srt",
    "ja":"Japanese.srt",
    "ko":"Korean.srt",
    "ru":"Russian.srt",
    "pt":"Portuguese.srt"
}
```
> in this merge.json file, the keys are the short writting of different languanges, and the values are the corresponding srt file names, except that the `origin` key's value presents the original language, and `output` key's value specifies the final merged out put file name.

使用：
 切换到`subline-process`所在目录，然后在终端输入
  ```
  $ ./subline-process -merge /Users/myname/mydoc/merge.json
  ```
>把后面的`/Users/myname/mydoc/merge.json`替换成你自己的merge.json文件路径

多语言字幕合并完成！

#### 多段字幕文件合并 -combine
`-combine srtpath1 srtpath2 time2` 将两个分段字幕文件合并成一个;   
举例子:将mysrt_cd1.srt和/mysrt_cd2.srt文件合并成一个，其中mysrt_cd2.srt的首句字幕开始时间设置为 00:15:14,999
```
$ ./subline-process -combine /Users/xxoo/srt_debug/mysrt_cd1.srt /Users/xxoo/srt_debug/mysrt_cd2.srt 00:15:14,999
```


### 清理样式标签
清理样式标签用`-cleantags file_path`参数，`cleantags`将会清理掉srt字幕中'<>' 和 '{}'之间的样式内容,举个栗子：
切换到`subline-process`所在目录，然后在终端输入
  ```
  $ ./subline-process -cleantags /Users/myname/mydoc/mysubtitle.srt
  ```
>把后面的`/Users/myname/mydoc/mysubtitle.srt`替换成你自己的srt文件路径

被清理的数据将会输出到新生成的文件，文件路径和原文件目录相同，文件名称在原文件名后面加上'_clean', 上面的例子输出文件将会是`/Users/myname/mydoc/mysubtitle_clean.srt`

### 调整时间
#### 设置偏移 `-offset`
用`-offset file_path second`对srt文件中的所有字幕添加整体时间偏移，
假如要将mysubtitle.srt文件的所有字幕内容提前2.5秒：

切换到`subline-process`所在目录，然后在终端输入
  ```
  $ ./subline-process -offset /Users/myname/mydoc/mysubtitle.srt -2.5
  ```
>把后面的`/Users/myname/mydoc/mysubtitle.srt`替换成你自己的srt文件路径

被清理的数据将会输出到新生成的文件，文件路径和原文件目录相同，文件名称在原文件名后面加上'_offset', 上面的例子输出文件将会是`/Users/myname/mydoc/mysubtitle_offset.srt`

#### 设置开始时间
##### -setallstart
使用`-setallstart directory second`对directory目录下所有的srt字幕设置统一的开始时间，这样第一句字幕的开始时间自动设定为second时间，后续字幕时间按照时间偏移自动设置。
举个栗子，要设置`mySrt`目录下的所有字幕的开始时间，都设置为00:00:02,500，
首先切换到`subline-process`所在目录，然后在终端输入
  ```
  $ ./subline-process -setallstart /Users/myname/mySrt 2.5
  ```

##### -setstart
使用`-setstart file.srt second`设置file.srt字幕开始时间为second时间，后续字幕时间按照时间偏移自动设置。

举个栗子，要设置`xxx.srt`的开始时间为00:00:02,500，
首先切换到`subline-process`所在目录，然后在终端输入
  ```
  $ ./subline-process -setstart /Users/myname/mySrt/xxx.srt 2.5
  ```

### 字幕分割 
#### -detectsplitpoint
使用命令`-detectsplitpoint file.srt interval` 获取合适的分割时间点, interval为小数或整数的时间间隔
举例子:
```
-detectsplitpoint /Users/myname/mySrt/xxx.srt 8.0
```
获取‘xxx.srt’文件中，间隔时间大于等于8秒的字幕时间点

#### -splittime
使用命令`-splittime file.srt t1 t2 t3 t3`将file.srt字幕按照[t1 t2 t3 t3]时间点进行分割,其中时间的格式和srt字幕时间格式一致`'时:分:秒,毫秒'`

举例子:
```
-splittime /Users/myname/mySrt/xxx.srt 00:00:20,000 00:00:37,000 00:00:42,000 00:07:29,000 01:12:25,00
```



### 添加语言
To be finished...
