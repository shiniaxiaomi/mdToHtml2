let fileTitle;
let fileContent;
let tocTitle;
let tocContent;
let folderList;

let searchDiv; //搜索div
let searchInput; //搜索输入框
let dataList; //数据节点
var index = -1; //标记现在选择的位置
var pList = undefined; //存放p的数组
var dataArr = []; //保存要搜索的数据的数组
var initSearchDataBuff = undefined; //缓存搜索初始化的数据

//注册快捷键时使用到的变量
var altFlag = false;
var time = undefined;
var windowOnload = false; //标记是否已经完成加载
var sign = 80; //定义默认的向上滚与向下滚的边界
//注册快捷键
addShortcutKey();

window.onload = function() {

  windowOnload = true;
  //获取节点
  getSidebarElement();
  getSearchElement();

  //判断是否是PC端,并进行隐藏对应的按钮
  if(IsPC()){
    document.getElementById("hiddenDirButton").style.display="none";
    document.getElementById("searchNoteButton").style.display="none";
  }else{
    hiddenDir();//如果是手机端,默认隐藏侧边栏
  }

  //添加事件
  addSidebarEvent();
  addSearchEvent();

  //初始化搜索数据
  initSearchData();

  //initialize(关闭所有文件夹)
  folderList.forEach(elm => {
    folderClick.call(elm);
  });

 
  
};

//判断是否是PC端
function IsPC() {
  var userAgentInfo = navigator.userAgent;
  var Agents = ["Android", "iPhone",
     "SymbianOS", "Windows Phone",
     "iPad", "iPod"];
  var flag = true;
  for (var v = 0; v < Agents.length; v++) {
     if (userAgentInfo.indexOf(Agents[v]) > 0) {
        flag = false;
        break;
     }
  }
  return flag;
}

//===============添加两个手机端的按钮
//隐藏目录
function hiddenDir(){
  if(document.getElementById("sidebar").style.display!="none"){
    var top=document.getElementById("top");

    document.getElementById("sidebar").style.display="none";
    document.getElementById("top-container").style.marginLeft="0px";
    document.getElementById("write").style.padding="0px 0px 0px 25px";//手机端将padding变小
    //设置返回顶部按钮
    top.style.right="30px";
    top.style.bottom="30px";
    top.style.opacity="0.4";

  }else{
    document.getElementById("sidebar").style.display="block";
    document.getElementById("top-container").style.marginLeft="250px";
    document.getElementById("write").style.padding="60px";
  }
  
  
}
//搜索笔记
function searchNote(){
  showSearchDiv();
}

//===============文件夹和大纲
//给侧边栏添加事件
function addSidebarEvent() {
  folderList = document.querySelectorAll(".folder");
  folderList.forEach(ele => ele.addEventListener("click", folderClick));
}
//获取侧边栏的节点
function getSidebarElement() {
  fileTitle = document.querySelector("#top-buttons-file");
  fileContent = document.querySelector("#top-file");
  tocTitle = document.querySelector("#top-buttons-toc");
  tocContent = document.querySelector("#top-content");
}
//文件和大纲的显示和隐藏
function changeTopButton(type) {
  if (type === "file") {
    fileTitle.classList.add("top-clicked");
    tocTitle.classList.remove("top-clicked");
    fileContent.style.display = "block";
    tocContent.style.display = "none";
  } else if (type === "toc") {
    fileTitle.classList.remove("top-clicked");
    tocTitle.classList.add("top-clicked");
    fileContent.style.display = "none";
    tocContent.style.display = "block";
  }
}
//文件夹的收缩和展开
function folderClick() {
  //子级的隐藏和显示
  if (this.nextElementSibling == null) {
    return;
  }
  let display = this.nextElementSibling.style.display;
  this.nextElementSibling.style.display =
    display === "block" || display === "" ? "none" : "block";

  //文件夹箭头的变动
  var down = this.querySelector(".icon-down");
  if (down != null) {
    if (down.classList.contains("folder-open")) {
      down.classList.remove("folder-open");
    } else {
      down.classList.add("folder-open");
    }
  }
}

//同步笔记点击事件
function syncClick() {
  var password = prompt("请输入同步的密码");
  if (password == null) {
    return;
  }

  //创建异步对象
  var xhr = new XMLHttpRequest();
  xhr.open("post", "syncNote"); //发送请求
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  //发送请求
  var data = "password=" + password;
  xhr.send(data);
  document.getElementById("syncTip").style.display = "block";
  //waitting
  xhr.onreadystatechange = function() {
    //这步为判断服务器是否正确响应
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        var response = eval("(" + xhr.responseText + ")");
        if (response.flag == 1) {
          //成功
          alert("笔记同步成功");
        } else {
          //失败
          alert(response.data);
        }
      } else {
        alert("服务器内部错误");
      }
      document.getElementById("syncTip").style.display = "none";
    }
  };
}

//===============搜索框
function addShortcutKey() {
  //注册alt+i快捷键
  document.onkeypress = function(e) {
    //阻止浏览器的打印事件
    if (e.altKey && e.keyCode == 73) {
      e.preventDefault();
    }
  };
  document.onkeydown = function(e) {
    //阻止浏览器的打印事件
    if (e.altKey && e.keyCode == 73) {
      e.preventDefault();
    }

    if (e.altKey) {
      altFlag = true;
      //300ms内按下i键则触发事件
      window.clearTimeout(time);
      time = setTimeout(function() {
        altFlag = false;
      }, 400);
    }
  };
  //在键盘弹起的时候触发事件
  document.onkeyup = function(e) {
    //阻止浏览器的打印事件
    if (e.altKey && e.keyCode == 73) {
      e.preventDefault();
    }

    if (e.keyCode == 73) {
      if (altFlag) {
        if (windowOnload) {
          showSearchDiv(); //显示搜索输入框
        }
        altFlag = false;
      }
      e.preventDefault(); //阻止默认事件
    } else if (e.keyCode == 27) {
      hiddenSearchDiv();
    }
  };
}

//给搜索框添加事件
function addSearchEvent() {
  //给输入框注册事件
  searchInput.onfocus = function() {
    dataList.style.display = "";
  };
  searchInput.oninput = function() {
    searchKeywords(); //搜索关键字
  };
  searchInput.onkeydown = function(event) {
    checkKeyCode(event);
  };
  searchDiv.onclick = function() {
    searchInput.focus();
  };
}

//获取搜索框节点
function getSearchElement() {
  searchDiv = document.getElementById("searchDiv");
  searchInput = document.getElementById("searchInput");
  dataList = document.getElementById("dataList");
}
//初始化搜索数据
function initSearchData() {
  var fileBuff = document.querySelectorAll("#top-file .icon-file");
  fileBuff.forEach(item => {
    var node = {
      content: item.nextElementSibling.innerText,
      url: item.parentElement.getAttribute("href"),
      icon: "iconfont icon-file"
    };
    dataArr.push(node);
  });
  var titleBuff = document.querySelectorAll("#top-content a");
  titleBuff.forEach(item => {
    var node = {
      content: item.innerText,
      url: item.getAttribute("href"),
      icon: "iconfont icon-maodian"
    };
    dataArr.push(node);
  });
}

//搜索弹窗显示和影藏
function showSearchDiv() {
  //首次显示,进行初始化
  if (initSearchDataBuff == undefined) {
    dataArr.forEach(function(item) {
      var p = document.createElement("p");

      var icon = document.createElement("i");
      icon.setAttribute("class", item.icon);
      p.appendChild(icon);

      var text = document.createTextNode(item.content);
      p.appendChild(text);

      p.setAttribute("url", item.url);
      p.onclick=function(){
        window.location=item.url;
        showSearchDiv();//隐藏searchDiv
      }
      dataList.appendChild(p);
    });
    initSearchDataBuff = dataList.innerHTML;
  } else {
    dataList.innerHTML = initSearchDataBuff;
  }

  var display = searchDiv.style.display;
  if (display == "none") {
    searchDiv.style.display = "block";
    searchInput.focus();
  } else {
    hiddenSearchDiv();
  }

  selectFirstSearchData(); //默认选中第一个
}
//隐藏搜索输入框
function hiddenSearchDiv() {
  searchDiv.style.display = "none";
  searchInput.value = ""; //清空
}

//过滤和搜索信息
function searchKeywords() {
  var e = event.target || event.srcElement;
  var str = e.value;
  dataList.innerHTML = ""; //清空div下的所有P元素
  if (str == "") {
    dataList.innerHTML = initSearchDataBuff;
  } else {
    dataArr.forEach(function(item) {
      //全部转化为小写再进行比较,就可以忽略大小写进行查找
      if (item.content.toLowerCase().indexOf(str.toLowerCase()) != -1) {
        var p = document.createElement("p");

        var icon = document.createElement("i");
        icon.setAttribute("class", item.icon);
        p.appendChild(icon);

        var text = document.createTextNode(item.content);
        p.appendChild(text);

        p.setAttribute("url", item.url);
        p.onclick=function(){
          window.location=item.url;
          showSearchDiv();//隐藏searchDiv
        }
        dataList.appendChild(p);
      }
    });
  }

  //数据为空时,显示暂无数据
  if (dataList.innerHTML == "") {
    var p = document.createElement("p");
    var icon = document.createElement("i");
    icon.setAttribute("class", "iconfont icon-none");
    p.appendChild(icon);

    var text = document.createTextNode("暂无数据");
    p.appendChild(text);
    dataList.appendChild(p);
  }

  selectFirstSearchData(); //默认选中第一个
}

//默认选中第一个
function selectFirstSearchData() {
  //默认选择搜索的第一个值
  pList = dataList.getElementsByTagName("p");
  for (var i = 0; i < pList.length; i++) {
    pList[i].classList = "";
  }
  pList[0].classList = "on";
  index = 0;
  dataList.scrollTop = 0;
}

function checkKeyCode(e) {
  var size = 5;
  switch (e.keyCode) {
    case 38: //上
      if (index >= pList.length) {
        index = pList.length - 1;
      } else {
        pList[index].className = ""; //将class置空
        index--; //标记往上一个
        if (index <= -1) {
          index = 0;
        }
      }
      pList[index].classList = "on"; //将class设置为on
      event.preventDefault(); //阻止默认事件

      //改变滚动条
      if (index < pList.length - size) {
        dataList.scrollTop =
          ((index - size) * dataList.scrollHeight) / pList.length;
        // console.log(dataList.scrollTop)
      }
      break;
    case 40: //下
      if (index <= -1) {
        index = 0;
      } else {
        pList[index].className = ""; //将class置空
        index++;
        if (index >= pList.length) {
          index = pList.length - 1;
        }
      }
      pList[index].classList = "on"; //将class设置为on
      event.preventDefault(); //阻止默认事件

      //改变滚动条
      if (index >= size) {
        dataList.scrollTop =
          ((index - size) * dataList.scrollHeight) / pList.length;
        // console.log(dataList.scrollTop)
      }
      break;
    case 13: //回车选择
      if (index != -1) {
        //打开对应的链接
        var url = pList[index].getAttribute("url");
        if (url == undefined) {
          return;
        }
        searchDiv.style.display = "none";
        searchInput.value = ""; //清空文本
        window.location.href = pList[index].getAttribute("url");
      }
      break;
  }
}
