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
      <span class="ab-philosophy__mark" aria-hidden="true"></span>
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
  const hide = (el, ms) => {
    if (!el) return;
    el.style.opacity = "0";
    setTimeout(() => { el.style.opacity = ""; }, ms);
  };

  const flash = (el, ms) => {
    if (!el) return;
    el.classList.add("is-received");
    setTimeout(() => el.classList.remove("is-received"), ms);
  };

  const relays = {};

  // ② 01 -> 02：那条横线被"撑开"成一个圆，落成 GPA 环
  relays["philosophy>education"] = () => {
    const mark = document.querySelector("#philosophy .ab-philosophy__mark");
    const gpa = document.querySelector("#education .ab-gpa");
    if (!mark || !gpa) return;
    const mr = R(mark);
    const gr = R(gpa);

    // 一条粗横线：靠"边框"撑开成圆环（背景随尺寸淡掉，只剩描边）
    const c = document.createElement("div");
    c.className = "ab-relay ab-relay--ring";
    c.style.left = mr.left + "px";
    c.style.top = mr.top + "px";
    c.style.width = mr.width + "px";
    c.style.height = Math.max(6, mr.height) + "px";
    layer.appendChild(c);

    const size = Math.min(gr.width, gr.height) * 0.94;
    const a = c.animate([
      {
        left: mr.left + "px",
        top: mr.top + "px",
        width: mr.width + "px",
        height: Math.max(6, mr.height) + "px",
        backgroundColor: "rgba(255,207,149,1)",
        opacity: 1,
      },
      {
        left: (gr.left + (gr.width - size) / 2) + "px",
        top: (gr.top + (gr.height - size) / 2) + "px",
        width: size + "px",
        height: size + "px",
        backgroundColor: "rgba(255,207,149,0)",
        opacity: 1,
      },
    ], { duration: 600, easing: "cubic-bezier(.55,0,.25,1)", fill: "both" });
    a.onfinish = () => {
      c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: "both" }).onfinish = () => c.remove();
    };

    hide(mark, 900);

    gpa.style.opacity = "0";
    setTimeout(() => {
      gpa.style.transition = "opacity .3s ease";
      gpa.style.opacity = "";
      setTimeout(() => { gpa.style.transition = ""; }, 380);
    }, 420);
  };

  // ③ 02 -> 03：环缩小，落成时间轴的第一个点
  relays["education>experience"] = () => {
    const gpa = document.querySelector("#education .ab-gpa");
    const dot = document.querySelector("#experience .ab-exp__dot");
    if (!gpa || !dot) return;
    const gr = R(gpa);
    const dr = R(dot);
    const { c } = clone(gpa);
    const s = Math.max(0.02, dr.width / gr.width);
    const a = run(c, [
      { transform: "none", opacity: 1 },
      { transform: "translate(" + (dr.left + dr.width / 2 - (gr.left + gr.width / 2)) + "px," + (dr.top + dr.height / 2 - (gr.top + gr.height / 2)) + "px) scale(" + s.toFixed(3) + ")", opacity: 0 },
    ], { duration: 540 });
    a.onfinish = () => { c.remove(); flash(dot, 700); };
    hide(gpa, 1000);
  };

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
   打字：把 .ab-ch 一个个放出来（finish() 可以立刻补完）
   ============================================================ */
function abTypeRun(root, dur) {
  const chars = root ? [...root.querySelectorAll(".ab-ch")] : [];
  if (!chars.length) return null;

  chars.forEach((c) => c.classList.add("is-off"));
  const n = chars.length;
  let shown = 0;
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
    const k = Math.min(1, (now - t0) / dur);
    const upto = Math.min(n, Math.max(1, Math.round(k * n)));
    while (shown < upto) {
      chars[shown].classList.remove("is-off");
      shown += 1;
    }
    if (k >= 1) { finish(); return; }
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
let AB_TRANSIT = null;

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
    out: 620,        // 照片飞走 / 文字左移
    waveDelay: 470,  // 圆晚一拍起步：先把照片飞走这件事看清楚
    wave: 820,       // 圆撑满整屏
    fade: 420,       // 奶油色层淡出，露出 01
    type: 4300,      // 打字总时长（5 秒内）
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

    // 虚线光圈、浮动小标签、底部 scroll 提示一起退场
    [ring, cue, ...floats].forEach((el) => {
      if (el) el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "both" });
    });

    // 01 的文字在这时先全部藏起来：等黄色散开时是空白，再一个字一个字打出来
    // （否则会先闪一下完整的段落，然后重新打）
    stmt.querySelectorAll(".ab-ch").forEach((c) => c.classList.add("is-off"));

    const swapAt = T.waveDelay + T.wave;
    after(swapAt, () => {
      setY(topOf(phil));                // 整屏被奶油色盖着，跳这一下看不见
      if (stmt.__abReset) stmt.__abReset();   // 01 落到鼠标底下时不要立刻把卡片弹出来
      anims.forEach((a) => a.cancel()); // hero 已在视口外，直接归位
      anims = [];
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
  const up = () => {
    if (!wentDown) return false;        // 刷新直接落在这里时没有可倒放的东西
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

    // 照片飞回来
    photo.animate(
      [
        { transform: "translateZ(-780px) rotate(-3deg) scale(.42)", opacity: 0 },
        { transform: "rotate(-3deg)", opacity: 1 },
      ],
      { duration: 760, easing: "cubic-bezier(.2,.8,.3,1)" }
    );

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
      if (now < settleUntil) return true;
    }
    const prev = idx > 0 ? sections[idx - 1] : hero;
    // 01 → 首屏：把刚才那套转场倒着放一遍
    if (idx === 0 && prev === hero && AB_TRANSIT && AB_TRANSIT.up()) return true;
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
    // 首屏那段转场还在播（约 1.1s）：先吞掉，别让它被后续滚轮推着走
    if (AB_TRANSIT && AB_TRANSIT.busy()) { e.preventDefault(); return; }

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
  abInitHeroTransit();   // 必须在 abInitPager 之前：pager 会读 AB_TRANSIT
  abInitIndex(abRenderIndex());
  abInitPager();

  // main.js 的滚动入场在这里补挂一次（内容刚生成）
  if (typeof initReveal === "function") initReveal();
})();
