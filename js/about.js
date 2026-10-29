/* ============================================================
   About me 页面渲染 —— 数据来自 content.js 的 SITE.aboutPage
   ============================================================ */

const AB = SITE.aboutPage;

/* ---------- 兴趣区的小图形 ---------- */
const INT_ICONS = {
  yarn: `<svg class="ab-int__icon" viewBox="0 0 72 72" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
    <circle cx="32" cy="38" r="21"/>
    <path d="M15 30c9 2 20 10 26 22"/>
    <path d="M20 52c8-9 20-16 30-15"/>
    <path d="M28 18c-4 10 2 24 12 32"/>
    <path d="M47 55c6 3 10 6 12 10"/>
  </svg>`,
  gamepad: `<svg class="ab-int__icon" viewBox="0 0 72 72" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 26h28a14 14 0 0 1 13.6 17.4l-1.9 9.2A6.4 6.4 0 0 1 49 55l-4.6-7h-17L23 55a6.4 6.4 0 0 1-12.4-2.4l-1.9-9.2A14 14 0 0 1 22 26Z"/>
    <path d="M24 33v10M19 38h10"/>
    <circle cx="48" cy="35" r="2.6"/>
    <circle cx="54" cy="41" r="2.6"/>
  </svg>`,
  wave: `<svg class="ab-int__icon" viewBox="0 0 72 72" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
    <path d="M8 28c6-6 12-6 18 0s12 6 18 0 12-6 18 0"/>
    <path d="M8 40c6-6 12-6 18 0s12 6 18 0 12-6 18 0"/>
    <path d="M8 52c6-6 12-6 18 0s12 6 18 0 12-6 18 0"/>
  </svg>`,
};

/* ---------- 1. 首屏 ---------- */
function abRenderHero() {
  const h = AB.hero;
  // 首屏背景里的字母：沿用首页迷宫的桌面版字母表（此处只取字母做底纹）
  const letters = SITE.wordsearch.desktop.letters.join("").split("");
  const ghost = letters
    .map((ch, i) => `<span style="--i:${i}">${esc(ch)}</span>`)
    .join("");

  const roles = h.roles.map((r) => `<span class="ab-role">${esc(r)}</span>`).join("");
  const stats = h.stats
    .map((s) => `<div class="ab-meta"><div class="ab-meta__k">${esc(s.k)}</div><div class="ab-meta__v">${esc(s.v)}</div></div>`)
    .join("");
  const floats = h.floats
    .map((f, i) => `<span class="ab-float ab-float--${i + 1}">${esc(f)}</span>`)
    .join("");

  return `
  <section class="ab-hero" id="top">
    <div class="ab-hero__ghost" id="abGhost" aria-hidden="true">${ghost}</div>
    <div class="ab-wrap ab-hero__inner">
      <div class="ab-hero__lead">
        <h1 class="ab-hero__name" data-ab-in="1">${esc(h.name)} <em>${esc(h.nameAccent)}</em>
        </h1>
      </div>
      <div class="ab-hero__right" data-ab-in="2">
        <div class="ab-stage" id="abStage">
          <span class="ab-stage__blob" aria-hidden="true"></span>
          <span class="ab-stage__ring" aria-hidden="true"></span>
          <div class="ab-photo" id="abPhoto">
            <img src="${esc(h.photo)}" alt="Portrait of Tong Zhang (Amy)" />
            <span class="ab-photo__glare" aria-hidden="true"></span>
          </div>
          ${floats}
        </div>
      </div>
      <div class="ab-hero__rest">
        <div class="ab-roles" id="abRoles" data-ab-in="3">${roles}</div>
        <p class="ab-hero__lede" data-ab-in="4">${esc(h.lede)}</p>
        <div class="ab-hero__cta" data-ab-in="5">
          <a class="ab-btn-ghost" href="${esc(h.cta.href)}">${esc(h.cta.label)}</a>
        </div>
        <div class="ab-hero__meta" data-ab-in="6">${stats}</div>
      </div>
    </div>
    <a class="scrollcue ab-hero__cue" href="#philosophy" aria-label="Scroll down to explore more">
      <span class="scrollcue__txt">Scroll down to explore more</span>
      <span class="scrollcue__line" aria-hidden="true"><i></i></span>
    </a>
  </section>`;
}

/* ---------- 2. 设计理念 ---------- */
function abRenderPhilosophy() {
  const p = AB.philosophy;
  const body = p.statement
    .map((s) => (s.hl ? `<span class="hl">${esc(s.t)}</span>` : esc(s.t)))
    .join("");
  return `
  <section class="ab-sec ab-sec--cream" id="philosophy">
    <div class="ab-wrap">
      <div class="ab-head">
        <span class="ab-head__num">${esc(p.index)}</span>
        <span class="ab-head__label">${esc(p.label)}</span>
        <span class="ab-head__rule"></span>
      </div>
      <span class="ab-philosophy__mark" aria-hidden="true"></span>
      <p class="ab-philosophy__statement" id="abPhilosophy">${body}</p>
    </div>
  </section>`;
}

/* ---------- 3. 教育背景 ---------- */
function abRenderEducation() {
  const e = AB.education;
  const R = 86;
  const C = 2 * Math.PI * R;
  const ratio = e.gpa.value / e.gpa.max;

  const courses = e.courses
    .map(
      (c) => `
      <div class="ab-course">
        <span class="ab-course__name">${esc(c.name)}</span>
        <span class="ab-course__score">${c.score}</span>
        <span class="ab-course__bar"><span class="ab-course__fill" data-w="${c.score}"></span></span>
      </div>`
    )
    .join("");

  return `
  <section class="ab-sec ab-sec--white" id="education">
    <div class="ab-wrap">
      <div class="ab-head">
        <span class="ab-head__num">${esc(e.index)}</span>
        <span class="ab-head__label">${esc(e.label)}</span>
        <span class="ab-head__rule"></span>
      </div>
      <div class="ab-edu">
        <div class="ab-gpa">
          <svg viewBox="0 0 200 200" role="img" aria-label="GPA ${e.gpa.value} out of ${e.gpa.max}">
            <defs>
              <linearGradient id="abGpaGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#7EB5EC" />
                <stop offset="100%" stop-color="#7469B6" />
              </linearGradient>
            </defs>
            <circle class="ab-gpa__track" cx="100" cy="100" r="${R}" />
            <circle class="ab-gpa__arc" id="abGpaArc" cx="100" cy="100" r="${R}"
              transform="rotate(-90 100 100)"
              stroke-dasharray="${C.toFixed(2)}"
              stroke-dashoffset="${C.toFixed(2)}"
              data-off="${(C * (1 - ratio)).toFixed(2)}" />
          </svg>
          <div class="ab-gpa__center">
            <span class="ab-gpa__value">${e.gpa.value}</span>
            <span class="ab-gpa__max">out of ${e.gpa.max}</span>
            <span class="ab-gpa__cap">GPA</span>
          </div>
        </div>
        <div class="ab-edu__body">
          <h3 class="ab-edu__degree">${esc(e.degree)}</h3>
          <p class="ab-edu__school">${esc(e.school)}</p>
          <div class="ab-edu__meta">
            <span>${esc(e.period)}</span>
            <span>${esc(e.place)}</span>
          </div>
          <p class="ab-edu__note">${esc(e.note)}</p>
          <div class="ab-courses" id="abCourses">${courses}</div>
        </div>
      </div>
    </div>
  </section>`;
}

/* ---------- 4. 相关经历 ---------- */
function abRenderExperience() {
  const x = AB.experience;
  const items = x.items
    .map(
      (it) => `
      <article class="ab-exp reveal">
        <span class="ab-exp__dot" aria-hidden="true"></span>
        <div class="ab-exp__top">
          <div>
            <h3 class="ab-exp__role">${esc(it.role)}</h3>
            <p class="ab-exp__org">${esc(it.org)} · ${esc(it.place)}</p>
          </div>
          <span class="ab-exp__period">${esc(it.period)}</span>
        </div>
        <ul class="ab-exp__points">
          ${it.points.map((p) => `<li>${esc(p)}</li>`).join("")}
        </ul>
        <div class="ab-exp__tags">
          ${it.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}
        </div>
      </article>`
    )
    .join("");

  return `
  <section class="ab-sec" id="experience">
    <div class="ab-wrap">
      <div class="ab-head">
        <span class="ab-head__num">${esc(x.index)}</span>
        <span class="ab-head__label">${esc(x.label)}</span>
        <span class="ab-head__rule"></span>
      </div>
      <div class="ab-timeline">${items}</div>
    </div>
  </section>`;
}

/* ---------- 5. 技能与工具 ---------- */
// 8 个等大瓦片：7 项能力 + 语言。全部同构（编号 / 名称 / 说明 / 关键词标签），
// 用户一眼扫下来就能抓到"会什么"，不用在不同形状的卡片里找。
function abRenderSkills() {
  const s = AB.skills;

  const tiles = s.capabilities.items
    .map(
      (c, i) => `
      <article class="ab-skill">
        <span class="ab-skill__num">${String(i + 1).padStart(2, "0")}</span>
        <h3 class="ab-skill__name">${esc(c.name)}</h3>
        <p class="ab-skill__note">${esc(c.note)}</p>
        ${
          c.chips && c.chips.length
            ? `<div class="ab-skill__chips">${c.chips.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>`
            : ""
        }
      </article>`
    )
    .join("");

  const langRows = (s.languages || [])
    .map(
      (l) => `
        <span class="ab-skill__langrow"><b>${esc(l.name)}</b>${esc(l.level)}</span>`
    )
    .join("");

  const langTile = s.languages && s.languages.length
    ? `
      <article class="ab-skill ab-skill--lang">
        <span class="ab-skill__num">LANG</span>
        <h3 class="ab-skill__name">Languages</h3>
        <div class="ab-skill__langs">${langRows}</div>
      </article>`
    : "";

  const tools = s.tools.items
    .map((t) => `<span class="ab-tool" style="--c:${esc(t.color)}">${esc(t.label)}</span>`)
    .join("");

  return `
  <section class="ab-sec ab-sec--white" id="skills">
    <div class="ab-wrap">
      <div class="ab-head">
        <span class="ab-head__num">${esc(s.index)}</span>
        <span class="ab-head__label">${esc(s.label)}</span>
        <span class="ab-head__rule"></span>
      </div>
      <p class="ab-skills__lead">Eight things that show up on almost every project, from first interview to final build.</p>
      <div class="ab-skillgrid">${tiles}${langTile}</div>
      <div class="ab-toolbelt">
        <h3 class="ab-group__title">${esc(s.tools.title)}</h3>
        <div class="ab-tools">${tools}</div>
      </div>
    </div>
  </section>`;
}


/* ---------- 6. 联系方式 ---------- */
function abRenderContact() {
  const c = AB.contact;
  const rows = c.items
    .map((it) => {
      const hint = it.hint || (it.copy === false ? "" : "Click to copy");
      if (it.copy === false) {
        return `
      <div class="ab-contact__row is-static">
        <span class="ab-contact__k">${esc(it.label)}</span>
        <span class="ab-contact__v">${esc(it.value)}</span>
        <span class="ab-contact__hint">${esc(hint)}</span>
      </div>`;
      }
      return `
      <button class="ab-contact__row" type="button" data-copy="${esc(it.value)}">
        <span class="ab-contact__k">${esc(it.label)}</span>
        <span class="ab-contact__v">${esc(it.value)}</span>
        <span class="ab-contact__hint">${esc(hint)}</span>
      </button>`;
    })
    .join("");

  return `
  <section class="ab-sec" id="contact">
    <div class="ab-wrap">
      <div class="ab-contact__card">
        <span class="ab-contact__glow" aria-hidden="true"></span>
        <div class="ab-head">
          <span class="ab-head__num">${esc(c.index)}</span>
          <span class="ab-head__label">${esc(c.label)}</span>
          <span class="ab-head__rule"></span>
        </div>
        <h2 class="ab-contact__heading">${esc(c.heading)}</h2>
        <p class="ab-contact__sub">${esc(c.sub)}</p>
        <div class="ab-contact__rows">${rows}</div>
      </div>
    </div>
  </section>`;
}

/* ---------- 7. 个人兴趣 ---------- */
// 展开后的内容：图集 / 条目 / 奖项
function abMoreBody(m) {
  if (!m) return "";

  const head = `
    <div class="ab-more__head">
      <div>
        <h4 class="ab-more__heading">${esc(m.heading)}</h4>
        <p class="ab-more__lead">${esc(m.lead)}</p>
      </div>
    </div>`;

  let body = "";

  if (m.type === "gallery") {
    body = `<div class="ab-more__grid">${m.items
      .map(
        (it) => `
        <figure class="ab-more__tile" style="--tint:${esc(it.tint || "#FFE9C7")}">
          ${
            it.image
              ? `<img src="${esc(it.image)}" alt="${esc(it.label)}" loading="lazy" />`
              : `<span class="ab-more__ph" aria-hidden="true">${INT_ICONS[it.icon] || ""}</span>`
          }
          <figcaption>
            <span class="ab-more__t">${esc(it.label)}</span>
            <span class="ab-more__m">${esc(it.meta)}</span>
          </figcaption>
        </figure>`
      )
      .join("")}</div>`;
  } else if (m.type === "list") {
    body = `<ol class="ab-more__list">${m.items
      .map(
        (it, i) => `
        <li class="ab-more__row">
          <span class="ab-more__idx">${String(i + 1).padStart(2, "0")}</span>
          <div class="ab-more__rowbody">
            <h5 class="ab-more__item">${esc(it.title)}<span class="ab-more__meta">${esc(it.meta)}</span></h5>
            <p class="ab-more__note">${esc(it.note)}</p>
          </div>
        </li>`
      )
      .join("")}</ol>`;
  } else if (m.type === "awards") {
    body = `<div class="ab-more__split">
      <ul class="ab-more__awards">
        ${m.items
          .map(
            (it) => `
          <li>
            <span class="ab-more__k">${esc(it.k)}</span>
            <span class="ab-more__v">${esc(it.v)}</span>
          </li>`
          )
          .join("")}
      </ul>
      <figure class="ab-more__photo" style="--tint:${esc(m.tint || "#CFE6FF")}">
        ${
          m.image
            ? `<img src="${esc(m.image)}" alt="${esc(m.imageCaption || "Diving")}" loading="lazy" />`
            : `<span class="ab-more__ph ab-more__ph--wide" aria-hidden="true">${INT_ICONS.wave}</span>`
        }
        <figcaption>${esc(m.imageCaption || "")}</figcaption>
      </figure>
    </div>`;
  }

  return head + body;
}

function abRenderInterests() {
  const s = AB.interests;
  const cards = s.items
    .map((it, i) => {
      const media = it.image
        ? `<img class="ab-int__img" src="${esc(it.image)}" alt="${esc(it.title)}" loading="lazy" />${
            it.imageOpen
              ? `<img class="ab-int__img ab-int__img--open" src="${esc(it.imageOpen)}" alt="" loading="lazy" />`
              : ""
          }`
        : INT_ICONS[it.icon] || "";
      const cardVars = [
        `--tint:${esc(it.tint)}`,
        it.fit ? `--open-fit:${esc(it.fit)}` : "",
        it.bg ? `--open-bg:${esc(it.bg)}` : "",
        it.pad ? `--open-pad:${esc(it.pad)}` : "",
        it.pos ? `--open-pos:${esc(it.pos)}` : "",
      ].filter(Boolean).join(";");
      return `
      <article class="ab-int__card reveal" data-int="${i}" style="${cardVars}">
        <div class="ab-int__media">${media}</div>
        <div class="ab-int__right">
          <div class="ab-int__body">
            <span class="ab-int__kicker">${esc(it.kicker)}</span>
            <h3 class="ab-int__title">${esc(it.title)}</h3>
            <p class="ab-int__text">${esc(it.text)}</p>
            ${
              it.more
                ? `<button class="ab-int__toggle" type="button" aria-expanded="false" aria-controls="intMore${i}">
                    <span class="ab-int__sign" aria-hidden="true"></span>
                    <span class="ab-int__toggle-txt">See more</span>
                  </button>`
                : ""
            }
          </div>
          ${it.more ? `<div class="ab-int__more" id="intMore${i}">${abMoreBody(it.more)}</div>` : ""}
        </div>
      </article>`;
    })
    .join("");

  return `
  <section class="ab-sec" id="interests">
    <div class="ab-wrap">
      <div class="ab-head">
        <span class="ab-head__num">${esc(s.index)}</span>
        <span class="ab-head__label">${esc(s.label)}</span>
        <span class="ab-head__rule"></span>
      </div>
      <p class="ab-int__intro">${esc(s.intro)}</p>
      <div class="ab-int" id="abInt">${cards}</div>
    </div>
  </section>`;
}

/* ============================================================
   交互
   ============================================================ */

// 首屏：入场 + 身份标签轮流高亮 + 照片 3D 视差 + 背景字母轻微漂移
function abInitHero() {
  const hero = document.querySelector(".ab-hero");
  if (!hero) return;
  requestAnimationFrame(() => hero.classList.add("is-ready"));

  const roles = [...document.querySelectorAll("#abRoles .ab-role")];
  if (roles.length > 1) {
    let i = 0;
    const tick = () => {
      roles.forEach((r) => r.classList.remove("is-lit"));
      roles[i % roles.length].classList.add("is-lit");
      i++;
    };
    tick();
    setInterval(tick, 2100);
  }

  const stage = $("abStage");
  const photo = $("abPhoto");
  const ghost = $("abGhost");
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (fine && stage && photo) {
    const MAX = 10;
    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const ry = (px - 0.5) * 2 * MAX;
      const rx = -(py - 0.5) * 2 * MAX;
      photo.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotate(-3deg) scale(1.02)`;
      photo.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
      photo.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
    });
    stage.addEventListener("pointerleave", () => {
      photo.style.transform = "";
    });
  }

  if (fine && hero && ghost) {
    let raf = null;
    hero.addEventListener("pointermove", (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect();
        const dx = (e.clientX - r.width / 2) / r.width;
        const dy = (e.clientY - r.height / 2) / r.height;
        ghost.style.transform = `translate3d(${(dx * 22).toFixed(1)}px, ${(dy * 18).toFixed(1)}px, 0)`;
        raf = null;
      });
    });
  }
}

// 滚动到这里时：理念高亮扫过、GPA 环填色、课程分数条生长
function abInitAnim() {
  const targets = document.querySelectorAll("#abPhilosophy, #education");
  if (!targets.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;

        if (el.id === "abPhilosophy") el.classList.add("is-in");

        if (el.id === "education") {
          const arc = $("abGpaArc");
          if (arc) arc.style.strokeDashoffset = arc.dataset.off;
          document.querySelectorAll(".ab-course__fill").forEach((f, i) => {
            setTimeout(() => {
              f.style.width = `${f.dataset.w}%`;
            }, 180 + i * 110);
          });
        }
        io.unobserve(el);
      });
    },
    { threshold: 0.25 }
  );
  targets.forEach((t) => io.observe(t));
}

// 联系方式：点击复制
function abInitCopy() {
  const toast = document.createElement("div");
  toast.className = "ab-toast";
  document.body.appendChild(toast);

  let timer = null;
  const say = (msg) => {
    toast.textContent = msg;
    toast.classList.add("is-on");
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove("is-on"), 1800);
  };

  const copy = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(
        () => say("Copied"),
        () => fallback(text)
      );
      return;
    }
    fallback(text);
  };

  const fallback = (text) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e) {
      ok = false;
    }
    ta.remove();
    say(ok ? "Copied" : text);
  };

  document.querySelectorAll(".ab-contact__row").forEach((row) => {
    row.addEventListener("click", () => {
      const val = row.dataset.copy || "";
      if (!val) return;
      copy(val);
    });
  });
}

/* ============================================================
   左侧板块索引（fixed，不随页面滚动）
   ============================================================ */
const AB_SECTIONS = [
  { id: "philosophy", label: "How I design" },
  { id: "education", label: "Education" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills & tools" },
  { id: "interests", label: "Off the screen" },
  { id: "contact", label: "Contact" },
];

function abRenderIndex() {
  const rail = document.createElement("nav");
  rail.className = "ab-index";
  rail.setAttribute("aria-label", "Section index");
  rail.innerHTML = AB_SECTIONS.map(
    (s, i) => `
    <a class="ab-index__item" href="#${s.id}" data-target="${s.id}" aria-label="${esc(s.label)}">
      <span class="ab-index__num">${String(i + 1).padStart(2, "0")}</span>
      <span class="ab-index__dot" aria-hidden="true"></span>
      <span class="ab-index__label">${esc(s.label)}</span>
    </a>`
  ).join("");
  document.body.appendChild(rail);
  return rail;
}

function abInitIndex(rail) {
  if (!rail) return;
  const hero = document.querySelector(".ab-hero");
  const items = [...rail.querySelectorAll(".ab-index__item")];
  const sections = AB_SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);
  if (!sections.length) return;

  let raf = null;

  // 左侧索引摆位：内容位置和宽度都不动，索引自己往左挪到内容左侧的空白里
  const place = () => {
    if (window.innerWidth < 1180) {
      rail.style.left = "";
      return;
    }
    const wraps = [...document.querySelectorAll(".ab-sec .ab-wrap")];
    if (!wraps.length) return;
    const contentLeft = Math.min(
      ...wraps.map(
        (w) => w.getBoundingClientRect().left + (parseFloat(getComputedStyle(w).paddingLeft) || 0)
      )
    );
    const railW = rail.offsetWidth || 124;
    // 与内容至少留 78px；空间不够时先保左留白 24px，再退让间距
    const gap = Math.min(78, Math.max(24, contentLeft - railW - 24));
    rail.style.left = Math.max(8, Math.round(contentLeft - gap - railW)) + "px";
  };

  const sync = () => {
    raf = null;
    const y = window.scrollY;
    const vh = window.innerHeight;

    // 首屏不显示索引
    const heroH = hero ? hero.offsetHeight : 0;
    rail.classList.toggle("is-visible", y > heroH - vh * 0.55);

    // 当前板块：以视口 42% 处所在的板块为准
    const probe = y + vh * 0.42;
    let active = -1;
    sections.forEach((sec, i) => {
      if (sec.offsetTop <= probe) active = i;
    });
    items.forEach((it, i) => it.classList.toggle("is-active", i === active));
  };

  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(sync);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", place);
  window.addEventListener("load", place);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  place();
  sync();

  items.forEach((it) => {
    it.addEventListener("click", (e) => {
      const el = document.getElementById(it.dataset.target);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", "#" + it.dataset.target);
    });
  });
}

/* ============================================================
   兴趣卡片：点击展开成横跨三卡的长方形
   ============================================================ */
function abInitInterests() {
  const wrap = $("abInt");
  if (!wrap) return;
  const cards = [...wrap.querySelectorAll(".ab-int__card")];

  const setOpen = (card) => {
    cards.forEach((c) => {
      const on = c === card;
      c.classList.toggle("is-open", on);
      const btn = c.querySelector(".ab-int__toggle");
      if (btn) {
        btn.setAttribute("aria-expanded", String(on));
        const txt = btn.querySelector(".ab-int__toggle-txt");
        if (txt) txt.textContent = on ? "Close" : "See more";
      }
    });
    wrap.classList.toggle("has-open", !!card);
    if (card) {
      const top = card.getBoundingClientRect().top + window.scrollY - 96;
      if (Math.abs(window.scrollY - top) > 40) window.scrollTo({ top, behavior: "smooth" });
    }
  };

  cards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".ab-more__close")) {
        setOpen(null);
        return;
      }
      // 已展开时，点内容区不收起（方便阅读）
      if (card.classList.contains("is-open") && e.target.closest(".ab-int__more")) return;
      setOpen(card.classList.contains("is-open") ? null : card);
    });
  });

  // Esc 收起
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(null);
  });
}

/* ============================================================
   板块分页滚动（pin）：一次滚轮 = 前进一个板块
   - 板块高于视口时，先让用户连续滚动看完底部，再翻到下一块
   - 触屏 / 小屏 / 减弱动效 时整体不启用，保持原生滚动
   ============================================================ */
function abInitPager() {
  const main = $("abMain");
  if (!main) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (!window.matchMedia("(min-width: 1024px)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const nav = document.querySelector(".nav");
  const hero = main.querySelector(".ab-hero");
  const sections = AB_SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);
  if (sections.length < 2) return;

  const THRESHOLD = 8;      // 滚轮 / 触控板累积阈值
  const LOCK_MS = 760;      // 翻页动画锁
  const GESTURE_GAP = 90;   // 两次滚轮间隔小于此值 → 视为同一次滑动（惯性）
  const SETTLE_MS = 240;    // 碰到板块底部后先停一下，让底部留白被看见
  const EDGE = 2;           // 判定「已对齐到板块顶部 / 底部」的容差

  let lockUntil = 0;
  let lockDir = 0;
  let lockTo = -1;
  let settleUntil = 0;
  let acc = 0;
  let accTimer = 0;
  let lastWheelAt = 0;

  const navH = () => (nav ? nav.offsetHeight : 0);
  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
  const topOf = (el) => el.getBoundingClientRect().top + window.scrollY;
  const clampY = (v) => Math.max(0, Math.min(v, maxScroll()));

  // 当前板块序号，-1 = 还停在首屏
  const indexAt = () => {
    const probe = window.scrollY + navH() + 4;
    let idx = -1;
    sections.forEach((sec, i) => {
      if (topOf(sec) <= probe) idx = i;
    });
    return idx;
  };

  const go = (top, dir) => {
    const target = clampY(top);
    lockUntil = performance.now() + LOCK_MS;
    lockDir = dir;
    lockTo = target;
    window.scrollTo({ top: target, behavior: "smooth" });
  };

  // 逐像素跟手滚动（html 上开了 scroll-behavior: smooth，这里必须临时关掉）
  const jump = (top) => {
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, clampY(top));
    root.style.scrollBehavior = prev;
  };

  // 板块「读完」的位置：板块底边贴住视口底边
  // 此时板块自身的 padding-bottom（留白）正好完整露出来，作为「本板块结束」的信号
  const endOf = (el) => Math.min(topOf(el) + el.offsetHeight - window.innerHeight, maxScroll());

  // 返回 true 表示已接管本次滚动
  // now / sinceLast：用来区分「同一次滑动的惯性」和「新的一次操作」
  const step = (dir, delta, now, sinceLast) => {
    const y = window.scrollY;
    const idx = indexAt();
    const cur = idx >= 0 ? sections[idx] : null;

    if (dir > 0) {
      if (cur) {
        const endY = endOf(cur);
        if (y < endY - EDGE) {
          // 板块底部还没露出来：跟手推进，最多推到「底部对齐」为止，绝不冲进下一块
          const target = Math.min(y + delta, endY);
          jump(target);
          if (target >= endY - 1) settleUntil = now + SETTLE_MS;
          return true;
        }
        // 刚到板块底部：先停住，让底部留白被看到；同一次滑动的惯性也一并吞掉
        if (now < settleUntil || sinceLast < GESTURE_GAP) return true;
      }
      const next = sections[idx + 1];
      if (!next) return false;
      const target = topOf(next);
      if (Math.abs(target - y) < 4) return false;
      go(target, 1);
      return true;
    }

    // 向上
    if (cur) {
      const curTop = topOf(cur);
      if (y > curTop + EDGE) {
        // 板块内部：跟手回退，最多回到板块顶部
        const target = Math.max(y - delta, curTop);
        jump(target);
        if (target <= curTop + 1) settleUntil = now + SETTLE_MS;
        return true;
      }
      if (now < settleUntil || sinceLast < GESTURE_GAP) return true;
    }
    const prev = idx > 0 ? sections[idx - 1] : hero;
    if (!prev) return false;
    const prevTop = topOf(prev);
    const prevEnd = endOf(prev);
    // 上一块比视口高时，停到它「读完」的位置（底部留白可见），从下往上读更自然
    const target = prevEnd > prevTop + EDGE ? prevEnd : prevTop;
    if (Math.abs(target - y) < 4) return false;
    go(target, -1);
    return true;
  };

  const inScroller = (el) => {
    while (el && el !== document.body && el !== document.documentElement) {
      const oy = getComputedStyle(el).overflowY;
      if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight + 4) return true;
      el = el.parentElement;
    }
    return false;
  };

  const onWheel = (e) => {
    if (e.ctrlKey) return; // 缩放
    if (e.target instanceof Element && inScroller(e.target)) return;

    const d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    if (!d) return;

    const now = performance.now();
    const sinceLast = lastWheelAt ? now - lastWheelAt : 1e9;
    lastWheelAt = now;

    // 翻页动画期间吞掉惯性滚动；反向输入、或动画已经到位，都立刻放行
    if (now < lockUntil) {
      if (Math.sign(d) !== lockDir) {
        lockUntil = 0;
        acc = 0;
        return;
      }
      if (Math.abs(window.scrollY - lockTo) > 2) {
        e.preventDefault();
        return;
      }
      lockUntil = 0; // 已经到站，别让用户白滚一格
    }

    acc += d;
    clearTimeout(accTimer);
    accTimer = setTimeout(() => (acc = 0), 200);

    if (Math.abs(acc) < THRESHOLD) {
      // 累积不够：先吞掉，避免页面停在两个板块之间
      e.preventDefault();
      return;
    }

    const delta = Math.abs(acc);
    const dir = acc > 0 ? 1 : -1;
    acc = 0;
    if (step(dir, delta, now, sinceLast)) e.preventDefault();
  };

  const onKey = (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target && e.target.tagName) || "";
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;

    let dir = 0;
    if (e.key === "PageDown" || e.key === " " || e.key === "ArrowDown") dir = 1;
    else if (e.key === "PageUp" || e.key === "ArrowUp") dir = -1;
    else if (e.key === "Home") {
      e.preventDefault();
      go(0, -1);
      return;
    } else if (e.key === "End") {
      e.preventDefault();
      go(maxScroll(), 1);
      return;
    }
    if (!dir) return;
    if (performance.now() < lockUntil) {
      if (Math.abs(window.scrollY - lockTo) > 2) {
        e.preventDefault();
        return;
      }
      lockUntil = 0;
    }
    if (step(dir, window.innerHeight * 0.85, performance.now(), 1e9)) e.preventDefault();
  };

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", onKey);
}

/* ============================================================
   启动
   ============================================================ */
(function abBoot() {
  const main = $("abMain");
  if (!main || !AB) return;

  main.innerHTML = [
    abRenderHero(),
    abRenderPhilosophy(),
    abRenderEducation(),
    abRenderExperience(),
    abRenderSkills(),
    abRenderInterests(),
    abRenderContact(),
  ].join("");

  abInitHero();
  abInitAnim();
  abInitCopy();
  abInitInterests();
  abInitIndex(abRenderIndex());
  abInitPager();

  // main.js 的滚动入场在这里补挂一次（内容刚生成）
  if (typeof initReveal === "function") initReveal();
})();
