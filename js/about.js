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
  const letters = SITE.wordsearch.letters.join("").split("");
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
        <span class="ab-eyebrow" data-ab-in="1"><span class="ab-eyebrow__dot"></span>${esc(h.eyebrow)}</span>
        <h1 class="ab-hero__name" data-ab-in="2">${esc(h.name)} <em>${esc(h.nameAccent)}</em>
          <span class="ab-hero__alias">${esc(h.alias)}</span>
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
          <span class="ab-badge">${esc(h.badge)}</span>
          ${floats}
        </div>
      </div>
      <div class="ab-hero__rest">
        <div class="ab-roles" id="abRoles" data-ab-in="3">${roles}</div>
        <p class="ab-hero__lede" data-ab-in="4">${esc(h.lede)}</p>
        <div class="ab-hero__cta" data-ab-in="5">
          <a class="btn btn--purple" href="${esc(h.ctaPrimary.href)}">${esc(h.ctaPrimary.label)}</a>
          <a class="ab-btn-ghost" href="${esc(h.ctaSecondary.href)}">${esc(h.ctaSecondary.label)}</a>
        </div>
        <div class="ab-hero__meta" data-ab-in="6">${stats}</div>
      </div>
    </div>
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
function abRenderSkills() {
  const s = AB.skills;
  const caps = s.capabilities.items
    .map(
      (c, i) => `
      <div class="ab-cap__item">
        <span class="ab-cap__num">${String(i + 1).padStart(2, "0")}</span>
        <h4 class="ab-cap__name">${esc(c.name)}</h4>
        <p class="ab-cap__note">${esc(c.note)}</p>
      </div>`
    )
    .join("");
  const tools = s.tools.items
    .map((t) => `<span class="ab-tool" style="--c:${esc(t.color)}">${esc(t.label)}</span>`)
    .join("");

  const langs = (s.languages || [])
    .map(
      (l) => `
      <div class="ab-lang__row">
        <span class="ab-lang__k">${esc(l.name)}</span>
        <span class="ab-lang__v">${esc(l.level)}</span>
      </div>`
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
      <div class="ab-skills">
        <div>
          <h3 class="ab-group__title">${esc(s.capabilities.title)}</h3>
          <div class="ab-cap">${caps}</div>
        </div>
        <div>
          <h3 class="ab-group__title">${esc(s.tools.title)}</h3>
          <div class="ab-tools">${tools}</div>
          ${langs ? `<div class="ab-lang">${langs}</div>` : ""}
        </div>
      </div>
    </div>
  </section>`;
}

/* ---------- 6. 联系方式 ---------- */
function abRenderContact() {
  const c = AB.contact;
  const rows = c.items
    .map(
      (it) => `
      <button class="ab-contact__row" type="button" data-copy="${esc(it.value)}"${it.copy === false ? ' data-nocopy="1"' : ""}>
        <span class="ab-contact__k">${esc(it.label)}</span>
        <span class="ab-contact__v">${esc(it.value)}</span>
        <span class="ab-contact__hint">${it.copy === false ? "Ask me for it" : "Click to copy"}</span>
      </button>`
    )
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
function abRenderInterests() {
  const s = AB.interests;
  const cards = s.items
    .map((it) => {
      const media = it.image
        ? `<img src="${esc(it.image)}" alt="${esc(it.title)}" loading="lazy" />`
        : INT_ICONS[it.icon] || "";
      return `
      <article class="ab-int__card reveal" style="--tint:${esc(it.tint)}">
        <div class="ab-int__media">${media}</div>
        <div class="ab-int__body">
          <span class="ab-int__kicker">${esc(it.kicker)}</span>
          <h3 class="ab-int__title">${esc(it.title)}</h3>
          <p class="ab-int__text">${esc(it.text)}</p>
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
      <div class="ab-int">${cards}</div>
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
      if (row.dataset.nocopy) {
        say("Drop me an email and I'll send it");
        return;
      }
      copy(val);
    });
  });
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
    abRenderContact(),
    abRenderInterests(),
  ].join("");

  abInitHero();
  abInitAnim();
  abInitCopy();

  // main.js 的滚动入场在这里补挂一次（内容刚生成）
  if (typeof initReveal === "function") initReveal();
})();
