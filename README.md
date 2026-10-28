# Amy Portfolio — 个人作品集网站

基于即时设计稿「amy作品集」HomePage 还原的静态网站。

## 本地预览

```bash
cd portfolio
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080
```

## 发布到 GitHub Pages（所有人可访问）

1. 在 GitHub 新建仓库，例如 `portfolio`（Public）
2. 把本文件夹全部文件 push 上去：

```bash
cd portfolio
git init
git add .
git commit -m "portfolio first version"
git branch -M main
git remote add origin https://github.com/Ameee1211/portfolio.git
git push -u origin main
```

3. 打开仓库 → Settings → Pages → Source 选 `Deploy from a branch`，Branch 选 `main` / `(root)`，保存
4. 1–2 分钟后访问：`https://Ameee1211.github.io/portfolio`

## 日后如何修改内容

**只需要编辑 `js/content.js`**，全部文字、项目、链接都集中在那里：

- **改文字**：直接改对应字段（如 `hero.slogan`）
- **新增项目**：在 `projects` 数组里复制一个 `{...}` 块改内容
- **补充项目封面图**：把图片放进 `assets/img/`，然后把文件路径填到该项目的 `cover`
- **补充项目详情页**：做好详情页后，把链接填到该项目的 `link`，卡片上的 "View project" 会自动变可点击

改完 push 到 GitHub，网站自动更新。

## 文件结构

```
portfolio/
├── index.html          页面骨架（一般不用动）
├── css/style.css       样式（配色在 :root 变量里）
├── js/content.js       ★ 网站全部内容（改这个）
├── js/main.js          渲染逻辑（一般不用动）
└── assets/img/         图片素材
```
