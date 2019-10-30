const path = require("path");
const fileUtil = require("./util/fileutil"); //获取文件工具
const gitUtil = require("./util/gitutil"); //获取git工具
const mdToHtml = require("./util/mdtohtml"); //获取md构建工具

const varUtil= require("./util/varUtil")

exports.startToBuild = function(
  gitUrl,
  srcDir,
  targetDir,
  staticPath,
  isRemoveDirFlag,
  isNeedClone
) {
  try {
    varUtil.logTime("开始克隆");
    //git clone笔记
    if(isNeedClone){
      gitUtil.gitAction(gitUrl, srcDir);
    }

    // 删除目标路径下的所有文件
    varUtil.logTime("删除文件");
    if (isRemoveDirFlag == true) {
      fileUtil.rm(targetDir);
    }

    varUtil.logTime("构建开始");

    //开始构建并生成html
    mdToHtml.startToBuild(srcDir, targetDir, staticPath);

    varUtil.logTime("构建结束");

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
