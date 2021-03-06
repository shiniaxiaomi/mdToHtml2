const fs = require("fs");
const shell = require("shelljs");
const path = require("path");
const mapDirUtil = require("./mapdirutil");
const minify = require("html-minifier").minify; //文本压缩
const varUtil=require("./varUtil.js");

//将dirData树状对象转化为Blog数组
function dirDataToBlogArr(dirData){
  if(dirData.isDir==false){
    varUtil.blogArr.push(dirData);
    return;
  }

  for(var i=0;i<dirData.children.length;i++){
    dirDataToBlogArr(dirData.children[i])
  }
}

//获取目录的html
function getDirHtml(srcDir, targetDir, staticPath) {
  var dirData = getDirData(srcDir, targetDir, staticPath);//获取dirData树状对象
  dirDataToBlogArr(dirData);//将dirData树状对象转化为Blog数组并保存起来,供查询使用
  var dirHtml = { str: "" };
  var dirDetailHtml = { str: "" };
  buildDirDataToHtml(dirData, dirHtml);//生成文件树状目录的html
  buildDirDataToDetailHtml(dirData,dirDetailHtml);//生成文件树状展开目录的html
  varUtil.dirDetailHtml=dirDetailHtml.str;//保存dirDetailHtml为全局变量
  return dirHtml.str;
}

//构建文件树状目录的html
function buildDirDataToHtml(dirData, dirHtml) {
  if (dirData.isDir) {
    if (dirData.children.length == 0) {
      dirHtml.str +=
        "<li><a class='folder' href='javascript:void(0);'><i class='iconfont icon-folder'></i><div>" +
        dirData.name +
        "</div></a></li>";
    } else {
      if (dirData.name == "总目录") {
        dirData.children.map(item => {
          buildDirDataToHtml(item, dirHtml);
        });
      } else {
        dirHtml.str +=
          "<li><a class='folder' href='javascript:void(0);'><i class='iconfont icon-down'></i><i class='iconfont icon-folder'></i><div>" +
          dirData.name +
          "</div></a><ul>";
        dirData.children.map(item => {
          buildDirDataToHtml(item, dirHtml);
        });
        dirHtml.str += "</ul></li>";
      }
    }
  } else {
    //文件
    dirHtml.str +=
      "<li></i><a href='" +
      dirData.link +
      "'><i class='iconfont icon-file'></i><div>" +
      dirData.name +
      "</div></a></li>";
  }
}

//构建文件树状展开目录的html
function buildDirDataToDetailHtml(dirData, dirHtml) {
  if (dirData.isDir) {
    if (dirData.children.length == 0) {
      dirHtml.str +=
        "<li><a href='javascript:void(0);'><span>" +
        dirData.name +
        "</span></a></li>";
    } else {
      //文件夹
      if (dirData.name == "总目录") {
        dirData.children.map(item => {
          buildDirDataToDetailHtml(item, dirHtml);
        });
      } else {
        dirHtml.str +=
          "<li><a style='cursor:default;' href='javascript:void(0);'><span><i class='iconfont icon-folder'></i>" +
          dirData.name +
          "</span></a><ul>";
        dirData.children.map(item => {
          buildDirDataToDetailHtml(item, dirHtml);
        });
        dirHtml.str += "</ul></li>";
      }
    }
  } else {
    //文件
    dirHtml.str +=
      "<li></i><a href='" +
      dirData.link +
      "'><span><i class='iconfont icon-file'></i>" +
      dirData.name +
      "</span></a></li>";
  }
}

//获取dirData对象
function getDirData(srcDir, targetDir, staticPath) {
  //保存目录信息
  var dirData = {
    isDir: true,
    name: "总目录",
    link: "",
    children: []
  };

  //生成目录结构数据到dirData中
  _getDirData(srcDir, targetDir, "", dirData, staticPath);

  //调整dir的目录结构,将文件夹排在最上面
  var buff = {
    isDir: true,
    name: "总目录",
    children: []
  };
  buff.children.push({
    isDir: false,
    name: "首页",
    link: staticPath + "/" + path.join("index.html")
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

function _getDirData(srcDir, targetDir, relativePath, dirData, staticPath) {
  var files = fs.readdirSync(path.join(srcDir, relativePath));
  files.map(item => {
    var buff = relativePath; //暂存原来的相对路径
    relativePath = path.join(relativePath, item); //更新相对路径
    var stat = fs.statSync(path.join(srcDir, relativePath));
    if (stat.isDirectory()) {
      //是文件夹则继续遍历
      // 排除.git仓库目录
      if (item == ".git" || item == ".img") {
        relativePath = buff; //恢复原来的相对路径
        return;
      }
      var dirBuff = {
        isDir: true,
        name: item,
        link: staticPath + "/" + path.join(relativePath),
        children: []
      };
      dirData.children.push(dirBuff);
      _getDirData(srcDir, targetDir, relativePath, dirBuff, staticPath);

      DirUp(dirData); //如果dirBuff是文件夹,那么dirData(dirBuff的上一级)必将要做文件夹调整(置顶)
    } else {
      //排除.gitignore和note.dat文件
      if (item.indexOf(".gitignore") != -1 || item.indexOf("note.bat") != -1 ||  item.indexOf("README.md") != -1) {
        relativePath = buff; //恢复原来的相对路径
        return;
      }
      dirData.children.push({
        isDir: false,
        name: item.replace(".md",""),//去掉.md的后缀
        link: staticPath + "/" + path.join(relativePath).replace(".md", ".html")
      });
    }
    relativePath = buff; //恢复原来的相对路径
  });
}

//调整文件夹位置到顶部
function DirUp(dirBuff) {
  var buff = [];
  dirBuff.children.map(item => {
    //文件夹
    if (item.isDir) {
      buff.push(item);
    }
  });
  dirBuff.children.map(item => {
    //不是文件夹
    if (!item.isDir) {
      buff.push(item);
    }
  });
  dirBuff.children = [];
  for (var i = 0; i < buff.length; i++) {
    dirBuff.children.push(buff[i]);
  }
}

//构建toc目录对象
function buildTocObj(titleData, start, end, level, srcData) {
  for (var i = start; i < end; i++) {
    if (srcData[i].level == level) {
      var titleBuff = {
        level: srcData[i].level,
        text: srcData[i].text,
        id: srcData[i].id,
        children: []
      };
      titleData.children.push(titleBuff);
      for (var j = i + 1; j < srcData.length; j++) {
        if (srcData[j].level == level || j == srcData.length - 1) {
          buildTocObj(titleBuff, i, j, level + 1, srcData);
          break;
        }
      }
    }
  }
}

//构建并生成toc目录Html
function buildTocHtml(titleData, titleObj) {
  if (titleData.children.length == 0) {
    titleObj.html +=
      `<li><a href="#` + titleData.id + `">` + titleData.text + `</a></li>`;
    titleObj.str += titleData.text + ",";
    return;
  }

  if (titleData.level != -1) {
    titleObj.html +=
      `<li><a href="#` + titleData.id + `">` + titleData.text + `</a><ul>`;
    titleObj.str += titleData.text + ",";
  }

  titleData.children.map(item => {
    buildTocHtml(item, titleObj);
  });
  if (titleData.level != -1) {
    titleObj.html += `</ul></li>`;
  }
}

//构建并生成toc目录的html数据
exports.getTocHtml = function(srcData) {
  if (srcData.length == 0) {
    return "";
  }
  var titleData = {
    level: -1,
    id: Math.random()
      .toString()
      .substr(3, 15),
    children: []
  };
  buildTocObj(titleData, 0, srcData.length, 1, srcData);
  var titleObj = {
    html: "",
    str: ""
  };
  buildTocHtml(titleData, titleObj);
  return titleObj;
};

//删除目录
exports.rm = function(dir) {
  if (!fs.existsSync(dir)) {
    console.log("删除的源文件夹:" + dir + "不存在!");
    return;
  }
  shell.rm("-rf", dir); //强制递归删除目录
  shell.mkdir(dir); //创建原目录文件夹
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
exports.getDirHtml = function(srcDir, targetDir, staticPath) {
  return getDirHtml(srcDir, targetDir, staticPath);
};

//构建并生成index.html
// exports.buildIndexHtml = function(srcDir, targetDir, dirHtml, staticPath,renderer) {
//   buildIndexHtml(srcDir, targetDir, dirHtml, staticPath,renderer);
// };

//递归创建目录
exports.mkdir = function(dir) {
  shell.mkdir("-p", dir);
};
