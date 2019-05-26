# SublineProcess
Parse and merge srt files.

## Usage
### 文件编码
目前本工具只能处理`utf-8`字符文件，所以在转换前需要将所有文件转换成utf8格式.   
如何进行文件转码参考<https://segmentfault.com/a/1190000007073776?_ea=1252426>

#### 编码转换

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

### 使用
 - Have nodejs engine installed on your computer [reference](https://www.runoob.com/nodejs/nodejs-install-setup.html).
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
- input in terminal like
  ```
  node srtprocess /Users/myname/mydoc/merge.json
  ```
