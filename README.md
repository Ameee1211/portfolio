# Amy Portfolio — 个人作品集网站

基于即时设计稿「amy作品集 / HomePage」一比一还原的静态网站。

## 线上地址

https://Ameee1211.github.io/portfolio/

## 网站结构（共 6 个页面）

| 页面 | 文件 | 状态 |
|---|---|---|
| HomePage | `index.html` | ✅ 已完成 |
| About me | `about.html` | 空白页（待填内容） |
| Project 1 — SunLink Neighbours | `sunlink.html` | 空白页（待填内容） |
| Project 2 — Auto-Signaled Bus Stop | `busstop.html` | 空白页（待填内容） |
| Project 3 — SteamTracker | `steamtracker.html` | 空白页（待填内容） |
| Project 4 — Chocolate 3D Model | `chocolate.html` | 空白页（待填内容） |

> 后 5 个页面只含顶部导航（与首页完全一致，含 Projects 下拉菜单和当前页高亮），
> 主体为空白，后续逐个填内容即可。导航由 `js/content.js` 的 `nav` 统一驱动，
> 改一处、6 个页面同时生效。

## 本地预览

```bash
cd portfolio
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080
```

## 发布到 GitHub（所有人可访问）

仓库：https://github.com/Ameee1211/portfolio（Public，main 分支）

GitHub Pages 已开启，从 `main` 分支根目录发布。推送后约 1 分钟自动生效。

```bash
git add -A
git commit -m "说明这次改了什么"
git push
```

本机已配置 SSH 密钥（`~/.ssh/id_ed25519`），推送无需输入密码或 Token。

## 日后如何修改内容

**只需要编辑 `js/content.js`**，全部文字、项目、链接都集中在那里。

### 改首页文字
直接改对应字段，例如 `about.intro`、`footer.thanks`。

### 首屏字母迷宫（是个真游戏）
访客按住鼠标（或手指）划过字母即可找词，找对后橙色高亮弹出、字母变深蓝，
5 个词全部找到后字母会依次轻跳庆祝。页面空闲时会有一个"手指划过"的演示动画提示玩法，
全程没有任何文字提示。`wordsearch.letters` 是 6 行字母网格，
`wordsearch.letters` 是 6 行字母网格，`wordsearch.words` 定义被橙色圈出的单词，
`cells` 用 `[行号, 列号]` 标记位置（都从 0 开始数）。改这里就能换名字或换单词。

### 新增 / 修改项目
在 `projects.items` 数组里复制一个 `{...}` 块改内容：

- `title` 标题、`tags` 标签、`description` 描述
- `cover` 封面图路径，留空则显示 `tint` 纯色占位块
- `tint` 配图区底色（对照设计稿取色）
- `link` 项目详情页链接，留空则按钮先指向 #projects

### 改配色
`css/style.css` 顶部的 `:root` 变量。当前色值均从设计稿采样：

| 用途 | 色值 |
|---|---|
| 页面背景 | `#F7F6FA` |
| 主紫 | `#7469B6` |
| 深蓝（标题） | `#333D6D` |
| 橙（字母高亮） | `#FFCF95` |
| 米黄（About 区） | `#FFF0D9` |

## 文件结构

```
portfolio/
├── index.html          页面骨架（一般不用动）
├── css/style.css       样式（配色在 :root 变量里）
├── js/content.js       ★ 网站全部内容（改这个）
├── js/main.js          渲染逻辑（一般不用动）
└── assets/img/         图片素材
```
