const marked = require("marked"); //markdown解析
const fs = require("fs");
const path = require("path");
const highlight = require("highlight.js"); //代码高亮
const minify = require("html-minifier").minify; //文本压缩
const mapDirUtil = require("./mapdirutil"); //遍历文件夹的工具类
const fileUtil = require("./fileutil"); //文件工具类

const varUtil = require("./varUtil"); //获取到公共变量
const templateUtil=require("./templateutil"); //获取模板工具类

const renderer = new marked.Renderer(); //创建markdown渲染对象

var h1_times = 0;
var h2_times = 0;
var h3_times = 0;
var h4_times = 0;
var h5_times = 0;
var h6_times = 0;

//完成一篇文章的解析后标题的次数清零
function cleanTitleTimes() {
  h1_times = 0;
  h2_times = 0;
  h3_times = 0;
  h4_times = 0;
  h5_times = 0;
  h6_times = 0;
}

//渲染a标签时的回调
renderer.link = function(href, title, text) {
  //如果是笔记链接
  if (href.indexOf(".md") != -1) {
    href = href.replace("D:\\note", ""); //将本地的笔记链接转换成url链接
    href = href.replace(".md", ".html"); //将.md结尾的链接转换成.html结尾的
    return `<a href="${href}">${text}</a>`; //在本窗口打开
  }

  return `<a target="_blank" href="${href}">${text}</a>`; //在新标签页打开
};

renderer.image = function(href, title, text) {
  var imgHref = href.match(".img.*");
  //判空,防止链接错误导致html构建失败,增加了代码的健壮性
  if (imgHref != null) {
    href = imgHref[0].match(".img.*")[0].substring(5); //将图片的绝对路径转化为相对路径
  }
  return `<img src="${varUtil.staticPath}/css/loading.gif" buff='${varUtil.staticPath}/.img/${href}'/>`;
};

//渲染表格时在外面套一层div,可以为其设置超过宽度时滚动
renderer.table = function(header, body) {
  return `<div class='myTable'><table>${header}${body}</table></div>`;
};

//渲染h1-h6标签时的回调
renderer.heading = function(text, level) {
  //记录序号
  switch (level) {
    case 1:
      h1_times++;
      h2_times = 0;
      h3_times = 0;
      h4_times = 0;
      h5_times = 0;
      h6_times = 0;
      break;
    case 2:
      h2_times++;
      h3_times = 0;
      h4_times = 0;
      h5_times = 0;
      h6_times = 0;
      break;
    case 3:
      h3_times++;
      h4_times = 0;
      h5_times = 0;
      h6_times = 0;
      break;
    case 4:
      h4_times++;
      h5_times = 0;
      h6_times = 0;
      break;
    case 5:
      h5_times++;
      break;
    case 6:
      h6_times++;
      break;
  }
  
  var titleId="";
  titleId = h1_times != 0 ? h1_times + "." : "";
  titleId += h2_times != 0 ? h2_times + "." : "";
  titleId += h3_times != 0 ? h3_times + "." : "";
  titleId += h4_times != 0 ? h4_times + "." : "";
  titleId += h5_times != 0 ? h5_times + "." : "";
  titleId += h6_times != 0 ? h6_times + "." : "";

  //如果标题中有a标签,则将a标签放到h标签的下面
  if (text.indexOf("<a") != -1) {
    var url = text.match('href=.*">')[0];
    url = url.substring(6, url.length - 2).replace(".md", ".html");
    var str = text.match(">.*<")[0];
    text = str.substring(1, str.length - 1);
    //序号加上标题
    titleId+=text;
    //暂存标签,用于生成大纲
    titleList.push({
      level: level,
      text: text,
      id: titleId
    });
    return `<h${level} id="${titleId}"><a target="_blank" href="${url}">${text}</a></h${level}>`;
  }else{
    //序号加上标题
    titleId+=text;
    //暂存标签,用于生成大纲
    titleList.push({
      level: level,
      text: text,
      id: titleId
    });
    return `<h${level} id="${titleId}">${text}</h${level}>`;
  }
  
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

var noteData = {}; //存放note的原数据
var titleList = []; //暂存h1-h6标签的内容
var dirHtml = ""; //目录的html结构

var contextTemplate=fs.readFileSync(path.join(__dirname, "..", "/html/template.html")).toString();//读取内容模板字符串
var indexTemplate=fs.readFileSync(path.join(".", "/html/index.html")).toString()//读取index模板字符串

var contextTemplateArr=templateUtil.analysisTemplate(contextTemplate);//通过内容模板生成内容模板数组
var indexTempalteArr=templateUtil.analysisTemplate(indexTemplate);//通过index模板生成index模板数组

exports.startToBuild = function(srcDir, targetDir, staticPath) {

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
      cleanTitleTimes(); //完成一篇解析后标题次数清零
      //生成toc目录
      var tocObj = fileUtil.getTocHtml(titleList);
      noteHtml = noteHtml.replace("[TOC]", "");//清空toc标记

      //SEO优化
      templateUtil.replaceWithTemplate(contextTemplateArr,"title",filename.replace(".md",""));//替换所有的title
      templateUtil.replaceWithTemplate(contextTemplateArr,"description",tocObj.str);//标题的拼接作为描述
      //内容替换
      templateUtil.replaceWithTemplate(contextTemplateArr,"staticPath",varUtil.staticPath);
      templateUtil.replaceWithTemplate(contextTemplateArr,"notePath",path.join(varUtil.noteSavePath+"/note", relativePath).replace(/\\/g,"/"));//替换本地的note绝对路径(D:/note/xxx.md)
      templateUtil.replaceWithTemplate(contextTemplateArr,"sidebar-toc",tocObj.html);
      templateUtil.replaceWithTemplate(contextTemplateArr,"sidebar-file",dirHtml);
      templateUtil.replaceWithTemplate(contextTemplateArr,"body",noteHtml);
      templateUtil.replaceWithTemplate(contextTemplateArr,"top-toc",tocObj.html);//替换toc目录
      
      //生成html
      var html=templateUtil.buildTemplateArrToHtml(contextTemplateArr);
      try {
        fs.writeFile(path.join(targetDir, relativePath).replace(".md", ".html"),html,function(){});
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

//采用异步的方式构建并生成对应的index.html
function buildIndexHtml(srcDir, targetDir, dirHtml, staticPath) {
  var noteStr = "";
  var noteHtml = "";
  //判断文件是否存在
  fs.access(path.join(srcDir, "/README.md"), fs.constants.F_OK, (err) => {
    if(err) return;
    //读取readme.md文件
    fs.readFile(path.join(srcDir, "/README.md"), (err, data) => {
      if (err) return;
      noteStr=data.toString();
      //解析文件并生成html
      noteHtml = marked(noteStr, { renderer: renderer });
      //进行参数替换
      templateUtil.replaceWithTemplate(indexTempalteArr,"staticPath",staticPath);
      templateUtil.replaceWithTemplate(indexTempalteArr,"notePath",path.join(varUtil.noteSavePath+"/note", "/README.md").replace(/\\/g,"/"));
      templateUtil.replaceWithTemplate(indexTempalteArr,"sidebar-file",dirHtml);
      templateUtil.replaceWithTemplate(indexTempalteArr,"body",noteHtml);
      templateUtil.replaceWithTemplate(indexTempalteArr,"toc-detail",varUtil.dirDetailHtml);

      //生成html
      var indexHtml=templateUtil.buildTemplateArrToHtml(indexTempalteArr);
      fs.writeFile(path.join(targetDir, "index.html"), indexHtml, (err) => {
        if (err) {
          console.log("html文件写入失败:" + err);
        }
      });
    });
  });
}
