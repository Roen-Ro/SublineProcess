# SublineProcess
Parse and merge srt files.

# Usage
1. Have nodejs engine installed on your computer [reference](https://www.runoob.com/nodejs/nodejs-install-setup.html).
1. Put all `.srt` files that you wish to be merged in to the same folder.
1. Create a `json` file named `merge.json` in the same folder along with the srt files with content like:
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