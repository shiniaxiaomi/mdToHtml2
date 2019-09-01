const fs = require("fs");
const shell = require("shelljs");
const path = require("path");
const mapDirUtil = require("./mapdirutil");
const minify = require("html-minifier").minify; //文本压缩

//构建并生成对应的index.html
function buildIndexHtml(srcDir, targetDir, dirHtml, staticPath) {
  var template = fs.readFileSync(path.join(".", "/html/index.html")).toString();
  //进行模板的参数替换
  var indexHtml = template
    .replace(new RegExp("#{staticPath}", "gm"), staticPath)
    .replace("#{sidebar-file}", dirHtml);

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
    console.log("html文本压缩错误:" + err);
  }
}

//获取目录的html
function getDirHtml(srcDir, targetDir, staticPath) {
  var dirData = getDirData(srcDir, targetDir, staticPath);
  var dirHtml = { str: "" };
  buildDirDataToHtml(dirData, dirHtml);
  return dirHtml.str;
}

//构建html
function buildDirDataToHtml(dirData, dirHtml) {
  if (dirData.isDir) {
    if (dirData.children.length == 0) {
      dirHtml.str +=
        "<li><a class='folder' href='#'><i class='iconfont icon-folder'></i><div>" +
        dirData.name +
        "</div></a></li>";
    } else {
      if (dirData.name == "总目录") {
        dirData.children.map(item => {
          buildDirDataToHtml(item, dirHtml);
        });
      } else {
        dirHtml.str +=
          "<li><a class='folder' href='#'><i class='iconfont icon-down'></i><i class='iconfont icon-folder'></i><div>" +
          dirData.name +
          "</div></a></li><ul>";
        dirData.children.map(item => {
          buildDirDataToHtml(item, dirHtml);
        });
        dirHtml.str += "</ul>";
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
    } else {
      dirData.children.push({
        isDir: false,
        name: item,
        link: staticPath + "/" + path.join(relativePath).replace(".md", ".html")
      });
    }
    relativePath = buff; //恢复原来的相对路径
  });
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
function buildTocHtml(titleData, titleHtml) {
  if (titleData.children.length == 0) {
    titleHtml.str +=
      `<li><a href="#` + titleData.id + `">` + titleData.text + `</a></li>`;
    return;
  }

  if (titleData.level != -1) {
    titleHtml.str +=
      `<li><a href="#` + titleData.id + `">` + titleData.text + `</a></li><ul>`;
  }

  titleData.children.map(item => {
    buildTocHtml(item, titleHtml);
  });
  if (titleData.level != -1) {
    titleHtml.str += `</ul>`;
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
  var titleHtml = {
    str: ""
  };
  buildTocHtml(titleData, titleHtml);
  return titleHtml.str;
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
exports.buildIndexHtml = function(srcDir, targetDir, dirHtml, staticPath) {
  buildIndexHtml(srcDir, targetDir, dirHtml, staticPath);
};

//递归创建目录
exports.mkdir = function(dir) {
  shell.mkdir("-p", dir);
};
