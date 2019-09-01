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

//TODO 点击文件夹的时候文件会跳转到最顶端,去除文件夹的a标签中的#
//TODO 还会出现.AWM的图片文件夹
