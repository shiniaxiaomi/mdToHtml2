var express = require("express"); //导入express模块
var bodyParser = require("body-parser");
// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var app = express(); //获取app对象
const path = require("path");
const build = require("./build"); //获取构建对象

//git网址
// var gitUrl = "https://github.com/shiniaxiaomi/mdToHtml.git";
var gitUrl = "https://github.com/shiniaxiaomi/note.git";
//原笔记存放路径
var srcDir = "/note";
//html生成路径
var targetDir = "/html";
//静态资源路径
var staticPath = "http://luyingjie.cn";

//构建笔记html
var buildOutput = build.startToBuild(gitUrl, srcDir, targetDir, staticPath);
if (buildOutput.flag == false) {
  //如果报错,则打印日志
  console.log(buildOutput.data);
}

//设置静态资源路径(将html生成路径设置为静态资源路径)
app.use("", express.static(targetDir));

//启动server并监听再8081端口
var server = app.listen(8081, function() {
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
    var output = build.startToBuild(gitUrl, srcDir, targetDir, staticPath);

    if (output.flag) {
      res.send({ flag: 1, data: "" }); //成功
    } else {
      res.send({ flag: 0, data: output.data }); //失败(报错)
    }
  } else {
    res.send({ flag: 0, data: "同步密码错误" }); //失败
  }
});
