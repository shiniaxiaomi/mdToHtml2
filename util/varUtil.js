const os = require("os");

var gitUrl = undefined; //git网址
var srcDir = undefined; //原笔记存放路径
var targetDir = undefined; //html生成路径
var staticPath = undefined; //静态资源路径
var isNeedClone = undefined; //需要clone

//=======其他全局变量=============
var blogArr=[];//存放blog名称的数组
var noteSavePath="D:"; //note文件夹保存的盘符

var startTime=Date.now();//记录程序启动的时间
var isOpenLog=true;//标记是否打开日志记录

//本地测试
if (os.type() != "Windows_NT") {
  //线上
  gitUrl = "https://github.com/shiniaxiaomi/note.git"; //git网址
  srcDir = "/note"; //原笔记存放路径
  targetDir = "/html"; //html生成路径
  // staticPath = "http://47.105.165.211"; //静态资源路径
  staticPath = ""; //静态资源路径
  isNeedClone = true; //需要clone
} else {
  //本地
  gitUrl = "https://github.com/shiniaxiaomi/mdToHtml.git";
  srcDir = noteSavePath+"\\note";
  targetDir = noteSavePath+"\\html";
  staticPath = "http://localhost:7999";
  isNeedClone = false; //本地调试不需要clone
}

//导出变量
exports.gitUrl = gitUrl; //git网址
exports.srcDir = srcDir; //原笔记存放路径
exports.targetDir = targetDir; //html生成路径
exports.staticPath = staticPath; //静态资源路径
exports.isNeedClone = isNeedClone; //需要clone

//=====其他变量======
exports.blogArr=blogArr;
exports.noteSavePath=noteSavePath;

//打印从开启启动到程序某一位置的时间
exports.logTime=function(str){
  if(isOpenLog){
    if(str==undefined){
      console.log("距离启动:"+(Date.now()-startTime)/1000+"s")
    }else{
      console.log(str+":"+(Date.now()-startTime)/1000+"s")
    }
  }
}
