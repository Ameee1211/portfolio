/* ============================================================
   渲染逻辑 —— 读取 content.js 的数据生成页面
   一般不需要改动这个文件
   ============================================================ */

const $ = (id) => document.getElementById(id);
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])
  );

/* ---------------- 导航 ---------------- */
function renderNav() {
  $("navLinks").innerHTML = SITE.nav.links
    .map(
      (l) =>
        `<a class="nav__link${l.active ? " is-active" : ""}" href="${esc(l.href)}">${esc(l.label)}</a>`
    )
    .join("");
  const logo = document.querySelector(".nav__logo");
  if (logo) logo.textContent = SITE.nav.brand;
}

/* ---------------- 首屏字母迷宫 ---------------- */
const CELL = 100;

function highlightGeom(cells) {
  const pts = cells.map(([r, c]) => ({ x: c * CELL + CELL / 2, y: r * CELL + CELL / 2 }));
  const first = pts[0];
  const last = pts[pts.length - 1];
  const sameRow = cells.every(([r]) => r === cells[0][0]);

  if (sameRow) {
    return {
      x: first.x - CELL / 2 + 14,
      y: first.y - 30,
      w: pts.length * CELL - 28,
      h: 60,
      rot: 0,
      cx: 0,
      cy: 0,
    };
  }
  // 斜向（TONG）
  const dx = last.x - first.x;
  const dy = last.y - first.y;
  const len = Math.hypot(dx, dy) + CELL - 28;
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  const mx = (first.x + last.x) / 2;
  const my = (first.y + last.y) / 2;
  return { x: mx - len / 2, y: my - 30, w: len, h: 60, rot: ang, cx: mx, cy: my };
}

function renderWordSearch() {
  const { letters, words } = SITE.wordsearch;
  const rows = letters.length;
  const cols = letters[0].length;

  const found = new Set();
  words.forEach((w) => w.cells.forEach(([r, c]) => found.add(`${r},${c}`)));

  const highlights = words
    .map((w, i) => {
      const g = highlightGeom(w.cells);
      const rot = g.rot ? ` transform="rotate(${g.rot.toFixed(2)} ${g.cx} ${g.cy})"` : "";
      return `<rect class="ws__hl" x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" rx="30"${rot} style="animation-delay:${(0.15 * i + 0.35).toFixed(2)}s"/>`;
    })
    .join("");

  const glyphs = letters
    .map((row, r) =>
      row
        .split("")
        .map((ch, c) => {
          const isFound = found.has(`${r},${c}`);
          return `<text class="ws__letter${isFound ? " is-found" : ""}" x="${c * CELL + CELL / 2}" y="${r * CELL + CELL / 2}">${esc(ch)}</text>`;
        })
        .join("")
    )
    .join("");

  $("wordSearch").innerHTML = `
    <svg class="ws" viewBox="0 0 ${cols * CELL} ${rows * CELL}" role="img"
         aria-label="Word search puzzle spelling TONG ZHANG, UI, UX and DESIGN">
      <g class="ws__highlights">${highlights}</g>
      <g class="ws__letters">${glyphs}</g>
    </svg>`;
}

/* ---------------- About Me ---------------- */
function renderAbout() {
  const a = SITE.about;
  $("aboutPhoto").src = a.photo;
  $("aboutTitle").textContent = a.title;
  $("aboutBtn").textContent = a.button.label;
  $("aboutBtn").href = a.button.href;

  $("aboutInfo").innerHTML = a.info
    .map(
      (i) =>
        `<div class="about__row"><dt>${esc(i.label)}</dt><dd>${esc(i.value)}</dd></div>`
    )
    .join("");

  $("aboutIntro").textContent = a.intro;

  $("skillsTitle").textContent = a.skills.title;
  $("skillsRow").innerHTML = a.skills.items
    .map(
      (s) =>
        `<span class="skill" style="--skill-color:${esc(s.color)}">${esc(s.label)}</span>`
    )
    .join("");
}

/* ---------------- Featured Projects ---------------- */
function renderProjects() {
  const p = SITE.projects;
  $("projectsTitle").textContent = p.title;
  $("projectsIntro").innerHTML = p.intro.map((t) => `<p>${esc(t)}</p>`).join("");

  $("projectsGrid").innerHTML = p.items
    .map((it, i) => {
      const media = it.cover
        ? `<img src="${esc(it.cover)}" alt="${esc(it.title)}" loading="lazy" />`
        : `<span class="card__placeholder">${esc(it.title)}</span>`;
      const href = it.link || "#projects";
      return `
      <article class="card reveal" style="--tint:${esc(it.tint)};transition-delay:${(i * 0.08).toFixed(2)}s">
        <div class="card__body">
          <div class="card__tags">
            ${it.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}
          </div>
          <h3 class="card__title">${esc(it.title)}</h3>
          <p class="card__desc">${esc(it.description)}</p>
          <a class="btn btn--purple" href="${esc(href)}">Explore More</a>
        </div>
        <div class="card__media">${media}</div>
      </article>`;
    })
    .join("");
}

/* ---------------- 页脚 ---------------- */
function renderFooter() {
  const f = SITE.footer;
  $("footerThanks").textContent = f.thanks;
  $("footerEmail").textContent = f.email;
  $("footerEmail").href = "mailto:" + f.email;
  $("footerBadge").textContent = f.badge;
  $("footerCopy").textContent = f.copyright;
}

/* ---------------- 交互 ---------------- */
function initInteractions() {
  const nav = document.querySelector(".nav");

  $("navBurger").addEventListener("click", () => nav.classList.toggle("is-open"));
  $("navLinks").addEventListener("click", (e) => {
    if (e.target.classList.contains("nav__link")) nav.classList.remove("is-open");
  });

  const links = [...document.querySelectorAll(".nav__link")];
  const targets = links
    .map((l) => document.querySelector(l.getAttribute("href")))
    .filter(Boolean);

  const onScroll = () => {
    nav.classList.toggle("is-solid", window.scrollY > 40);
    let current = targets[0];
    targets.forEach((t) => {
      if (t && t.getBoundingClientRect().top <= 140) current = t;
    });
    links.forEach((l) =>
      l.classList.toggle("is-active", current && l.getAttribute("href") === "#" + current.id)
    );
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
}

/* ---------------- 启动 ---------------- */
renderNav();
renderWordSearch();
renderAbout();
renderProjects();
renderFooter();
initInteractions();
