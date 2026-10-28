/* ============================================================
   内容配置文件 —— 日后修改网站内容只需要改这个文件
   改完保存、push 到 GitHub，网站几分钟内自动更新

   本文件内容依据即时设计稿「amy作品集 / HomePage」一比一提取
   ============================================================ */

const SITE = {
  // ---------- 顶部导航（页面级，不是页内锚点） ----------
  // href 指向独立页面文件；dropdown 里放 4 个项目页
  nav: {
    logo: "assets/img/logo.svg",
    links: [
      { label: "Home", href: "index.html" },
      { label: "About me", href: "about.html" },
      {
        label: "Projects",
        href: "sunlink.html",
        dropdown: [
          { label: "SunLink Neighbours", href: "sunlink.html" },
          { label: "Auto-Signaled Bus Stop", href: "busstop.html" },
          { label: "SteamTracker", href: "steamtracker.html" },
          { label: "Chocolate 3D Model", href: "chocolate.html" },
        ],
      },
    ],
  },

  // ---------- 首屏：字母迷宫（Word Search） ----------
  // letters：6 行 × 8 列的字母网格，每个字符串是一行
  // words：被橙色高亮圈出的单词，cells 为 [行序号, 列序号]（都从 0 开始数）
  wordsearch: {
    letters: [
      "GXYTLMNP",
      "CNOROKZR",
      "HALIWNET",
      "AJZHANGJ",
      "UIBQUXFW",
      "PVDESIGN",
    ],
    words: [
      { text: "TONG",   cells: [[0, 3], [1, 4], [2, 5], [3, 6]] },
      { text: "ZHANG",  cells: [[3, 2], [3, 3], [3, 4], [3, 5], [3, 6]] },
      { text: "UI",     cells: [[4, 0], [4, 1]] },
      { text: "UX",     cells: [[4, 4], [4, 5]] },
      { text: "DESIGN", cells: [[5, 2], [5, 3], [5, 4], [5, 5], [5, 6], [5, 7]] },
    ],
    // 全部找齐后的庆祝特效：WELCOME 字样 + 小星星 + 小猫，然后滚到 About 板块
    finale: {
      text: "WELCOME",
      stars: 16,
      cats: 3,
      holdMs: 1500,
      scrollTo: "about",
    },
  },

  // ---------- About Me ----------
  about: {
    photo: "assets/img/amy-portrait.jpg",
    title: "About Me",
    button: { label: "Explore More", href: "about.html" },
    info: [
      { label: "Name",      value: "Tong Zhang (Amy)" },
      { label: "Education", value: "University of Sydney" },
      { label: "Major",     value: "Bachelor of Design Computing" },
    ],
    intro:
      "I believe great design starts with listening. Whether it's a passing comment or a quiet habit, I turn subtle user needs into bold digital experiences.",
    skills: {
      title: "Skills",
      items: [
        { label: "Ai",    color: "#FF9A00" },
        { label: "Ps",    color: "#31A8FF" },
        { label: "Xd",    color: "#FF61F6" },
        { label: "Ae",    color: "#D6A4FF" },
        { label: "Id",    color: "#FF3366" },
        { label: "Figma", color: "#F24E1E" },
        { label: "HTML",  color: "#E44D26" },
        { label: "JS",    color: "#F7DF1E" },
        { label: "CSS",   color: "#2965F1" },
      ],
    },
  },

  // ---------- Featured Projects ----------
  projects: {
    title: "Featured Projects",
    intro: [
      "Behind every design is a story.",
      "Explore my projects to see how ideas evolve — from research to refined interfaces.",
      "Click through, try things out, and get a feel for my process.",
    ],
    // 新增项目：复制一个 {} 改内容即可，卡片自动生成
    // cover 为空字符串时显示 tint 纯色占位块
    items: [
      {
        title: "SunLink Neighbours",
        tags: ["UI", "UX", "Dashboard"],
        description:
          "A community platform that solves the imbalance of solar energy usage by enabling neighbors to share surplus power.",
        cover: "assets/img/sunlink-cover.png",
        tint: "#D2FFF1",
        link: "sunlink.html",
      },
      {
        title: "SteamTracker",
        tags: ["Web Design", "Web App"],
        description:
          "A lightweight web app for Steam users that enables custom tracking of game time through active input, ensuring privacy and offline access.",
        cover: "assets/img/steamtracker-cover.jpg",
        tint: "#DBFFD2",
        link: "steamtracker.html",
      },
      {
        title: "Auto-Signaled Bus Stop",
        tags: ["UI", "UX", "Interactive Installation"],
        description:
          "A smart bus stop prototype designed for Sydney's 'wave-to-board' culture, combining schedule info, intent signal, and a social space to improve waiting experience.",
        cover: "",
        tint: "#7EB5EC",
        link: "busstop.html",
      },
      {
        title: "Chocolate 3D Model",
        tags: ["3D Modelling", "3D Printing"],
        description:
          "A form exploration project with custom chocolate moulds developed through 3D modelling, 3D printing and hand chocolate crafting.",
        cover: "",
        tint: "#FFE9C7",
        link: "chocolate.html",
      },
    ],
  },

  // ---------- 页脚 ----------
  footer: {
    thanks: "Thank you for taking the time to view my portfolio",
    email: "zhangtong011211@163.com",
    badge: "Portfolio 2026",
    copyright: "© 2026 Tong Zhang (Amy). Designed & built with care.",
  },
};
