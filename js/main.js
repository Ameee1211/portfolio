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
   桌面与手机各有一套题（见 content.js 的 wordsearch.desktop / .mobile），
   格子尺寸、字号、高亮条厚度都随题目走，手机端是重新排版的竖版迷宫。
   ============================================================ */
const WS_MQ = window.matchMedia("(max-width: 900px)");
const wsCfg = () => (WS_MQ.matches ? SITE.wordsearch.mobile : SITE.wordsearch.desktop);

// g = { cw, ch, band }：格宽、格高、高亮条厚度
const wsGrid = (cfg) => ({ cw: cfg.cell[0], ch: cfg.cell[1], band: cfg.band });

const wsCenter = (g, r, c) => ({ x: c * g.cw + g.cw / 2, y: r * g.ch + g.ch / 2 });

/* 高亮条 = 沿字母中心的一条胶囊（两端是半径 band/2 的半圆）
   两个圆心的位置正好是首、尾字母的格心，所以 TONG 与 ZHANG 共用的 G
   两端是同圆心同半径的半圆 —— 完全重合，不会一边多出一个角。
   首格圆心也在格心，T 那一端同样是完整的半圆，不会被裁掉。 */
function wsBand(g, cells) {
  const r = g.band / 2;
  const first = wsCenter(g, cells[0][0], cells[0][1]);
  const last = wsCenter(g, cells[cells.length - 1][0], cells[cells.length - 1][1]);
  const sameRow = cells.every((x) => x[0] === cells[0][0]);

  if (sameRow) {
    return {
      x: Math.min(first.x, last.x) - r,
      y: first.y - r,
      w: Math.abs(last.x - first.x) + g.band,
      h: g.band,
      rx: r,
      rot: 0,
      cx: 0,
      cy: 0,
    };
  }

  const dx = last.x - first.x;
  const dy = last.y - first.y;
  const rot = (Math.atan2(dy, dx) * 180) / Math.PI;
  const len = Math.hypot(dx, dy) + g.band;
  const mx = (first.x + last.x) / 2;
  const my = (first.y + last.y) / 2;
  return { x: mx - len / 2, y: my - g.band / 2, w: len, h: g.band, rx: r, rot, cx: mx, cy: my };
}

/* ---- 完成状态本地记忆 ----
   玩过之后写一个标记，之后不管去 About 还是别的页面再回来，
   首屏都直接是「全部连好」的样子，不会再放一次 WELCOME、也不会自动跳页。 */
const WS_DONE_KEY = "portfolio:wordsearch-done";

const wsPlayerDone = () => {
  try {
    return localStorage.getItem(WS_DONE_KEY) === "1";
  } catch (e) {
    return false;
  }
};

const wsRememberDone = () => {
  try {
    localStorage.setItem(WS_DONE_KEY, "1");
  } catch (e) {}
};

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
  const cfg = wsCfg();
  const g = wsGrid(cfg);
  const { letters, words } = cfg;
  const rows = letters.length;
  const cols = letters[0].length;
  host.style.setProperty("--ws-font", `${cfg.font}px`);
  host.style.setProperty("--ws-band", String(g.band));
  host.dataset.puzzle = cfg === SITE.wordsearch.mobile ? "mobile" : "desktop";

  // 答案直接可见：每个单词一开始就画出虚线轮廓，未找到时轮流呼吸
  const foundBands = words
    .map((w, i) => {
      const b = wsBand(g, w.cells);
      const rect = `<rect class="ws__hl" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${b.rx}" />`;
      const rot = b.rot ? ` transform="rotate(${b.rot.toFixed(2)} ${b.cx} ${b.cy})"` : "";
      return `<g class="ws__band" style="animation-delay:${(i * 0.55).toFixed(2)}s"${rot}>${rect}</g>`;
    })
    .join("");

  const hits = letters
    .map((row, r) =>
      row
        .split("")
        .map(
          (_, c) =>
            `<rect class="ws__hit" x="${c * g.cw + 6}" y="${r * g.ch + 6}" width="${g.cw - 12}" height="${g.ch - 12}" rx="14" />`
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
            `<text class="ws__letter" x="${c * g.cw + g.cw / 2}" y="${r * g.ch + g.ch / 2}">${esc(ch)}</text>`
        )
        .join("")
    )
    .join("");

  host.innerHTML = `
    <svg class="ws" viewBox="0 0 ${cols * g.cw} ${rows * g.ch}" role="img"
         aria-label="A word search puzzle: drag across the letters to find them">
      <g class="ws__found">${foundBands}</g>
      <line class="ws__sel" x1="0" y1="0" x2="0" y2="0" />
      <g class="ws__hits">${hits}</g>
      <g class="ws__letters">${glyphs}</g>
      <circle class="ws__cursor" cx="0" cy="0" r="13" />
    </svg>`;

  // 玩过就直接呈现完成态，不再让人玩第二遍
  if (wsPlayerDone()) {
    wsPaintSolved(host, cfg);
    return;
  }

  initWordSearchGame(host, letters, words, rows, cols, g);
}

/* 把所有单词一次性画成「已连好」：实心橙条 + 深蓝字母 */
function wsPaintSolved(host, cfg) {
  const cols = cfg.letters[0].length;
  const bandEls = [...host.querySelectorAll(".ws__hl")];
  const letterEls = [...host.querySelectorAll(".ws__letter")];

  cfg.words.forEach((w, i) => {
    if (bandEls[i]) {
      bandEls[i].classList.add("is-found");
      bandEls[i].parentElement.classList.add("is-done");
    }
    w.cells.forEach(([r, c]) => {
      const el = letterEls[r * cols + c];
      if (el) el.classList.add("is-found");
    });
  });

  const hero = host.closest(".hero");
  if (hero) hero.classList.add("is-ws-done");
  const svg = host.querySelector(".ws");
  if (svg) svg.setAttribute("aria-label", "Word search puzzle, all words found");
}

function initWordSearchGame(host, letters, words, rows, cols, g) {
  const svg = host.querySelector(".ws");
  const sel = svg.querySelector(".ws__sel");
  const cursor = svg.querySelector(".ws__cursor");
  const hitEls = [...svg.querySelectorAll(".ws__hit")];
  const letterEls = [...svg.querySelectorAll(".ws__letter")];
  const bandEls = [...svg.querySelectorAll(".ws__hl")];

  const letterAt = (r, c) => letters[r][c];
  const idx = (r, c) => r * cols + c;

  let dragging = false;
  let start = null;
  let currentCells = [];
  let hintRaf = null;
  let idleTimer = null;

  const toUser = (evt) => {
    const m = svg.getScreenCTM();
    if (!m) return null;
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    const p = pt.matrixTransform(m.inverse());
    const c = Math.floor(p.x / g.cw);
    const r = Math.floor(p.y / g.ch);
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
    const a = wsCenter(g, cells[0].r, cells[0].c);
    const b = wsCenter(g, cells[cells.length - 1].r, cells[cells.length - 1].c);
    sel.setAttribute("x1", a.x);
    sel.setAttribute("y1", a.y);
    sel.setAttribute("x2", b.x);
    sel.setAttribute("y2", b.y);
    sel.style.opacity = 0.5;
  }

  const readout = (cells) => cells.map((p) => letterAt(p.r, p.c)).join("");

  let completed = false;

  function paintFound(i) {
    bandEls[i].classList.add("is-found");
    bandEls[i].parentElement.classList.add("is-done");
    words[i].cells.forEach(([r, c]) => letterEls[idx(r, c)].classList.add("is-found"));
  }

  /* 连对任意一个单词 = 全部完成。
     剩下的四个词立刻一起点亮（不再需要一个个连），然后放 WELCOME、
     滑到下一屏 —— 首屏停留时间越短越好。 */
  function completeAll() {
    if (completed) return;
    completed = true;
    clearTimeout(idleTimer);
    cancelAnimationFrame(hintRaf);
    sel.style.opacity = 0;
    cursor.style.opacity = 0;

    words.forEach((_, i) => paintFound(i));
    svg.classList.add("is-complete");
    letterEls.forEach((el, i) => {
      el.style.animationDelay = `${((i % cols) * 0.03 + Math.floor(i / cols) * 0.02).toFixed(2)}s`;
    });

    wsRememberDone();
    setTimeout(playFinale, 420);
  }

  function tryCommit(cells) {
    if (cells.length < 2 || completed) return;
    const s = readout(cells);
    const rev = [...s].reverse().join("");
    if (words.some((w) => w.text === s || w.text === rev)) completeAll();
  }

  /* ---- 提示动画：模拟手指划过一个单词（无任何文字提示） ---- */
  function playHint() {
    if (completed) return;
    cancelAnimationFrame(hintRaf);
    const w = words[Math.floor(Math.random() * words.length)];
    const a = wsCenter(g, w.cells[0][0], w.cells[0][1]);
    const z = wsCenter(g, w.cells[w.cells.length - 1][0], w.cells[w.cells.length - 1][1]);

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
    if (completed) return;
    idleTimer = setTimeout(() => {
      if (!dragging) playHint();
      scheduleHint(9000);
    }, delay);
  }

  /* ---- 指针交互 ---- */
  svg.addEventListener("pointerdown", (e) => {
    if (completed) return;
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
    if (completed) return;
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
  const stage = $("deckStage");
  if (!stage) return;
  const p = SITE.projects;
  $("projectsTitle").textContent = p.title;
  $("projectsIntro").innerHTML = p.intro.map((t) => `<p>${esc(t)}</p>`).join("");

  const INK_A = "M2.8 3.4 C21 1.1 61 2.7 96.9 2.9 C98.7 43 96.7 94.5 96.1 129.7 C67 131.8 30 130.1 3.3 129.3 C1.3 91.5 2.1 38.5 2.9 3.4 Z";
  const INK_B = "M5.7 5.6 C26 3.3 56 4.9 94.5 5.3 C96.3 44.2 94.7 89.6 94.3 127.9 C67 129.5 30 128.7 5.9 128.1 C3.9 89.6 4.5 40.6 5.7 5.6 Z";
  const INK_C = "M2.1 6.3 C23 3 58 4.1 97.6 4.7 C98.3 44.4 97.7 89.4 96.7 131.2 C68 132.4 28 131.2 2.7 130.6 C1.1 89 1.5 41.5 2.1 6.3 Z";

  stage.innerHTML = p.items
    .map((it, i) => {
      const no = String(i + 1).padStart(2, "0");
      const media = it.cover
        ? `<img src="${esc(it.cover)}" alt="${esc(it.title)}" width="720" height="600" loading="eager" decoding="async" />`
        : `<div class="pcard__empty"><span>Image coming</span></div>`;
      return `
      <div class="pcard" data-i="${i}" style="--tint:${esc(it.tint)}" tabindex="-1" role="button" aria-label="${esc(it.title)}">
        <div class="pcard__face">
          <div class="pcard__img">${media}</div>
          <div class="pcard__body">
            <span class="pcard__no">${no} / 04</span>
            <h3 class="pcard__t">${esc(it.title)}</h3>
            <p class="pcard__d">${esc(it.description)}</p>
          </div>
          <span class="pcard__corner" aria-hidden="true">${no}</span>
          <span class="pcard__shine" aria-hidden="true"></span>
        </div>
        <svg class="pcard__ink" viewBox="0 0 100 133" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <filter id="inkRough${i}" x="-12%" y="-12%" width="124%" height="124%">
              <feTurbulence type="fractalNoise" baseFrequency="0.016" numOctaves="3" seed="${i * 7 + 3}" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="4.2" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
          <g filter="url(#inkRough${i})">
            <path d="${INK_A}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-opacity="0.9" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
            <path d="${INK_B}" fill="none" stroke="currentColor" stroke-width="1.2" stroke-opacity="0.55" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
            <path d="${INK_C}" fill="none" stroke="currentColor" stroke-width="0.8" stroke-opacity="0.4" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
          </g>
        </svg>
      </div>`;
    })
    .join("");

  initDeck();
}

/* 扑克牌堆：中间那张可进项目页，点两侧的牌把它换到中间；不支持滚轮切换 */
function initDeck() {
  const stage = $("deckStage");
  const tags = $("deckTags");
  if (!stage) return;

  const cards = Array.from(stage.querySelectorAll(".pcard"));
  const data = SITE.projects.items;
  const n = cards.length;
  if (!n) return;

  let cur = 0;

  const select = (i) => {
    cur = ((i % n) + n) % n;
    cards.forEach((el, k) => {
      // 环形排列：最前面那张的左侧是最后一张，三张永远对称
      let off = k - cur;
      if (off > n / 2) off -= n;
      if (off < -n / 2) off += n;
      const a = Math.abs(off);
      const spread = window.innerWidth < 900 ? 0.52 : 1;
      const x = off * 148 * spread;      // 左右等距，以中间那张为轴镜像
      const y = a * 66 * spread;         // 两侧同时下沉，中间是最高点
      const z = (off === 0 ? 62 : -260) * spread; // 两侧同深度 → 一样大
      const ry = off * -17;
      el.style.transform = `translate(-50%, -50%) translateX(${x}%) translateY(${y}px) translateZ(${z}px) rotateX(3deg) rotateY(${ry}deg)`;
      el.style.opacity = a > 1 ? "0" : String(1 - a * 0.16);
      el.style.zIndex = String(10 - a);
      el.style.filter = "none";
      el.style.pointerEvents = a > 1 ? "none" : "auto";
      el.classList.toggle("is-current", a === 0);
      el.tabIndex = a === 0 ? 0 : -1;
      el.setAttribute("aria-label", a === 0 ? `Open ${data[k].title}` : `Bring ${data[k].title} to the front`);
    });

    if (tags) {
      tags.innerHTML = data[cur].tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("");
    }
  };

  const go = (i) => {
    if (i === cur) {
      window.location.href = data[i].link;
      return;
    }
    select(i);
  };

  /* 手机上没有侧卡可点，用横向滑动换牌 */
  let tx = 0;
  stage.addEventListener(
    "touchstart",
    (e) => {
      tx = e.touches[0].clientX;
    },
    { passive: true }
  );
  stage.addEventListener(
    "touchend",
    (e) => {
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 40) select(cur + (dx < 0 ? 1 : -1));
    },
    { passive: true }
  );

  /* 悬停：卡片跟着指针做 3D 倾斜 + 光斑跟随，参数与 About 页照片一致 */
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    cards.forEach((el) => {
      const face = el.querySelector(".pcard__face");
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const MAX = 10;
        const ry = (px - 0.5) * 2 * MAX;
        const rx = -(py - 0.5) * 2 * MAX;
        face.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(1.02)`;
        el.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
        el.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
      });
      el.addEventListener("pointerleave", () => {
        face.style.transform = "";
      });
    });
  }

  cards.forEach((el, i) => {
    el.addEventListener("click", () => go(i));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go(i);
      }
    });
  });

  select(0);
}

/* ============================================================
   页脚
   ============================================================ */
const ICON_MAIL = `<svg class="footer__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="4.8" width="19" height="14.4" rx="3"/><path d="M3.4 6.6l7.5 5.5a2 2 0 0 0 2.2 0l7.5-5.5"/></svg>`;
const ICON_PHONE = `<svg class="footer__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.2 3.5h2.9c.6 0 1.1.4 1.2 1l.6 3a1.3 1.3 0 0 1-.4 1.2l-1.6 1.5a12.6 12.6 0 0 0 5.9 5.9l1.5-1.6c.3-.3.8-.4 1.2-.3l3 .6c.6.1 1 .6 1 1.2v2.9a2 2 0 0 1-2.2 2A17.6 17.6 0 0 1 4.2 5.7a2 2 0 0 1 2-2.2z"/></svg>`;

function renderFooter() {
  if (!$("footerThanks")) return;
  const f = SITE.footer;
  $("footerThanks").textContent = f.thanks;
  if ($("footerNote")) $("footerNote").textContent = f.note;

  $("footerEmail").innerHTML = `${ICON_MAIL}<span>${esc(f.email)}</span>`;
  $("footerEmail").href = "mailto:" + f.email;

  if ($("footerPhone")) {
    $("footerPhone").innerHTML = `${ICON_PHONE}<span>${esc(f.phone)}</span>`;
    $("footerPhone").href = "tel:" + f.phone.replace(/\s+/g, "");
  }
  $("footerCopy").textContent = f.copyright;
}

/* ============================================================
   首页分页滚动（pin）
   与 about.me 页面同一套规则：
   · 一次滑动只前进一步，先跟手滚到板块底部，绝不越过
   · 板块底部整块露出来（含底部留白）之后，还需要新的一次滑动才翻页
   · 比视口矮的板块整块看得见，同样要新的一次滑动
   首页没有左侧导航栏，所以只有翻页，没有 rail。
   ============================================================ */
function initPinPager() {
  const pinned = ["about", "projects"].map((id) => $(id)).filter(Boolean);
  if (pinned.length < 2) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (!window.matchMedia("(min-width: 1024px)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const nav = document.querySelector(".nav");
  const hero = document.querySelector(".hero");

  const THRESHOLD = 8;
  const LOCK_MS = 760;
  const GESTURE_GAP = 90;
  const SETTLE_MS = 240;
  const EDGE = 2;

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

  const indexAt = () => {
    const probe = window.scrollY + navH() + 4;
    let idx = -1;
    pinned.forEach((sec, i) => {
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

  const jump = (top) => {
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, clampY(top));
    root.style.scrollBehavior = prev;
  };

  const endOf = (el) => Math.min(topOf(el) + el.offsetHeight - window.innerHeight, maxScroll());

  const step = (dir, delta, now, sinceLast) => {
    const y = window.scrollY;
    const idx = indexAt();
    const cur = idx >= 0 ? pinned[idx] : null;

    if (dir > 0) {
      if (cur) {
        const endY = endOf(cur);
        if (y < endY - EDGE) {
          const target = Math.min(y + delta, endY);
          jump(target);
          if (target >= endY - 1) settleUntil = now + SETTLE_MS;
          return true;
        }
        if (now < settleUntil || sinceLast < GESTURE_GAP) return true;
      }
      const next = pinned[idx + 1];
      if (!next) return false; // 最后一屏：交回浏览器，页脚自然滑上来
      const target = topOf(next);
      if (Math.abs(target - y) < 4) return false;
      go(target, 1);
      return true;
    }

    if (cur) {
      const curTop = topOf(cur);
      if (y > curTop + EDGE) {
        const target = Math.max(y - delta, curTop);
        jump(target);
        if (target <= curTop + 1) settleUntil = now + SETTLE_MS;
        return true;
      }
      if (now < settleUntil || sinceLast < GESTURE_GAP) return true;
    }
    const prev = idx > 0 ? pinned[idx - 1] : hero;
    if (!prev) return false;
    const prevTop = topOf(prev);
    const prevEnd = endOf(prev);
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
    if (e.ctrlKey) return;
    if (e.target instanceof Element && inScroller(e.target)) return;

    const d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    if (!d) return;

    const now = performance.now();
    const sinceLast = lastWheelAt ? now - lastWheelAt : 1e9;
    lastWheelAt = now;

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
      lockUntil = 0;
    }

    acc += d;
    clearTimeout(accTimer);
    accTimer = setTimeout(() => (acc = 0), 200);

    if (Math.abs(acc) < THRESHOLD) {
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
   滚动引导：往下滚一点就淡出（Home / About / 项目页首屏共用）
   ============================================================ */
function initScrollCue() {
  const cues = document.querySelectorAll(".scrollcue");
  if (!cues.length) return;
  let raf = null;
  const sync = () => {
    raf = null;
    const gone = window.scrollY > 60;
    cues.forEach((c) => c.classList.toggle("is-gone", gone));
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!raf) raf = requestAnimationFrame(sync);
    },
    { passive: true }
  );
  sync();
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
initScrollCue();
initPinPager();

// 桌面 / 手机切换时换一套迷宫（两套题布局与字数都不同）
WS_MQ.addEventListener("change", () => renderWordSearch());
