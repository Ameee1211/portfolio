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
  // 两套题：桌面横向、手机竖版（手机不是桌面版缩小，而是重新排的竖版迷宫）
  // letters：每个字符串是一行；words：cells 为 [行序号, 列序号]（都从 0 开始数）
  // cell：[格宽, 格高]（SVG 内部单位）· band：高亮条厚度 · font：字母字号
  wordsearch: {
    // 桌面 / 平板横屏：6 行 × 8 列
    desktop: {
      cell: [150, 100],
      band: 64,
      font: 64,
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
    },
    // 手机竖屏：7 行 × 6 列，DESIGN 竖排、TONG 斜排落在共用的 G 上
    mobile: {
      cell: [100, 122],
      band: 76,
      font: 58,
      letters: [
        "DXLMNP",
        "ECTRKZ",
        "SANOIH",
        "ILWENJ",
        "GZHANG",
        "NVQBFR",
        "PUIWUX",
      ],
      words: [
        { text: "TONG",   cells: [[1, 2], [2, 3], [3, 4], [4, 5]] },
        { text: "ZHANG",  cells: [[4, 1], [4, 2], [4, 3], [4, 4], [4, 5]] },
        { text: "UI",     cells: [[6, 1], [6, 2]] },
        { text: "UX",     cells: [[6, 4], [6, 5]] },
        { text: "DESIGN", cells: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]] },
      ],
    },
    // 连对任意一个词就算全部完成：放 WELCOME 字样 + 小星星 + 小猫，然后滚到 About 板块
    finale: {
      text: "WELCOME",
      stars: 16,
      cats: 3,
      holdMs: 650,
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
      name: "Tong",
      nameAccent: "Zhang",
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
        { t: "I design for the moment someone actually uses the thing — " },
        { t: "how it feels to use", hl: true },
        { t: ", not how it looks in a frame. So I start with the friction: the point where people hesitate, re-read the same label, or quietly give up and do it another way. That gets fixed before anything gets decorated. " },
        { t: "Experience comes first", hl: true },
        { t: "; visual polish has to earn its place on top of it. AI is part of how I work now — I use it to explore more directions, draft faster and pressure-test my own thinking before I commit — but " },
        { t: "the judgement stays mine", hl: true },
        { t: "." },
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
          {
            name: "User Research",
            note: "Interviews, contextual observation, synthesis",
            chips: ["Interviews", "Observation"],
          },
          {
            name: "Information Architecture",
            note: "Flows, structure, naming, navigation",
            chips: ["Flows", "Naming"],
          },
          {
            name: "Prototyping",
            note: "Wireframes through to clickable high fidelity",
            chips: ["Wireframes", "Prototypes"],
          },
          {
            name: "Web Design",
            note: "Responsive layout, HTML, CSS, JavaScript",
            chips: ["HTML / CSS", "Responsive"],
          },
          {
            name: "3D Modelling",
            note: "Form exploration, modelling, 3D printing",
            chips: ["Rhino", "3D print"],
          },
          {
            name: "Visual Systems",
            note: "Type, colour, components, consistency",
            chips: ["Type", "Components"],
          },
          {
            name: "AI-Assisted Design",
            note: "AI does the repetitive half — I keep the judgement and the craft.",
            chips: ["Prompting", "Drafting", "Critique"],
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
      // 每张卡片可点击展开：more 里是展开后的内容
      // type: "gallery" 图集 / "list" 条目 / "awards" 奖项 + 配图
      items: [
        {
          title: "Crochet",
          kicker: "Hats, scarves, bags",
          text:
            "I make things I can actually wear out of the house: hats, scarves, bags. Practical objects are unforgiving — yarn weight, gauge, the size of a head — so you commit to the rules first, then break exactly one on purpose. That is how I treat a design system.",
          image: "assets/img/int-crochet.jpg?v=2",
          tint: "#FFE9C7",
          icon: "yarn",
          more: {
            heading: "Three things I made and still use",
            lead:
              "If it doesn't get worn, it doesn't get finished. All three of these started on one hook and a single ball of yarn.",
            type: "gallery",
            items: [
              { label: "My hat", meta: "Cat-ear beanie · mohair", image: "assets/img/work-hat.jpg?v=2", tint: "#FFE9C7", icon: "yarn" },
              { label: "My scarf", meta: "Chunky knit · variegated wool", image: "assets/img/work-scarf.jpg?v=2", tint: "#D2FFF1", icon: "yarn" },
              { label: "My bag", meta: "Granny-square tote · cotton", image: "assets/img/work-bag.jpg?v=2", tint: "#DCE9FB", icon: "yarn" },
            ],
          },
        },
        {
          title: "Games",
          kicker: "Worlds I get lost in",
          text:
            "Games are interaction design turned up loud. A space that tells you where to go without a marker, a resource so scarce you check your inventory twice, a silence that does the emotional work a soundtrack usually does — I borrow that restraint for interfaces.",
          image: "assets/img/int-games.jpg?v=2",
          // 展开后窄列改用竖版商店页，避免把界面文字裁断
          imageOpen: "assets/img/int-games-open.jpg?v=2",
          tint: "#D2FFF1",
          icon: "gamepad",
          more: {
            heading: "Three I keep coming back to",
            lead: "Each one taught me something I now use in interface work.",
            type: "list",
            items: [
              {
                title: "What Remains of Edith Finch",
                meta: "Giant Sparrow · 2017",
                note:
                  "Every room explains who lived in it without a line of exposition. That is information architecture doing emotional work — I steal the idea of revealing structure through objects instead of menus.",
              },
              {
                title: "The Last of Us",
                meta: "Naughty Dog · 2013",
                note:
                  "Almost no HUD, no quest markers: you read the rooms instead of the map. Crafting is deliberately slow and scarce, so every item you pick up becomes a decision. Tension built out of interaction, never explained by a cutscene.",
              },
              {
                title: "Florence",
                meta: "Mountains · 2018",
                note:
                  "A puzzle shaped like an argument, not a description of one. Interaction can carry the feeling on its own — the copy does not have to explain it.",
              },
            ],
          },
        },
        {
          title: "Swimming & diving",
          kicker: "Laps and one long breath",
          text:
            "Pool laps and open-water dives teach the same lesson at different depths: breathe, relax, stop fighting the water. Most of my layout decisions get settled somewhere around the eight-hundred-metre mark; the rest get settled underwater.",
          image: "assets/img/int-diving.jpg",
          tint: "#DCE9FB",
          icon: "wave",
          more: {
            heading: "In the water, competitively and otherwise",
            lead: "I raced as a kid, taught it later, and still spend weekends underneath it.",
            type: "awards",
            items: [
              { k: "Won", v: "2nd place, National Youth Swimming Championship, China" },
              { k: "Certified", v: "Swimming Instructor Certificate, Australia" },
              { k: "Freediver", v: "Open-water dives on weekends, chasing the quiet" },
            ],
            // 潜水照片：把文件放进 assets/img/ 后把路径填在这里
            image: "assets/img/int-underwater.jpg",
            imageCaption: "Under the surface, off the coast",
            tint: "#CFE6FF",
          },
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
    note:
      "If you'd like to work together — or simply say hello — I'd love to hear from you.",
    email: "zhangtong011211@163.com",
    phone: "19700766036",
    copyright: "© 2026 Tong Zhang (Amy). Designed & built with care.",
  },
};
