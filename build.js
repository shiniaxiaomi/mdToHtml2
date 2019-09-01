const path = require("path");
const fileUtil = require("./util/fileutil"); //获取文件工具
const gitUtil = require("./util/gitutil"); //获取git工具
const mdToHtml = require("./util/mdtohtml"); //获取md构建工具

exports.startToBuild = function(gitUrl, srcDir, targetDir, staticPath) {
  try {
    //git clone笔记
    // gitUtil.gitAction(gitUrl, srcDir);

    // 删除目标路径下的所有文件
    fileUtil.rm(targetDir);

    //开始构建并生成html
    mdToHtml.startToBuild(srcDir, targetDir, staticPath);

    // 将当前项目下的css和js复制到目标路径下
    fileUtil.cp(path.join("./", "css"), path.join(targetDir, "css"));
    fileUtil.cp(path.join("./", "js"), path.join(targetDir, "js"));
  } catch (err) {
    return {
      flag: false,
      data: err
    };
  }
  return {
    flag: true,
    data: ""
  };
};
