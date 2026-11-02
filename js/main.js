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

  // 上下各成一组：在 ZHANG 与 UI 之间裂开（6 行时是 4 上 2 下），
  // 这样 TONG / ZHANG 的五条高亮都在上半，UI / UX / DESIGN 都在下半，不会跨缝
  const half = Math.max(2, Math.min(rows - 1, Math.round(rows * 0.667)));
  const midY = (rows * g.ch) * (half / rows);

  const bandParts = { top: [], bottom: [] };
  words.forEach((w, i) => {
    const b = wsBand(g, w.cells);
    const rect = `<rect class="ws__hl" data-w="${i}" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${b.rx}" />`;
    const rot = b.rot ? ` transform="rotate(${b.rot.toFixed(2)} ${b.cx} ${b.cy})"` : "";
    const html = `<g class="ws__band" style="animation-delay:${(i * 0.55).toFixed(2)}s"${rot}>${rect}</g>`;
    ((b.y + b.h / 2) < midY ? bandParts.top : bandParts.bottom).push(html);
  });

  const hitParts = { top: [], bottom: [] };
  letters.forEach((row, r) => {
    const html = row
      .split("")
      .map(
        (_, c) =>
          `<rect class="ws__hit" x="${c * g.cw + 6}" y="${r * g.ch + 6}" width="${g.cw - 12}" height="${g.ch - 12}" rx="14" />`
      )
      .join("");
    (r < half ? hitParts.top : hitParts.bottom).push(html);
  });

  const glyphParts = { top: [], bottom: [] };
  letters.forEach((row, r) => {
    const html = row
      .split("")
      .map(
        (ch, c) =>
          `<text class="ws__letter" x="${c * g.cw + g.cw / 2}" y="${r * g.ch + g.ch / 2}">${esc(ch)}</text>`
      )
      .join("");
    (r < half ? glyphParts.top : glyphParts.bottom).push(html);
  });

  // 填充行：平时透明，裂开时淡入，让字母一直铺到屏幕上下边缘
  const pool = letters.join("").replace(/\s/g, "");
  const fillRow = (r) =>
    Array.from({ length: cols }, (_, c) => {
      const ch = pool[Math.abs(r * 37 + c * 17 + 11) % pool.length];
      return `<text class="ws__fill" x="${c * g.cw + g.cw / 2}" y="${r * g.ch + g.ch / 2}">${esc(ch)}</text>`;
    }).join("");

  const topFill = Array.from({ length: 4 }, (_, i) => fillRow(i - 4)).join("");
  const botFill = Array.from({ length: 10 }, (_, i) => fillRow(rows + i)).join("");
  glyphParts.top.unshift(topFill);
  glyphParts.bottom.push(botFill);

  host.innerHTML = `
    <svg class="ws" viewBox="0 0 ${cols * g.cw} ${rows * g.ch}" role="img"
         aria-label="A word search puzzle: drag across the letters to find them">
      <g class="ws__found" data-half="top">${bandParts.top.join("")}</g>
      <g class="ws__found" data-half="bottom">${bandParts.bottom.join("")}</g>
      <line class="ws__sel" x1="0" y1="0" x2="0" y2="0" />
      <g class="ws__hits" data-half="top">${hitParts.top.join("")}</g>
      <g class="ws__hits" data-half="bottom">${hitParts.bottom.join("")}</g>
      <g class="ws__letters" data-half="top">${glyphParts.top.join("")}</g>
      <g class="ws__letters" data-half="bottom">${glyphParts.bottom.join("")}</g>
      <circle class="ws__cursor" cx="0" cy="0" r="13" />
    </svg>`;

  if (window.__grabHomeScenes) window.__grabHomeScenes();

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
    const el = host.querySelector(`.ws__hl[data-w="${i}"]`);
    if (el) {
      el.classList.add("is-found");
      el.parentElement.classList.add("is-done");
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
    const band = svg.querySelector(`.ws__hl[data-w="${i}"]`);
    if (band) {
      band.classList.add("is-found");
      band.parentElement.classList.add("is-done");
    }
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
  // 翻牌用的那张图提前一起发起请求：不然它要等到转场才加载，
  // 慢网下就会看到一张白卡（实测原图 365KB 单独下载要近 4 秒）
  const cardImgEl = $("aboutCardImg");
  if (cardImgEl) cardImgEl.src = a.photo;
  $("aboutTitle").textContent = a.title;
  $("aboutBtn").textContent = a.button.label;
  $("aboutBtn").href = a.button.href;

  $("aboutInfo").innerHTML = a.info
    .map((i) => `<div class="about__row"><dt>${esc(i.label)}</dt><dd>${esc(i.value)}</dd></div>`)
    .join("");

  $("aboutIntro").textContent = a.intro;
  $("skillsTitle").textContent = a.skills.title;
  $("skillsRow").innerHTML = a.skills.items
    .map(
      (s) =>
        `<span class="skill" title="${esc(s.label)}" aria-label="${esc(s.label)}">` +
        (TOOL_ICONS[s.label] || esc(s.label)) +
        `</span>`
    )
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
    if (document.body.dataset.hsLock === "1") return;   // 转场接管期间不跟随鼠标
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
    if (document.body.dataset.hsLock === "1") return;
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
  const tiltRect = new Map();   // 每张卡悬停开始时缓存的矩形

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
      const base = `translate(-50%, -50%) translateX(${x}%) translateY(${y}px) translateZ(${z}px) rotateX(3deg) rotateY(${ry}deg)`;
      el.dataset.base = base;
      if (!el.dataset.tilting) el.style.transform = base;
      el.style.opacity = a > 1 ? "0" : String(1 - a * 0.16);
      el.style.zIndex = String(10 - a);
      el.style.filter = "none";
      el.style.pointerEvents = a > 1 ? "none" : "auto";
      el.classList.toggle("is-current", a === 0);
      el.tabIndex = a === 0 ? 0 : -1;
      el.setAttribute("aria-label", a === 0 ? `Open ${data[k].title}` : `Bring ${data[k].title} to the front`);
    });

    tiltRect.clear();   // 卡片换位了，缓存的矩形作废
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

  window.addEventListener("pdeck-reset", () => tiltRect.clear());

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
      // 倾斜加在外层 .pcard 上：它才是被 .pdeck 透视的元素，方向不会失真
      el.addEventListener("pointerenter", () => {
        tiltRect.set(el, el.getBoundingClientRect());
      });
      el.addEventListener("pointermove", (e) => {
        let rect = tiltRect.get(el);
        if (!rect) {
          rect = el.getBoundingClientRect();
          tiltRect.set(el, rect);
        }
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const MAX = 12;
        // 指针所在的角往屏幕里压：右侧 → rotateY 正，下方 → rotateX 负
        const ry = (px - 0.5) * 2 * MAX;
        const rx = -(py - 0.5) * 2 * MAX;
        el.dataset.tilting = "1";
        el.style.transform = `${el.dataset.base || ""} rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
        el.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
        el.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
      });
      el.addEventListener("pointerleave", () => {
        el.dataset.tilting = "";
        el.style.transform = el.dataset.base || "";
        tiltRect.delete(el);
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

  const THRESHOLD = 24;
  const LOCK_MS = 520;
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
        if (now < settleUntil) return true;
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
      if (now < settleUntil) return true;
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
initHomeScenes();

// 桌面 / 手机切换时换一套迷宫（两套题布局与字数都不同）
WS_MQ.addEventListener("change", () => renderWordSearch());

/* ============================================================
   分屏吸附（项目页通用）：一屏一段，段内可滚，段末再滚翻页
   由各项目页调用 initSectionPager({ main, sections, hero })
   ============================================================ */
window.initSectionPager = function (opts) {
  const { main, sections, hero } = opts || {};
  if (!main || !sections || sections.length < 2) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (!window.matchMedia("(min-width: 1024px)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const nav = document.querySelector(".nav");
  const THRESHOLD = 24;   // 滚轮 / 触控板累积阈值（触控板抖动不会误触发）
  const LOCK_MS = 520;    // 翻页动画锁上限，滚到目标位置会提前解锁
  const SETTLE_MS = 240;  // 段末到位后停一下，再滚才翻页
  const EDGE = 2;         // 判定「已对齐」的容差

  let lockUntil = 0;
  let lockDir = 0;
  let lockTo = -1;
  let settleUntil = 0;
  let acc = 0;
  let accTimer = 0;

  const navH = () => (nav ? nav.offsetHeight : 0);
  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
  const topOf = (el) => el.getBoundingClientRect().top + window.scrollY;
  const clampY = (v) => Math.max(0, Math.min(v, maxScroll()));

  // 当前段：以视口顶部为基准，滚到段顶才算进入这一段（不用屏幕中线，避免半屏就误判）
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

  const jump = (top) => {
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, clampY(top));
    root.style.scrollBehavior = prev;
  };

  const endOf = (el) => Math.min(topOf(el) + el.offsetHeight - window.innerHeight, maxScroll());

  const step = (dir, delta) => {
    const y = window.scrollY;
    const idx = indexAt();
    const cur = idx >= 0 ? sections[idx] : null;

    if (dir > 0) {
      if (cur) {
        const endY = endOf(cur);
        if (y < endY - EDGE) {
          const target = Math.min(y + delta, endY);
          jump(target);
          if (target >= endY - 1) settleUntil = performance.now() + SETTLE_MS;
          return true;
        }
        if (performance.now() < settleUntil) return true;
      }
      const next = sections[idx + 1];
      if (!next) return false;   // 最后一段：交回浏览器，页脚自然滑上来
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
        if (target <= curTop + 1) settleUntil = performance.now() + SETTLE_MS;
        return true;
      }
      if (performance.now() < settleUntil) return true;
    }
    const prev = idx > 0 ? sections[idx - 1] : hero;
    if (!prev) return false;
    const prevTop = topOf(prev);
    const prevEnd = endOf(prev);
    const target = prevEnd > prevTop + EDGE ? prevEnd : prevTop;
    if (Math.abs(target - y) < 4) return false;
    go(target, -1);
    return true;
  };

  // 段内有独立滚动容器时（如可滚的代码框）不接管
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

    if (now < lockUntil) {
      // 反向操作立刻解锁，不打断用户
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
    if (step(dir, delta)) e.preventDefault();
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
    if (step(dir, window.innerHeight * 0.85)) e.preventDefault();
  };

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", onKey);
};

/* ============================================================
   首页 · 四屏转场
   Hero(字母迷宫) → About → Projects → Thanks
   四屏固定叠在同一视口，滚动位置只当时间轴用；全部可逆
   ============================================================ */
function initHomeScenes() {
  const stage = document.querySelector(".hs-stage");
  const hero = document.querySelector(".hero");
  if (!stage || !hero) return;

  const about = document.querySelector(".about");
  const projects = document.querySelector(".projects");
  const footer = document.querySelector(".footer");

  // 时间轴（单位：1 = 一个视口高度）。A→B 是转场区间，其余是停留区
  const TL = {
    splitA: 0.12, splitB: 1.1,
    info: 1.55, intro: 1.95, skills: 2.35, btn: 2.75,
    // 按钮出现后只留 0.35 屏缓冲：滚动一到这条线画面就开始变，用户的手是"参与"进来的
    morphA: 3.1, morphB: 3.65,   // 文字退场，照片移到中间（区间短，滚一格就看得出在动）
    flipA: 3.7, flipB: 4.4,      // 翻牌：照片 → SunLink 卡片
    revealA: 4.8, revealB: 5.35, // Projects 的标题、侧卡、标签出现
    shrinkA: 5.95, shrinkB: 6.55,
    end: 6.85,
  };
  stage.style.height = (TL.end + 1) * 100 + "vh";
  document.body.classList.add("hs-on");

  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  // 加减速：起步慢、中段快、收尾缓，避免"匀速直线"那种被拽一下的感觉
  const easeIO = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

  // 回弹缓动：末尾会冲过头再退回来，形成"弹出来"的手感
  const backOut = (x) => {
    const c1 = 1.15;
    const c3 = c1 + 1;
    const u = x - 1;
    return 1 + c3 * u * u * u + c1 * u * u;
  };

  // About 内部四块：滚动只决定「进没进场」，动画本身交给 CSS 过渡，
  // 所以滑一下是完整播一次，而不是滚多少走多少
  const STEPS = () => [
    { el: els.info, at: TL.info },
    { el: els.intro, at: TL.intro },
    { el: els.skills, at: TL.skills },
    { el: els.btn, at: TL.btn },
  ];

  let els = null;
  const grab = () => {
    els = {
      svg: hero.querySelector(".ws"),
      top: [...hero.querySelectorAll('[data-half="top"]')],
      bot: [...hero.querySelectorAll('[data-half="bottom"]')],
      veilT: hero.querySelector(".hero__veil--top"),
      veilB: hero.querySelector(".hero__veil--bottom"),
      found: [...hero.querySelectorAll(".ws__found")],
      cue: hero.querySelector(".hero__cue"),
      aboutInner: document.querySelector(".about__inner"),
      photo: document.querySelector(".about__photo"),
      pnote: document.querySelector(".projects__note"),
      pdeck: document.querySelector(".pdeck"),
      ptags: document.querySelector(".pdeck__tags"),
      card: document.getElementById("aboutCard"),
      cardInner: document.getElementById("aboutCardInner"),
      cardImg: document.getElementById("aboutCardImg"),
      cardBack: document.getElementById("aboutCardBack"),
      info: document.querySelector(".about__info"),
      intro: document.querySelector(".about__intro"),
      skills: document.querySelector(".skills"),
      btn: document.querySelector(".about__btn"),
      splitRatio: (() => {
        const gs = hero.querySelector('.ws__letters[data-half="top"]');
        const rows = SITE.wordsearch.desktop.letters.length;
        const half = Math.max(2, Math.min(rows - 1, Math.round(rows * 0.667)));
        return gs ? half / rows : 0.667;
      })(),
    };
  };
  grab();

  // 正面沿用 About 的照片；背面克隆 pdeck 当前那张卡，保证翻过来和真卡一模一样
  let backFor = null;
  const syncCard = () => {
    const src = document.querySelector("#aboutPhoto");
    if (els.cardImg && src && src.src && els.cardImg.src !== src.src) {
      els.cardImg.src = src.src;
      els.cardImg.alt = src.alt || "";
    }
    const cur = document.querySelector(".pcard.is-current");
    const key = cur ? cur.dataset.i : null;
    if (cur && key !== backFor) {
      const face = cur.querySelector(".pcard__face");
      if (face) {
        els.cardBack.innerHTML = "";
        els.cardBack.appendChild(face.cloneNode(true));
        backFor = key;
      }
    }
  };

  // 起止几何：起点是 About 里的照片卡，终点是 pdeck 当前那张卡
  const W = 380;
  const H = 506.7;

  const measureStart = () => {
    const ph = els.photo;
    if (!ph || !els.cardGeom) return;
    const r = ph.getBoundingClientRect();
    // 照片带 -2° 旋转，rect 是被撑大的包围盒；尺寸要用 offsetWidth/Height
    const w = ph.offsetWidth || r.width;
    const h = ph.offsetHeight || r.height;
    if (w <= 0) return;
    const vw = window.innerWidth || 1;
    const vh = window.innerHeight || 1;
    els.cardGeom.dx = r.left + r.width / 2 - vw / 2;
    els.cardGeom.dy = r.top + r.height / 2 - vh / 2;
    els.cardGeom.sx = w / W;
    els.cardGeom.sy = h / H;
  };

  const measureEnd = () => {
    const cur = document.querySelector(".pcard.is-current");
    if (!cur || !els.cardGeom) return;
    const c = cur.getBoundingClientRect();
    if (c.width <= 0) return;
    const vw = window.innerWidth || 1;
    const vh = window.innerHeight || 1;
    els.cardGeom.dxEnd = c.left + c.width / 2 - vw / 2;
    els.cardGeom.dyEnd = c.top + c.height / 2 - vh / 2;
    els.cardGeom.sxEnd = c.width / W;
    els.cardGeom.syEnd = c.height / H;
  };

  const measure = () => {
    if (!els.cardGeom) {
      els.cardGeom = { dx: 0, dy: 0, sx: 1, sy: 1, dxEnd: 0, dyEnd: 0, sxEnd: 1, syEnd: 1 };
    }
    measureStart();
    measureEnd();
  };

  // 把被鼠标吸歪的卡片按回原位（无过渡），再量终点，保证量的是最终位置
  const settleDeck = () => {
    const cur = document.querySelector(".pcard.is-current");
    if (!cur) return;
    cur.dataset.tilting = "";
    cur.style.transition = "none";
    cur.style.transform = cur.dataset.base || "";
    void cur.offsetWidth;
    cur.style.transition = "";
    tiltClear();
  };
  // 让 initDeck 缓存的悬停矩形作废
  const tiltClear = () => {
    window.dispatchEvent(new CustomEvent("pdeck-reset"));
  };

  syncCard();
  measure();
  window.__grabHomeScenes = () => {
    grab();
    syncCard();
    measure();
  };

  let raf = 0;
  let backSynced = false;
  // 导航里的 #home / #about / #projects 在叠屏布局下没有位置可跳，改成滚到对应时间点
  const ANCHORS = { home: 0, about: 1.2, projects: 3.95, contact: 5.7 };
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    const id = (a.getAttribute("href") || "").slice(1);
    if (!(id in ANCHORS)) return;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: window.innerHeight * ANCHORS[id], behavior: "smooth" });
    });
  });

  const apply = () => {
    raf = 0;
    const vh = window.innerHeight || 1;
    const t = window.scrollY / vh;

    // —— Hero → About：字母上下裂开，半屏底色跟着退场 ——
    const p1 = clamp01((t - TL.splitA) / (TL.splitB - TL.splitA));
    // 裂缝对齐迷宫真正的 4/6 分界（ZHANG 与 UI 之间），不是屏幕的 2/3
    const svg = els.svg;
    let seamY = vh * 0.62;
    let k = 1;
    if (svg && svg.viewBox && svg.viewBox.baseVal.width) {
      const r = svg.getBoundingClientRect();
      k = r.width / svg.viewBox.baseVal.width || 1;
      seamY = r.top + r.height * (els.splitRatio || 0.667);
    }
    const offTop = seamY * p1;
    const offBottom = (vh - seamY) * p1;

    if (svg) {
      els.top.forEach((g) => g.setAttribute("transform", `translate(0 ${-offTop / k})`));
      els.bot.forEach((g) => g.setAttribute("transform", `translate(0 ${offBottom / k})`));
    }
    // 两片底色的高度就贴着裂缝，位移量各自等于自身高度，p=1 时正好整片让开
    if (els.veilT) {
      els.veilT.style.height = seamY.toFixed(1) + "px";
      els.veilT.style.transform = `translateY(${(-offTop).toFixed(1)}px)`;
    }
    if (els.veilB) {
      els.veilB.style.height = (vh - seamY).toFixed(1) + "px";
      els.veilB.style.transform = `translateY(${offBottom.toFixed(1)}px)`;
    }
    // 答案虚线跨在上下两半之间，裂开时没法跟着走，干脆先淡出
    hero.style.setProperty("--hp", p1.toFixed(4));
    const hideBands = p1 > 0.18;
    hero.querySelectorAll(".ws__found").forEach((g) => {
      g.style.opacity = String(Math.max(0, 1 - p1 * 5));
      g.style.visibility = hideBands ? "hidden" : "";
    });

    // About 就是压在下面的一层画布：不位移，只是随着裂缝张开逐渐清晰
    if (els.aboutInner) {
      els.aboutInner.style.opacity = String(0.2 + 0.8 * p1);
      els.aboutInner.style.transform = "none";
    }

    // —— About 内部：滑过一条线就放进一块，动画自己慢慢播完 ——
    STEPS().forEach(({ el, at }) => {
      if (!el) return;
      if (t >= at - 0.02) el.classList.add("is-in");
      else if (t < at - 0.12) el.classList.remove("is-in");
    });

    // —— About → 翻牌：文字退场，照片离开原位成为一张牌 ——
    const pM = clamp01((t - TL.morphA) / (TL.morphB - TL.morphA));
    // 翻牌卡与原照片位置重合，所以在这里把原图让出来，看不出替换
    if (els.photo) els.photo.style.opacity = pM > 0 ? "0" : "";
    // 文字先退场，底色慢一拍再走：卡片移动时画面还是暖的，不是一片白
    if (about) {
      about.style.setProperty("--about-bg", Math.max(0, 1 - pM * 1.15).toFixed(3));
      about.style.opacity = "1";
    }
    // 只在进入这一阶段后接管，否则会盖掉裂开时的 0.2→1 渐显
    if (els.aboutInner && pM > 0) {
      els.aboutInner.style.opacity = String(Math.max(0, 1 - pM * 2.1));
    }

    // 进入翻牌：把照片的鼠标视差按回原位并锁住，同时重新量起止
    // （照片被鼠标吸歪时 rect 会变，用旧值接管就会看到"卡片先跳一下"）
    if (pM > 0 && !backSynced) {
      backSynced = true;
      document.body.dataset.hsLock = "1";
      if (els.photo) {
        els.photo.style.transition = "none";
        els.photo.style.transform = "rotate(-2deg)";
      }
      syncCard();
      settleDeck();     // 把被鼠标吸歪的卡片按回去
      measure();        // 重新量起点与终点
    } else if (pM <= 0 && backSynced) {
      backSynced = false;
      document.body.dataset.hsLock = "";
      if (els.photo) {
        els.photo.style.transition = "";
        els.photo.style.transform = "";
      }
    }

    const pMove = easeIO(clamp01(pM));   // 从照片原位就开始走，不再先停一段
    if (els.card && els.cardGeom) {
      const g = els.cardGeom;
      const dx = g.dx + (g.dxEnd - g.dx) * pMove;
      const dy = g.dy + (g.dyEnd - g.dy) * pMove;
      const sx = g.sx + (g.sxEnd - g.sx) * pMove;
      const sy = g.sy + (g.syEnd - g.sy) * pMove;
      const rot = -2 * (1 - pMove);   // 与 About 里照片的 -2° 对齐，移动过程中回正
      els.card.style.transform =
        `translate(-50%, -50%) translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) ` +
        `scale(${sx.toFixed(4)}, ${sy.toFixed(4)}) rotate(${rot.toFixed(2)}deg)`;
      els.card.style.opacity = String(pM > 0 ? 1 : 0);
    }

    // —— 翻面：照片（正面）转到 SunLink 卡片（背面）——
    const pF = clamp01((t - TL.flipA) / (TL.flipB - TL.flipA));
    if (els.card) els.card.classList.toggle("is-flipping", pF > 0 && pF < 1);
    if (els.cardInner) els.cardInner.style.transform = `rotateY(${(easeIO(pF) * 180).toFixed(2)}deg)`;

    // —— Projects 的其他元素：标题、两侧卡、标签一起浮现 ——
    const pR = clamp01((t - TL.revealA) / (TL.revealB - TL.revealA));
    // 先让真卡在完全相同的位置"垫"上来（pR 0→0.55 就铺满），
    // 然后再把翻牌卡撤走；同时交叉淡化会让中间态发灰，看着像卡片在动
    const pIn = Math.min(1, pR / 0.55);
    const pOut = Math.max(0, (pR - 0.55) / 0.45);
    if (els.pnote) els.pnote.style.opacity = String(pIn);
    if (els.pdeck) els.pdeck.style.opacity = String(pIn);
    if (els.ptags) els.ptags.style.opacity = String(pIn);
    if (els.card) els.card.style.opacity = String(pM > 0 ? 1 - pOut : 0);

    // —— Projects → Thanks（先用淡出占位）——
    const p3 = clamp01((t - TL.shrinkA) / (TL.shrinkB - TL.shrinkA));
    if (projects) projects.style.opacity = String(1 - p3);

    // 已经让开的那几屏不能再挡点击（否则 About 的按钮、卡片都点不到）
    if (hero) hero.style.pointerEvents = p1 > 0.9 ? "none" : "";
    if (about) about.style.pointerEvents = pM > 0.9 ? "none" : "";
    if (projects) projects.style.pointerEvents = pR > 0.9 ? "none" : "";
    if (els.pdeck) els.pdeck.style.pointerEvents = pR >= 0.999 ? "" : "none";

    stage.dataset.phase =
      t < TL.splitA ? "hero" : t < TL.morphA ? "about" : t < TL.revealA ? "card" : t < TL.shrinkA ? "projects" : "thanks";
  };

  // 一次滚动就跨掉整段停留区（滚得太猛）时，先把页面按回 About 末尾，
  // 让人至少看清一次；需要再滚一下才真的进 Projects
  let prevT = 0;
  let guardArmed = true;   // 防暴滚只拦一次
  let playing = false;
  let playRaf = 0;
  let restY = null;        // 停住时的位置：只有"停下来再滑"才算一次
  let restT = 0;           // 停住时在时间轴上的位置
  let restTimer = 0;
  let lastY = window.scrollY;


  // 从当前位置匀速缓入缓出地滚到 toY
  const playTo = (toY) => {
    const root = document.documentElement;
    const prevBehavior = root.style.scrollBehavior;
    // style.css 是 scroll-behavior: smooth，逐帧 scrollTo 会每帧重启平滑滚动 → 页面几乎不动
    root.style.scrollBehavior = "auto";

    const from = window.scrollY;
    const dist = Math.abs(toY - from);
    if (dist < 8) {
      root.style.scrollBehavior = prevBehavior;
      return;
    }
    const full = (TL.revealB - TL.morphA) * (window.innerHeight || 1);
    const dur = 900 + 2100 * Math.min(1, dist / (full || 1));

    playing = true;
    restY = null;
    const t0 = performance.now();
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      window.scrollTo(0, Math.round(from + (toY - from) * easeIO(k)));
      if (k < 1) {
        playRaf = requestAnimationFrame(tick);
      } else {
        playing = false;
        root.style.scrollBehavior = prevBehavior;
        lastY = window.scrollY;
        prevT = window.scrollY / (window.innerHeight || 1);
        // 播完等同于"刚停在这里"，下一次滑动可以直接接上
        restY = window.scrollY;
        restT = window.scrollY / (window.innerHeight || 1);
      }
    };
    playRaf = requestAnimationFrame(tick);
  };

  // 前进：About 完整 → Projects（停留区静止，先对齐到动画起点，看不出跳）
  const playForward = () => {
    const vh = window.innerHeight || 1;
    const startY = Math.max(window.scrollY, TL.morphA * vh);
    if (startY !== window.scrollY) {
      const root = document.documentElement;
      const b = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      window.scrollTo(0, startY);
      root.style.scrollBehavior = b;
    }
    playTo(TL.revealB * vh);
  };

  // 后退：Projects → About 完整（翻牌倒放）
  const playBack = () => {
    const vh = window.innerHeight || 1;
    // 用户可能把卡片 hover 歪了，先在牌面还看得见时按回原位，
    // 否则翻牌卡和真实卡在交叉淡化时会错位
    settleDeck();
    measureEnd();
    playTo(TL.morphA * vh);
  };

  const onScroll = () => {
    const vh = window.innerHeight || 1;
    const t = window.scrollY / vh;

    if (playing) {
      lastY = window.scrollY;
      prevT = t;
      if (!raf) raf = requestAnimationFrame(apply);
      return;
    }

    // 停手 300ms 才记录"停在哪"，这样按钮刚出现时的惯性不会直接把页面带走
    clearTimeout(restTimer);
    restTimer = setTimeout(() => {
      if (playing) return;
      const y = window.scrollY / (window.innerHeight || 1);
      const inAbout = y >= TL.btn - 0.02 && y < TL.revealB - 0.02;
      const inProjects = y >= TL.revealB - 0.02 && y < TL.shrinkA;
      if (inAbout || inProjects) {
        restY = window.scrollY;
        restT = y;
      } else {
        restY = null;
      }
    }, 300);

    if (restY !== null) {
      const dy = window.scrollY - restY;
      // About 完整后，往下滑一下 → 整段自动播完
      if (restT < TL.morphA + 0.02 && dy > 8) {
        playForward();
        lastY = window.scrollY;
        if (!raf) raf = requestAnimationFrame(apply);
        return;
      }
      // Projects 里往上滑一下 → 自动倒放回 About
      if (restT >= TL.revealB - 0.02 && dy < -8) {
        playBack();
        lastY = window.scrollY;
        if (!raf) raf = requestAnimationFrame(apply);
        return;
      }
    }

    if (guardArmed && t - lastY > 1.1 && lastY / vh < TL.morphA && t > TL.morphA) {
      guardArmed = false;
      const back = (TL.morphA - 0.03) * vh;
      lastY = TL.morphA - 0.03;
      const root = document.documentElement;
      const b = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      window.scrollTo(0, back);
      root.style.scrollBehavior = b;
      if (!raf) raf = requestAnimationFrame(apply);
      return;
    }
    if (t < TL.morphA - 0.4) guardArmed = true;
    lastY = window.scrollY;
    prevT = t;
    if (!raf) raf = requestAnimationFrame(apply);
  };

  // 自动播放期间不让滚轮 / 手指插进来打断
  const blockInput = (e) => {
    if (playing) e.preventDefault();
  };
  window.addEventListener("wheel", blockInput, { passive: false });
  window.addEventListener("touchmove", blockInput, { passive: false });
  prevT = window.scrollY / (window.innerHeight || 1);   // 刷新时可能带着滚动位置回来，别误判成"跳了一大下"
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    measure();
    onScroll();
  });
  // 图 / 字体落位后再量一次，避免起点算歪
  [280, 1200].forEach((ms) => setTimeout(() => {
    syncCard();
    measure();
    apply();
  }, ms));
  apply();
}
