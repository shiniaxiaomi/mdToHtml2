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
