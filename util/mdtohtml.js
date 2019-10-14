const marked = require("marked"); //markdown解析
const fs = require("fs");
const path = require("path");
const highlight = require("highlight.js"); //代码高亮
const minify = require("html-minifier").minify; //文本压缩
const mapDirUtil = require("./mapdirutil"); //遍历文件夹的工具类
const fileUtil = require("./fileutil"); //文件工具类

const renderer = new marked.Renderer(); //创建markdown渲染对象

//渲染a标签时的回调
renderer.link = function(href, title, text) {
  href = href.replace(".md", ".html"); //将.md结尾的链接转换成.html结尾的
  return `<a target="_blank" href="${href}">${text}</a>`;
};

//渲染h1-h6标签时的回调
renderer.heading = function(text, level) {
  var titleId = Math.random()
    .toString()
    .substr(3, 15);
  //如果标题中有a标签,则将a标签放到h标签的下面
  if (text.indexOf("<a") != -1) {
    var url = text.match('href=.*">')[0];
    url = url.substring(6, url.length - 2).replace(".md", ".html");
    var str = text.match(">.*<")[0];
    text = str.substring(1, str.length - 1);
    //暂存标签,用于生成大纲
    titleList.push({
      level: level,
      text: text,
      id: titleId
    });
    return `<h${level} id="${titleId}"><a target="_blank" href="${url}">${text}</a></h${level}>`;
  }

  //暂存标签,用于生成大纲
  titleList.push({
    level: level,
    text: text,
    id: titleId
  });

  return `<h${level} id="${titleId}">${text}</h${level}>`;
};

//设置markdown解析
marked.setOptions({
  renderer: new marked.Renderer(),
  highlight: function(code, language) {
    var html = undefined;
    try {
      html = highlight.highlight(language, code).value;
    } catch (err) {
      //如果不支持某些语言报错,则使用java语法进行转化
      html = highlight.highlight("java", code).value;
    }
    return html;
  },
  pedantic: false,
  gfm: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false
});

var tempalte = ""; //模板内容
var noteData = {}; //存放note的原数据
var titleList = []; //暂存h1-h6标签的内容
var dirHtml = ""; //目录的html结构

exports.startToBuild = function(srcDir, targetDir, staticPath) {
  // 同步读取 模板内容
  tempalte = fs
    .readFileSync(path.join(__dirname, "..", "/html/template.html"))
    .toString();

  //获取目录的html结构
  dirHtml = fileUtil.getDirHtml(srcDir, targetDir, staticPath);

  //遍历原笔记目录
  mapDirUtil.mapDirSync(
    srcDir, //src路径
    "./", //当前目录(生成文件的相对路径)
    function(srcDir, relativePath, filename) {
      //文件回调
      // console.log(srcDir, relativePath, filename);

      //如果不是.md文件,则直接进行复制
      if (!(filename.indexOf(".md") != -1)) {
        fileUtil.cp(
          path.join(srcDir, relativePath),
          path.join(targetDir, relativePath)
        );
        return;
      }

      //读取原文件并缓存
      var noteStr = fs.readFileSync(path.join(srcDir, relativePath)).toString();
      noteData[path.join(srcDir, relativePath)] = noteStr;

      //解析文件并生成html
      var noteHtml = marked(noteStr, { renderer: renderer });
      //生成toc目录
      var tocObj = fileUtil.getTocHtml(titleList);

      //进行模板的参数替换
      var html = tempalte;
      if (noteHtml.indexOf("[TOC]") != -1) {
        //替换[TOC]
        noteHtml = noteHtml.replace("[TOC]", "");
        //替换toc目录
        html = html.replace("#{top-toc}", tocObj.html);
      } else {
        //替换toc目录
        html = html.replace("#{top-toc}", ""); //清空toc标记为
      }

      html = html
        //SEO优化
        .replace(new RegExp("#{title}", "gm"), filename) //替换所有的title
        .replace("#{description}", tocObj.str) //标题的拼接作为描述

        //内容替换
        .replace(new RegExp("#{staticPath}", "gm"), staticPath)
        .replace("#{sidebar-toc}", tocObj.html)
        .replace("#{sidebar-file}", dirHtml)
        .replace("#{body}", noteHtml);

      //生成html
      var targetFile = path
        .join(targetDir, relativePath)
        .replace(".md", ".html");

      try {
        fs.writeFileSync(
          targetFile,
          html
          // minify(html, {
          //   removeComments: true,
          //   collapseWhitespace: true,
          //   minifyJS: true,
          //   minifyCSS: true
          // }) //开启文本压缩
        );
      } catch (err) {
        console.log("html文件写入失败:" + err);
      }

      //清空数据
      titleList = [];
      noteHtml = "";
      tocHtml = "";
    },
    function(srcDir, relativePath, filename) {
      //目录回调(返回false则该目录不继续遍历)
      // console.log(srcDir, relativePath, filename);

      //在target目录下生成对应的文件夹
      fileUtil.mkdir(path.join(targetDir, relativePath));
    }
  );

  //生成index.html
  buildIndexHtml(srcDir, targetDir, dirHtml, staticPath);
};

//构建并生成对应的index.html
function buildIndexHtml(srcDir, targetDir, dirHtml, staticPath) {
  var template = fs.readFileSync(path.join(".", "/html/index.html")).toString();

  var noteStr = "";
  var noteHtml = "";
  if (fs.existsSync(path.join(srcDir, "/README.md"))) {
    //读取readme.md文件
    noteStr = fs.readFileSync(path.join(srcDir, "/README.md")).toString();
    //解析文件并生成html
    noteHtml = marked(noteStr, { renderer: renderer });
  }

  //进行模板的参数替换
  var indexHtml = template
    .replace(new RegExp("#{staticPath}", "gm"), staticPath)
    .replace("#{sidebar-file}", dirHtml)
    .replace("#{body}", noteHtml);

  try {
    fs.writeFileSync(
      path.join(targetDir, "index.html"),
      indexHtml
      // minify(indexHtml, {
      //   removeComments: true,
      //   collapseWhitespace: true,
      //   minifyJS: true,
      //   minifyCSS: true
      // })
    ); //开启文本压缩
  } catch (err) {
    console.log("html文件写入失败:" + err);
  }
}
