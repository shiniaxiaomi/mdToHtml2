const fs = require("fs");
const shell = require("shelljs");
const path = require("path");
const mapDirUtil = require("./mapdirutil");

//获取目录的html
function getDirHtml(srcDir, targetDir) {
  var dirData = getDirData(srcDir, targetDir);
  var dirHtml = "";
  buildDirDataToHtml(dirData, dirHtml);
  return dirHtml;
}

//构建html
function buildDirDataToHtml(dirData, dirHtml) {
  if (dirData.isDir) {
    if (dirData.children.length == 0) {
      dirHtml +=
        "<li><a class='folder' href='#'><i class='iconfont icon-folder'></i><div>" +
        dirData.name +
        "</div></a></li>";
    } else {
      if (dirData.name == "总文件") {
        dirData.children.map(item => {
          buildDirDataToHtml(item, dirHtml);
        });
      } else {
        dirHtml +=
          "<li><a class='folder' href='#'><i class='iconfont icon-down'></i><i class='iconfont icon-folder'></i><div>" +
          dirData.name +
          "</div></a></li><ul>";
        dirData.children.map(item => {
          buildDirDataToHtml(item, dirHtml);
        });
        dirHtml += "</ul>";
      }
    }
  } else {
    //文件
    dirHtml +=
      "<li></i><a href='" +
      dirData.link +
      "'><i class='iconfont icon-file'></i><div>" +
      dirData.name +
      "</div></a></li>";
  }
}

//获取dirData对象
function getDirData(srcDir, targetDir) {
  //保存目录信息
  var dirData = {
    isDir: true,
    name: "总目录",
    link: "",
    children: []
  };

  //生成目录信息
  mapDirUtil.mapDirSync(
    srcDir, //src路径
    "./", //当前目录(生成文件的相对路径)
    function(srcDir, relativePath, filename) {
      //生成目录数据
      dirData.push({
        isDir: false,
        name: filename,
        children: [],
        link: path.join(targetDir, relativePath).replace(".md", ".html")
      });
    },
    function(srcDir, relativePath, filename) {
      //生成目录数据
      dirData.push({
        isDir: true,
        name: filename,
        children: []
      });
    }
  );

  //调整dir的目录结构,将文件夹排在最上面
  var buff = {
    isDir: true,
    name: "总目录",
    children: []
  };
  buff.children.push({
    isDir: false,
    name: "首页",
    link: path.join(targetDir, "index.html")
  });
  dirData.children.map(item => {
    //文件夹
    if (item.isDir) {
      buff.children.push(item);
    }
  });
  dirData.children.map(item => {
    //文件
    if (!item.isDir) {
      buff.children.push(item);
    }
  });

  return buff;
}

//删除目录
exports.rm = function(dir) {
  if (!fs.existsSync(dir)) {
    console.log("删除的源文件夹:" + dir + "不存在!");
    return;
  }
  shell.rm("-rf", dir); //强制递归删除目录
};

//复制目录
exports.cp = function(srcDir, targetDir) {
  if (!fs.existsSync(srcDir)) {
    console.log("复制的源文件夹:" + srcDir + "不存在!");
    return;
  }
  shell.cp("-R", srcDir, targetDir); //递归复制文件夹
};

//获取目录的html结构
exports.getDirHtml = function(srcDir, targetDir) {
  return getDirHtml(srcDir, targetDir);
};
