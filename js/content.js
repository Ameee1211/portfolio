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
          { label: "SteamTracker", href: "steamtracker.html" },
          { label: "Auto-Signaled Bus Stop", href: "busstop.html" },
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
    photo: "assets/img/amy-portrait.webp?v=2",
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
      // 与下面 01「How I design」同一件事，只是压成两句
      lede:
        "I design for the moment someone actually uses the thing — how it feels to use, not how it looks in a frame. So I start with the friction: the point where people hesitate, re-read a label, or quietly give up — and I fix that before anything gets decorated.",
      // 首屏只保留一个按钮：导航栏里已经有 Projects，这里的 "View my work" 是重复入口
      cta: { label: "Get in touch", href: "#contact" },
      photo: "assets/img/amy-portrait.webp?v=2",
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
      gpa: { value: 3.4, max: 4 },
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
    // 只保留这一句副标题：它会和 title 交替出现在标题带里（原来那两段说明已按用户要求删掉）
    intro: ["Behind every design is a story."],
    // 新增项目：复制一个 {} 改内容即可，卡片自动生成
    // cover 为空字符串时显示 tint 纯色占位块
    items: [
      {
        title: "SunLink Neighbours",
        tags: ["UI/UX", "Dashboard", "Product Design"],
        description:
          "A community platform that solves the imbalance of solar energy usage by enabling neighbors to share surplus power.",
        cover: "assets/img/card-sunlink.webp",
        tint: "#D2FFF1",
        link: "sunlink.html",
      },
      {
        title: "SteamTracker",
        tags: ["Web Design", "Web App"],
        description:
          "A lightweight web app for Steam users that enables custom tracking of game time through active input, ensuring privacy and offline access.",
        cover: "assets/img/card-steamtracker.webp",
        tint: "#DBFFD2",
        link: "steamtracker.html",
      },
      {
        title: "Auto-Signaled Bus Stop",
        tags: ["UI", "UX", "Interactive Installation"],
        description:
          "A smart bus stop prototype designed for Sydney's 'wave-to-board' culture, combining schedule info, intent signal, and a social space to improve waiting experience.",
        cover: "assets/img/card-busstop.webp",
        tint: "#7EB5EC",
        link: "busstop.html",
      },
      {
        title: "Chocolate 3D Model",
        tags: ["3D Modelling", "3D Printing"],
        description:
          "A form exploration project with custom chocolate moulds developed through 3D modelling, 3D printing and hand chocolate crafting.",
        cover: "assets/img/choc/cho-cover.webp",
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

/* ============================================================
   软件图标（内联 SVG）—— 首页 About 的 Skills 与 About 页 What I use 共用
   ============================================================ */
const TOOL_ICONS = {
  "即时设计": '<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="4.4" fill="#6C5CE7"/><text x="12" y="16.2" font-family="PingFang SC,Microsoft YaHei,sans-serif" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">即</text></svg>',
  "Figma": '<svg fill="#F24E1E" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.097-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-.098z"/></svg>',
  "Adobe XD": '<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="4.4" fill="#FF61F6"/><text x="12" y="15.5" font-family="Helvetica,Arial,sans-serif" font-size="8.4" font-weight="700" fill="#470137" text-anchor="middle" letter-spacing="-0.2">Xd</text></svg>',
  "Illustrator": '<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="4.4" fill="#FF9A00"/><text x="12" y="15.5" font-family="Helvetica,Arial,sans-serif" font-size="8.4" font-weight="700" fill="#330000" text-anchor="middle" letter-spacing="-0.2">Ai</text></svg>',
  "Photoshop": '<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="4.4" fill="#31A8FF"/><text x="12" y="15.5" font-family="Helvetica,Arial,sans-serif" font-size="8.4" font-weight="700" fill="#001E36" text-anchor="middle" letter-spacing="-0.2">Ps</text></svg>',
  "InDesign": '<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="4.4" fill="#FF3366"/><text x="12" y="15.5" font-family="Helvetica,Arial,sans-serif" font-size="8.4" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="-0.2">Id</text></svg>',
  "After Effects": '<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="4.4" fill="#9999FF"/><text x="12" y="15.5" font-family="Helvetica,Arial,sans-serif" font-size="8.4" font-weight="700" fill="#00005B" text-anchor="middle" letter-spacing="-0.2">Ae</text></svg>',
  "Canva": '<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="cvG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#00C4CC"/><stop offset="1" stop-color="#7D2AE8"/></linearGradient></defs><circle cx="12" cy="12" r="12" fill="url(#cvG)"/><text x="12" y="16.6" font-family="Georgia,serif" font-size="12" font-weight="700" fill="#fff" text-anchor="middle">C</text></svg>',
  "Rhino 7": '<svg fill="#4B4B4B" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.823 3.103c-.1 0-.213.006-.34.017-.511.044-1.25.18-1.802.329a6.269 6.269 0 0 0-1.15.42c-.231.112-.33.178-.354.273-.023.094.028.217.16.436s.346.533.535.961c.19.428.356.97.361 1.651.006.68-.149 1.5-.245 1.962-.096.462-.133.568-.227.618-.094.05-.245.044-.525-.021-.281-.065-.69-.187-1.1-.259-.41-.072-.819-.093-1.122-.038-.304.056-.504.189-.645.369-.14.18-.224.406-.282.75A6.957 6.957 0 0 0 0 11.687c.005.317.047.49.136.584.088.094.223.109.492.054s.672-.18 1.224-.215a6.302 6.302 0 0 1 1.94.202c.685.182 1.353.49 1.95.93.598.438 1.127 1.007 1.566 1.593.438.586.787 1.189 1.004 1.541.217.353.304.455.372.42.068-.035.117-.207.145-.417a3.141 3.141 0 0 0-.02-.848 7.467 7.467 0 0 0-.32-1.365 5.617 5.617 0 0 0-.495-1.018c-.146-.247-.241-.408-.245-.51-.004-.103.085-.148.51-.315.424-.167 1.185-.457 1.958-.808.772-.351 1.556-.764 2.042-1.106.486-.341.674-.61.724-.937.05-.326-.039-.71-.16-1.076a6.93 6.93 0 0 0-.529-1.193A13.696 13.696 0 0 0 11.28 5.6a9.187 9.187 0 0 0-1.1-1.236c-.282-.255-.421-.31-.51-.29-.09.02-.131.115-.168.47-.037.356-.07.973-.144 1.559a7.468 7.468 0 0 1-.432 1.773 12.543 12.543 0 0 1-.99 1.982c-.388.64-.803 1.212-1.054 1.462-.25.25-.336.18-.477.064l-.486-.4c-.15-.125-.253-.213-.273-.293-.02-.08.045-.15.27-.448.227-.299.615-.825.96-1.478a7.75 7.75 0 0 0 .796-2.282 10.1 10.1 0 0 0 .095-2.338c-.044-.564-.124-.77-.306-.896-.137-.095-.332-.146-.638-.146zm6.48 7.034h-.012c-.084.01-.192.112-.415.294a6.86 6.86 0 0 1-1.017.7c-.458.257-1.038.507-1.51.734-.47.226-.831.429-1.004.712-.172.283-.155.648.04.85.194.204.566.246.883.259.318.013.58-.002.826.087.246.09.475.285.764.516.288.23.637.498.925.561.289.063.518-.079.766-.202.249-.124.516-.23.888-.225.371.005.847.12 1.318.37.47.248.938.63 1.184.866.247.236.272.327.245.362-.028.036-.108.018-.304-.14-.196-.157-.508-.454-.917-.688-.41-.234-.916-.404-1.4-.391-.482.013-.94.21-1.23.55-.29.34-.412.822-.546 1.164-.133.341-.28.543-.47.617-.19.074-.424.02-.703-.099-.28-.12-.604-.307-.874-.442-.269-.136-.484-.22-.62-.353-.136-.132-.195-.31-.203-.571-.01-.26.032-.6.05-.853.02-.25.018-.413-.038-.56a1.079 1.079 0 0 0-.232-.35c-.07-.07-.099-.075-.113-.058-.014.017-.012.058.01.158.023.1.067.26.05.581-.019.321-.098.803-.16 1.17-.062.366-.107.618-.02.808.087.191.306.322.707.54.4.22.982.527 1.518.855.537.327 1.027.673 1.562 1.089.534.415 1.112.9 1.5 1.238.39.339.588.532.742.59.154.059.264-.018.307-.138.044-.12.023-.285-.014-.429a1.174 1.174 0 0 0-.24-.46 4.92 4.92 0 0 0-.68-.704c-.287-.243-.614-.463-.803-.614-.19-.151-.242-.233-.212-.259.03-.026.14.004.302.108.162.103.375.28.612.459.237.178.499.356.733.584.235.228.443.506.583.706.14.201.214.324.294.372.08.049.165.022.277-.05a3.03 3.03 0 0 0 .426-.355c.178-.169.398-.393.551-.633.154-.24.242-.496.299-.772.056-.276.08-.572.247-.862.167-.29.476-.574.994-1.025.518-.451 1.244-1.07 1.891-1.664.648-.595 1.216-1.165 1.696-1.802.479-.638.87-1.342 1.067-1.743.199-.4.205-.498.14-.526-.063-.027-.198.015-.61.313-.414.297-1.106.849-1.886 1.43-.781.58-1.65 1.19-2.336 1.569-.686.378-1.19.524-1.55.562-.361.037-.58-.034-.724-.11-.143-.077-.21-.158-.224-.241-.013-.084.03-.17.135-.275.106-.106.277-.232.447-.392.17-.16.338-.354.468-.556.13-.202.22-.411.261-.592.042-.181.034-.333-.04-.376-.074-.043-.215.023-.376.11-.162.086-.343.192-.593.3a2.683 2.683 0 0 1-.92.235 1.626 1.626 0 0 1-1.088-.313c-.343-.26-.635-.71-.866-1.147-.23-.438-.398-.865-.512-1.12-.108-.242-.168-.33-.246-.33zm-2.215 4.075a.422.422 0 0 0-.294.115c-.094.086-.145.2-.034.338.112.137.385.297.636.469.252.172.481.357.666.42.184.064.323.006.402-.096.08-.102.1-.247-.003-.404-.103-.157-.327-.325-.564-.481-.238-.157-.488-.302-.681-.346a.574.574 0 0 0-.128-.015zm.252.208c.025 0 .053.003.083.01.118.026.272.115.418.211.145.096.283.2.333.289.05.089.014.163-.048.216a.255.255 0 0 1-.247.053c-.1-.031-.216-.126-.36-.219-.145-.093-.319-.184-.387-.268-.068-.084-.031-.162.029-.218a.26.26 0 0 1 .18-.074zm4.778 3.728c.211-.008.42.06.602.24.183.178.34.467.383.732.042.265-.03.505-.125.692a1.58 1.58 0 0 1-.289.397c-.074.074-.109.095-.14.095h-.003c-.033-.001-.062-.023-.208-.171a7.39 7.39 0 0 1-.573-.642c-.165-.22-.232-.383-.263-.568-.032-.185-.027-.39.082-.536.109-.146.323-.23.534-.239zm.093 1.111a.258.258 0 0 0-.153.046c-.058.041-.105.113-.093.185.012.073.085.146.174.255.089.11.195.255.264.335.068.08.1.093.127.091.029-.002.054-.018.086-.048a.349.349 0 0 0 .094-.157.518.518 0 0 0 .002-.316.668.668 0 0 0-.218-.282.476.476 0 0 0-.283-.109z"/></svg>',
  "Blender": '<svg fill="#EA7600" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.51 13.214c.046-.8.438-1.506 1.03-2.006a3.424 3.424 0 0 1 2.212-.79c.85 0 1.631.3 2.211.79.592.5.983 1.206 1.028 2.005.045.823-.285 1.586-.865 2.153a3.389 3.389 0 0 1-2.374.938 3.393 3.393 0 0 1-2.376-.938c-.58-.567-.91-1.33-.865-2.152M7.35 14.831c.006.314.106.922.256 1.398a7.372 7.372 0 0 0 1.593 2.757 8.227 8.227 0 0 0 2.787 2.001 8.947 8.947 0 0 0 3.66.76 8.964 8.964 0 0 0 3.657-.772 8.285 8.285 0 0 0 2.785-2.01 7.428 7.428 0 0 0 1.592-2.762 6.964 6.964 0 0 0 .25-3.074 7.123 7.123 0 0 0-1.016-2.779 7.764 7.764 0 0 0-1.852-2.043h.002L13.566 2.55l-.02-.015c-.492-.378-1.319-.376-1.86.002-.547.382-.609 1.015-.123 1.415l-.001.001 3.126 2.543-9.53.01h-.013c-.788.001-1.545.518-1.695 1.172-.154.665.38 1.217 1.2 1.22V8.9l4.83-.01-8.62 6.617-.034.025c-.813.622-1.075 1.658-.563 2.313.52.667 1.625.668 2.447.004L7.414 14s-.069.52-.063.831zm12.09 1.741c-.97.988-2.326 1.548-3.795 1.55-1.47.004-2.827-.552-3.797-1.538a4.51 4.51 0 0 1-1.036-1.622 4.282 4.282 0 0 1 .282-3.519 4.702 4.702 0 0 1 1.153-1.371c.942-.768 2.141-1.183 3.396-1.185 1.256-.002 2.455.41 3.398 1.175.48.391.87.854 1.152 1.367a4.28 4.28 0 0 1 .522 1.706 4.236 4.236 0 0 1-.239 1.811 4.54 4.54 0 0 1-1.035 1.626"/></svg>',
  "Fusion 360": '<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="fsG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFB300"/><stop offset="1" stop-color="#F57C00"/></linearGradient></defs><rect width="24" height="24" rx="4.4" fill="url(#fsG)"/><text x="12" y="15.8" font-family="Helvetica,Arial,sans-serif" font-size="9.5" font-weight="700" fill="#fff" text-anchor="middle">F</text></svg>',
  "Sketch": '<svg fill="#F7B500" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 1.25l6.75 6.637V2L12 1.25zm0 0l-6.05 7h12.1l-6.05-7zm0 0L5.25 2v5.887L12 1.25zM5.25 2L0 9l4.416-.68L5.25 2zM0 9l11.959 13.703.008-.014L4.443 9H0zm18.75-7l.834 6.32L24 9l-5.25-7zM24 9h-4.506l-7.523 13.69.029.06L24 9zM12 22.75l-.031-.057-.008.012.039.045zM5.436 9l6.533 13.686L18.564 9H5.436Z"/></svg>',
  "HTML / CSS / JS": '<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="4.4" fill="#2965F1"/><text x="12" y="15.4" font-family="Helvetica,Arial,sans-serif" font-size="7.4" font-weight="700" fill="#fff" text-anchor="middle">&lt;/&gt;</text></svg>',
};

// 首页 About 的 Skills 与 About 页 What I use 保持同一组软件、同一组图标
SITE.about.skills.items = SITE.aboutPage.skills.tools.items;
