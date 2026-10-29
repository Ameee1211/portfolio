/* ============================================================
   渲染逻辑 —— 读取 content.js 的数据生成页面
   一般不需要改动这个文件
   ============================================================ */

const $ = (id) => document.getElementById(id);
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])
  );

/* ============================================================
   导航（所有页面共用）
   ============================================================ */
const CARET = `<svg class="nav__caret" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`;

function currentPage() {
  const f = location.pathname.split("/").pop();
  return (f || "index.html").toLowerCase();
}

function renderNav() {
  const brandEl = document.querySelector(".nav__brand");
  if (!brandEl || !$("navLinks")) return;
  brandEl.innerHTML = `<img class="nav__logo" src="${esc(SITE.nav.logo)}" alt="Amy logo" />`;

  const here = currentPage();
  $("navLinks").innerHTML = SITE.nav.links
    .map((l) => {
      const drop = l.dropdown || [];
      const active =
        l.href.toLowerCase() === here || drop.some((d) => d.href.toLowerCase() === here);

      if (drop.length) {
        const items = drop
          .map(
            (d) =>
              `<a class="nav__drop-link${d.href.toLowerCase() === here ? " is-active" : ""}" href="${esc(d.href)}">${esc(d.label)}</a>`
          )
          .join("");
        return `<div class="nav__item has-dropdown">
          <button class="nav__link${active ? " is-active" : ""}" type="button" aria-haspopup="true" aria-expanded="false">${esc(l.label)}${CARET}</button>
          <div class="nav__dropdown">${items}</div>
        </div>`;
      }
      return `<div class="nav__item">
        <a class="nav__link${active ? " is-active" : ""}" href="${esc(l.href)}">${esc(l.label)}</a>
      </div>`;
    })
    .join("");
}

// 收起所有展开的项目下拉（except 用来保留刚点开的那个）
function closeDropdowns(except) {
  document.querySelectorAll(".has-dropdown.is-open").forEach((item) => {
    if (item === except) return;
    item.classList.remove("is-open");
    const btn = item.querySelector(".nav__link");
    if (btn) btn.setAttribute("aria-expanded", "false");
  });
}

function initNav() {
  const nav = document.querySelector(".nav");
  if (!nav) return;

  nav.addEventListener("click", (e) => {
    const btn = e.target.closest(".nav__link");
    if (btn && btn.parentElement.classList.contains("has-dropdown")) {
      const item = btn.parentElement;
      closeDropdowns(item); // 同时只允许展开一个
      const open = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
      return;
    }
    if (e.target.closest(".nav__drop-link")) {
      nav.classList.remove("is-open");
      closeDropdowns();
    }
  });

  $("navBurger").addEventListener("click", () => nav.classList.toggle("is-open"));

  // 点击页面其他地方：收起下拉，手机端连整个菜单一起收起
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target)) nav.classList.remove("is-open");
    closeDropdowns(e.target.closest(".has-dropdown"));
  });

  const onScroll = () => {
    nav.classList.toggle("is-solid", window.scrollY > 40);
    // 手机端：上下滑动时收起菜单和下拉
    if (window.innerWidth <= 900 && nav.classList.contains("is-open")) {
      nav.classList.remove("is-open");
      closeDropdowns();
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    nav.classList.remove("is-open");
    closeDropdowns();
  });

  // 窗口变宽回到桌面布局时清理残留状态
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      nav.classList.remove("is-open");
      closeDropdowns();
    }
  });
}

/* ============================================================
   首屏：字母迷宫小游戏
   ============================================================ */
const CW = 150; // 单元格宽（SVG 单位）
const CH = 100; // 单元格高
const BAND = 64; // 高亮条厚度

const center = (r, c) => ({ x: c * CW + CW / 2, y: r * CH + CH / 2 });

function bandGeom(cells) {
  const first = center(cells[0][0], cells[0][1]);
  const last = center(cells[cells.length - 1][0], cells[cells.length - 1][1]);
  const sameRow = cells.every((x) => x[0] === cells[0][0]);

  if (sameRow) {
    const inset = 16;
    return {
      x: first.x - CW / 2 + inset,
      y: first.y - BAND / 2,
      w: cells.length * CW - inset * 2,
      h: BAND,
      rot: 0,
      cx: 0,
      cy: 0,
    };
  }
  const dx = last.x - first.x;
  const dy = last.y - first.y;
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  const rad = Math.atan2(dy, dx);
  const pad =
    (CW / 2) * Math.abs(Math.cos(rad)) + (CH / 2) * Math.abs(Math.sin(rad)) - 10;
  const len = Math.hypot(dx, dy) + 2 * pad;
  const mx = (first.x + last.x) / 2;
  const my = (first.y + last.y) / 2;
  return { x: mx - len / 2, y: my - BAND / 2, w: len, h: BAND, rot: ang, cx: mx, cy: my };
}

/* ---- 完成特效用的图形 ---- */
const STAR_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.6l3 6.6 7.2.7-5.4 4.8 1.5 7.1L12 17.2 5.7 20.8l1.5-7.1L1.8 8.9 9 8.2z" fill="currentColor"/></svg>`;

const CAT_SVG = `<svg viewBox="0 0 72 72" aria-hidden="true">
  <path d="M12 32 L15 7 L35 21 Z" fill="#FFCF95"/>
  <path d="M60 32 L57 7 L37 21 Z" fill="#FFCF95"/>
  <path d="M17 28 L19 13 L30 22 Z" fill="#F3B3C4"/>
  <path d="M55 28 L53 13 L42 22 Z" fill="#F3B3C4"/>
  <ellipse cx="36" cy="42" rx="26" ry="22" fill="#FFCF95"/>
  <ellipse cx="24.5" cy="38" rx="3.4" ry="4.2" fill="#333D6D"/>
  <ellipse cx="47.5" cy="38" rx="3.4" ry="4.2" fill="#333D6D"/>
  <circle cx="25.7" cy="36.3" r="1.2" fill="#fff"/>
  <circle cx="48.7" cy="36.3" r="1.2" fill="#fff"/>
  <ellipse cx="17" cy="46" rx="4" ry="2.6" fill="#F3B3C4" opacity="0.75"/>
  <ellipse cx="55" cy="46" rx="4" ry="2.6" fill="#F3B3C4" opacity="0.75"/>
  <path d="M32.5 47 L39.5 47 L36 51.5 Z" fill="#E8886B"/>
  <path d="M36 51.5 Q32.5 56.5 28.5 52.5" fill="none" stroke="#333D6D" stroke-width="2" stroke-linecap="round"/>
  <path d="M36 51.5 Q39.5 56.5 43.5 52.5" fill="none" stroke="#333D6D" stroke-width="2" stroke-linecap="round"/>
  <g stroke="#333D6D" stroke-width="1.7" stroke-linecap="round" opacity="0.65">
    <line x1="9" y1="41" x2="24" y2="43.5"/>
    <line x1="9" y1="48" x2="24" y2="48.5"/>
    <line x1="63" y1="41" x2="48" y2="43.5"/>
    <line x1="63" y1="48" x2="48" y2="48.5"/>
  </g>
</svg>`;

/* 全部找齐后的庆祝：WELCOME 跳出 → 小星星 + 小猫 → 滚到 About 板块 */
function playFinale() {
  const cfg = SITE.wordsearch.finale || {};
  if ($("wsFinale")) return;
  const text = cfg.text || "WELCOME";

  const colors = ["#FFCF95", "#7469B6", "#7EB5EC", "#F3B3C4"];
  const stars = Array.from({ length: cfg.stars ?? 16 }, (_, i) => {
    const x = 4 + Math.random() * 92;
    const y = 8 + Math.random() * 62;
    const s = 14 + Math.random() * 24;
    return `<span class="ws-star" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;width:${s.toFixed(0)}px;height:${s.toFixed(0)}px;animation-delay:${(Math.random() * 0.75).toFixed(2)}s;color:${colors[i % colors.length]}">${STAR_SVG}</span>`;
  }).join("");

  const n = cfg.cats ?? 3;
  const cats = Array.from({ length: n }, (_, i) => {
    const x = n === 1 ? 50 : 18 + (i * 64) / (n - 1);
    const s = 58 + (i % 2) * 18;
    return `<span class="ws-cat" style="left:${x.toFixed(1)}%;width:${s}px;animation-delay:${(0.4 + i * 0.16).toFixed(2)}s">${CAT_SVG}</span>`;
  }).join("");

  const el = document.createElement("div");
  el.className = "ws-finale";
  el.id = "wsFinale";
  el.innerHTML = `<div class="ws-finale__stars">${stars}</div><div class="ws-finale__word">${esc(text)}</div><div class="ws-finale__cats">${cats}</div>`;
  document.body.appendChild(el);

  const hold = cfg.holdMs ?? 1500;
  setTimeout(() => {
    el.classList.add("is-out");
    const target = $(cfg.scrollTo || "about");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 950 + hold);
  setTimeout(() => el.remove(), 950 + hold + 520);
}

function renderWordSearch() {
  const host = $("wordSearch");
  if (!host) return;
  const { letters, words } = SITE.wordsearch;
  const rows = letters.length;
  const cols = letters[0].length;

  // 答案直接可见：每个单词一开始就画出虚线轮廓，未找到时轮流呼吸
  const foundBands = words
    .map((w, i) => {
      const g = bandGeom(w.cells);
      const rect = `<rect class="ws__hl" x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" rx="${BAND / 2}" />`;
      const rot = g.rot ? ` transform="rotate(${g.rot.toFixed(2)} ${g.cx} ${g.cy})"` : "";
      return `<g class="ws__band" style="animation-delay:${(i * 0.55).toFixed(2)}s"${rot}>${rect}</g>`;
    })
    .join("");

  const hits = letters
    .map((row, r) =>
      row
        .split("")
        .map(
          (_, c) =>
            `<rect class="ws__hit" x="${c * CW + 6}" y="${r * CH + 6}" width="${CW - 12}" height="${CH - 12}" rx="14" />`
        )
        .join("")
    )
    .join("");

  const glyphs = letters
    .map((row, r) =>
      row
        .split("")
        .map(
          (ch, c) =>
            `<text class="ws__letter" x="${c * CW + CW / 2}" y="${r * CH + CH / 2}">${esc(ch)}</text>`
        )
        .join("")
    )
    .join("");

  host.innerHTML = `
    <svg class="ws" viewBox="0 0 ${cols * CW} ${rows * CH}" role="img"
         aria-label="A word search puzzle: drag across the letters to find them">
      <g class="ws__found">${foundBands}</g>
      <line class="ws__sel" x1="0" y1="0" x2="0" y2="0" />
      <g class="ws__hits">${hits}</g>
      <g class="ws__letters">${glyphs}</g>
      <circle class="ws__cursor" cx="0" cy="0" r="13" />
    </svg>`;

  initWordSearchGame(host, letters, words, rows, cols);
}

function initWordSearchGame(host, letters, words, rows, cols) {
  const svg = host.querySelector(".ws");
  const sel = svg.querySelector(".ws__sel");
  const cursor = svg.querySelector(".ws__cursor");
  const hitEls = [...svg.querySelectorAll(".ws__hit")];
  const letterEls = [...svg.querySelectorAll(".ws__letter")];
  const bandEls = [...svg.querySelectorAll(".ws__hl")];

  const letterAt = (r, c) => letters[r][c];
  const idx = (r, c) => r * cols + c;

  const solved = new Set();
  let dragging = false;
  let start = null;
  let currentCells = [];
  let hintRaf = null;
  let idleTimer = null;

  // 进度圆点：找对一个点亮一个
  const dots = (() => {
    const host = $("wsProgress");
    if (!host) return [];
    host.innerHTML = words.map(() => `<span class="ws-dot"></span>`).join("");
    return [...host.children];
  })();

  const toUser = (evt) => {
    const m = svg.getScreenCTM();
    if (!m) return null;
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    const p = pt.matrixTransform(m.inverse());
    const c = Math.floor(p.x / CW);
    const r = Math.floor(p.y / CH);
    if (r < 0 || c < 0 || r >= rows || c >= cols) return null;
    return { r, c };
  };

  const clearHover = () => hitEls.forEach((el) => el.classList.remove("is-hover"));

  function lineCells(a, b) {
    const dr = Math.sign(b.r - a.r);
    const dc = Math.sign(b.c - a.c);
    const len = Math.max(Math.abs(b.r - a.r), Math.abs(b.c - a.c));
    const out = [];
    for (let i = 0; i <= len; i++) out.push({ r: a.r + dr * i, c: a.c + dc * i });
    return out;
  }

  const isLine = (a, b) =>
    a.r === b.r || a.c === b.c || Math.abs(a.r - b.r) === Math.abs(a.c - b.c);

  function drawSelection(cells) {
    if (!cells.length) {
      sel.style.opacity = 0;
      return;
    }
    const a = center(cells[0].r, cells[0].c);
    const b = center(cells[cells.length - 1].r, cells[cells.length - 1].c);
    sel.setAttribute("x1", a.x);
    sel.setAttribute("y1", a.y);
    sel.setAttribute("x2", b.x);
    sel.setAttribute("y2", b.y);
    sel.style.opacity = 0.5;
  }

  const readout = (cells) => cells.map((p) => letterAt(p.r, p.c)).join("");

  function markFound(i) {
    if (solved.has(i)) return;
    solved.add(i);
    bandEls[i].classList.add("is-found");
    bandEls[i].parentElement.classList.add("is-done");
    words[i].cells.forEach(([r, c]) => letterEls[idx(r, c)].classList.add("is-found"));
    if (dots[i]) dots[i].classList.add("is-found");
    if (solved.size === words.length) {
      svg.classList.add("is-complete");
      letterEls.forEach((el, i) => {
        el.style.animationDelay = `${(i % cols) * 0.04 + Math.floor(i / cols) * 0.03}s`;
      });
      clearTimeout(idleTimer);
      cancelAnimationFrame(hintRaf);
      setTimeout(playFinale, 620);
      return;
    }
    // 只剩最后两个时，剩下的答案加快呼吸，推一把让用户做完
    if (solved.size >= words.length - 2) {
      bandEls.forEach((el, i) => {
        if (!solved.has(i)) el.parentElement.classList.add("is-urging");
      });
    }
  }

  function tryCommit(cells) {
    if (cells.length < 2) return;
    const s = readout(cells);
    const rev = [...s].reverse().join("");
    for (let i = 0; i < words.length; i++) {
      if (solved.has(i)) continue;
      if (words[i].text === s || words[i].text === rev) markFound(i);
    }
  }

  /* ---- 提示动画：模拟手指划过一个单词（无任何文字提示） ---- */
  function playHint() {
    const rest = words.map((_, i) => i).filter((i) => !solved.has(i));
    if (!rest.length) return;
    cancelAnimationFrame(hintRaf);
    const w = words[rest[Math.floor(Math.random() * rest.length)]];
    const a = center(w.cells[0][0], w.cells[0][1]);
    const z = center(w.cells[w.cells.length - 1][0], w.cells[w.cells.length - 1][1]);

    sel.setAttribute("x1", a.x);
    sel.setAttribute("y1", a.y);
    sel.setAttribute("x2", a.x);
    sel.setAttribute("y2", a.y);
    sel.style.opacity = 0.55;
    cursor.setAttribute("cx", a.x);
    cursor.setAttribute("cy", a.y);
    cursor.style.opacity = 0.9;

    const t0 = performance.now();
    const dur = 1500;
    const step = (now) => {
      let t = (now - t0) / dur;
      if (t > 1) t = 1;
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const x = a.x + (z.x - a.x) * e;
      const y = a.y + (z.y - a.y) * e;
      sel.setAttribute("x2", x);
      sel.setAttribute("y2", y);
      cursor.setAttribute("cx", x);
      cursor.setAttribute("cy", y);
      if (t < 1) hintRaf = requestAnimationFrame(step);
      else {
        sel.style.opacity = 0;
        cursor.style.opacity = 0;
      }
    };
    hintRaf = requestAnimationFrame(step);
  }

  function scheduleHint(delay) {
    clearTimeout(idleTimer);
    if (solved.size === words.length) return;
    idleTimer = setTimeout(() => {
      if (!dragging) playHint();
      scheduleHint(9000);
    }, delay);
  }

  /* ---- 指针交互 ---- */
  svg.addEventListener("pointerdown", (e) => {
    const p = toUser(e);
    if (!p) return;
    e.preventDefault();
    cancelAnimationFrame(hintRaf);
    sel.style.opacity = 0;
    cursor.style.opacity = 0;
    dragging = true;
    start = p;
    currentCells = [p];
    clearHover();
    hitEls[idx(p.r, p.c)].classList.add("is-hover");
    drawSelection([p]);
  });

  svg.addEventListener("pointermove", (e) => {
    const p = toUser(e);
    if (!dragging) {
      clearHover();
      if (p) hitEls[idx(p.r, p.c)].classList.add("is-hover");
      return;
    }
    if (!p || !isLine(start, p)) return;
    const cells = lineCells(start, p);
    if (readout(cells) === readout(currentCells)) return;
    currentCells = cells;
    clearHover();
    cells.forEach((q) => hitEls[idx(q.r, q.c)].classList.add("is-hover"));
    drawSelection(cells);
  });

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    tryCommit(currentCells);
    currentCells = [];
    clearHover();
    sel.style.opacity = 0;
    scheduleHint(7000);
  };
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);
  svg.addEventListener("pointerleave", () => {
    if (!dragging) clearHover();
  });

  setTimeout(() => {
    playHint();
    scheduleHint(9000);
  }, 1200);
}

/* ============================================================
   About Me
   ============================================================ */
function renderAbout() {
  if (!$("aboutPhoto")) return;
  const a = SITE.about;
  $("aboutPhoto").src = a.photo;
  $("aboutTitle").textContent = a.title;
  $("aboutBtn").textContent = a.button.label;
  $("aboutBtn").href = a.button.href;

  $("aboutInfo").innerHTML = a.info
    .map((i) => `<div class="about__row"><dt>${esc(i.label)}</dt><dd>${esc(i.value)}</dd></div>`)
    .join("");

  $("aboutIntro").textContent = a.intro;
  $("skillsTitle").textContent = a.skills.title;
  $("skillsRow").innerHTML = a.skills.items
    .map((s) => `<span class="skill" style="--skill-color:${esc(s.color)}">${esc(s.label)}</span>`)
    .join("");
}

// 照片随鼠标做 3D 视差 + 高光跟随（仅桌面端有指针的设备）
function initAboutStage() {
  const stage = $("aboutStage");
  const photo = $("aboutPhotoWrap");
  if (!stage || !photo) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const MAX = 9; // 最大倾斜角度
  stage.addEventListener("pointermove", (e) => {
    const r = stage.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const ry = (px - 0.5) * 2 * MAX;
    const rx = -(py - 0.5) * 2 * MAX;
    photo.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotate(-2deg) scale(1.03)`;
    photo.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
    photo.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
  });

  stage.addEventListener("pointerleave", () => {
    photo.style.transform = "";
  });
}

/* ============================================================
   Featured Projects
   ============================================================ */
function renderProjects() {
  if (!$("projectsGrid")) return;
  const p = SITE.projects;
  $("projectsTitle").textContent = p.title;
  $("projectsIntro").innerHTML = p.intro.map((t) => `<p>${esc(t)}</p>`).join("");

  $("projectsGrid").innerHTML = p.items
    .map((it, i) => {
      const media = it.cover
        ? `<img src="${esc(it.cover)}" alt="${esc(it.title)}" loading="lazy" />`
        : `<span class="card__placeholder">${esc(it.title)}</span>`;
      return `
      <article class="card reveal" style="--tint:${esc(it.tint)};transition-delay:${(i * 0.08).toFixed(2)}s">
        <div class="card__body">
          <div class="card__tags">
            ${it.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}
          </div>
          <h3 class="card__title">${esc(it.title)}</h3>
          <p class="card__desc">${esc(it.description)}</p>
          <a class="btn btn--purple" href="${esc(it.link)}">Explore More</a>
        </div>
        <div class="card__media">${media}</div>
      </article>`;
    })
    .join("");
}

/* ============================================================
   页脚
   ============================================================ */
function renderFooter() {
  if (!$("footerThanks")) return;
  const f = SITE.footer;
  $("footerThanks").textContent = f.thanks;
  $("footerEmail").textContent = f.email;
  $("footerEmail").href = "mailto:" + f.email;
  $("footerBadge").textContent = f.badge;
  $("footerCopy").textContent = f.copyright;
}

/* ============================================================
   滚动入场
   ============================================================ */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;
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
  els.forEach((el) => io.observe(el));
}

/* ============================================================
   启动
   ============================================================ */
renderNav();
initNav();
renderWordSearch();
renderAbout();
renderProjects();
renderFooter();
initReveal();
initAboutStage();
