const os = require("os");

var gitUrl = undefined; //git网址
var srcDir = undefined; //原笔记存放路径
var targetDir = undefined; //html生成路径
var staticPath = undefined; //静态资源路径
var isNeedClone = undefined; //需要clone

//=======其他全局变量=============
var blogArr=[];//存放blog名称的数组

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
  srcDir = "D:\\note";
  targetDir = "D:\\html";
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
