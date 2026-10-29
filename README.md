# Amy Portfolio — 个人作品集网站

基于即时设计稿「amy作品集 / HomePage」一比一还原的静态网站。

## 线上地址

https://Ameee1211.github.io/portfolio/

## 网站结构（共 6 个页面）

| 页面 | 文件 | 状态 |
|---|---|---|
| HomePage | `index.html` | ✅ 已完成 |
| About me | `about.html` | ✅ 已完成 |
| Project 1 — SunLink Neighbours | `sunlink.html` | 空白页（待填内容） |
| Project 2 — Auto-Signaled Bus Stop | `busstop.html` | 空白页（待填内容） |
| Project 3 — SteamTracker | `steamtracker.html` | 空白页（待填内容） |
| Project 4 — Chocolate 3D Model | `chocolate.html` | 空白页（待填内容） |

> 4 个项目页只含顶部导航（与首页完全一致，含 Projects 下拉菜单和当前页高亮），
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

### About Me 板块的交互
内容是固定的（照片 / 标题 / 按钮 / 三行信息 / 简介 / Skills），改文字仍只动 `content.js`。
排版与交互都在 `css/style.css` 的 `.about` 段落和 `js/main.js` 的 `initAboutStage()`：
- 照片背后有渐变柔和块（缓慢变形）+ 虚线圆环（自转，鼠标移入加速）+ 两个浮动小圆点
- 鼠标在照片区域移动时照片会 3D 倾斜、高光跟随鼠标；移开自动复位（仅桌面端）
- 三行信息悬停：淡紫底 + 左侧竖条滑出 + 轻微右移
- Skills 标签悬停：填充对应品牌色 + 上浮
- 滚动进入视口时，照片旋转翻起 → 标题 → 按钮依次出现

### About me 页面（about.html）
独立页面，内容全部来自 `content.js` 的 `aboutPage`，渲染与交互在 `js/about.js`，
样式在 `css/about.css`。七个区块依次是（Contact 收尾整页，没有单独页脚）：

| 区块 | 数据位置 | 说明 |
|---|---|---|
| 首屏 | `aboutPage.hero` | 名字、身份标签、简介、照片、四个浮动标签、底部三条信息 |
| 设计理念 | `aboutPage.philosophy` | `statement` 是分段数组，`hl: true` 的片段会被橙色马克笔高亮 |
| 教育背景 | `aboutPage.education` | `gpa` 控制圆环比例，`courses` 的 `score` 决定进度条长度 |
| 相关经历 | `aboutPage.experience` | `items` 数组，每项含 `points`（要点）和 `tags` |
| 技能工具 | `aboutPage.skills` | 8 个等大瓦片：7 项能力（`capabilities`，含 `chips` 关键词）+ 语言；`tools` 的颜色决定标签色 |
| 个人兴趣 | `aboutPage.interests` | 三张卡片可点击展开，展开内容在 `items[].more`；`image` 留空显示内置图标 |
| 联系方式 | `aboutPage.contact` | 点击整张卡片即可复制；`copy: false` 的那条渲染成不可点的信息卡 |

左侧还有一个固定的小索引（`.ab-index`，`js/about.js` 里的 `AB_SECTIONS`）：
首屏不显示，滚过首屏后淡入，6 个板块各一个点，当前板块的点变紫放大，
点击平滑跳转。窗口窄于 1180px 自动隐藏。

### 兴趣卡片的展开内容（`interests.items[].more`）
`type` 决定展开后的版式，三种都实现好了：

| `type` | 版式 | 每条需要的字段 |
|---|---|---|
| `gallery` | 四宫格作品图集 | `label`、`meta`、`image`、`tint`、`icon` |
| `list` | 编号条目清单 | `title`、`meta`、`note` |
| `awards` | 奖项列表 + 右侧配图 | `k`（左侧小标题）、`v`（内容）；`image` + `imageCaption` |

> 想放真实照片：把文件放进 `assets/img/`，然后把对应条目的 `image` 改成
> `"assets/img/文件名.jpg"`，占位图标会自动换掉。

### 视觉规范：按钮 vs 标签（全站统一，别混）
- **按钮**（`.btn` / `.btn--purple`）：实心紫底白字、胶囊圆角 `999px`、带投影、悬停上浮。
- **标签**（`.tag` / `.ab-role` / `.ab-tool`）：浅色平底、方角 `7–8px`、小字号大写字距、
  **无边框、无阴影、无悬停位移、`cursor: default`**。
  目的是让人一眼分清"这是可以点的"和"这只是一个词"，不要给标签加回胶囊和边框。

交互清单：
- 首屏身份标签每 2.1 秒自动轮换高亮；照片随鼠标 3D 倾斜、高光跟随
- 背景铺的是和首页字母迷宫同一套字母，随鼠标轻微漂移（透明度 5%）
- 滚到理念段落时，三个关键词的橙色底色从左扫过
- 滚到教育背景时，GPA 圆环填色 + 四条课程分数条依次生长
- 兴趣卡片点击展开成横跨三卡的长方形，同一时间只开一张，Esc 也可收起
- 联系方式点击即复制，底部弹出提示；不支持剪贴板的浏览器自动降级

> 想给兴趣卡片配图：把照片放进 `assets/img/`，然后把 `interests.items[].image`
> 改成 `"assets/img/你的文件名.jpg"` 即可，占位图标会自动消失。

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
