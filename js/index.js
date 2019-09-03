window.onload = function() {
  //初始化搜索数据
  var dataArr = []; //保存文件名称的数组
  var fileBuff = document.querySelectorAll("#top-file .icon-file");
  fileBuff.forEach(item => {
    var node = {
      content: item.nextElementSibling.innerText,
      url: item.parentElement.getAttribute("href")
    };
    dataArr.push(node);
  });
  var titleBuff = document.querySelectorAll("#top-content a");
  titleBuff.forEach(item => {
    var node = {
      content: item.innerText,
      url: item.getAttribute("href")
    };
    dataArr.push(node);
  });

  var searchDiv = document.getElementById("searchDiv");
  var searchInput = document.getElementById("searchInput");
  var dataList = document.getElementById("dataList");

  var index = -1; //标记现在选择的位置
  var pList = undefined; //存放p的数组

  //给输入框注册事件
  searchInput.onfocus = function() {
    dataList.style.display = "";
  };
  searchInput.oninput = function() {
    filterP();
  };
  searchInput.onkeydown = function(event) {
    checkKeyCode(event);
  };

  //注册Ctrl+P快捷键
  var flag = true;
  document.onkeydown = function(e) {
    if (flag && e.ctrlKey && e.keyCode == 80) {
      flag = false;
      e.preventDefault(); //阻止默认事件
    }
  };
  //在键盘弹起的时候触发事件
  document.onkeyup = function(e) {
    if (e.keyCode == 80) {
      flag = true;
      search();
      e.preventDefault(); //阻止默认事件
    } else if (e.keyCode == 27) {
      searchDiv.style.display = "none";
    }
  };

  //搜索弹窗显示和影藏
  function search() {
    var display = searchDiv.style.display;
    searchDiv.style.display = display == "none" ? "block" : "none";
    if (display == "none") {
      searchInput.focus();
    }
  }

  //过滤和搜索信息
  function filterP() {
    var e = event.target || event.srcElement;
    var str = e.value;
    // console.log(str);
    dataList.innerHTML = ""; //清空div下的所有P元素
    dataArr.forEach(function(item, index) {
      if (item.content.indexOf(str) != -1) {
        var p = document.createElement("p");
        var text = document.createTextNode(item.content);
        p.appendChild(text);
        dataList.appendChild(p);
      }
    });

    //数据为空时,显示暂无数据
    if (dataList.innerHTML == "") {
      var p = document.createElement("p");
      var text = document.createTextNode("暂无数据");
      // p.style.color = "#d7d7d7";
      // p.onclick = function() {
      // event.stopImmediatePropagation();
      // }; //阻止事件的冒泡
      p.appendChild(text);
      dataList.appendChild(p);
    }
    //默认选择搜索的第一个值
    pList = dataList.getElementsByTagName("p");
    pList[0].classList = "on";
  }

  function checkKeyCode(e) {
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
        // if (index < 0) index = pList.length - 1; //如果小于0,则到最下面
        pList[index].classList = "on"; //将class设置为on
        event.preventDefault(); //阻止默认事件
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
        // if (index >= pList.length) index = 0; //如果大于最大值,回到最上面
        pList[index].classList = "on"; //将class设置为on
        event.preventDefault(); //阻止默认事件
        break;
      case 13: //回车选择
        if (index != -1) searchInput.value = pList[index].innerHTML; //回车时将选中的值设置到输入框中
        break;
    }
  }

  /**
stopImmediatePropagation() 和 stopPropagation()的区别在哪儿呢？
　　后者只会阻止冒泡或者是捕获。 但是前者除此之外还会阻止该元素的其他事件发生，但是后者就不会阻止其他事件的发生
**/
};
