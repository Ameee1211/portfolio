# Amy Portfolio — 个人作品集网站

基于即时设计稿「amy作品集 / HomePage」一比一还原的静态网站。

## 线上地址

https://Ameee1211.github.io/portfolio/

## 网站结构（共 6 个页面）

| 页面 | 文件 | 状态 |
|---|---|---|
| HomePage | `index.html` | ✅ 已完成 |
| About me | `about.html` | ✅ 已完成 |
| Project 1 — SunLink Neighbours | `sunlink.html` | ✅ 已完成 |
| Project 2 — Auto-Signaled Bus Stop | `busstop.html` | 空白页（待填内容） |
| Project 3 — SteamTracker | `steamtracker.html` | 空白页（待填内容） |
| Project 4 — Chocolate 3D Model | `chocolate.html` | 空白页（待填内容） |

> 另外 3 个项目页目前只含顶部导航（与首页完全一致，含 Projects 下拉菜单和当前页高亮），
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

### 首屏字母迷宫（只连一个词就通关）
**5 个单词的位置一开始就以橙色虚线轮廓标出来**——即使只停留几秒、完全不玩，
访客也能一眼看到 TONG / ZHANG / UI / UX / DESIGN，虚线轮廓会轮流呼吸提示位置。

按住鼠标（或手指）沿轮廓划过字母即可，横、竖、45° 斜线都认，正反方向都算对。
**连对任意一个词就算通关**：剩下四个词同时变成实心橙条、字母一起变深蓝、5 个圆点全亮，
随即播放 **WELCOME** 大字 + 16 颗小星星 + 3 只小猫，然后自动平滑滚动到 About 板块。
不需要把 5 个词都连一遍——首屏停留时间越短越好。页面空闲时有一个"手指划过"的演示动画，全程无文字提示。

**通关状态会记在浏览器里**（`localStorage` 的 `portfolio:wordsearch-done`）。
玩过之后再从 About / Projects 回到首页，首屏直接是"全部连好"的样子：
不会再放 WELCOME、也不会自动跳页，迷宫不再响应拖拽（不改版面，仍然是一张好看的封面图）。
想让自己重新体验一遍，在控制台执行 `localStorage.removeItem("portfolio:wordsearch-done")` 再刷新即可。

#### 两套题：桌面横版 / 手机竖版
`content.js` 里有两套完全独立的题目，不是同一套缩放的：

| 键 | 尺寸 | 网格 | 用在哪 |
|---|---|---|---|
| `wordsearch.desktop` | `cell: [150, 100]` | 6 行 × 8 列 | 宽度 > 900px |
| `wordsearch.mobile` | `cell: [100, 122]` | 7 行 × 6 列（竖版） | 宽度 ≤ 900px |

手机版是重新排的：DESIGN 竖着排在最左列、TONG 斜着落到 ZHANG 末端的 G 上，
格子更高、字母更大，整块是竖长的，占满一屏（页面缩放时会在两套之间自动切换并重绘）。
两套题的单词完全一样：TONG / ZHANG / UI / UX / DESIGN。

每个配置里：
- `letters` 是字母网格（每个字符串一行）
- `words` 定义被圈出的单词，`cells` 用 `[行号, 列号]` 标记位置（都从 0 开始数）
- `cell` 是 `[格宽, 格高]`、`band` 是高亮条厚度、`font` 是字母字号（都是 SVG 内部单位）
- `wordsearch.finale` 控制庆祝特效：文字、星星数量、猫数量、停留时长、滚动目标

#### 高亮框的形状（改过，别再改回去）
高亮条不是"外接矩形"而是**两端半圆的胶囊**（`js/main.js` 的 `wsBand()`）：
两个半圆的圆心正好落在首、尾字母的格心。所以
- 斜排的 TONG 在 T 那一端是完整的圆弧，不会被网格边界切掉一角
- TONG 和 ZHANG 共用的 G，两端是**同圆心同半径**的同一个半圆，翻过来看完全重合
- 找到后变成实心橙条时，两块的接缝也不会出现多余的凸起

### 首页分页滚动（一次滚轮 = 前进一个板块）
首页 `#about`、`#projects` 两块都按 `min-height:100svh` 处理（内容垂直居中），
滚动行为在 `js/main.js` 的 `initPinPager()`，规则和 About me 页面的 `abInitPager()` 完全一致：

- **每块都必须先滚到「底边贴住视口底边」才允许翻页**（`endOf()`），
  此时板块自己的 `padding` 底边留白正好露出来，就是「这块看完了」的信号
- 板块比视口高时按 1:1 跟手滚，最多推到板块底部，绝不越过
- 到底之后同一次滑动的惯性会被吞掉（`SETTLE_MS` 240ms + `GESTURE_GAP` 90ms），
  要再滚一次才翻页
- 首屏（迷宫）是起点，滚一次直接到 `#about`
- **最后一块（`#projects`）之后交给浏览器**，页脚自然滑上来，不强行翻页
- `PageDown / Space / ↑ / ↓ / Home / End` 同样按板块走
- 触屏、宽度 <1024、系统「减弱动态效果」时不启用，保持原生滚动
- 首页**没有**左侧索引栏（那是 About me 页面专有的）

### 页脚
`footer` 里有四个字段：`thanks`（感谢语）、`note`（紧跟其后的一句正文）、
`email` / `phone`（各自带一个线描图标，分别生成 `mailto:` 和 `tel:` 链接）。
原来那句 `Portfolio 2026` 徽标已删除，如需再加速用 `<p class="footer__note">` 同款样式。

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

左侧固定索引（`.ab-index`，名字在 `js/about.js` 的 `AB_SECTIONS` 里改）：
宽于 1180px 时显示「编号 + 文字标签」，当前板块的编号变紫、左侧出现一条短竖线；
点击平滑跳转；首屏不显示，滚过首屏后淡入。窄于 1180px 自动隐藏。
为了让标签有地方站，`@media (min-width:1180px)` 里给板块内容加了 `padding-left:150px`
（首屏 `.ab-hero .ab-wrap` 不受影响，保持通栏）。

索引的横向位置由 `abInitIndex()` 里的 `place()` 计算：取六个板块里最靠左的内容边界，
往左留 78px 间距摆索引（空间不够时先保 24px 左留白、压缩间距），**内容本身不移动**。
窗口 resize、字体加载完成后都会重算；不写死在 CSS 里是因为 `.ab-wrap` 在
`display:flex` 的列容器里是「收缩到内容宽」，各板块宽度并不完全相同。

### 板块分页滚动（一次滚轮 = 前进一个板块）
`.ab-sec` 都是 `min-height:100svh`，滚动行为在 `js/about.js` 的 `abInitPager()`：

- **每个板块都必须先滚到「底边贴住视口底边」才允许翻页**
  （`endOf()`），此时板块自己的 `padding-bottom` 正好完整露出来，就是「本板块看完了」的信号
- 板块比视口高时不会硬跳：滚轮怎么滚，页面就按 1:1 跟手前进多少，最多推到板块底部为止
  （所以永远看不到「唰一下跳到下一块」）
- 到了底部之后**同一次滑动里的惯性会被吞掉**（`SETTLE_MS` 240ms + `GESTURE_GAP` 90ms），
  底部留白会真的停住一瞬；再滚一次才翻到下一个板块
- 翻页动画期间吞掉多余滚动（`LOCK_MS`），到位后立即放行，不会让你白滚一格
- 触控板的小 delta 会累积到 `THRESHOLD` 才动，轻微抖动不会让页面停在两块之间
- `PageDown / Space / ↑ / ↓ / Home / End` 同样按板块走
- **触屏、宽度 <1024、系统「减弱动态效果」时不启用**，保持原生滚动

想调整手感，改 `abInitPager()` 顶部那几个常量即可。

### 兴趣卡片的展开内容（`interests.items[].more`）
`type` 决定展开后的版式，三种都实现好了：

| `type` | 版式 | 每条需要的字段 |
|---|---|---|
| `gallery` | 作品图集（自适应等分，3 张时一行三格） | `label`、`meta`、`image`、`tint`、`icon` |
| `list` | 编号条目清单 | `title`、`meta`、`note` |
| `awards` | 奖项列表 + 右侧配图 | `k`（左侧小标题）、`v`（内容）；`image` + `imageCaption` |

> 展开后 **关闭按钮固定在卡片右上角**（`.ab-int__card.is-open .ab-int__toggle`），
> 桌面端正文右侧留 124px 避让；窄屏（≤1100px）媒体区移到顶部，按钮浮在图上。

兴趣卡片现有配图（都是真实照片，钩织卡不出现本人）：

| 文件 | 用在哪 |
|---|---|
| `int-crochet.jpg` | 钩织卡主图（用三张实拍做参考生成的棚拍静物，不含人物） |
| `work-hat.jpg` `work-scarf.jpg` `work-bag.jpg` | 钩织卡展开后的三张作品图（同样由实拍生成的单品棚拍） |
| `int-games.jpg` | 游戏卡主图（HTML 搭的商店页 1600×1200 截图） |
| `int-games-open.jpg` | 游戏卡展开态用的竖版商店页（`imageOpen` 字段，避免窄列裁断文字） |
| `int-diving.jpg` | 游泳潜水卡主图（用户提供的潜水照，4:3 裁切） |
| `int-underwater.jpg` | 游泳卡展开后的水下配图（从视频抽帧提亮 + 转蓝） |

> 兴趣卡片支持 `imageOpen`：填了就在展开态换图（游戏卡用的就是竖版截图）。
> 生成图（AI）**右下角自带水印**，处理时一律裁掉底部 92px 或裁掉右侧，别直接贴。

> 想换照片：把文件放进 `assets/img/`，然后把对应条目的 `image` 改成
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

### SunLink Neighbours 项目页（sunlink.html）

这个页面**没有走 `content.js`**，文案直接写在 `sunlink.html` 里，因为它是一篇长文，
每段文字都紧贴自己的版式，拆到数据文件反而更难改。

- `css/sunlink.css` 只作用于这一页（所有类名以 `sl-` 开头，不会影响其他页面）
- `js/sunlink.js` 负责 4 个交互：
  1. **三状态切换**（`04` 节）：按钮 `data-state` → 面板 `data-panel`
  2. **XD 原型懒加载**（`06` 节）：点一下才插 iframe；三个 tab 换 `embed/<id>`；截图先当封面
  3. **电路开关**（`07` 节）：`data-mode="battery|inverter"` 控制虚线走哪条支路 + 拨杆动画
  4. **六户 3D 社区**（`08` 节）：three.js 手写建模（不加载外部模型文件），
     滚到该区域才初始化，可拖拽旋转，三个状态改变电流方向
- `assets/vendor/three.min.js` 是本地内嵌的 three.js r160（UMD，650KB）。
  **故意不用 CDN**：国内加载 jsdelivr 可能很慢；也故意不用 ES module，
  这样直接双击 `sunlink.html` 用 `file://` 打开也能跑。
- 图片：`sl-panel-{green,blue,red}.webp`（控制面板）、`sl-model-{green,blue,red}.webp`（房屋页）、
  `sl-confirm.webp` / `sl-sharing.webp`（分享流程）、`sl-model-print.jpg` / `sl-model-cardboard.jpg`（实物照片）、
  `sl-iter-1..5.webp`（五代迭代缩略图）。
  界面图是从 Adobe XD 原型里用 puppeteer 截的 2x 画布，比 PDF 里清楚。

> XD 原型链接：三个状态各一个 artboard id，写在 `js/sunlink.js` 顶部的 `XD` 对象里。
> `xd.adobe.com/view/...` 带 `X-Frame-Options: DENY` 嵌不了，必须换成 `xd.adobe.com/embed/<同一个 id>/`。

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

**每次改完 CSS 或 JS 后，把版本号 +1**（只改 HTML 结构不用管），
浏览器就会强制重新下载，不用等缓存过期。
不用手动改 6 个文件：运行下面这条命令，它会把所有页面的 css/js 版本号统一 +1。

```bash
node .workbuddy/design/bump.mjs bump
```

若还是看到旧内容，按 `Ctrl + Shift + R` 强制刷新一次。

## 文件结构

```
portfolio/
├── index.html / about.html / sunlink.html ...   6 个页面
├── css/style.css       全站样式（配色在 :root 变量里）
├── css/about.css       About me 页专用
├── css/sunlink.css     SunLink 项目页专用
├── js/content.js       ★ 首页/关于页的全部内容（改这个）
├── js/main.js          首页渲染逻辑（一般不用动）
├── js/about.js         About me 渲染逻辑
├── js/sunlink.js       SunLink 项目页交互（含 3D）
├── assets/img/         图片素材
└── assets/vendor/      本地第三方库（three.min.js）
```
