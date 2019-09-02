let fileTitle;
let fileContent;
let tocTitle;
let tocContent;
let folderList;
window.onload = function() {
  fileTitle = document.querySelector("#top-buttons-file");
  fileContent = document.querySelector("#top-file");
  tocTitle = document.querySelector("#top-buttons-toc");
  tocContent = document.querySelector("#top-content");
  //为所有目录添加监听器
  folderList = document.querySelectorAll(".folder");
  folderList.forEach(ele => ele.addEventListener("click", folderClick));

  //initialize(关闭所有文件夹)
  folderList.forEach(elm => {
    folderClick.call(elm);
  });
};
function changeTopButton(type) {
  if (type === "file") {
    //显示与隐藏
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
