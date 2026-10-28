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

### 首屏字母迷宫（是个真游戏，答案默认可见）
**5 个单词的位置一开始就以橙色虚线轮廓标出来**——即使只停留几秒、完全不玩，
访客也能一眼看到 TONG / ZHANG / UI / UX / DESIGN。未找到的轮廓会轮流呼吸，
只剩最后两个时会加快闪烁催促完成；迷宫下方 5 个圆点是进度，连对一个点亮一个。

想玩的话按住鼠标（或手指）沿轮廓划过字母即可，横、竖、45° 斜线都认，正反方向都算对。
连对后轮廓变成实心橙条弹出、字母变深蓝、对应圆点点亮。
5 个全部连完会播放庆祝特效：**WELCOME** 大字跳出再消失 + 16 颗小星星 + 3 只小猫，
然后自动平滑滚动到 About 板块。页面空闲时还有一个"手指划过"的演示动画，全程无文字提示。

数据都在 `js/content.js`：
- `wordsearch.letters` 是 6 行字母网格
- `wordsearch.words` 定义被圈出的单词，`cells` 用 `[行号, 列号]` 标记位置（都从 0 开始数）
- `wordsearch.finale` 控制庆祝特效：文字、星星数量、猫数量、停留时长、滚动目标

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

## 缓存与版本号（重要，改完看不到效果先看这里）
GitHub Pages 给静态文件设了 `Cache-Control: max-age=600`（缓存 10 分钟），
所以推送成功后浏览器**可能仍然显示旧版本**。

解决办法：6 个页面的 css/js 引用都带了版本号，长这样
`css/style.css?v=2` · `js/content.js?v=2` · `js/main.js?v=2`

**每次改完 CSS 或 JS 后，把 3 处的 `v` 数字 +1**（只改 HTML 结构不用管），
浏览器就会强制重新下载，不用等缓存过期。
若还是看到旧内容，按 `Ctrl + Shift + R` 强制刷新一次。

## 文件结构

```
portfolio/
├── index.html          页面骨架（一般不用动）
├── css/style.css       样式（配色在 :root 变量里）
├── js/content.js       ★ 网站全部内容（改这个）
├── js/main.js          渲染逻辑（一般不用动）
└── assets/img/         图片素材
```
