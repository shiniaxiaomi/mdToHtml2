var buff = [
  { level: 1, text: "介绍" },

  { level: 1, text: "安装git" },
  { level: 2, text: "windows安装git" },
  { level: 2, text: "linux安装git" },

  { level: 1, text: "创建版本库" },
  { level: 2, text: "初始化目录使之称为可以管理的仓库" },
  { level: 2, text: "把文件添加到版本库" },

  { level: 1, text: "版本管理" },
  { level: 2, text: "版本的概念" },
  { level: 2, text: "查看当前仓库的状态" },
  { level: 2, text: "查看文件的修改对比" },
  { level: 2, text: "查看git提交日志" },
  { level: 2, text: "版本回退" },
  { level: 3, text: "如果回退版本后又想恢复回退之前的版本怎么办?" },
  { level: 2, text: "工作区和暂存区(重要)" },
  { level: 3, text: "工作区（Working Directory）" },
  { level: 3, text: "版本库（Repository）-包含了暂存区" },
  { level: 3, text: "git提交的具体细节" },
  { level: 2, text: "管理修改" },
  { level: 2, text: "撤销修改" },
  { level: 2, text: "删除文件" },
  { level: 3, text: "如果删错,怎么恢复" }
];

var titleData = {
  level: "",
  text: "",
  children: []
};

function build(titleData, start, end, level, srcData) {
  for (var i = start; i < end; i++) {
    if (srcData[i].level == level) {
      var titleBuff = {
        level: srcData[i].level,
        text: srcData[i].text,
        children: []
      };
      titleData.children.push(titleBuff);
      for (var j = i + 1; j < srcData.length; j++) {
        if (srcData[j].level == level || j == srcData.length - 1) {
          build(titleBuff, i, j, level + 1, srcData);
          break;
        }
      }
    }
  }
}

build(titleData, 0, buff.length, 1, buff);

console.log(titleData);
