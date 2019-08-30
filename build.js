//git网址
var gitUrl = "https://github.com/shiniaxiaomi/mdToHtml.git";
//原笔记存放路径
var srcDir = "C:\\Users\\Administrator\\Desktop\\buff";
//html生成路径
var targetDir = "C:\\Users\\Administrator\\Desktop";

const path = require("path");
const fileUtil = require("./util/fileutil"); //获取文件工具
const gitUtil = require("./util/gitutil"); //获取git工具

//git clone笔记
gitUtil.gitclone(gitUrl, srcDir);

// 删除目标路径下的所有文件
fileUtil.rm(targetDir);

// 复制css和js到目标路径下
fileUtil.cp(path.join(srcDir, "css"), path.join(targetDir, "css"));

// 同步读取 模板内容
// 同步读取 目录结构
// 同步读取 笔记的所有内容并缓存
// 构建html笔记(包括index.html)
