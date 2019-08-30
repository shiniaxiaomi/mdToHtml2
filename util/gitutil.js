const shell = require("shelljs");

//git clone操作,如果srcDir没传,默认为当前文件夹
exports.gitclone = function(gitUrl, srcDir) {
  //进入到srcDir目录下,将github上笔记了克隆到源目录下
  var gitExe = shell.exec(
    "git clone " + gitUrl + " " + srcDir == undefined ? "./" : srcDir,
    {
      silent: true
    }
  );
  if (gitExe.code != 0) {
    console.log(
      "git clone failed: (" +
        gitExe.stderr.replace(/[\r\n]/g, "") +
        ") ---time:" +
        new Date().toLocaleString()
    );
    return; //如果克隆失败,则终止
  } else {
    console.log(
      "git clone success!" + " ---time:" + new Date().toLocaleString()
    );
  }
};
