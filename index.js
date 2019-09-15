var express = require("express"); //导入express模块
var bodyParser = require("body-parser");
var schedule = require("node-schedule"); //导入定时任务模块
// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var app = express(); //获取app对象
const path = require("path");
const build = require("./build"); //获取构建对象

//linux
var gitUrl = "https://github.com/shiniaxiaomi/note.git"; //git网址
var srcDir = "/note"; //原笔记存放路径
var targetDir = "/html"; //html生成路径
// var staticPath = "http://47.105.165.211"; //静态资源路径
var staticPath = ""; //静态资源路径
var isNeedClone=true;//需要clone

//本地
// var gitUrl = "https://github.com/shiniaxiaomi/mdToHtml.git";
// // var srcDir = "C:\\Users\\Administrator\\Desktop\\note";
// var srcDir = "C:\\Users\\yingjie.lu\\Desktop\\note";
// // var targetDir = "C:\\Users\\Administrator\\Desktop\\html";
// var targetDir = "C:\\Users\\yingjie.lu\\Desktop\\html";
// var staticPath = "http://localhost";
// var isNeedClone=false;//本地调试不需要clone

//构建笔记html
var buildOutput = build.startToBuild(
  gitUrl,
  srcDir,
  targetDir,
  staticPath,
  true,
  isNeedClone
); //删除原生成的笔记html
if (buildOutput.flag == false) {
  //如果报错,则打印日志
  console.log(buildOutput.data);
}

//设置静态资源路径(将html生成路径设置为静态资源路径)
app.use("", express.static(targetDir));

//启动server并监听再80端口
var server = app.listen(80, function() {
  console.log("应用实例启动成功!");
});

//当'/'请求时返回首页
app.get("/", function(req, res) {
  res.sendFile(path.join(targetDir, "index.html"));
});

app.post("/syncNote", urlencodedParser, function(req, res) {
  if (req.body.password == "123456") {
    //执行同步操作
    //构建笔记html
    console.log("开始构建笔记--------------");
    var output = build.startToBuild(
      gitUrl,
      srcDir,
      targetDir,
      staticPath,
      false
    ); //不删除原生成的笔记html

    if (output.flag) {
      res.send({ flag: 1, data: "" }); //成功
    } else {
      res.send({ flag: 0, data: output.data }); //失败(报错)
    }
  } else {
    res.send({ flag: 0, data: "同步密码错误" }); //失败
  }
});

//添加一个每天凌晨定时拉去更新笔记的功能
//每天凌晨4点钟执行
schedule.scheduleJob("0 0 4 * * *", function() {
  console.log("定时任务开始构建笔记--------------");
  var output = build.startToBuild(gitUrl, srcDir, targetDir, staticPath);

  if (output.flag) {
    console.log("定时任务构建笔记成功!");
  } else {
    console.log("定时任务构建笔记失败:" + output.data);
  }
});
