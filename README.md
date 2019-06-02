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
    >`fromcode`表示原文件编码,`tocode`表示目标编码, `file1`表示原文件，`file2`表示输出目标文件

### 字幕合并
程序员可以自己下载代码打包，当然工程目录中有现成的打包好的可执行文件
- 在项目`build`目录下，找到你需要的可执行文件`subline-process`,把它拷贝到你想要的目录下
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
- 切换到`subline-process`所在目录，然后在终端输入
  ```
  $ ./subline-process /Users/myname/mydoc/merge.json
  ```
    >把后面的`/Users/myname/mydoc/merge.json`替换成你自己的merge.json文件路径

字幕合并完成！