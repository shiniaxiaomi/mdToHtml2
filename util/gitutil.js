const shell = require("shelljs");
const fs = require("fs");
const path = require("path");

//git clone操作
function gitclone(gitUrl, srcDir) {
  //进入到srcDir目录下,将github上笔记了克隆到源目录下
  srcDir = srcDir == undefined ? "./" : srcDir;
  var gitExe = shell.exec("git clone " + gitUrl + " " + srcDir, {
    silent: true
  });
  if (gitExe.code != 0) {
    console.log(
      "git clone failed: (" +
        gitExe.stderr +
        ") ---time:" +
        new Date().toLocaleString()
    );
    shell.exit(); //终止程序
  } else {
    console.log(
      "git clone success!" + " ---time:" + new Date().toLocaleString()
    );
  }
}

// git pull操作
function gitpull(srcDir) {
  var gitExe = shell.exec("cd " + srcDir + " && git pull ", {
    silent: true
  });
  if (gitExe.code != 0) {
    console.log(
      "git pull failed: (" +
        gitExe.stderr +
        ") ---time:" +
        new Date().toLocaleString()
    );
    shell.exit(); //终止程序
  } else {
    console.log(
      "git pull success!" + " ---time:" + new Date().toLocaleString()
    );
  }
}

// git clone操作,如果srcDir没传,默认为当前文件夹
exports.gitAction = function(gitUrl, srcDir) {
  //如果目录不存在,则创建(表示还没有clone)
  if (srcDir != undefined && !fs.existsSync(srcDir)) {
    shell.mkdir(srcDir);
    gitclone(gitUrl, srcDir);
  } else {
    //如果目录存在,判断是否有.git文件夹
    if (fs.existsSync(path.join(srcDir, ".git"))) {
      //执行git pull命令
      gitpull(srcDir);
    } else {
      gitclone(gitUrl, srcDir);
    }
  }
};
