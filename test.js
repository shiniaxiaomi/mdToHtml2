// function genID(length) {
//   return Number(
//     Math.random()
//       .toString()
//       .substr(3, length) + new Date().getTime()
//   ).toString(36);
// }

// for (var i = 1; i < 10; i++) {
//   console.log(
//     Math.random()
//       .toString()
//       .substr(3, 15)
//   );
// }

var schedule = require('node-schedule');//导入定时任务模块

//每天凌晨4点钟执行
schedule.scheduleJob('0 0 4 * * *', function(){
  console.log('scheduleCronstyle:' + new Date());
}); 
