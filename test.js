function genID(length) {
  return Number(
    Math.random()
      .toString()
      .substr(3, length) + new Date().getTime()
  ).toString(36);
}

for (var i = 1; i < 10; i++) {
  console.log(
    Math.random()
      .toString()
      .substr(3, 15)
  );
}

//TODO 侧边栏的文件和目录下面的黑条太短了
//TODO 添加一个文件和目录搜索框
//TODO 文件夹和文件都会有下划线
