/* ============================================================
   内容配置文件 —— 日后修改网站内容只需要改这个文件
   改完保存、push 到 GitHub，网站几分钟内自动更新
   ============================================================ */

const SITE = {
  // ---------- 顶部导航 ----------
  nav: {
    brand: "Amy.",
    links: [
      { label: "Home", href: "#home" },
      { label: "About me", href: "#about" },
      {
        label: "Projects",
        // 下拉菜单：对应下方 projects 数组的 id
        dropdown: [
          { label: "SunLink Neighbours", anchor: "#proj-sunlink" },
          { label: "Auto-Signaled Bus Stop", anchor: "#proj-busstop" },
          { label: "SteamTracker", anchor: "#proj-steamtracker" },
          { label: "Chocolate 3D Model", anchor: "#proj-chocolate" },
        ],
      },
    ],
    cta: { label: "Explore More", href: "#projects" },
  },

  // ---------- 首屏 Hero ----------
  hero: {
    greeting: "Hi, I'm",
    name: "Tong Zhang (Amy)",
    role: "UI/UX Designer",
    subrole: "Design Computing @ University of Sydney",
    slogan:
      "I believe great design starts with listening. Whether it's a passing comment or a quiet habit, I turn subtle user needs into bold digital experiences.",
    badge: "Portfolio 2026",
    scrollHint: "Scroll to explore",
    photo: "assets/img/amy-portrait.jpg",
  },

  // ---------- 精选项目 ----------
  // 日后新增项目：复制一个 {} 改内容即可，卡片自动生成
  // cover 为空字符串时显示占位色块
  projects: [
    {
      id: "sunlink",
      title: "SunLink Neighbours",
      description:
        "A community platform that solves the imbalance of solar energy usage by enabling neighbors to share surplus power.",
      tags: ["Web Design", "Dashboard"],
      cover: "assets/img/sunlink-cover.png",
      link: "", // 日后补充详情页链接，如 "projects/sunlink.html"
    },
    {
      id: "busstop",
      title: "Auto-Signaled Bus Stop",
      description:
        "A smart bus stop prototype designed for Sydney's 'wave-to-board' culture, combining schedule info, intent signal, and a social space to improve waiting experience.",
      tags: ["Interactive Installation"],
      cover: "",
      link: "",
    },
    {
      id: "steamtracker",
      title: "SteamTracker",
      description:
        "A lightweight web app for Steam users that enables custom tracking of game time through active input, ensuring privacy and offline access.",
      tags: ["Web App", "Responsive"],
      cover: "assets/img/steamtracker-cover.jpg",
      link: "",
    },
    {
      id: "chocolate",
      title: "Chocolate 3D Model",
      description:
        "A form exploration project with custom chocolate moulds developed through 3D modelling, 3D printing and hand chocolate crafting.",
      tags: ["3D Modelling", "Form Design"],
      cover: "",
      link: "",
    },
  ],

  // ---------- 过渡语段 ----------
  story: {
    title: "Behind every design is a story.",
    text: "Explore my projects to see how ideas evolve — from research to refined interfaces. Click through, try things out, and get a feel for my process.",
  },

  // ---------- 关于我简版（首屏底部） ----------
  about: {
    heading: "About me",
    lines: [
      "UI/UX Designer based in Sydney, currently studying Bachelor of Design Computing at the University of Sydney.",
      "I care about usability, clarity, and designs that can actually be built.",
    ],
  },

  // ---------- 页脚 ----------
  footer: {
    email: "zhangtong011211@163.com",
    note: "All projects are undergraduate coursework.",
    copyright: "© 2026 Tong Zhang (Amy). Designed & built with care.",
  },
};
