/**
 * 提示弹出层
 * @param content 提示内容
 * @param time 延迟时间,默认2s
 * @param callback 窗口关闭时的函数调用
 * 使用方法: msg("hello world",1000);
 */
function msg(content, time, callback) {
  let id = "msg-id";
  //判断是否已存在
  if (document.querySelector("#" + id) != null) {
    return;
  }
  //插入css
  if (document.body.getAttribute("data-msg-style") !== "true") {
    //未插入css
    document.body.setAttribute("data-msg-style", "true");
    let style = document.createElement("style");
    style.innerHTML = `
                            /*元素位于根元素或position父元素中间*/
                            .layer-msg-center{
                                position: fixed;
                                left:50%;
                                top:50%;
                                -webkit-transform: translate(-50%,-50%);
                                -moz-transform: translate(-50%,-50%);
                                -ms-transform: translate(-50%,-50%);
                                -o-transform: translate(-50%,-50%);
                                transform: translate(-50%,-50%);
                            }
                            @keyframes appear1 {
                                from {
                                    -webkit-transform: translate(-50%,-50%) scale(0);
                                    -moz-transform: translate(-50%,-50%) scale(0);
                                    -ms-transform: translate(-50%,-50%) scale(0);
                                    -o-transform: translate(-50%,-50%) scale(0);
                                    transform: translate(-50%,-50%) scale(0);
                                    opacity: 0;
                                }
                                to {
                                    -webkit-transform: translate(-50%, -50%) scale(1);
                                    -moz-transform: translate(-50%, -50%) scale(1);
                                    -ms-transform: translate(-50%, -50%) scale(1);
                                    -o-transform: translate(-50%, -50%) scale(1);
                                    transform: translate(-50%, -50%) scale(1);
                                    opacity: 1;
                                }
                            }
                            @keyframes disappear1 {
                                from{
                                    -webkit-transform: translate(-50%, -50%) scale(1);
                                    -moz-transform: translate(-50%, -50%) scale(1);
                                    -ms-transform: translate(-50%, -50%) scale(1);
                                    -o-transform: translate(-50%, -50%) scale(1);
                                    transform: translate(-50%, -50%) scale(1);
                                    opacity: 1;
                                }
                                to{
                                    -webkit-transform: translate(-50%,-50%) scale(0);
                                    -moz-transform: translate(-50%,-50%) scale(0);
                                    -ms-transform: translate(-50%,-50%) scale(0);
                                    -o-transform: translate(-50%,-50%) scale(0);
                                    transform: translate(-50%,-50%) scale(0);
                                    opacity: 0;
                                }
                            }

                            /*
                            my-msg
                             */
                            .layer-msg{
                                background-color:rgba(0,0,0,.7);
                                color:white;
                                padding: 10px 20px;
                                border-radius: 5px;
                                -webkit-animation: appear1 0.5s;
                                -o-animation: appear1 0.5s;
                                animation: appear1 0.5s;
                            }
                `;
    document.head.appendChild(style);
  }
  //插入弹窗html
  let tempElm = document.createElement("div");
  tempElm.innerHTML = `<div id="${id}" class="layer-msg-center layer-msg">${content}</div>`;
  let layer = tempElm.firstChild;
  document.body.appendChild(layer);
  //延迟一定时间并删除
  setTimeout(
    function() {
      //删除
      document.body.removeChild(document.querySelector(`#${id}`));
      //删除后回调函数
      if (callback != null) {
        callback();
      }
    },
    time == null ? 2000 : time
  );
}
