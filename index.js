var express = require("express"); //导入express模块
var bodyParser = require("body-parser");
var schedule = require("node-schedule"); //导入定时任务模块
// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var app = express(); //获取app对象
const path = require("path");
const build = require("./build"); //获取构建对象

const varUtil=require("./util/varUtil"); //获取到公共变量

varUtil.logTime();//打印时间


//构建笔记html
var buildOutput = build.startToBuild(
  varUtil.gitUrl,
  varUtil.srcDir,
  varUtil.targetDir,
  varUtil.staticPath,
  true,
  varUtil.isNeedClone
); //删除原生成的笔记html
if (buildOutput.flag == false) {
  //如果报错,则打印日志
  console.log(buildOutput.data);
}

//设置静态资源路径(将html生成路径设置为静态资源路径)
app.use("", express.static(varUtil.targetDir));

//启动server并监听再80端口
var server = app.listen(7999, function() {
  varUtil.logTime("应用实例启动成功")
});

//当'/'请求时返回首页
app.get("/", function(req, res) {
  res.sendFile(path.join(varUtil.targetDir, "index.html"));
});

//当'/search/java'搜索java关键字时
app.get("/search/:blog", function(req, res) {

  var blogName=req.params.blog.trim().toLowerCase();//转化成小写
  var resultBlog=undefined;//保存匹配度最高的blog对象
  for(var i=0;i<varUtil.blogArr.length;i++){
    if(varUtil.blogArr[i].name.toLowerCase().indexOf(blogName)!=-1){
      if(resultBlog==undefined){
        resultBlog=varUtil.blogArr[i];
      }else{
        //匹配规则,关键词占比越高的返回
        if(varUtil.blogArr[i].name.length<resultBlog.name.length){
          resultBlog=varUtil.blogArr[i];
        }
      }
    }
  }
  if(resultBlog==undefined){
    res.sendFile(path.join(varUtil.targetDir, "index.html"));//如果没有找到,则返回首页
  }else{
    res.redirect(resultBlog.link);//重定向到搜索到的blog链接
  }
});

//当'/getJson/java'搜索java关键字时
app.get("/getJson/:blog", function(req, res) {

  var blogName=req.params.blog.trim().toLowerCase();//转化成小写
  // var resultBlog=undefined;//保存匹配度最高的blog对象
  var AlfredJson={
    "items": []
  }
  var item={
      "uid": "",
      "type": "url",
      "title": "",
      "subtitle": "",
      "arg": "",
      "autocomplete": "",
      "icon": {
          "type": "",
          "path": ""
      }
  }

  for(var i=0;i<varUtil.blogArr.length;i++){
    if(varUtil.blogArr[i].name.toLowerCase().indexOf(blogName)!=-1){
      var buff =JSON.parse(JSON.stringify(item));
      buff.uid=varUtil.blogArr[i].name;
      buff.title=varUtil.blogArr[i].name;
      buff.subtitle=varUtil.blogArr[i].link;
      buff.arg=varUtil.blogArr[i].link;
      AlfredJson.items.push(buff);
    }
  }

  
  res.json(AlfredJson);//返回json对象

});

app.post("/syncNote", urlencodedParser, function(req, res) {
  if (req.body.password == "123456") {
    //执行同步操作
    //构建笔记html
    console.log("同步按钮: 开始构建笔记--------------");
    varUtil.blogArr=[];//在构建之前，将原来缓存的数据清空
    var output = build.startToBuild(
      varUtil.gitUrl,
      varUtil.srcDir,
      varUtil.targetDir,
      varUtil.staticPath,
      false,
      true //允许clone
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
  console.log(getDate() + " 定时任务开始构建笔记--------------");
  varUtil.blogArr=[];//在构建之前，将原来缓存的数据清空
  var output = build.startToBuild(
    varUtil.gitUrl,
    varUtil.srcDir,
    varUtil.targetDir,
    varUtil.staticPath,
    true, //删除原来的笔记生成的html的内容,重新构建
    true //允许克隆
  );

  if (output.flag) {
    console.log(getDate() + " 定时任务构建笔记成功!");
  } else {
    console.log(getDate() + " 定时任务构建笔记失败:" + output.data);
  }
});

function getDate() {
  var date = new Date();
  var str = "";
  str +=
    date.getFullYear() +
    "/" +
    date.getMonth() +
    "/" +
    date.getDate() +
    " " +
    date.getHours() +
    ":" +
    date.getMinutes() +
    ":" +
    date.getSeconds();

  console.log(str);
  return str;
}
