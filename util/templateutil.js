
//解析模板,返回解析后的模板数组
exports.analysisTemplate=function (template) {
  var arr = template.split("#{");
  var templateArr = [
    {
      isNeedReplace: false, //是否要进行替换
      paramName: undefined, //变量名称
      context: arr[0] //内容
    }
  ];
  for (var i = 1; i < arr.length; i++) {
    var buff = arr[i];
    var index = buff.indexOf("}");
    //添加要替换的标记
    templateArr.push({
      isNeedReplace: true,
      paramName: buff.slice(0, index),
      context: ""
    });
    //将不替换的保存
    templateArr.push({
      isNeedReplace: false,
      paramName: undefined,
      context: buff.slice(index + 1)
    });
  }
  return templateArr;
}

//替换参数
exports.replaceWithTemplate=function (templateArr, paramName, value) {
  for (var i = 0; i < templateArr.length; i++) {
    var item = templateArr[i];
    if (item.isNeedReplace == true && item.paramName == paramName) {
      item.context = value; //替换
      item.isNeedReplace = false; //设置为替换完成
    }
  }
}

//将模板数组构建成html,将html构建完成后,模板数组即可重新使用进行替换(始终使用的是一个对象,效率高)
exports.buildTemplateArrToHtml=function buildTemplateArrToHtml(templateArr) {
  var strArr=[];
  templateArr.map(obj => {
    strArr.push(obj.context); //将内容合并
    //内容合并完后,将原来参数的是否替换标志位置为true,以便下一次使用
    if (obj.paramName != undefined) {
      obj.isNeedReplace = true;
    }
  });
  return strArr.join("");
}

//Demo
// //生成的模板数组可重复使用
// var arr=analysisTemplate(str);//将字符串解析为模板数组(模板以#{xxx}格式传递变量)
// replaceWithTemplate(arr,"title","adfsdfsdfsd");//将变量进行替换
// var str=buildTemplateArrToHtml(arr);//将模板数组生成html