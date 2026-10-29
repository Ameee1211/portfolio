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

  // ============================================================
  // About me 页面（独立页面 about.html，不是首页里的板块）
  // 内容来源：张彤（Amy）简历
  // ============================================================
  aboutPage: {
    hero: {
      eyebrow: "Portfolio 2026 · Hangzhou, China",
      name: "Tong",
      nameAccent: "Zhang",
      alias: "Amy · 张彤",
      roles: ["UI/UX Designer", "Web Designer", "3D Modeller", "Product Designer"],
      lede:
        "I design interfaces, websites and 3D objects from Hangzhou, China. I studied Design Computing at the University of Sydney, and I like problems that arrive messy: too many stakeholders, too many screens, no obvious next step.",
      ctaPrimary: { label: "View my work", href: "index.html#projects" },
      ctaSecondary: { label: "Get in touch", href: "#contact" },
      photo: "assets/img/amy-portrait.jpg",
      floats: ["Figma", "Rhino 7", "Blender", "Adobe CC"],
      stats: [
        { k: "Based in", v: "Hangzhou, China" },
        { k: "Looking for", v: "UI/UX & product roles" },
        { k: "Graduated", v: "USYD · 2024" },
      ],
    },

    philosophy: {
      index: "01",
      label: "How I design",
      statement: [
        { t: "I start with " },
        { t: "whoever has to use the thing", hl: true },
        { t: " — the task they are trying to finish, and the exact point where they get stuck. " },
        { t: "Clarity", hl: true },
        { t: " earns its place before style does; a screen that needs instructions has already failed. I also keep the build in the room while I design, because a decision that " },
        { t: "cannot ship", hl: true },
        { t: " is not a decision." },
      ],
    },

    education: {
      index: "02",
      label: "Education",
      school: "The University of Sydney",
      degree: "Bachelor of Design Computing",
      period: "Mar 2021 — Jul 2024",
      place: "Sydney, Australia",
      gpa: { value: 5.4, max: 7 },
      note:
        "Coursework ran across UI/UX, web and 3D form, which is still the shape of the work I take on.",
      courses: [
        { name: "Principles of Interactive Animation", score: 84 },
        { name: "Product Interaction Design", score: 82 },
        { name: "Design Programming", score: 82 },
        { name: "Advanced Web Design", score: 81 },
      ],
    },

    experience: {
      index: "03",
      label: "Experience",
      items: [
        {
          role: "Interaction Design Assistant",
          org: "Killara Gardens Pathways",
          place: "Sydney, AU",
          period: "Apr 2026 — Sep 2026",
          tags: ["User research", "Requirements", "Interface iteration"],
          points: [
            "Kept the internal operations platform for a residential aged-care home running, and mapped the resident-management and reporting flows to find where the interface created extra work.",
            "Interviewed residents, families and staff as three separate user groups, then turned those conversations into a structured requirements list that steered the redesign.",
            "Grouped scattered feedback on the staff mobile app into themes and worked with the team on the interaction fixes.",
          ],
        },
        {
          role: "Client Manager",
          org: "TRADEMAX Australia Limited",
          place: "Sydney, AU",
          period: "Mar 2023 — Jan 2025",
          tags: ["Market analysis", "Client strategy"],
          points: [
            "Analysed gold and foreign-exchange markets in real time and translated the numbers into advice clients could act on.",
            "Built strategies around each client's risk appetite and portfolio needs; average client returns came up by roughly 7%.",
            "Lived inside the trading platform's analytics tools daily, and grew a base of new clients through regular review calls.",
          ],
        },
        {
          role: "Volunteer",
          org: "Australian Red Cross",
          place: "Sydney, AU",
          period: "Oct 2022 — Mar 2023",
          tags: ["Field observation", "Feedback synthesis"],
          points: [
            "Worked the floor of a charity store, watching how customers and older volunteers handled the POS and inventory system, and noting every point where they hesitated.",
            "Collected feedback from customers and donors and turned it into a structured brief for the retail back-office tools.",
            "Reviewed the store's digital tooling with the team and proposed small fixes that lowered the barrier for volunteers.",
          ],
        },
      ],
    },

    skills: {
      index: "04",
      label: "Skills & tools",
      capabilities: {
        title: "What I do",
        items: [
          { name: "User Research", note: "Interviews, contextual observation, synthesis" },
          { name: "Information Architecture", note: "Flows, structure, naming, navigation" },
          { name: "Prototyping", note: "Wireframes through to clickable high fidelity" },
          { name: "Web Design", note: "Responsive layout, HTML, CSS, JavaScript" },
          { name: "3D Modelling", note: "Form exploration, modelling, 3D printing" },
          { name: "Visual Systems", note: "Type, colour, components, consistency" },
          {
            name: "AI-Assisted Design",
            note: "Prompting for ideation, research and drafting; I keep the judgement and the craft, and let AI take the repetitive half.",
            wide: true,
          },
        ],
      },
      tools: {
        title: "What I use",
        items: [
          { label: "即时设计", color: "#6C5CE7" },
          { label: "Figma", color: "#F24E1E" },
          { label: "Adobe XD", color: "#FF61F6" },
          { label: "Illustrator", color: "#FF9A00" },
          { label: "Photoshop", color: "#31A8FF" },
          { label: "InDesign", color: "#FF3366" },
          { label: "After Effects", color: "#D6A4FF" },
          { label: "Canva", color: "#00C4CC" },
          { label: "Rhino 7", color: "#4B4B4B" },
          { label: "Blender", color: "#EA7600" },
          { label: "Fusion 360", color: "#F5A623" },
          { label: "Sketch", color: "#F7B500" },
          { label: "HTML / CSS / JS", color: "#2965F1" },
        ],
      },
      languages: [
        { name: "Chinese", level: "Native" },
        { name: "English", level: "Professional · PTE 68/90" },
      ],
    },

    contact: {
      index: "06",
      label: "Contact",
      heading: "Let's make something clear.",
      sub: "I'm looking for UI/UX and product design roles in Hangzhou, Shanghai or remote. Email reaches me fastest.",
      items: [
        { label: "Email", value: "zhangtong011211@163.com", copy: true },
        { label: "Phone", value: "19700766036", copy: true },
        { label: "Location", value: "Hangzhou, China · GMT+8", copy: false, hint: "Open to remote work" },
      ],
    },

    interests: {
      index: "05",
      label: "Off the screen",
      intro: "Three things I do away from a desk, and what they quietly teach me about design.",
      items: [
        {
          title: "Crochet",
          kicker: "Hook and yarn",
          text:
            "Amigurumi is structural design with one hook. Every piece starts as a grid of stitches, you work inside that constraint for hours, then break it on purpose in exactly one place. I treat design systems the same way.",
          image: "",
          tint: "#FFE9C7",
          icon: "yarn",
        },
        {
          title: "Indie games",
          kicker: "Small studios, big feelings",
          text:
            "Small games taught me that systems create feeling, not screens. A feedback loop, a nudge, a reward that lands two seconds late: those are interaction decisions long before they become visual ones.",
          image: "",
          tint: "#D2FFF1",
          icon: "gamepad",
        },
        {
          title: "Swimming",
          kicker: "25 m, back and forth",
          text:
            "Laps are the only place I think in straight lines. Most of my information architecture decisions get made somewhere around the eight-hundred-metre mark.",
          image: "",
          tint: "#DCE9FB",
          icon: "wave",
        },
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
