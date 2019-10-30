var str=`
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>#{title} | 陆英杰的博客</title>
    
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="keywords" content="#{title},陆英杰,陆英杰的博客,luyingjie,lyj,java" />
    <meta name="description" content="#{description}">
    <meta name="author" content="陆英杰,luyingjie,lyj">

    <script type="text/javascript" src="#{staticPath}/js/buff.js"></script>
    <script type="text/javascript" src="#{staticPath}/js/my.js"></script>


    <link
      rel="stylesheet"
      type="text/css"
      href="#{staticPath}/css/github.css"
    />
    <link
      rel="stylesheet"
      type="text/css"
      href="#{staticPath}/css/highlight.css"
    />
    <link
      rel="stylesheet"
      type="text/css"
      href="#{staticPath}/css/number.css"
    />
    <link
      rel="stylesheet"
      href="https://at.alicdn.com/t/font_1374216_9590mn2t4fo.css"
    />
    
  </head>
  <body>
    <!-- 回到顶部的按钮 -->
    <a id="top" class="top" href="#header">
      <i class="iconfont icon-up"></i>
    </a>
    <!-- 编辑的按钮 -->
    <a id="edit" class="edit" href="Typora:#{notePath}" onclick="tip()">
      <i class="iconfont icon-edit"></i>
    </a>
    <div id="header"></div>
    <div id="sidebar">
      <div class="top-buttons">
        <a
          href="javascript:void(0);"
          id="top-buttons-file"
          onclick="changeTopButton('file')"
          class="top-buttons-ele toc-buttons-file"
          >文件</a
        >
        <a
          href="javascript:void(0);"
          id="top-buttons-toc"
          onclick="changeTopButton('toc')"
          class="top-buttons-ele top-buttons-toc top-clicked"
          >目录</a
        >
      </div>
      <!-- 侧边栏的大纲 -->
      <div id="top-content" class="top-content">#{sidebar-toc}</div>
      <!-- 侧边栏的目录 -->
      <div id="top-file" class="top-file" style="display:none">
        #{sidebar-file}
      </div>
    </div>

    <div id="searchDiv" class="searchDiv" style="display: none">
      <input
        id="searchInput"
        class="searchInput"
        type="text"
        placeholder="请输入"
        autocomplete="off"
      />
      <div id="dataList" class="dataList"></div>
    </div>

    <div id="top-container" class="top-container">
      <div style="text-align: center">
        <button id="hiddenDirButton" onclick="hiddenDir()">隐藏目录</button>
        <button id="searchNoteButton" onclick="searchNote()">搜索笔记</button>
      </div>

      <div id="toc">#{top-toc}</div>
      <div id="write" class="markdown-body">
        #{body}
      </div>
    </div>
  </body>
</html>
`;




console.log(str)