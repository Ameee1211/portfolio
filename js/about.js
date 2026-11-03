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
// 逐字打字用：把一段文本拆成字符 span。空格保留为普通空格（省一堆节点），
// 这样只要按顺序 remove("is-off") 就能一个一个"打"出来。
function abTypeChars(text) {
  return [...text].map((ch) => (ch === " " ? " " : `<span class="ab-ch">${esc(ch)}</span>`)).join("");
}

// 段落本身保持完整可读；三个高亮短语是"活"的：
// 鼠标移上去 → 其余文字淡到 32%，右侧浮出这张原则卡；点卡片 → 翻面看它在项目里的例子。
function abRenderPhilosophy() {
  const p = AB.philosophy;
  let hi = -1;
  const body = p.statement
    .map((s) => {
      if (!s.hl) return `<span class="ab-ph">${abTypeChars(s.t)}</span>`;
      hi += 1;
      return `<span class="hl" data-p="${hi}" tabindex="0" role="button">${abTypeChars(s.t)}</span>`;
    })
    .join("");

  const cards = (p.principles || [])
    .map(
      (c, i) => `
      <article class="ab-principle" data-p="${i}">
        <div class="ab-principle__flip">
          <div class="ab-principle__face">
            <span class="ab-principle__idx">${String(i + 1).padStart(2, "0")}</span>
            <h3 class="ab-principle__t">${esc(c.title)}</h3>
            <p class="ab-principle__b">${esc(c.body)}</p>
          </div>
          <div class="ab-principle__face ab-principle__face--back">
            <span class="ab-principle__idx">${String(i + 1).padStart(2, "0")}</span>
            <p class="ab-principle__ex">${esc(c.example)}</p>
            <a class="ab-principle__link" href="${esc(c.href)}">${esc(c.linkLabel || "Open")}
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div>
      </article>`
    )
    .join("");

  return `
  <section class="ab-sec ab-sec--cream ab-philosophy" id="philosophy">
    <div class="ab-wrap">
      <div class="ab-head">
        <span class="ab-head__num">${esc(p.index)}</span>
        <span class="ab-head__label">${esc(p.label)}</span>
        <span class="ab-head__rule"></span>
      </div>
      <div class="ab-philosophy__body">
        <p class="ab-philosophy__statement" id="abPhilosophy">${body}</p>
        <div class="ab-principles" id="abPrinciples">
          <div class="ab-principles__cue">
            ${(p.principles || [])
              .map(
                (c, i) => `<button class="ab-principles__item" type="button" data-p="${i}">
                  <span>${String(i + 1).padStart(2, "0")}</span>${esc(c.title)}
                </button>`
              )
              .join("")}
          </div>
          ${cards}
        </div>
      </div>
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
        ${c.note ? `<span class="ab-course__note">${esc(c.note)}</span>` : ""}
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
            <span class="ab-gpa__value" data-count="${e.gpa.value}">${e.gpa.value}</span>
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
      <div class="ab-timeline"><span class="ab-timeline__line" id="abExpLine" aria-hidden="true"></span>${items}</div>
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

  // 工具图标：Adobe 系列为官方「圆角方块 + 产品缩写」，其余为官方路径或等价标记

  const tools = s.tools.items
    .map(
      (t) =>
        `<span class="ab-tool" title="${esc(t.label)}" aria-label="${esc(t.label)}">` +
        (TOOL_ICONS[t.label] || esc(t.label)) +
        `</span>`
    )
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
        <span class="ab-int__strip" aria-hidden="true"><span class="ab-int__strip-t">${esc(it.title)}</span></span>
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

/* ============================================================
   转场公用：一块 fixed 全屏的 SVG 画布 + 采样点生成
   ============================================================ */
function abRelaySvg(n, id) {
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "ab-pe");
  const defs = document.createElementNS(NS, "defs");
  const grad = document.createElementNS(NS, "linearGradient");
  grad.setAttribute("id", id);
  grad.setAttribute("gradientUnits", "userSpaceOnUse");
  const s0 = document.createElementNS(NS, "stop");
  s0.setAttribute("offset", "0%");
  const s1 = document.createElementNS(NS, "stop");
  s1.setAttribute("offset", "100%");
  grad.appendChild(s0);
  grad.appendChild(s1);
  defs.appendChild(grad);
  svg.appendChild(defs);
  const paths = [];
  for (let i = 0; i < n; i++) {
    const p = document.createElementNS(NS, "path");
    p.setAttribute("fill", "none");
    p.setAttribute("stroke", "url(#" + id + ")");
    p.setAttribute("stroke-linecap", "round");
    p.setAttribute("stroke-linejoin", "round");
    svg.appendChild(p);
    paths.push(p);
  }
  document.body.appendChild(svg);
  return { svg, grad, s0, s1, paths };
}

// 一条弧（或一段线）的采样点 → path 的 d
function abArcPath(cx, cy, r, a0, a1, rot, n) {
  let d = "";
  for (let s = 0; s < n; s++) {
    const u = s / (n - 1);
    const ang = ((a0 + (a1 - a0) * u + rot) * Math.PI) / 180;
    d += (s ? "L" : "M") + (cx + r * Math.cos(ang)).toFixed(1) + " " + (cy + r * Math.sin(ang)).toFixed(1);
  }
  return d;
}

/* ============================================================
   01 → 02：正文三处高亮条聚成有缺口的圆，转成 GPA 环
   ------------------------------------------------------------
   三段弧的角度（度）：
   A = 刚聚成圆时：段间留 4° 细缝，顶部一个 34° 大缺口
   B = 落到 GPA 时：三段无缝连成 306°，缺口 54° —— 正好是 GPA 的 3.4/4
   ============================================================ */
function abInitPhilEdu() {
  const phil = document.getElementById("philosophy");
  const edu = document.getElementById("education");
  const gpa = edu && edu.querySelector(".ab-gpa");
  if (!phil || !edu || !gpa) return;

  let busy = false;

  const SEG_A = [[0, 106], [110, 216], [220, 326]];
  const SEG_B = [[0, 102], [102, 204], [204, 306]];
  const SAMPLES = 30;
  const R_MID = 130;   // 屏幕中央那个圆的半径（直径约 260px）
  const SPIN = 630;    // 边转边落位的总转角：1.75 圈后正好停在 GPA 的 -90° 起点

  const YEL = [255, 207, 149];
  const BLUE = [126, 181, 236];
  const PURPLE = [116, 105, 182];

  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const mix = (a, b, t) =>
    "rgb(" + Math.round(lerp(a[0], b[0], t)) + "," + Math.round(lerp(a[1], b[1], t)) + "," +
    Math.round(lerp(a[2], b[2], t)) + ")";

  // 高亮条的真实几何：background-position: 0 86% + background-size: 100% 36%
  const barGeom = (el) => {
    const rs = el.getClientRects();
    if (!rs.length) return null;
    const r = rs[0];
    return { x0: r.left, x1: r.right, y: r.top + r.height * 0.5504, h: r.height * 0.36 };
  };

  const jumpTo = (top) => {
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, top);
    root.style.scrollBehavior = prev;
  };

  // 三段弧的画布：fixed 全屏 SVG，逐帧改 path 的 d
  const makeSvg = () => abRelaySvg(3, "abPeGrad");

  const down = () => {
    if (busy || !abWide()) return false;
    // 打字还没打完就滚走：高亮条宽度还是 0，转场没有起点，直接普通翻页
    if (phil.querySelector(".ab-ch.is-off")) return false;
    const hls = [...phil.querySelectorAll(".ab-philosophy__statement .hl")];
    if (hls.length < 3) return false;
    const bars = hls.slice(0, 3).map(barGeom);
    if (bars.some((b) => !b)) return false;

    const gr = gpa.getBoundingClientRect();
    const er = edu.getBoundingClientRect();
    if (!gr.width) return false;
    const k = gr.width / 200;              // SVG viewBox 是 200，换算成实际像素
    const gR = 86 * k;
    const gW = 13 * k;
    const gCx = gr.left + gr.width / 2;
    // 转场结束会跳到 02 顶部，GPA 届时的视口纵坐标
    const gCy = gr.top - er.top + gr.height / 2;

    busy = true;
    phil.classList.add("is-relay");
    abCoursesReset();          // 02 的课程条先归零（此时 02 还在视口外），落位后再一起长出来

    const cx0 = window.innerWidth / 2;
    const cy0 = window.innerHeight / 2;
    const { svg, grad, s0, s1, paths } = makeSvg();

    const T_A = 880;    // 三条杠飘到屏幕中央、弯成弧、拼成圆
    const T_B = 1050;   // 边转边变色边缩小，落到 GPA 上
    const t0 = performance.now();
    let raf = 0;

    const frame = (now) => {
      const el = now - t0;

      if (el < T_A) {
        const p = easeInOut(el / T_A);
        bars.forEach((b, i) => {
          const a0 = SEG_A[i][0];
          const a1 = SEG_A[i][1];
          let d = "";
          for (let s = 0; s < SAMPLES; s++) {
            const u = s / (SAMPLES - 1);
            const ang = ((a0 + (a1 - a0) * u) * Math.PI) / 180;
            const x = lerp(lerp(b.x0, b.x1, u), cx0 + R_MID * Math.cos(ang), p);
            const y = lerp(b.y + b.h / 2, cy0 + R_MID * Math.sin(ang), p);
            d += (s ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
          }
          paths[i].setAttribute("d", d);
          paths[i].setAttribute("stroke-width", b.h.toFixed(1));
        });
        s0.setAttribute("stop-color", mix(YEL, YEL, 0));
        s1.setAttribute("stop-color", mix(YEL, YEL, 0));
        grad.setAttribute("x1", cx0 - R_MID);
        grad.setAttribute("y1", cy0 - R_MID);
        grad.setAttribute("x2", cx0 + R_MID);
        grad.setAttribute("y2", cy0 + R_MID);
        raf = requestAnimationFrame(frame);
        return;
      }

      const q = Math.min(1, (el - T_A) / T_B);
      const p = easeInOut(q);
      const rot = SPIN * easeOut(q);
      const cx = lerp(cx0, gCx, p);
      const cy = lerp(cy0, gCy, p);
      const rr = lerp(R_MID, gR, p);

      bars.forEach((b, i) => {
        const a0 = lerp(SEG_A[i][0], SEG_B[i][0], p);
        const a1 = lerp(SEG_A[i][1], SEG_B[i][1], p);
        let d = "";
        for (let s = 0; s < SAMPLES; s++) {
          const u = s / (SAMPLES - 1);
          const ang = ((a0 + (a1 - a0) * u + rot) * Math.PI) / 180;
          d += (s ? "L" : "M") + (cx + rr * Math.cos(ang)).toFixed(1) + " " +
            (cy + rr * Math.sin(ang)).toFixed(1);
        }
        paths[i].setAttribute("d", d);
        paths[i].setAttribute("stroke-width", lerp(b.h, gW, p).toFixed(1));
      });
      s0.setAttribute("stop-color", mix(YEL, BLUE, p));
      s1.setAttribute("stop-color", mix(YEL, PURPLE, p));
      grad.setAttribute("x1", cx - rr);
      grad.setAttribute("y1", cy - rr);
      grad.setAttribute("x2", cx + rr);
      grad.setAttribute("y2", cy + rr);

      if (q < 1) { raf = requestAnimationFrame(frame); return; }

      // 落位：圆已经是 306° 了，GPA 直接摆到最终进度，别再长一次
      const arc = edu.querySelector("#abGpaArc");
      if (arc) {
        arc.style.transition = "none";
        arc.style.strokeDashoffset = arc.dataset.off;
        requestAnimationFrame(() => { arc.style.transition = ""; });
      }
      // 其余内容随后浮出来
      [edu.querySelector(".ab-head"), edu.querySelector(".ab-edu__body")].forEach((n) => {
        if (!n) return;
        n.animate(
          [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }],
          { duration: 520, delay: 200, easing: "cubic-bezier(.2,.8,.3,1)", fill: "backwards" }
        );
      });

      jumpTo(er.top + window.scrollY);
      abCoursesGrow(240);        // 落位后四条分数条一起从 0 长到 84/82/82/81
      svg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "both" })
        .onfinish = () => svg.remove();

      // 01 已经滚出视口，悄悄还原，下次滚回来还是正常的
      setTimeout(() => phil.classList.remove("is-relay"), 600);
      setTimeout(() => { busy = false; }, 140);
    };

    raf = requestAnimationFrame(frame);
    return true;
  };

  // 往上：02 → 01（把上面那一套倒着放一遍：GPA 环散回三条黄杠）
  const up = () => {
    if (busy || !abWide()) return false;
    const hls = [...phil.querySelectorAll(".ab-philosophy__statement .hl")];
    if (hls.length < 3) return false;
    const bars0 = hls.slice(0, 3).map(barGeom);
    if (bars0.some((b) => !b)) return false;

    const gr = gpa.getBoundingClientRect();
    if (!gr.width) return false;
    const k = gr.width / 200;
    const gR = 86 * k;
    const gW = 13 * k;
    const gCx = gr.left + gr.width / 2;
    const gCy = gr.top + gr.height / 2;

    // 01 现在在视口上方；跳回去之后那些杠会整体往下挪这么多
    const philTop = phil.getBoundingClientRect().top + window.scrollY;
    const dy = window.scrollY - philTop;
    const bars = bars0.map((b) => ({ ...b, y: b.y + dy }));

    busy = true;
    phil.classList.add("is-relay");    // 01 的文字先藏着，落位再放出来
    gpa.dataset.peHidden = "1";        // 转场期间别被 relay 的 hide() 定时器放出来

    // 02 的内容退场，GPA 交给克隆
    const outs = [];
    [edu.querySelector(".ab-head"), edu.querySelector(".ab-edu__body")].forEach((n) => {
      if (!n) return;
      outs.push(
        n.animate([{ opacity: 1 }, { opacity: 0, transform: "translateY(8px)" }],
          { duration: 300, easing: "ease", fill: "both" })
      );
    });
    gpa.style.opacity = "0";

    const cx0 = window.innerWidth / 2;
    const cy0 = window.innerHeight / 2;
    const { svg, grad, s0, s1, paths } = makeSvg();

    const T_A = 900;   // 圆从 GPA 退出去：反着转、变回黄、散成三段
    const T_B = 880;   // 三段散开、拉直、回到正文原位
    const rotEnd = -90 - SPIN;
    const t0 = performance.now();
    let raf = 0;

    const frame = (now) => {
      const el = now - t0;

      if (el < T_A) {
        const q = el / T_A;
        const p = easeInOut(q);
        const rot = -90 - SPIN * easeOut(q);
        const cx = lerp(gCx, cx0, p);
        const cy = lerp(gCy, cy0, p);
        const rr = lerp(gR, R_MID, p);
        bars.forEach((b, i) => {
          const a0 = lerp(SEG_B[i][0], SEG_A[i][0], p);
          const a1 = lerp(SEG_B[i][1], SEG_A[i][1], p);
          paths[i].setAttribute("d", abArcPath(cx, cy, rr, a0, a1, rot, SAMPLES));
          paths[i].setAttribute("stroke-width", lerp(gW, b.h, p).toFixed(1));
        });
        s0.setAttribute("stop-color", mix(BLUE, YEL, p));
        s1.setAttribute("stop-color", mix(PURPLE, YEL, p));
        grad.setAttribute("x1", cx - rr);
        grad.setAttribute("y1", cy - rr);
        grad.setAttribute("x2", cx + rr);
        grad.setAttribute("y2", cy + rr);
        raf = requestAnimationFrame(frame);
        return;
      }

      const q = Math.min(1, (el - T_A) / T_B);
      const p = easeInOut(q);
      bars.forEach((b, i) => {
        const a0 = SEG_A[i][0];
        const a1 = SEG_A[i][1];
        let d = "";
        for (let s = 0; s < SAMPLES; s++) {
          const u = s / (SAMPLES - 1);
          const ang = ((a0 + (a1 - a0) * u + rotEnd) * Math.PI) / 180;
          const x = lerp(cx0 + R_MID * Math.cos(ang), lerp(b.x0, b.x1, u), p);
          const y = lerp(cy0 + R_MID * Math.sin(ang), b.y + b.h / 2, p);
          d += (s ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
        }
        paths[i].setAttribute("d", d);
        paths[i].setAttribute("stroke-width", b.h.toFixed(1));
      });
      s0.setAttribute("stop-color", mix(YEL, YEL, 0));
      s1.setAttribute("stop-color", mix(YEL, YEL, 0));
      grad.setAttribute("x1", cx0 - R_MID);
      grad.setAttribute("y1", cy0 - R_MID);
      grad.setAttribute("x2", cx0 + R_MID);
      grad.setAttribute("y2", cy0 + R_MID);

      if (q < 1) { raf = requestAnimationFrame(frame); return; }

      // 落位：跳回 01，克隆撤走，文字和高亮条一起回来
      jumpTo(philTop);
      svg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: "both" })
        .onfinish = () => svg.remove();
      phil.classList.remove("is-relay");

      // 02 恢复原样，下次再进来还是完整的
      outs.forEach((a) => a.cancel());
      delete gpa.dataset.peHidden;
      gpa.style.opacity = "";
      setTimeout(() => { busy = false; }, 140);
    };

    raf = requestAnimationFrame(frame);
    return true;
  };

  AB_PE = { down, up, busy: () => busy };
}

/* ============================================================
   02 → 03：GPA 环转着到屏幕中间 → 拉直 → 变成 03 左边那条时间轴竖线
   反向（03 → 02）把同一套倒着放：竖线弯回成环、转回 GPA
   ------------------------------------------------------------
   环按采样点顺序「解开」成线：圆周上第 i 个点 → 竖线上第 i 个点，
   所以是剪开拉直，不是压扁
   ============================================================ */
function abInitEduExp() {
  const edu = document.getElementById("education");
  const exp = document.getElementById("experience");
  const gpa = edu && edu.querySelector(".ab-gpa");
  const tl = exp && exp.querySelector(".ab-timeline");
  const line = exp && document.getElementById("abExpLine");
  if (!edu || !exp || !gpa || !tl || !line) return;

  let busy = false;

  // 03 的标题 + 三条经历：飞入由转场自己驱动，不靠一次性的 IntersectionObserver
  const expHead = exp.querySelector(".ab-head");
  const expItems = [...exp.querySelectorAll(".ab-exp")];

  // 把三条经历摆回「还没飞进来」的状态。
  // 关键：先把 is-in 加上，让观察器之后不再二次触发过渡；隐身靠内联样式压住。
  const resetItems = () => {
    expItems.forEach((el) => {
      el.getAnimations().forEach((a) => a.cancel());
      el.classList.add("is-in");
      el.style.transition = "none";
      el.style.opacity = "0";
      el.style.transform = "translate3d(58px,0,0)";
    });
  };

  // 依次从右边飞进来（标题先渐现，三条随后错开，合起来约 1.3s）
  const flyIn = () => {
    if (expHead) {
      const ha = expHead.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 380, easing: "ease" });
      ha.onfinish = () => ha.cancel();
    }
    expItems.forEach((el, i) => {
      const a = el.animate(
        [
          { opacity: 0, transform: "translate3d(58px,0,0)" },
          { opacity: 1, transform: "none" },
        ],
        {
          duration: 640,
          delay: 200 + i * 250,
          easing: "cubic-bezier(.16,.84,.28,1)",
          fill: "both",
        }
      );
      a.onfinish = () => {
        el.style.cssText = "";   // 交回 CSS（is-in 已经是最终态，不会跳）
        a.cancel();
      };
    });
  };

  const SAMPLES = 44;
  const R_MID = 130;    // 到屏幕中央时那个环的半径
  const SPIN = 540;     // 转着过去的总转角（1.5 圈）
  const A0 = -90;       // 环的起点角度，和 GPA 的 rotate(-90) 对齐
  const A1 = 216;       // 306° 的弧，正好是 3.4/4

  const BLUE = [126, 181, 236];
  const PURPLE = [116, 105, 182];
  const LINE0 = [116, 105, 182];   // 时间轴渐变上端 var(--purple)
  const LINE1 = [116, 105, 182];   // 下端同色，靠 stop-opacity 变淡

  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const mix = (a, b, t) =>
    "rgb(" + Math.round(lerp(a[0], b[0], t)) + "," + Math.round(lerp(a[1], b[1], t)) + "," +
    Math.round(lerp(a[2], b[2], t)) + ")";

  const jumpTo = (top) => {
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, top);
    root.style.scrollBehavior = prev;
  };

  // 跳到 03 之后，那条竖线应该有多长（跟 abInitExperience 的填充公式一致）
  const lineAfter = () => {
    const tlR = tl.getBoundingClientRect();
    const expR = exp.getBoundingClientRect();
    const relTop = tlR.top - expR.top;
    const p = clamp01((window.innerHeight * 0.78 - relTop) / Math.max(1, tlR.height));
    return { x: tlR.left + 8, top: relTop + 14, h: Math.max(1, (tlR.height - 28) * p), p: p };
  };

  // 现在这条线在屏幕上的真实位置（03 就在视口里时用得上）
  const lineNow = () => {
    const r = line.getBoundingClientRect();
    return { x: r.left + r.width / 2, top: r.top, h: Math.max(1, r.height) };
  };

  const down = () => {
    if (busy || !abWide()) return false;
    const gr = gpa.getBoundingClientRect();
    if (!gr.width) return false;
    const k = gr.width / 200;
    const gR = 86 * k;
    const gW = 13 * k;
    const gCx = gr.left + gr.width / 2;
    const gCy = gr.top + gr.height / 2;

    const dst = lineAfter();
    const cx0 = window.innerWidth / 2;
    const cy0 = window.innerHeight / 2;

    busy = true;
    gpa.dataset.peHidden = "1";
    gpa.style.opacity = "0";
    line.style.opacity = "0";            // 真身那根线先让位，落位再接上
    edu.classList.add("is-bg-shift");    // 02 的白 → 03 的淡灰紫，和圈圈同时渐变
    resetItems();                        // 03 的三条经历先回到屏外，落位后再依次飞入
    // 02 其余内容退场
    const outs = [];
    [edu.querySelector(".ab-head"), edu.querySelector(".ab-edu__body")].forEach((n) => {
      if (!n) return;
      outs.push(n.animate([{ opacity: 1 }, { opacity: 0, transform: "translateY(8px)" }],
        { duration: 300, easing: "ease", fill: "both" }));
    });

    const { svg, grad, s0, s1, paths } = abRelaySvg(1, "abEeGrad");
    const path = paths[0];

    const T_A = 900;    // 环转着挪到屏幕中央
    const T_B = 1000;   // 拉直，落到时间轴那条线上
    const t0 = performance.now();
    let raf = 0;

    const frame = (now) => {
      const el = now - t0;

      if (el < T_A) {
        const p = easeInOut(el / T_A);
        const cx = lerp(gCx, cx0, p);
        const cy = lerp(gCy, cy0, p);
        const rr = lerp(gR, R_MID, p);
        const rot = SPIN * easeOut(el / T_A);
        path.setAttribute("d", abArcPath(cx, cy, rr, A0, A1, rot, SAMPLES));
        path.setAttribute("stroke-width", lerp(gW, gW, p).toFixed(1));
        s0.setAttribute("stop-color", mix(BLUE, BLUE, 0));
        s1.setAttribute("stop-color", mix(PURPLE, PURPLE, 0));
        // 渐变走外接框的对角线 —— 和 GPA 自身那个 x1/y1 → x2/y2 对角渐变一致，
        // 否则克隆和真环的配色分布不一样，交接时会闪一下
        grad.setAttribute("x1", cx - rr);
        grad.setAttribute("y1", cy - rr);
        grad.setAttribute("x2", cx + rr);
        grad.setAttribute("y2", cy + rr);
        raf = requestAnimationFrame(frame);
        return;
      }

      const q = Math.min(1, (el - T_A) / T_B);
      const p = easeInOut(q);
      const rot = SPIN;
      let d = "";
      for (let s = 0; s < SAMPLES; s++) {
        const u = s / (SAMPLES - 1);
        const ang = ((A0 + (A1 - A0) * u + rot) * Math.PI) / 180;
        const ax = cx0 + R_MID * Math.cos(ang);
        const ay = cy0 + R_MID * Math.sin(ang);
        const bx = dst.x;
        const by = dst.top + dst.h * u;
        d += (s ? "L" : "M") + lerp(ax, bx, p).toFixed(1) + " " + lerp(ay, by, p).toFixed(1);
      }
      path.setAttribute("d", d);
      path.setAttribute("stroke-width", lerp(gW, 2, p).toFixed(1));
      s0.setAttribute("stop-color", mix(BLUE, LINE0, p));
      s1.setAttribute("stop-color", mix(PURPLE, LINE1, p));
      s1.setAttribute("stop-opacity", lerp(1, 0.28, p).toFixed(2));
      grad.setAttribute("x1", lerp(cx0 - R_MID, dst.x, p));
      grad.setAttribute("y1", lerp(cy0 - R_MID, dst.top, p));
      grad.setAttribute("x2", lerp(cx0 + R_MID, dst.x, p));
      grad.setAttribute("y2", lerp(cy0 + R_MID, dst.top + dst.h, p));

      if (q < 1) { raf = requestAnimationFrame(frame); return; }

      // 落位：跳到 03，真身那根线立刻接在克隆的位置上（不留空档），克隆再淡出撤走
      const expTop = exp.getBoundingClientRect().top + window.scrollY;
      jumpTo(expTop);
      line.style.transform = "scaleY(" + dst.p.toFixed(4) + ")";
      line.style.opacity = "";
      svg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: "both" })
        .onfinish = () => svg.remove();
      outs.forEach((a) => a.cancel());
      flyIn();                             // 标题渐现 → 三条经历依次从右边飞入
      delete gpa.dataset.peHidden;
      gpa.style.opacity = "";
      // 03 已经是自己的底色了，02 慢慢变回去（此时它已在视口外）
      setTimeout(() => edu.classList.remove("is-bg-shift"), 700);
      setTimeout(() => { busy = false; }, 140);
    };

    raf = requestAnimationFrame(frame);
    return true;
  };

  // 往上：03 → 02（竖线弯回成环，转回 GPA）
  const up = () => {
    if (busy || !abWide()) return false;
    const gr = gpa.getBoundingClientRect();
    const er = edu.getBoundingClientRect();
    if (!gr.width) return false;
    const k = gr.width / 200;
    const gR = 86 * k;
    const gW = 13 * k;
    const gCx = gr.left + gr.width / 2;
    // 跳回 02 之后 GPA 会在的视口位置
    const gCy = gr.top - er.top + gr.height / 2;

    const src = lineNow();
    const cx0 = window.innerWidth / 2;
    const cy0 = window.innerHeight / 2;

    busy = true;
    gpa.dataset.peHidden = "1";
    gpa.style.opacity = "0";
    line.style.opacity = "0";            // 真身那根线先让位
    exp.classList.add("is-bg-shift");    // 03 的淡灰紫 → 02 的白，和圈圈同时渐变
    exp.classList.add("is-line-out");    // 时间轴那条淡淡的底线也一起让位，否则圈飞走后还留着一条线
    abCoursesReset();                    // 回到 02 时课程条要重新从 0 长一遍

    // 03 的内容全部退场，只留下圈圈在转
    const outs3 = [];
    [expHead, ...expItems].forEach((n, i) => {
      if (!n) return;
      if (i) { n.getAnimations().forEach((a) => a.cancel()); n.style.cssText = ""; }
      outs3.push(n.animate(
        [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateX(46px)" }],
        { duration: 300, delay: Math.min(i, 3) * 40, easing: "ease", fill: "both" }
      ));
    });

    const { svg, grad, s0, s1, paths } = abRelaySvg(1, "abEeGrad");
    const path = paths[0];

    const T_A = 900;    // 竖线离开时间轴、弯回成环、退到屏幕中央
    const T_B = 1000;   // 环反着转、缩小，回到 GPA
    const t0 = performance.now();
    let raf = 0;

    const frame = (now) => {
      const el = now - t0;

      if (el < T_A) {
        const p = easeInOut(el / T_A);
        const rot = SPIN;
        let d = "";
        for (let s = 0; s < SAMPLES; s++) {
          const u = s / (SAMPLES - 1);
          const bx = src.x;
          const by = src.top + src.h * u;
          const ang = ((A0 + (A1 - A0) * u + rot) * Math.PI) / 180;
          const ax = cx0 + R_MID * Math.cos(ang);
          const ay = cy0 + R_MID * Math.sin(ang);
          d += (s ? "L" : "M") + lerp(bx, ax, p).toFixed(1) + " " + lerp(by, ay, p).toFixed(1);
        }
        path.setAttribute("d", d);
        path.setAttribute("stroke-width", lerp(2, gW, p).toFixed(1));
        s0.setAttribute("stop-color", mix(LINE0, BLUE, p));
        s1.setAttribute("stop-color", mix(LINE1, PURPLE, p));
        s1.setAttribute("stop-opacity", lerp(0.28, 1, p).toFixed(2));
        grad.setAttribute("x1", lerp(src.x, cx0 - R_MID, p));
        grad.setAttribute("y1", lerp(src.top, cy0 - R_MID, p));
        grad.setAttribute("x2", lerp(src.x, cx0 + R_MID, p));
        grad.setAttribute("y2", lerp(src.top + src.h, cy0 + R_MID, p));
        raf = requestAnimationFrame(frame);
        return;
      }

      const q = Math.min(1, (el - T_A) / T_B);
      const p = easeInOut(q);
      const rot = SPIN * (1 - easeOut(q));
      const cx = lerp(cx0, gCx, p);
      const cy = lerp(cy0, gCy, p);
      const rr = lerp(R_MID, gR, p);
      path.setAttribute("d", abArcPath(cx, cy, rr, A0, A1, rot, SAMPLES));
      path.setAttribute("stroke-width", gW.toFixed(1));
      s0.setAttribute("stop-color", mix(BLUE, BLUE, 0));
      s1.setAttribute("stop-color", mix(PURPLE, PURPLE, 0));
      grad.setAttribute("x1", cx - rr);
      grad.setAttribute("y1", cy - rr);
      grad.setAttribute("x2", cx + rr);
      grad.setAttribute("y2", cy + rr);

      if (q < 1) { raf = requestAnimationFrame(frame); return; }

      // 落位：跳回 02。GPA 立刻出现在克隆的位置上（不留空档、不闪），克隆随后淡出
      jumpTo(er.top + window.scrollY);
      abCoursesGrow(240);        // 回到 02 后四条分数条也一起从 0 长一遍
      delete gpa.dataset.peHidden;
      gpa.style.opacity = "";
      svg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: "both" })
        .onfinish = () => svg.remove();
      line.style.opacity = "";
      outs3.forEach((a) => a.cancel());
      setTimeout(() => exp.classList.remove("is-bg-shift"), 700);
      exp.classList.remove("is-line-out");   // 03 已经滚出视口，底线可以回来了
      setTimeout(() => { busy = false; }, 140);
    };

    raf = requestAnimationFrame(frame);
    return true;
  };

  AB_EE = { down, up, busy: () => busy };
}

/* ============================================================
   03 → 04：时间轴那条竖线守住原地 → 收成外框的左边 → 笔尖绕着 8 张卡片画一圈
   ------------------------------------------------------------
   几何上成立：03 的竖线在 x≈305、卡片外框左边缘在 x≈288，几乎是同一列，
   所以「线就是框的左边」不用把它挪到屏幕中间，原地就能接上。
   时序：03 内容退场 0.3s → 跳 04、线收成左边 0.24s → 笔尖绕一圈 1.3s（卡片依次亮）
        → 标题淡入 0.38s → lead 与工具条从右进 0.43s
   ============================================================ */
function abInitExpSkills() {
  const exp = document.getElementById("experience");
  const skills = document.getElementById("skills");
  if (!exp || !skills) return;

  const line = document.getElementById("abExpLine");
  const tlEl = exp.querySelector(".ab-timeline");
  const grid = skills.querySelector(".ab-skillgrid");
  const cards = [...skills.querySelectorAll(".ab-skill")];
  const head = skills.querySelector(".ab-head");
  const lead = skills.querySelector(".ab-skills__lead");
  const belt = skills.querySelector(".ab-toolbelt");
  if (!line || !tlEl || !grid || !cards.length) return;

  const PAD = 10;      // 框在卡片外面留一点
  const RAD = 22;      // 圆角
  const T_OUT = 300;   // 03 内容退场
  const T_JUMP = 300;  // 跳过去
  const T_SEED = 240;  // 竖线收成框的左边
  const T_DRAW = 1300; // 笔尖绕一圈
  const T_HEAD = 380;  // 标题淡入
  const T_REST = 430;  // lead + 工具条从右进
  const NS = "http://www.w3.org/2000/svg";

  let busy = false;
  let expOut = [];     // down() 里把 03 内容淡出用的动画（回来时要撤回）

  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  const jumpTo = (top) => {
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, top);
    root.style.scrollBehavior = prev;
  };

  // 8 张卡片的外框（屏幕坐标，04 在视口里时才准）
  const frameRect = () => {
    const g = grid.getBoundingClientRect();
    return { x: g.left - PAD, y: g.top - PAD, w: g.width + PAD * 2, h: g.height + PAD * 2 };
  };

  // 圆角矩形路径，从左上角起顺时针
  const roundD = (r) => {
    const x = r.x, y = r.y, w = r.w, h = r.h, k = RAD;
    return "M " + (x + k) + " " + y +
      " H " + (x + w - k) + " A " + k + " " + k + " 0 0 1 " + (x + w) + " " + (y + k) +
      " V " + (y + h - k) + " A " + k + " " + k + " 0 0 1 " + (x + w - k) + " " + (y + h) +
      " H " + (x + k) + " A " + k + " " + k + " 0 0 1 " + x + " " + (y + h - k) +
      " V " + (y + k) + " A " + k + " " + k + " 0 0 1 " + (x + k) + " " + y + " Z";
  };

  const makeLayer = () => {
    const el = (tag) => document.createElementNS(NS, tag);
    const svg = el("svg");
    svg.setAttribute("class", "ab-pe");

    const defs = el("defs");
    const grad = el("linearGradient");
    grad.setAttribute("id", "abEsGrad");
    grad.setAttribute("gradientUnits", "userSpaceOnUse");
    const s0 = el("stop");
    const s1 = el("stop");
    s0.setAttribute("offset", "0%");
    s0.setAttribute("stop-color", "#8b82c9");
    s1.setAttribute("offset", "100%");
    s1.setAttribute("stop-color", "#6f64b3");
    grad.append(s0, s1);
    defs.appendChild(grad);
    svg.appendChild(defs);

    const seed = el("path");
    const frame = el("path");
    [seed, frame].forEach((p) => {
      p.setAttribute("fill", "none");
      p.setAttribute("stroke", "url(#abEsGrad)");
      p.setAttribute("stroke-width", "2");
      p.setAttribute("stroke-linecap", "round");
      p.setAttribute("stroke-linejoin", "round");
    });
    const glow = el("circle");
    glow.setAttribute("r", "10");
    glow.setAttribute("fill", "rgba(116,105,182,0.16)");
    glow.setAttribute("opacity", "0");
    const pen = el("circle");
    pen.setAttribute("r", "4");
    pen.setAttribute("fill", "#6f64b3");
    pen.setAttribute("opacity", "0");
    svg.append(seed, frame, glow, pen);
    document.body.appendChild(svg);
    return { svg, seed, frame, pen, glow, grad };
  };

  // 框的渐变按外框走，和卡片区域同宽
  const setGrad = (layer, r) => {
    layer.grad.setAttribute("x1", r.x);
    layer.grad.setAttribute("y1", r.y);
    layer.grad.setAttribute("x2", r.x + r.w);
    layer.grad.setAttribute("y2", r.y + r.h);
  };

  // 04 的内容先藏起来。
  // 这里刻意不用内联 opacity：03→04 返回时元素在视口外，清内联样式会撞上
  // Chrome 的懒计算（样式不重算，计算值卡在 0），再进来就少几张卡。
  const hideSkills = () => {
    [head, lead, belt, ...cards].forEach((n) => { if (n) n.classList.add("is-pre"); });
  };

  // 淡入；dx / dy 是起始位移。结束时摘掉 is-pre 再撤动画，全程不写内联样式
  const show = (n, dur, delay, dx, dy) => {
    if (!n) return;
    const from = { opacity: 0 };
    const to = { opacity: 1 };
    if (dx) { from.transform = "translateX(" + dx + "px)"; to.transform = "none"; }
    if (dy) { from.transform = "translateY(" + dy + "px)"; to.transform = "none"; }
    const a = n.animate([from, to], {
      duration: dur,
      delay: delay || 0,
      easing: "cubic-bezier(.2,.8,.3,1)",
      fill: "both",
    });
    a.onfinish = () => { n.classList.remove("is-pre"); a.cancel(); };
  };

  // 回程落位时，03 那条线应该长什么样（在 04 的时候就能算出来）
  const expEndTarget = () => {
    const tlR = tlEl.getBoundingClientRect();
    const expAbs = exp.getBoundingClientRect().top + window.scrollY;
    const scroll = Math.min(expAbs + exp.offsetHeight - window.innerHeight,
      document.documentElement.scrollHeight - window.innerHeight);
    const relTop = tlR.top + window.scrollY - expAbs;
    const h0 = Math.max(1, tlR.height);
    const p = clamp01((window.innerHeight * 0.78 - relTop) / h0);
    const h = Math.max(1, (h0 - 28) * p);
    const topV = tlR.top + window.scrollY + 14 - scroll;
    return { x: tlR.left + 8, top: topV, bottom: topV + h, p: p, scroll: scroll };
  };

  const down = () => {
    if (busy || !abWide()) return false;
    const gr = grid.getBoundingClientRect();
    if (!gr.width) return false;
    busy = true;

    const lr = line.getBoundingClientRect();   // 03 那条线此刻在屏幕上的位置
    hideSkills();                              // 04 的内容先全部藏起来（此时还在 03，看不见）

    // 03 的文字退场，只留下那条竖线
    expOut = [];
    [exp.querySelector(".ab-head"), ...exp.querySelectorAll(".ab-exp")].forEach((n, i) => {
      if (!n) return;
      expOut.push(n.animate(
        [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateX(42px)" }],
        { duration: T_OUT, delay: Math.min(i, 3) * 34, easing: "ease", fill: "both" }
      ));
    });

    setTimeout(() => {
      const skTop = skills.getBoundingClientRect().top + window.scrollY;
      jumpTo(skTop);

      // 背景：先按成 03 的灰紫，再慢慢变回 04 的纯白
      skills.style.transition = "none";
      skills.style.backgroundColor = "var(--bg)";
      void skills.offsetWidth;
      skills.style.transition = "background-color .9s ease";
      skills.style.backgroundColor = "";
      setTimeout(() => { skills.style.transition = ""; }, 1000);

      const layer = makeLayer();
      const rect = frameRect();
      setGrad(layer, rect);
      layer.frame.setAttribute("d", roundD(rect));
      const LEN = layer.frame.getTotalLength();
      layer.frame.style.strokeDasharray = LEN + " " + LEN;
      layer.frame.style.strokeDashoffset = LEN;

      // 竖线的起点：03 那条线此刻的可见范围
      const from = { x: lr.left + 1, top: lr.top, bottom: lr.bottom };
      if (from.bottom - from.top < 80) {
        from.top = window.innerHeight * 0.22;
        from.bottom = window.innerHeight * 0.86;
      }
      // 终点：框的左边（直边那一段，不含圆角）
      const to = { x: rect.x, top: rect.y + RAD, bottom: rect.y + rect.h - RAD };

      // 卡片依次亮起（0.14s 一张，最后一张刚好在框画完时落定）
      setTimeout(() => {
        cards.forEach((n, i) => show(n, 340, 40 + i * 140, 0, 8));
      }, T_SEED);

      const t0 = performance.now();
      const tick = (now) => {
        const el = now - t0;

        if (el < T_SEED) {
          const p = easeInOut(el / T_SEED);
          const x = lerp(from.x, to.x, p);
          const top = lerp(from.top, to.top, p);
          const bot = lerp(from.bottom, to.bottom, p);
          layer.seed.setAttribute("d", "M " + x.toFixed(1) + " " + top.toFixed(1) +
            " L " + x.toFixed(1) + " " + bot.toFixed(1));
          requestAnimationFrame(tick);
          return;
        }

        const q = clamp01((el - T_SEED) / T_DRAW);
        layer.frame.style.strokeDashoffset = (LEN * (1 - q)).toFixed(2);
        const pt = layer.frame.getPointAtLength(LEN * q);
        layer.pen.setAttribute("cx", pt.x.toFixed(1));
        layer.pen.setAttribute("cy", pt.y.toFixed(1));
        layer.glow.setAttribute("cx", pt.x.toFixed(1));
        layer.glow.setAttribute("cy", pt.y.toFixed(1));

        // 最后一小段里慢慢淡：第 7 张亮起时已经变淡，LANG 落定那一刻归零
        const op = q < 0.62 ? 1 : Math.max(0, 1 - (q - 0.62) / 0.38);
        layer.seed.setAttribute("opacity", op.toFixed(3));
        layer.frame.setAttribute("opacity", op.toFixed(3));
        layer.pen.setAttribute("opacity", (op * 0.95).toFixed(3));
        layer.glow.setAttribute("opacity", op.toFixed(3));

        if (q < 1) { requestAnimationFrame(tick); return; }

        layer.svg.remove();
        // 标题先淡入，然后 lead 与工具条一起从右边进来
        show(head, T_HEAD, 0, 0, 0);
        setTimeout(() => {
          show(lead, T_REST, 0, 52, 0);
          show(belt, T_REST, 0, 52, 0);
        }, T_HEAD - 40);
        setTimeout(() => { busy = false; }, T_HEAD + T_REST - 40 + 120);
      };
      requestAnimationFrame(tick);
    }, T_JUMP);

    return true;
  };

  // 往上：04 → 03（整套倒着放）
  const up = () => {
    if (busy || !abWide()) return false;
    const gr = grid.getBoundingClientRect();
    if (!gr.width) return false;
    busy = true;

    // 04 的其余内容先退场。
    // 退场一律用「类名 + CSS 过渡」，不用 WAAPI：
    // 带 fill 的动画在元素移出视口后取消，样式会卡住不失效（试过，会剩几张卡不可见）
    const dimOut = (n, delay) => {
      if (!n) return;
      n.style.transitionDelay = (delay || 0) + "ms";
      n.classList.add("is-out");
    };
    dimOut(head, 0);
    dimOut(lead, 40);
    dimOut(belt, 40);

    const rect = frameRect();
    const layer = makeLayer();
    setGrad(layer, rect);
    layer.frame.setAttribute("d", roundD(rect));
    const LEN = layer.frame.getTotalLength();
    layer.frame.style.strokeDasharray = LEN + " " + LEN;
    layer.frame.style.strokeDashoffset = "0";
    layer.seed.setAttribute("d", "M " + rect.x + " " + (rect.y + RAD) +
      " L " + rect.x + " " + (rect.y + rect.h - RAD));
    layer.frame.setAttribute("opacity", "0");
    layer.seed.setAttribute("opacity", "0");
    layer.pen.setAttribute("opacity", "0");

    // 背景：白 → 03 的灰紫
    skills.style.transition = "background-color .8s ease";
    skills.style.backgroundColor = "var(--bg)";

    // 卡片倒着消失（LANG → 01）
    [...cards].reverse().forEach((n, i) => dimOut(n, i * 140));

    const T_UNDRAW = 1150;
    const T_FOLD = 240;
    const t0 = performance.now();
    let phase = 0;
    const target = expEndTarget();

    const tick = (now) => {
      const el = now - t0;

      if (el < T_UNDRAW) {
        const q = clamp01(el / T_UNDRAW);
        layer.frame.style.strokeDashoffset = (LEN * q).toFixed(2);
        const pt = layer.frame.getPointAtLength(LEN * (1 - q));
        layer.pen.setAttribute("cx", pt.x.toFixed(1));
        layer.pen.setAttribute("cy", pt.y.toFixed(1));
        layer.glow.setAttribute("cx", pt.x.toFixed(1));
        layer.glow.setAttribute("cy", pt.y.toFixed(1));
        // 和正向完全镜像：正向是"最后 38% 淡出"，这里就是"前 38% 淡入"
        const qf = 1 - q;
        const op = qf < 0.62 ? 1 : Math.max(0, 1 - (qf - 0.62) / 0.38);
        layer.seed.setAttribute("opacity", op.toFixed(3));
        layer.frame.setAttribute("opacity", op.toFixed(3));
        layer.pen.setAttribute("opacity", (op * 0.95).toFixed(3));
        layer.glow.setAttribute("opacity", op.toFixed(3));
        requestAnimationFrame(tick);
        return;
      }

      // 第二段：框的左边收成 03 那条竖线的样子
      const f = clamp01((el - T_UNDRAW) / T_FOLD);
      if (phase === 0) {
        phase = 1;
        layer.frame.setAttribute("opacity", "0");
        layer.pen.setAttribute("opacity", "0");
        layer.glow.setAttribute("opacity", "0");
      }
      const p = easeInOut(f);
      const x = lerp(rect.x, target.x, p);
      const top = lerp(rect.y + RAD, target.top, p);
      const bot = lerp(rect.y + rect.h - RAD, target.bottom, p);
      layer.seed.setAttribute("d", "M " + x.toFixed(1) + " " + top.toFixed(1) +
        " L " + x.toFixed(1) + " " + bot.toFixed(1));
      layer.seed.setAttribute("opacity", "1");

      if (f < 1) { requestAnimationFrame(tick); return; }

      // 落位：跳回 03，真身那条线直接按算好的长度接上
      jumpTo(target.scroll);
      line.style.transform = "scaleY(" + target.p.toFixed(4) + ")";
      layer.svg.remove();

      skills.style.transition = "none";
      skills.style.backgroundColor = "";
      setTimeout(() => { skills.style.transition = ""; }, 60);

      // 04 的内容恢复正常（下次进来还是完整的）
      [head, lead, belt, ...cards].forEach((n) => {
        if (!n) return;
        n.getAnimations().forEach((a) => a.cancel());
        n.style.transitionDelay = "";
        n.classList.remove("is-out");
        n.classList.remove("is-pre");
      });
      void skills.offsetHeight;    // 强制算一次样式，别让离屏元素留着旧值

      // 03 的内容重新浮出来（只有确实被淡出过才做，避免刷新直接落在 04 时闪一下）
      if (expOut.length) {
        expOut.forEach((a) => a.cancel());
        expOut = [];
        [exp.querySelector(".ab-head"), ...exp.querySelectorAll(".ab-exp")].forEach((n, i) => {
          n.animate(
            [{ opacity: 0, transform: "translateX(42px)" }, { opacity: 1, transform: "none" }],
            { duration: 380, delay: i * 50, easing: "cubic-bezier(.2,.8,.3,1)" }
          );
        });
      }

      setTimeout(() => { busy = false; }, 140);
    };
    requestAnimationFrame(tick);
    return true;
  };

  AB_ES = { down, up, busy: () => busy };
}

/* ---------- 课程分数条：每次进 02 都从 0 一起长到各自的分值 ---------- */
// 转场一开始先归零（此时 02 还在视口外，看不见），落位后再一起生长。
// 普通入场（不经过转场）也走同一套，避免两条路径叠在一起。
let abGrowStamp = 0;

function abCoursesReset() {
  document.querySelectorAll(".ab-course__fill").forEach((f) => {
    f.style.transition = "none";
    f.style.width = "0%";
  });
}

function abCoursesGrow(delay) {
  const fills = [...document.querySelectorAll(".ab-course__fill")];
  if (!fills.length) return;
  abGrowStamp = performance.now();
  const run = () => {
    fills.forEach((f) => { f.style.transition = ""; });
    void fills[0].offsetWidth;   // 先让「宽度 0 + 过渡已恢复」这一帧落定，否则不会有过渡
    fills.forEach((f) => { f.style.width = (f.dataset.w || "0") + "%"; });
  };
  if (delay) setTimeout(run, delay);
  else requestAnimationFrame(run);
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
          const val = el.querySelector(".ab-gpa__value");
          if (val && abWide()) abCountUp(val);
          // 课程条：电脑端统一走 abCoursesGrow（转场与普通入场同一套，四条一起长）；
          // 手机端保持原来的依次生长不变
          if (performance.now() - abGrowStamp > 800) {
            if (abWide()) {
              abCoursesGrow(200);
            } else {
              document.querySelectorAll(".ab-course__fill").forEach((f, i) => {
                setTimeout(() => { f.style.width = `${f.dataset.w}%`; }, 180 + i * 110);
              });
            }
          }
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
   交互层（仅电脑端 >=1024px；手机端不参与）
   ============================================================ */
const abWide = () => window.matchMedia("(min-width: 1024px)").matches;

// 01 理念：高亮短语 -> 原则卡（悬停出现，点一下翻面看例子）
function abInitPhilosophy() {
  const st = $("abPhilosophy");
  const wrap = $("abPrinciples");
  if (!st || !wrap || !abWide()) return;

  const hls = [...st.querySelectorAll(".hl")];
  const cards = [...wrap.querySelectorAll(".ab-principle")];
  if (!hls.length || !cards.length) return;

  let on = -1;
  let hideTimer = 0;

  const show = (i) => {
    clearTimeout(hideTimer);
    if (on === i) return;
    on = i;
    st.classList.add("is-focus");
    wrap.classList.add("has-on");
    hls.forEach((h, k) => h.classList.toggle("is-on", k === i));
    cards.forEach((c, k) => c.classList.toggle("is-on", k === i));
  };

  const hide = () => {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      on = -1;
      st.classList.remove("is-focus");
      wrap.classList.remove("has-on");
      hls.forEach((h) => h.classList.remove("is-on"));
      cards.forEach((c) => {
        c.classList.remove("is-on");
        c.classList.remove("is-flipped");
      });
    }, 240);
  };

  hls.forEach((h, i) => {
    h.addEventListener("pointerenter", () => show(i));
    h.addEventListener("pointerleave", hide);
    h.addEventListener("focus", () => show(i));
    h.addEventListener("blur", hide);
  });

  // 供转场调用：开始打字前把可能残留的悬停状态清干净
  // （页面瞬间跳到 01 时，鼠标可能正好落在某个高亮短语上，会让整段一直淡淡的、还浮着一张卡）
  st.__abReset = () => {
    on = -1;
    clearTimeout(hideTimer);
    st.classList.remove("is-focus");
    wrap.classList.remove("has-on");
    hls.forEach((h) => h.classList.remove("is-on"));
    cards.forEach((c) => {
      c.classList.remove("is-on");
      c.classList.remove("is-flipped");
    });
  };

  wrap.addEventListener("pointerenter", () => clearTimeout(hideTimer));
  wrap.addEventListener("pointerleave", hide);

  // 段落下面那三个标题：悬停预览、点一下展开/翻面
  wrap.querySelectorAll(".ab-principles__item").forEach((btn, i) => {
    btn.addEventListener("pointerenter", () => show(i));
    btn.addEventListener("focus", () => show(i));
    btn.addEventListener("click", () => {
      show(i);
      const card = cards[i];
      if (card) card.classList.toggle("is-flipped");
    });
  });

  cards.forEach((c) => {
    c.addEventListener("click", (e) => {
      if (e.target.closest(".ab-principle__link")) return;
      c.classList.toggle("is-flipped");
    });
  });
}

// GPA 数字滚动
function abCountUp(el) {
  const target = parseFloat(el.dataset.count || "0");
  if (!target) return;
  const dur = 1200;
  const t0 = performance.now();
  const step = (now) => {
    const k = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - k, 3);
    el.textContent = (target * e).toFixed(1);
    if (k < 1) requestAnimationFrame(step);
    else el.textContent = target.toFixed(1);
  };
  requestAnimationFrame(step);
}

// 03 经历：从右侧飞入（CSS）+ 时间轴随滚动填充 + 悬停聚焦
function abInitExperience() {
  const tl = document.querySelector(".ab-timeline");
  if (!tl) return;
  const rows = [...tl.querySelectorAll(".ab-exp")];
  const line = $("abExpLine");

  rows.forEach((r) => {
    r.addEventListener("pointerenter", () => {
      tl.classList.add("is-hover");
      r.classList.add("is-on");
    });
    r.addEventListener("pointerleave", () => {
      tl.classList.remove("is-hover");
      r.classList.remove("is-on");
    });
  });

  if (!abWide() || !line) return;

  let raf = 0;
  const paint = () => {
    raf = 0;
    const r = tl.getBoundingClientRect();
    const p = (window.innerHeight * 0.78 - r.top) / Math.max(1, r.height);
    line.style.transform = "scaleY(" + Math.max(0, Math.min(1, p)).toFixed(4) + ")";
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(paint); };
  paint();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
}

// 04 技能：图标朝光标轻微转动
function abInitTools() {
  const belt = document.querySelector(".ab-tools");
  if (!belt || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const icons = [...belt.querySelectorAll(".ab-tool")];
  if (!icons.length) return;
  let rects = [];

  const cache = () => { rects = icons.map((el) => el.getBoundingClientRect()); };

  belt.addEventListener("pointerenter", cache);
  belt.addEventListener("pointermove", (e) => {
    if (!rects.length) cache();
    icons.forEach((el, i) => {
      const b = rects[i];
      if (!b) return;
      const dx = e.clientX - (b.left + b.width / 2);
      const dy = e.clientY - (b.top + b.height / 2);
      const d = Math.hypot(dx, dy);
      if (d > 240) { el.style.transform = ""; return; }
      const k = 1 - d / 240;
      const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
      el.style.transform =
        "translate(" + (dx * 0.09 * k).toFixed(2) + "px," + (dy * 0.09 * k).toFixed(2) + "px) rotate(" + (ang * 0.11 * k).toFixed(2) + "deg)";
    });
  });
  belt.addEventListener("pointerleave", () => {
    icons.forEach((el) => { el.style.transform = ""; });
    rects = [];
  });
}

// 章节标尺：每节进来时标题下那条细线从左划出
function abInitHeadRule() {
  const secs = [...document.querySelectorAll(".ab-sec, .ab-hero")];
  if (!secs.length) return;
  if (!("IntersectionObserver" in window)) {
    secs.forEach((s) => s.classList.add("is-head-in"));
    return;
  }
  const io = new IntersectionObserver(
    (es) => {
      es.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-head-in");
        io.unobserve(en.target);
      });
    },
    { threshold: 0.08 }
  );
  secs.forEach((s) => io.observe(s));
}

/* ============================================================
   板块接力（仅 >=1024px）
   每个边界都把上一节的一件**真实物件**带到下一节，而不是盖一层遮罩：
   字母 -> 横线 -> 环 -> 点 -> 标签 -> 瓷砖 -> 卡片
   触发点：两节之间的滚动进度过 32% 时播一次（往回滚到 12% 以下重置）
   ============================================================ */
function abInitRelays() {
  if (!window.matchMedia("(min-width: 1024px)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ORDER = ["top", "philosophy", "education", "experience", "skills", "interests", "contact"];
  const secs = ORDER.map((id) => document.getElementById(id));
  if (secs.some((x) => !x)) return;

  const layer = document.createElement("div");
  layer.className = "ab-relay-layer";
  document.body.appendChild(layer);

  const R = (el) => el.getBoundingClientRect();

  const clone = (el) => {
    const r = R(el);
    const c = el.cloneNode(true);
    c.classList.add("ab-relay");
    c.style.left = r.left + "px";
    c.style.top = r.top + "px";
    c.style.width = r.width + "px";
    c.style.height = r.height + "px";
    layer.appendChild(c);
    return { c, r };
  };

  const run = (el, frames, opts) =>
    el.animate(frames, Object.assign({ fill: "both", easing: "cubic-bezier(.4,0,.2,1)" }, opts));

  // 真身先隐身，过一会儿自动恢复（此时它已经在视口外）
  // 但如果这段时间里它被转场接管了（data-pe-hidden），就别把它放出来 ——
  // 否则转场正播到一半，GPA 会突然冒出来和克隆圆叠在一起
  const hide = (el, ms) => {
    if (!el) return;
    el.style.opacity = "0";
    setTimeout(() => {
      if (el.dataset.peHidden === "1") return;
      el.style.opacity = "";
    }, ms);
  };

  const flash = (el, ms) => {
    if (!el) return;
    el.classList.add("is-received");
    setTimeout(() => el.classList.remove("is-received"), ms);
  };

  const relays = {};

  // ② 01 -> 02 由 abInitPhilEdu() 的整段转场接管（高亮条聚成有缺口的圆 → GPA 环）
  //    这里不再有 relay：转场期间滚动是锁住的，不会走到 32% 进度

  // ③ 02 -> 03 由 abInitEduExp() 的整段转场接管（环转到屏幕中间 → 拉直 → 时间轴竖线）
  //    这里不再有 relay：转场期间滚动是锁住的，不会走到 32% 进度
  //    （旧的 hide(gpa, 1000) 也一并去掉 —— 那个延迟恢复会和 02→01 的转场抢 GPA）

  // ④ 03 -> 04：每条经历最后一个标签，飞进技能瓷砖的 chips
  relays["experience>skills"] = () => {
    const rows = [...document.querySelectorAll("#experience .ab-exp")];
    const chips = [...document.querySelectorAll("#skills .ab-skill__chips .tag")];
    if (!rows.length || !chips.length) return;

    rows.forEach((row, i) => {
      const tags = [...row.querySelectorAll(".tag")];
      const tag = tags[tags.length - 1];
      const dst = chips[i];
      if (!tag || !dst) return;
      const { c, r } = clone(tag);
      const d = R(dst);
      const a = run(c, [
        { transform: "none", opacity: 1 },
        { transform: "translate(" + (d.left - r.left) + "px," + (d.top - r.top) + "px)", opacity: 0.92 },
      ], { duration: 620, delay: i * 80, easing: "cubic-bezier(.3,.8,.3,1)" });
      a.onfinish = () => { c.remove(); flash(dst, 700); };
      hide(tag, 1300);
    });
  };

  // ⑤ 04 -> 05：瓷砖缩成卡片的位置，卡片在原地长出来
  relays["skills>interests"] = () => {
    const tiles = [...document.querySelectorAll("#skills .ab-skill")];
    const cards = [...document.querySelectorAll("#interests .ab-int__card")];
    if (!tiles.length || !cards.length) return;

    cards.forEach((card, i) => {
      const tile = tiles[i * 2] || tiles[i];
      if (!tile) return;
      const { c, r } = clone(tile);
      const d = R(card);
      const a = run(c, [
        { transform: "none", opacity: 1 },
        {
          transform:
            "translate(" + (d.left + d.width / 2 - (r.left + r.width / 2)) + "px," +
            (d.top + d.height / 2 - (r.top + r.height / 2)) + "px) scale(.82)",
          opacity: 0,
        },
      ], { duration: 520, delay: i * 70, easing: "cubic-bezier(.45,0,.2,1)" });
      a.onfinish = () => c.remove();
      hide(tile, 1100);

      card.animate([
        { opacity: 0, transform: "scale(.96)" },
        { opacity: 1, transform: "none" },
      ], { duration: 420, delay: 280 + i * 70, easing: "cubic-bezier(.2,.8,.3,1)", fill: "backwards" });
    });
  };

  // ⑥ 05 -> 06：三张卡收成一点，联系卡从这一点展开
  relays["interests>contact"] = () => {
    const cards = [...document.querySelectorAll("#interests .ab-int__card")];
    const panel = document.querySelector("#contact .ab-contact__card");
    if (!cards.length || !panel) return;
    const pr = R(panel);
    const cx = pr.left + pr.width / 2;
    const cy = pr.top + pr.height / 2;

    cards.forEach((card, i) => {
      const { c, r } = clone(card);
      const a = run(c, [
        { transform: "none", opacity: 1 },
        {
          transform:
            "translate(" + (cx - (r.left + r.width / 2)) + "px," + (cy - (r.top + r.height / 2)) + "px) scale(.28)",
          opacity: 0,
        },
      ], { duration: 540, delay: i * 70, easing: "cubic-bezier(.5,0,.25,1)" });
      a.onfinish = () => c.remove();
      hide(card, 1200);
    });

    panel.animate([
      { opacity: 0, transform: "scale(.94)" },
      { opacity: 1, transform: "none" },
    ], { duration: 440, delay: 340, easing: "cubic-bezier(.2,.8,.3,1)", fill: "backwards" });
  };

  /* ---- 触发：两节之间的滚动进度过 32% 播一次 ---- */
  let lastPlayed = -1;
  let raf = 0;

  const check = () => {
    raf = 0;
    const y = window.scrollY;
    const tops = secs.map((x) => x.getBoundingClientRect().top + y);
    let i = -1;
    for (let k = 0; k < tops.length; k++) if (tops[k] <= y + 2) i = k;
    if (i < 0 || i >= secs.length - 1) return;

    const p = (y - tops[i]) / Math.max(1, tops[i + 1] - tops[i]);
    if (p < 0.12) { lastPlayed = -1; return; }
    if (p > 0.32 && lastPlayed !== i) {
      lastPlayed = i;
      const fn = relays[ORDER[i] + ">" + ORDER[i + 1]];
      if (fn) { try { fn(); } catch (e) { /* 单段失败不影响滚动 */ } }
    }
  };

  const onScroll = () => { if (!raf) raf = requestAnimationFrame(check); };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
}

/* ============================================================
   打字：所有行一起从左往右推进，但每行快慢不同（有长有短）
   —— 整段在 dur 之内全部显现，不会「一行打完才轮到下一行」
   ============================================================ */
function abTypeRun(root, dur) {
  const chars = root ? [...root.querySelectorAll(".ab-ch")] : [];
  if (!chars.length) return null;

  chars.forEach((c) => c.classList.add("is-off"));

  // 先按行归堆（顶边高度相近的算同一行）
  const rows = new Map();
  chars.forEach((c) => {
    const r = c.getBoundingClientRect();
    if (!r.width && !r.height) return;
    const key = Math.round(r.top / 8);
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key).push({ el: c, x: r.left, right: r.right });
  });

  // 每行一条独立的从左往右进度，时长在 0.76~1.0 倍 dur 之间浮动
  // → 同一时刻各行的"扫描位置"不一样，看着就是有长有短地一起推出来
  const plan = [];
  [...rows.values()].forEach((row, i) => {
    const x0 = Math.min(...row.map((o) => o.x));
    const x1 = Math.max(...row.map((o) => o.right));
    const span = Math.max(1, x1 - x0);
    const rowDur = dur * (0.76 + 0.24 * ((i * 0.618) % 1));
    row.forEach((o) => plan.push({ el: o.el, t: ((o.x - x0) / span) * rowDur }));
  });
  plan.sort((a, b) => a.t - b.t);

  let i = 0;
  let raf = 0;
  let done = false;
  let resolve;
  const finished = new Promise((r) => (resolve = r));

  const finish = () => {
    if (done) return;
    done = true;
    if (raf) cancelAnimationFrame(raf);
    chars.forEach((c) => c.classList.remove("is-off"));
    resolve();
  };

  const t0 = performance.now();
  const tick = (now) => {
    if (done) return;
    const el = now - t0;
    while (i < plan.length && plan[i].t <= el) {
      plan[i].el.classList.remove("is-off");
      i += 1;
    }
    if (i >= plan.length) { finish(); return; }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return { finish, finished };
}

/* ============================================================
   Hero → 01 的转场（只在电脑端，手机端不存在这段逻辑）
   ① 照片在原位往屏幕深处飞走、缩到没有
   ② 左侧文字向左移出
   ③ 只留下那个渐变圆 → 撑满整屏并染成 01 的底色（#fff0d9）
   ④ 01 的标题直接出现
   ⑤ 那段话像打字一样一个字一个字打出来（5 秒内打完）
   ============================================================ */
let AB_TRANSIT = null;   // 首屏 → 01
let AB_PE = null;        // 01 → 02（高亮条聚成圆 → GPA 环）
let AB_EE = null;        // 02 → 03（GPA 环 → 拉直 → 时间轴竖线）
let AB_ES = null;        // 03 → 04（竖线 → 绕 8 张卡片画一圈）

function abInitHeroTransit() {
  if (!window.matchMedia("(min-width: 1024px)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const hero = document.querySelector(".ab-hero");
  const phil = $("philosophy");
  const stage = $("abStage");
  const photo = $("abPhoto");
  const stmt = $("abPhilosophy");
  const blob = hero && hero.querySelector(".ab-stage__blob");
  const lead = hero && hero.querySelector(".ab-hero__lead");
  const rest = hero && hero.querySelector(".ab-hero__rest");
  if (!hero || !phil || !stage || !photo || !stmt || !blob || !lead) return;

  const ring = hero.querySelector(".ab-stage__ring");
  const cue = hero.querySelector(".ab-hero__cue");
  const floats = [...hero.querySelectorAll(".ab-float")];

  const T = {
    out: 620,        // 照片（连同旁边的标签）缩到一个点消失 / 文字左移
    waveDelay: 640,  // 等它们彻底缩没，圆才开始长大
    wave: 760,       // 圆撑满整屏
    fade: 420,       // 奶油色层淡出，露出 01
    type: 1850,      // 整段话全部显现的时长（所有行一起从左往右，控制在 2s 内）
  };

  let busy = false;
  let wentDown = false;
  let typing = null;
  let anims = [];
  let timers = [];

  const after = (ms, fn) => timers.push(setTimeout(fn, ms));
  const topOf = (el) => el.getBoundingClientRect().top + window.scrollY;

  // html 上开着 scroll-behavior: smooth，普通 scrollTo 会变成平滑滚动（动画就错位了）。
  // behavior: "instant" 是标准值，会明确覆盖 CSS 的 smooth —— 一步到位。
  const setY = (v) => {
    window.scrollTo({ top: Math.round(v), left: 0, behavior: "instant" });
  };

  // 从一个矩形出发，算「保持圆形、也能盖住四个角」所需的最终圆
  const coverCircle = (r) => {
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const rad =
      Math.max(
        Math.hypot(cx, cy),
        Math.hypot(window.innerWidth - cx, cy),
        Math.hypot(cx, window.innerHeight - cy),
        Math.hypot(window.innerWidth - cx, window.innerHeight - cy)
      ) * 1.03;
    return { cx, cy, rad };
  };

  // 把一个元素缩到照片中心那一点（不是淡出）。先压掉它自己的 CSS 动画，
  // 否则 abFloat / abSpin 会盖掉这里写的 transform。
  const collapseTo = (el, cx, cy, dur, delay) => {
    if (!el) return null;
    el.style.animation = "none";
    const r = el.getBoundingClientRect();
    const dx = cx - (r.left + r.width / 2);
    const dy = cy - (r.top + r.height / 2);
    return el.animate(
      [
        { transform: "none", opacity: 1 },
        { transform: "translate(" + dx + "px," + dy + "px) scale(.04)", opacity: 0 },
      ],
      { duration: dur, delay: delay, easing: "cubic-bezier(.5,0,.72,1)", fill: "both" }
    );
  };

  const makeWave = (r) => {
    const w = document.createElement("div");
    w.className = "ab-hero-wave";
    w.innerHTML = '<div class="ab-hero-wave__tint"></div>';
    w.style.left = r.left + "px";
    w.style.top = r.top + "px";
    w.style.width = r.width + "px";
    w.style.height = r.height + "px";
    document.body.appendChild(w);
    return w;
  };

  const startType = () => {
    if (typing) return;
    if (stmt.__abReset) stmt.__abReset();   // 清掉跳转瞬间可能落在短语上的悬停
    phil.classList.add("is-typing");
    typing = abTypeRun(stmt, T.type);
    if (!typing) { phil.classList.remove("is-typing"); return; }
    typing.finished.then(() => {
      typing = null;
      phil.classList.remove("is-typing");
    });
  };

  // 往下：首屏 → 01
  const down = () => {
    if (busy) return true;
    busy = true;
    wentDown = true;
    stage.style.pointerEvents = "none";

    const r = blob.getBoundingClientRect();
    const w = makeWave(r);
    const tint = w.querySelector(".ab-hero-wave__tint");
    const c = coverCircle(r);

    // 圆：先按兵不动一小会儿（让照片先飞走），再保持圆形长大到盖住四个角
    w.animate(
      [
        { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px", borderRadius: "50%" },
        { left: c.cx - c.rad + "px", top: c.cy - c.rad + "px", width: c.rad * 2 + "px", height: c.rad * 2 + "px", borderRadius: "50%" },
      ],
      { duration: T.wave, delay: T.waveDelay, easing: "cubic-bezier(.42,0,.25,1)", fill: "both" }
    );
    after(T.waveDelay + T.wave * 0.1, () => { tint.style.opacity = "0"; });

    // 照片：往屏幕深处退（translateZ 负值）+ 缩小到没有
    anims.push(
      photo.animate(
        [
          { transform: "rotate(-3deg)", opacity: 1 },
          { transform: "translateZ(-360px) rotate(-3deg) scale(.74)", opacity: 1, offset: 0.55 },
          { transform: "translateZ(-940px) rotate(-3deg) scale(.26)", opacity: 0 },
        ],
        { duration: T.out, easing: "cubic-bezier(.45,0,.7,1)", fill: "both" }
      )
    );

    // 照片旁边的四个标签 + 那圈虚线，和照片一起收进照片中心那一点
    const pr = photo.getBoundingClientRect();
    const pcx = pr.left + pr.width / 2;
    const pcy = pr.top + pr.height / 2;
    // 和照片同一时长、同一节奏：一起缩，而不是照片先没、标签还挂着
    [ring, ...floats].forEach((el) => {
      const a = collapseTo(el, pcx, pcy, T.out, 0);
      if (a) anims.push(a);
    });

    // 左侧文字向左移出
    [lead, rest].forEach((el, i) => {
      if (!el) return;
      anims.push(
        el.animate(
          [
            { transform: "none", opacity: 1 },
            { transform: "translateX(-96px)", opacity: 0 },
          ],
          { duration: T.out, delay: 40 + i * 40, easing: "cubic-bezier(.45,0,.75,1)", fill: "both" }
        )
      );
    });

    // 底部 scroll 提示直接淡出
    if (cue) anims.push(cue.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280, fill: "both" }));

    // 01 先整体进"打字态"：
    // · 字符全部藏起来 —— 否则黄色散开的一瞬间会先闪出完整的一段话
    // · 高亮短语的底色归零 —— 否则字符虽然透明，那三条黄底纹还留在那儿
    // · 下面 01/02/03 三个条目隐藏，等打完字再浮上来
    phil.classList.add("is-typing");
    stmt.querySelectorAll(".ab-ch").forEach((c) => c.classList.add("is-off"));

    const swapAt = T.waveDelay + T.wave;
    after(swapAt, () => {
      setY(topOf(phil));                // 整屏被奶油色盖着，跳这一下看不见
      if (stmt.__abReset) stmt.__abReset();   // 01 落到鼠标底下时不要立刻把卡片弹出来
      anims.forEach((a) => a.cancel()); // hero 已在视口外，直接归位
      anims = [];
      [ring, ...floats].forEach((el) => { if (el) el.style.animation = ""; });
      stage.style.pointerEvents = "";
      phil.classList.add("is-head-in"); // 01 的标题在黄色底下就位（直接出现）
      after(90, () => {
        w.animate([{ opacity: 1 }, { opacity: 0 }], { duration: T.fade, fill: "both" }).onfinish = () => w.remove();
      });
      // 等黄色彻底散开、01 的底铺好，再开始打字（否则前几百毫秒的字被盖着）
      after(120 + T.fade, () => {
        busy = false;
        startType();
      });
      // 兜底：万一打字被中途打断，别让段落永远停在"打了一半"
      after(120 + T.fade + T.type + 2600, () => {
        if (!typing) stmt.querySelectorAll(".ab-ch.is-off").forEach((c) => c.classList.remove("is-off"));
      });
    });

    return true;
  };

  // 往上：01 → 首屏（把上面那一套倒着放一遍）
  // 没走过 down() 也能播（刷新后直接落在 01 时），只是首屏元素本来就在位，不用重播飞回
  const up = () => {
    if (busy) return true;
    busy = true;

    if (typing) { typing.finish(); typing = null; }
    stmt.querySelectorAll(".ab-ch").forEach((c) => c.classList.remove("is-off"));
    phil.classList.remove("is-typing");

    setY(0);                            // 先回到首屏，此刻整屏还是奶油色

    const r1 = blob.getBoundingClientRect();
    const c = coverCircle(r1);
    const w = makeWave({ left: c.cx - c.rad, top: c.cy - c.rad, width: c.rad * 2, height: c.rad * 2 });
    const tint = w.querySelector(".ab-hero-wave__tint");
    tint.style.opacity = "0";
    const a = w.animate(
      [
        { left: c.cx - c.rad + "px", top: c.cy - c.rad + "px", width: c.rad * 2 + "px", height: c.rad * 2 + "px", borderRadius: "50%" },
        { left: r1.left + "px", top: r1.top + "px", width: r1.width + "px", height: r1.height + "px", borderRadius: "50%" },
      ],
      { duration: 760, easing: "cubic-bezier(.4,0,.2,1)", fill: "both" }
    );
    a.onfinish = () => { w.remove(); busy = false; };
    after(50, () => { tint.style.opacity = "1"; });

    // 照片飞回来（只有走过 down() 首屏才是被"收走"的状态）
    if (wentDown) {
      photo.animate(
        [
          { transform: "translateZ(-780px) rotate(-3deg) scale(.42)", opacity: 0 },
          { transform: "rotate(-3deg)", opacity: 1 },
        ],
        { duration: 760, easing: "cubic-bezier(.2,.8,.3,1)" }
      );
    }

    // 标签和光圈从那个点重新长回来（和照片一起）
    if (wentDown) {
      const pr2 = photo.getBoundingClientRect();
      const pcx2 = pr2.left + pr2.width / 2;
      const pcy2 = pr2.top + pr2.height / 2;
      [ring, ...floats].forEach((el, i) => {
        if (!el) return;
        el.style.animation = "none";
        const r = el.getBoundingClientRect();
        const dx = pcx2 - (r.left + r.width / 2);
        const dy = pcy2 - (r.top + r.height / 2);
        const a = el.animate(
          [
            { transform: "translate(" + dx + "px," + dy + "px) scale(.04)", opacity: 0 },
            { transform: "none", opacity: 1 },
          ],
          { duration: 700, delay: 30 + i * 22, easing: "cubic-bezier(.2,.8,.3,1)" }
        );
        a.onfinish = () => { el.style.animation = ""; };
      });

      // 文字从左边归位
      [lead, rest].forEach((el, i) => {
        if (!el) return;
        el.animate(
          [
            { transform: "translateX(-96px)", opacity: 0 },
            { transform: "none", opacity: 1 },
          ],
          { duration: 700, delay: 60 + i * 40, easing: "cubic-bezier(.2,.8,.3,1)" }
        );
      });
    }

    return true;
  };

  // 打字途中用户往下走了：直接把剩下的字补完，别让他回来时看到打到一半的段落
  let scrollRaf = 0;
  window.addEventListener(
    "scroll",
    () => {
      if (scrollRaf || !typing) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        if (!typing) return;
        if (window.scrollY > topOf(phil) + window.innerHeight * 0.4) typing.finish();
      });
    },
    { passive: true }
  );

  AB_TRANSIT = { down, up, busy: () => busy };
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
  const wide = window.matchMedia("(min-width: 1024px)");   // 手风琴只在桌面端生效
  let cur = -1;
  let hTimer = 0;

  const paint = (idx) => {
    cards.forEach((c, i) => {
      const on = i === idx;
      c.classList.toggle("is-open", on);
      c.classList.toggle("is-strip", idx > -1 && !on);
      const btn = c.querySelector(".ab-int__toggle");
      if (btn) {
        btn.setAttribute("aria-expanded", String(on));
        const txt = btn.querySelector(".ab-int__toggle-txt");
        if (txt) txt.textContent = on ? "Close" : "See more";
      }
    });
    wrap.classList.toggle("has-open", idx > -1);
  };

  // 量一次"目标态"：临时关掉过渡按目标态排版，量完立刻还原，
  // 全程在同一次布局里完成，不会画到中间态，也不会留下动画记录。
  // 除了容器高度，还把展开卡里"图片列 / 文字列"的实际宽度量出来 ——
  // 变形期间要用它们把布局钉死在最终尺寸（否则宽度在插值，图的盒子会被拉伸、文字会重新折行）
  const measure = (idx, back) => {
    const wrapT = wrap.style.transition;
    const wrapH = wrap.style.height;
    const cardT = cards.map((c) => c.style.transition);
    wrap.style.transition = "none";
    wrap.style.height = "auto";
    cards.forEach((c) => { c.style.transition = "none"; });
    paint(idx);
    void wrap.offsetHeight;
    const h = wrap.getBoundingClientRect().height;
    let mediaW = 0;
    let rightW = 0;
    if (idx > -1) {
      const card = cards[idx];
      mediaW = Math.round(card.querySelector(".ab-int__media").getBoundingClientRect().width);
      rightW = Math.round(card.querySelector(".ab-int__right").getBoundingClientRect().width);
    }
    paint(back);
    void wrap.offsetHeight;
    cards.forEach((c, i) => { c.style.transition = cardT[i]; });
    wrap.style.transition = wrapT;
    wrap.style.height = wrapH;
    return { h, mediaW, rightW };
  };

  // 三张卡展开后的内容高度本来各不相同（同一宽度下实测 620 / 682 / 648）。
  // 这里把三张分别按"展开态"量一遍，取最大值写成 CSS 变量，
  // 让 .is-open 的 min-height 统一到它 —— 于是不管点哪张，撑开的高度都一样。
  // 量之前先清掉变量，否则上一次的值会把结果锁死在最大值上、越量越大。
  const fitHeight = () => {
    if (!wide.matches) {
      wrap.style.removeProperty("--int-open-h");
      wrap.style.removeProperty("--int-media-w");
      wrap.style.removeProperty("--int-right-w");
      wrap.style.removeProperty("--int-closed-w");
      return 0;
    }
    wrap.style.removeProperty("--int-open-h");
    void wrap.offsetHeight;
    let max = 0;
    let mediaW = 0;
    let rightW = 0;
    cards.forEach((c, i) => {
      const m = measure(i, cur);
      if (m.h > max) max = m.h;
      if (m.mediaW) mediaW = m.mediaW;
      if (m.rightW) rightW = m.rightW;
    });
    max = Math.round(max);
    wrap.style.setProperty("--int-open-h", max + "px");
    if (mediaW) wrap.style.setProperty("--int-media-w", mediaW + "px");
    if (rightW) wrap.style.setProperty("--int-right-w", rightW + "px");
    // 收起态的卡宽（CSS 里是 (100% - 44) / 3），挡板动画时要把内容钉在这个宽度
    wrap.style.setProperty(
      "--int-closed-w",
      Math.round((wrap.getBoundingClientRect().width - 44) / 3) + "px"
    );
    return max;
  };

  const setOpen = (card) => {
    const idx = card ? cards.indexOf(card) : -1;
    if (idx === cur) return;
    const prev = cur;
    cur = idx;
    const animate = wide.matches;

    if (!animate) {          // 小屏：保持原来的做法，不做高度动画（滚动跟随也照旧，不动手机端）
      paint(idx);
      if (card) {
        const top = card.getBoundingClientRect().top + window.scrollY - 96;
        if (Math.abs(window.scrollY - top) > 40) window.scrollTo({ top, behavior: "smooth" });
      }
      return;
    }

    const h0 = wrap.getBoundingClientRect().height;
    const m = measure(idx, prev);
    const h1 = m.h;
    const closing = idx === -1 && prev > -1;
    clearTimeout(hTimer);
    // 变形期间（下面在 CSS 里）把卡内布局钉死在最终尺寸：
    // 图片列/文字列的宽度、行高都用展开态的实测值 ——
    // 内容从头到尾一动不动，卡片只是像一个窗口一样长大，从左边把内容"扫"出来（像拉帘子）
    wrap.classList.add("is-morphing");
    if (closing) wrap.classList.add("is-closing");
    // 先把高度钉在当前值，再过渡到目标值，避免展开瞬间高度"跳一下"
    wrap.style.transition = "none";
    wrap.style.height = h0 + "px";
    void wrap.offsetHeight;
    // 收起时先不切布局：让卡片保持展开态，只把窗口宽度收回去，最后一帧才落回收起态
    if (!closing) paint(idx);
    wrap.style.transition = "height 0.48s cubic-bezier(0.4, 0, 0.2, 1)";
    wrap.style.height = h1 + "px";
    hTimer = setTimeout(() => {
      wrap.style.transition = "";
      wrap.style.height = "";
      wrap.classList.remove("is-morphing", "is-closing");
      if (closing) paint(-1);   // 窗口已经回到收起态的尺寸，这时再切布局
    }, 500);
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

  // 展开后的统一高度：第一次排版完成量一遍；字体加载完、窗口尺寸变了再量
  fitHeight();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => fitHeight());
  let fitTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(() => {
      fitHeight();
      if (cur > -1) wrap.style.height = "";   // 已展开时让容器回落到 auto，跟随新的统一高度
    }, 180);
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

  const THRESHOLD = 24;      // 滚轮 / 触控板累积阈值
  const LOCK_MS = 520;      // 翻页动画锁
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

    // 首屏 → 01：交给专门的转场（照片往屏幕里飞走 / 圆撑满整屏 / 打字）
    if (dir > 0 && !cur && AB_TRANSIT && AB_TRANSIT.down()) return true;

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
        if (now < settleUntil) return true;
      }
      const next = sections[idx + 1];
      if (!next) return false;
      // 01 → 02：交给专门的转场（高亮条聚成有缺口的圆 → GPA 环），期间锁滚动
      if (cur && cur.id === "philosophy" && next.id === "education" && AB_PE && AB_PE.down()) return true;
      // 02 → 03：GPA 环转到屏幕中间再拉直成时间轴竖线
      if (cur && cur.id === "education" && next.id === "experience" && AB_EE && AB_EE.down()) return true;
      // 03 → 04：竖线守在原地 → 收成外框的左边 → 笔尖绕 8 张卡片画一圈
      if (cur && cur.id === "experience" && next.id === "skills" && AB_ES && AB_ES.down()) return true;
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
    }
    const prev = idx > 0 ? sections[idx - 1] : hero;
    if (!prev) return false;
    // 已经贴着板块顶部、要往回走时：反向转场一律优先于上面那 240ms 的「停顿」，
    // 否则这几下滚轮会被直接吞掉 —— 返回动画就会时有时无
    // 02 → 01：把 01→02 那套倒着放一遍
    if (prev.id === "philosophy" && AB_PE && AB_PE.up()) return true;
    // 03 → 02：时间轴竖线弯回成环，转回 GPA
    if (prev.id === "education" && AB_EE && AB_EE.up()) return true;
    // 04 → 03：整套倒着放
    if (prev.id === "experience" && AB_ES && AB_ES.up()) return true;
    if (idx === 0 && prev === hero && AB_TRANSIT && AB_TRANSIT.up()) return true;
    if (cur && now < settleUntil) return true;
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
    // 首屏那段转场还在播（约 1.1s）：先吞掉，别让它被后续滚轮推着走
    if (AB_TRANSIT && AB_TRANSIT.busy()) { e.preventDefault(); return; }
    if (AB_PE && AB_PE.busy()) { e.preventDefault(); return; }
    if (AB_EE && AB_EE.busy()) { e.preventDefault(); return; }
    if (AB_ES && AB_ES.busy()) { e.preventDefault(); return; }

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
  abInitPhilosophy();
  abInitExperience();
  abInitTools();
  abInitHeadRule();
  abInitRelays();
  abInitPhilEdu();       // 01 → 02 的整段转场，同样要在 pager 之前
  abInitEduExp();        // 02 → 03 的整段转场
  abInitExpSkills();     // 03 → 04 的整段转场
  abInitHeroTransit();   // 必须在 abInitPager 之前：pager 会读 AB_TRANSIT
  abInitIndex(abRenderIndex());
  abInitPager();

  // main.js 的滚动入场在这里补挂一次（内容刚生成）
  if (typeof initReveal === "function") initReveal();
})();
