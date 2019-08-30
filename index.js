var express = require("express"); //导入express模块
var app = express(); //获取app对象
const path = require("path");

//git网址
var gitUrl = "https://github.com/shiniaxiaomi/mdToHtml.git";
//原笔记存放路径
var srcDir = "C:\\Users\\Administrator\\Desktop\\buff";
//html生成路径
var targetDir = "C:\\Users\\Administrator\\Desktop";

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
