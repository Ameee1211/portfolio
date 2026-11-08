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

/* 首页的整段动画由滚动位置当时间轴驱动。刷新时浏览器默认会把上次滚到的位置
   恢复回来（玩完一次往往停在 About 段），用户就看不到可以重玩的字母迷宫了。
   ★ 只在首页关掉滚动恢复：每次加载（含普通刷新 / 强制刷新）都从 t=0 开始。
     其它页面没有 #wordSearch，不设这个，行为完全不变。 */
if (document.getElementById("wordSearch") && "scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

/* ---- 区分「刷新」与「站内来回跳」（用户 2026-11-08 确认的口径）----
   浏览器每次加载页面都会给出导航类型：
     reload        = 按 F5 / Ctrl+Shift+R → 清掉「玩过」标记，回去可以重玩
     navigate      = 点站内链接去别的页面 / 从别的页面回首页 → 保留标记
     back_forward  = 浏览器后退 / 前进 → 保留标记
   ★ 这段在所有页面共用的 main.js 顶层**无条件执行**：
     用户明确说「在别的页面（About me / 项目页）按刷新也算刷新这个网站」。
   ★ 只清 sessionStorage 的会话键，不碰 localStorage —— 手机端行为完全不变。 */
const WS_SESSION_KEY = "portfolio:wordsearch-session";
const WS_NAV_TYPE = (() => {
  try {
    const e = performance.getEntriesByType("navigation")[0];
    return e && e.type ? e.type : "navigate";
  } catch (e) {
    return "navigate";
  }
})();
if (WS_NAV_TYPE === "reload") {
  try { sessionStorage.removeItem(WS_SESSION_KEY); } catch (e) {}
}

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

/* ---- 完成状态记忆 ----
   ★ 电脑端（用户 2026-11-08）：用「当前标签页会话」记住玩过。
     · 刷新（在任何页面，含强制刷新）→ 清标记 → 可以再玩一次
     · 站内来回跳 / 后退前进 → 不算刷新 → 仍是全部连好、不能玩第二遍
     · 关掉标签页重新打开 = 新会话 → 可以再玩
     最早用 localStorage（刷了也玩不了）、后来用纯内存变量（跳走再回来就重置），
     都不能同时满足这两条 —— 现在靠上面的导航类型区分。
   ★ 手机端保持原来的 localStorage 持久记忆，一行不动
     （用户长期要求：默认只改电脑端，不许动手机端）。 */
const WS_DONE_KEY = "portfolio:wordsearch-done";
const lsDone = () => {
  try { return localStorage.getItem(WS_DONE_KEY) === "1"; } catch (e) { return false; }
};
const lsRemember = () => {
  try { localStorage.setItem(WS_DONE_KEY, "1"); } catch (e) {}
};
const ssDone = () => {
  try { return sessionStorage.getItem(WS_SESSION_KEY) === "1"; } catch (e) { return false; }
};
const ssRemember = () => {
  try { sessionStorage.setItem(WS_SESSION_KEY, "1"); } catch (e) {}
};
const wsPlayerDone = () => (WS_MQ.matches ? lsDone() : ssDone());
const wsRememberDone = () => {
  if (WS_MQ.matches) lsRemember();
  else ssRemember();
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

/* 桌面端连对后不再放 WELCOME：直接自动播完首页时间轴 splitA~splitB 的
   「上下两半裂开」，停在 TL.splitB（裂开完成），About 内容仍由用户自己往下滚。
   ★ 不能用 scrollIntoView(#about)：hs-on 下 #about 是 position:fixed、
     offsetTop=0，实测那句话在电脑端根本不产生滚动。
   ★ 改走 initHomeScenes 暴露的 __homePlaySplit，复用站内同一条播放曲线、
     1.0s 时长、以及播放期间的输入屏蔽（playing 标志）。
   ★ 只给电脑端用；手机端仍走 playFinale（用户 2026-11-08 明确不动手机端）。 */
function wsGoAbout() {
  if (typeof window.__homePlaySplit === "function") window.__homePlaySplit();
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
    /* ★ 2026-11-08：电脑端去掉整层 WELCOME 庆祝浮层（白底 / 大字 / 星星 / 小猫），
       五词全亮后约 400ms 直接上下裂开切到 About。
       手机端保持原样。玩过一次（wsPlayerDone）根本不会走到这里，
       仍是静态全亮、不自动跳页 —— 用户确认保持现状。 */
    if (WS_MQ.matches) setTimeout(playFinale, 420);
    else setTimeout(wsGoAbout, 400);
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

  // 手机端的静态标题（电脑端这块 display:none，用下面的滚动标题带）
  const head = $("projectsHead");
  if (head) {
    head.innerHTML =
      `<p class="projects__kicker">${esc(p.title)}</p>` +
      `<span class="projects__rule" aria-hidden="true"></span>` +
      `<p class="projects__sub">${esc(p.intro[0])}</p>`;
  }

  // 标题带：大标题 + 副标题交替排列，复制成两组（内容完全一样）用来做无缝循环；
  // 一组里重复三遍，保证它比屏幕宽，滚到接缝处也不会露出空白
  const mq = $("projectsMarquee");
  if (mq) {
    const pair =
      `<span class="mq__big">${esc(p.title)}</span>` +
      `<span class="mq__small">${esc(p.intro[0])}</span>`;
    const group = `<div class="mq__group">${pair.repeat(3)}</div>`;
    mq.innerHTML = `<div class="mq__track">${group}${group}</div>`;
  }

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

/* 扑克牌堆：中间那张可进项目页，点两侧的牌把它换到中间 */
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
  let tiltUntil = 0;            // 换牌位移期间不接悬停倾斜

  const select = (i) => {
    // 一维排列，不绕圈：01..04 拉成一条直线，只在相邻之间来回切
    cur = Math.max(0, Math.min(n - 1, i));
    cards.forEach((el, k) => {
      const off = k - cur;               // 不再取模：第 1 张左边没有牌，第 4 张右边也没有
      const a = Math.abs(off);
      const spread = window.innerWidth < 900 ? 0.52 : 1;
      // 看不见的那几张别真的飞出去（会把页面撑出横向滚动），夹在两侧的位子上
      const pos = Math.max(-2, Math.min(2, off));
      const x = pos * 148 * spread;      // 左右等距，以中间那张为轴镜像
      const y = a * 66 * spread;         // 两侧同时下沉，中间是最高点
      const z = (off === 0 ? 0 : -260) * spread; // 两侧同深度 → 一样大
      // 中间那张保持纯平面（不做 Z 位移和后仰）：它是翻牌动画的落点，
      // 一旦带透视，卡片里的图片和文字会被压出梯形，和翻牌卡差 2~4px，交接就会"跳"
      const rx = off === 0 ? 0 : 3;
      const ry = pos * -17;
      const base = `translate(-50%, -50%) translateX(${x}%) translateY(${y}px) translateZ(${z}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      el.dataset.base = base;
      // 换牌时一律按新位置走，哪怕鼠标正压在这张卡上也要把倾斜让位：
      // 点两侧的卡时鼠标必然在它身上（dataset.tilting=1），旧代码会跳过这张的位移，
      // 于是中间那张先走了，被点的那张却停在原地，要等鼠标移开才归位
      el.dataset.tilting = "";
      el.style.transform = base;
      el.style.opacity = a > 1 ? "0" : String(1 - a * 0.16);
      el.style.zIndex = String(10 - a);
      el.style.filter = "none";
      el.style.pointerEvents = a > 1 ? "none" : "auto";
      el.classList.toggle("is-current", a === 0);
      el.tabIndex = a === 0 ? 0 : -1;
      el.setAttribute("aria-label", a === 0 ? `Open ${data[k].title}` : `Bring ${data[k].title} to the front`);
    });

    // 位移期间屏蔽倾斜：卡片正在走，pointermove 读到的矩形是中间态，硬套会把卡压歪
    tiltUntil = performance.now() + 760;
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

  // 给"滚轮翻牌"用：到头就停（第 1 张再往上、第 4 张再往下都不动）
  stage.__deck = {
    step(dir) {
      if (!n) return false;
      const next = cur + dir;
      if (next < 0 || next > n - 1) return false;
      select(next);
      return true;
    },
    index: () => cur,
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
      if (Math.abs(dx) <= 40) return;
      const next = cur + (dx < 0 ? 1 : -1);
      if (next < 0 || next > n - 1) return;   // 手机端同样不绕圈
      select(next);
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
        // 刚换过牌：卡片还在往新位置走的这 0.76s 里不接倾斜
        if (performance.now() < tiltUntil) return;
        if (tiltUntil) { tiltUntil = 0; tiltRect.clear(); }   // 位移结束，重新取一次矩形
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
  const EDGE = 2;

  let lockUntil = 0;
  let lockDir = 0;
  let lockTo = -1;
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

  /* 一手势一次推进（用户 2026-11-06）：一串连续滚轮只放行一次推进，
     同一串里剩下的格全部吞掉，必须停手再滑一次。 */
  let flipGid = -1;
  let gidSeq = 0;
  /* ★ 2026-11-06 改：以前用「edgeHoldUntil = now + edgeHoldMs」，
     而 edgeHoldMs 是「上一格间隔 × 1.8」—— 间隔 < 1.8×间隔 恒成立，
     于是滚到边界后同方向永远翻不了页（要滑十几下）。
     现在只用「这一格与上一格的间隔」当判据：短于 EDGE_GAP 算同一串，
     长于它就算手停了，放行翻页。另加 tick 兜底，杜绝再次锁死。 */
  const EDGE_GAP = 250;
  const EDGE_MAX_TICKS = 20;
  let edgeHold = 0;
  let edgeHoldDir = 0;
  let edgeHoldTicks = 0;

  const step = (dir, delta, gid) => {
    if (flipGid === gid) return true;
    const y = window.scrollY;
    const idx = indexAt();
    const cur = idx >= 0 ? pinned[idx] : null;

    if (dir > 0) {
      if (cur) {
        const endY = endOf(cur);
        if (y < endY - EDGE) {
          const target = Math.min(y + delta, endY);
          jump(target);
          if (target >= endY - 1) {
            flipGid = gid;
            edgeHold = 1; edgeHoldDir = 1; edgeHoldTicks = 0;
          }
          return true;
        }
      }
      const next = pinned[idx + 1];
      if (!next) return false; // 最后一屏：交回浏览器，页脚自然滑上来
      flipGid = gid;
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
        if (target <= curTop + 1) {
          flipGid = gid;
          edgeHold = 1; edgeHoldDir = -1; edgeHoldTicks = 0;
        }
        return true;
      }
    }
    const prev = idx > 0 ? pinned[idx - 1] : hero;
    if (!prev) return false;
    flipGid = gid;
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
    const gap = lastWheelAt ? now - lastWheelAt : 1e9;
    lastWheelAt = now;
    if (gap > GESTURE_GAP) gidSeq++;      // 停顿够久才算新手势
    if (edgeHold) {
      if (Math.sign(d) !== edgeHoldDir) {
        edgeHold = 0;                       // 反向：回板块里，立刻放行
      } else if (gap < EDGE_GAP && edgeHoldTicks < EDGE_MAX_TICKS) {
        edgeHoldTicks++;                    // 同一串猛滑，按住
        e.preventDefault();
        return;
      } else {
        edgeHold = 0;                       // 手停了，这一格放行翻页
      }
    }

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
    if (step(dir, delta, gidSeq)) e.preventDefault();
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
    gidSeq++;   // 每次按键都算一次新手势
    if (step(dir, window.innerHeight * 0.85, gidSeq)) e.preventDefault();
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

// 跨过 900px 断点 = 电脑端转场 / 手机端普通滚动 互换。
// 转场会往元素上写大量 inline 样式，中途换模式收不干净，重载最稳。
// 但要避开加载瞬间视口还没定下来的那一下（手机会先按 980 宽算一遍再收敛到设备宽度），
// 否则会自己触发自己、反复重载
const SCENE_MQ = window.matchMedia("(min-width: 901px)");
let mqReady = false;
setTimeout(() => { mqReady = true; }, 1600);
SCENE_MQ.addEventListener("change", () => {
  if (!mqReady) return;
  mqReady = false;
  setTimeout(() => window.location.reload(), 350);
});

/* ============================================================
   分屏吸附（项目页通用）：一屏一段，段内可滚，段末再滚翻页
   由各项目页调用 initSectionPager({ main, sections, hero })
   ============================================================ */
window.initSectionPager = function (opts) {
  // transition（可选）：某页要播专属板块转场时传入 { down, up, busy }；
  // 不传的页面行为完全不变（四个项目页共用这一个分页器）。
  const { main, sections, hero, transition } = opts || {};
  if (!main || !sections || sections.length < 2) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (!window.matchMedia("(min-width: 1024px)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const nav = document.querySelector(".nav");
  const THRESHOLD = 24;   // 滚轮 / 触控板累积阈值（触控板抖动不会误触发）
  const LOCK_MS = 520;    // 翻页动画锁上限，滚到目标位置会提前解锁
  const EDGE = 2;         // 判定「已对齐」的容差

  let lockUntil = 0;
  let lockDir = 0;
  let lockTo = -1;
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
    stopGlide();
    lockUntil = performance.now() + LOCK_MS;
    lockDir = dir;
    lockTo = target;
    window.scrollTo({ top: target, behavior: "smooth" });
  };

  const setY = (v) => {
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, v);
    root.style.scrollBehavior = prev;
  };

  /* 段内滚动改成「跟手缓动」：位移量照滚轮的累计量走，只是用几帧把它走完。
     原来这里是 jump(y + delta) 的瞬时跳 —— 触控板一次滑动会拆成几十个小 delta，
     每个都被 24px 阈值截断再瞬跳，看起来就是「每次只挪固定的一小格」。 */
  let glideTo = -1;
  let glideRaf = 0;
  let glideWrote = -1;
  const stopGlide = () => {
    if (glideRaf) cancelAnimationFrame(glideRaf);
    glideRaf = 0;
    glideTo = -1;
    glideWrote = -1;
  };
  const glideTick = () => {
    glideRaf = 0;
    if (glideTo < 0) return;
    const y = window.scrollY;
    /* 位置被别人动了（点索引栏、外部 scrollTo）：立刻让路，别抢回来 */
    if (glideWrote >= 0 && Math.abs(y - glideWrote) > 40) {
      stopGlide();
      return;
    }
    const d = glideTo - y;
    if (Math.abs(d) < 0.8) {
      setY(glideTo);
      stopGlide();
      return;
    }
    const next = y + d * 0.32;
    setY(next);
    glideWrote = next;
    glideRaf = requestAnimationFrame(glideTick);
  };
  const glide = (target) => {
    glideTo = clampY(target);
    if (!glideRaf) glideRaf = requestAnimationFrame(glideTick);
  };

  const jump = (top) => {
    stopGlide();
    setY(clampY(top));
  };

  const endOf = (el) => Math.min(topOf(el) + el.offsetHeight - window.innerHeight, maxScroll());

  /* ★ 一手势一次推进（全站通用）：同一串同向滚轮最多翻一次页。
     段内滚动不受限制 —— 每一格都会真的位移；只有「翻到下一个板块」这件事
     一个手势只做一次，段落滚到底之后必须停手再滑。 */
  const GESTURE_GAP = 220;
  let gestureId = 0;
  let lastGidAt = 0;
  let lastGidDir = 0;
  let flipGid = -1;
  /* ★ 到板块边界后「必须停手」才允许翻页（用户 2026-11-06）：见 onWheel */
  /* ★ 2026-11-06 改：以前用「edgeHoldUntil = now + edgeHoldMs」，
     而 edgeHoldMs 是「上一格间隔 × 1.8」—— 间隔 < 1.8×间隔 恒成立，
     于是滚到边界后同方向永远翻不了页（要滑十几下）。
     现在只用「这一格与上一格的间隔」当判据：短于 EDGE_GAP 算同一串，
     长于它就算手停了，放行翻页。另加 tick 兜底，杜绝再次锁死。 */
  const EDGE_GAP = 250;
  const EDGE_MAX_TICKS = 20;
  let edgeHold = 0;
  let edgeHoldDir = 0;
  let edgeHoldTicks = 0;

  const step = (dir, delta, gid) => {
    /* 这一手势已经推进过（翻页 / 滚到段底）：剩下的滚轮一律吞掉，必须停手再滑。
       段内正常滚动不会设置它，所以触控板的每一小格都还会真的位移。 */
    if (flipGid === gid) return true;

    const y = window.scrollY;
    const idx = indexAt();
    const cur = idx >= 0 ? sections[idx] : null;
    /* 缓动还没走完时，以「待到位」为准往下累加，否则快滑会丢掉位移量 */
    const base = glideTo >= 0 ? glideTo : y;

    if (dir > 0) {
      if (cur) {
        const endY = endOf(cur);
        if (base < endY - EDGE) {
          const target = Math.min(base + delta, endY);
          glide(target);
          if (target >= endY - 1) {
            flipGid = gid;
            edgeHold = 1; edgeHoldDir = 1; edgeHoldTicks = 0;
          }
          return true;
        }
      }
      const next = sections[idx + 1];
      if (!next) return false;   // 最后一段：交回浏览器，页脚自然滑上来
      flipGid = gid;
      // 专属转场接管：它自己负责落位（instant），不再走 go() 的平滑滚动
      if (transition && transition.down && transition.down(cur, next)) return true;
      const target = topOf(next);
      if (Math.abs(target - y) < 4) return false;
      go(target, 1);
      return true;
    }

    if (cur) {
      const curTop = topOf(cur);
      if (base > curTop + EDGE) {
        const target = Math.max(base - delta, curTop);
        glide(target);
        if (target <= curTop + 1) {
          flipGid = gid;
          edgeHold = 1; edgeHoldDir = -1; edgeHoldTicks = 0;
        }
        return true;
      }
    }
    const prev = idx > 0 ? sections[idx - 1] : hero;
    if (!prev) return false;
    flipGid = gid;
    if (transition && transition.up && transition.up(cur, prev)) return true;
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
    // 专属转场播放期间吞掉滚轮；同时把累积的量清零，
    // 否则转场结束后这一格会立刻补滚一次，段落会偏出几十像素
    if (transition && transition.busy && transition.busy()) {
      acc = 0;
      clearTimeout(accTimer);
      e.preventDefault();
      return;
    }

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

    /* 手势编号：同方向且间隔 < GESTURE_GAP 算同一串（用户 2026-11-04 的铁律：
       一次手势只放行一次推进；换方向立刻算新的一次操作） */
    const now2 = performance.now();
    const gapW = lastGidAt ? now2 - lastGidAt : 1e9;
    if (dir !== lastGidDir || now2 - lastGidAt > GESTURE_GAP) gestureId++;
    lastGidAt = now2;
    lastGidDir = dir;

    /* 到板块边界后必须停手：这一格与上一格的间隔短于 EDGE_GAP 算同一串猛滑，按住；
       长于它说明手已经停了，这一格就是「停手之后的新一次」，放行翻页。 */
    if (edgeHold) {
      if (dir !== edgeHoldDir) {
        edgeHold = 0;                       // 反向：回板块里，立刻放行
      } else if (gapW < EDGE_GAP && edgeHoldTicks < EDGE_MAX_TICKS) {
        edgeHoldTicks++;                    // 同一串，按住
        e.preventDefault();
        return;
      } else {
        edgeHold = 0;                       // 手停了，放行
      }
    }

    // 可选：某页的「板块内分段动画」优先消费这一格（返回 true 就不翻页）。
    // 放在 acc 阈值之后，触控板抖动不会误触发；不传 transition 的页面行为不变。
    if (transition && transition.intercept && transition.intercept(dir, "wheel")) {
      e.preventDefault();
      return;
    }
    if (step(dir, delta, gestureId)) e.preventDefault();
  };

  const onKey = (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target && e.target.tagName) || "";
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
    if (transition && transition.busy && transition.busy()) { e.preventDefault(); return; }

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
    if (transition && transition.intercept && transition.intercept(dir, "key")) {
      e.preventDefault();
      return;
    }
    /* 键盘一次就是一整步，算「新的一次操作」 */
    gestureId++;
    if (step(dir, window.innerHeight * 0.85, gestureId)) e.preventDefault();
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
  // 手机端（与字母迷宫同一个断点）不做转场：保持普通文档流，
  // 一屏一屏往下滑，hero / About / Projects / 页脚各自就在原位，没有任何位移动画
  if (window.matchMedia("(max-width: 900px)").matches) return;

  const about = document.querySelector(".about");
  const projects = document.querySelector(".projects");

  // 时间轴（单位：1 = 一个视口高度）。A→B 是转场区间，其余是停留区
  const TL = {
    splitA: 0.12, splitB: 1.1,
    info: 1.55, intro: 1.95, skills: 2.35, btn: 2.75,
    // 按钮出现后只留 0.35 屏缓冲：滚动一到这条线画面就开始变，用户的手是"参与"进来的
    morphA: 3.1, morphB: 3.92,   // 文字退场，照片移到中间
    flipA: 3.88, flipB: 4.55,    // 翻牌：照片 → SunLink 卡片（紧接位移，全程不断）
    // 侧卡 / 说明 / 标签出现。必须晚于 flipB：翻到一半时牌几乎是侧着的，
    // 这时候让底下那张一模一样的真卡浮上来，会看到一张"正面的牌"从侧面牌里透出来
    revealA: 4.62, revealB: 5.15,
    // 牌组和标签都到位之后，标题带才浮出来（它自己一直在从右往左滚，这里只管淡入）
    titleA: 5.18, titleB: 5.58,
    // 首页到 Featured Projects 就结束了（没有页脚）。留 0.02 屏余量，
    // 避免滚动上限和 titleB 卡在同一个像素上导致最后差一点点没走满
    end: 5.6,
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
      pmq: document.querySelector(".projects__marquee"),
      pback: document.querySelector(".projects__back"),
      pdeck: document.querySelector(".pdeck"),
      ptags: document.querySelector(".pdeck__tags"),
      card: document.getElementById("aboutCard"),
      cardFront: document.querySelector(".abcard__front"),
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

  // —— 阴影 ——
  // 照片的阴影是 0 26px 60px .18（悬停时更大），真卡的阴影是 0 24px 48px -24px .42 那套，
  // 两者完全不是一个量级。以前两面各自带自己的阴影，翻到 90° 那一帧正面消失、背面出现，
  // 阴影就硬切一下 —— 用户看到的就是「阴影跳一下」。
  // 现在两面都写**同一个** box-shadow（JS 内联），换面时一模一样，值本身再走 transition 渐变。
  let photoShadow = "";
  let cardShadow = "";
  let lastShadow = null;
  const readShadows = () => {
    if (els.photo) photoShadow = getComputedStyle(els.photo).boxShadow || "";
    const face = document.querySelector(".pcard.is-current .pcard__face");
    if (face) cardShadow = getComputedStyle(face).boxShadow || "";
    lastShadow = null;      // 强制下一帧写一次
  };

  // 正反两面写同一个阴影值（背面是克隆出来的，每次 syncCard 后要重新找一遍）
  // instant：刚接手的那一帧必须**立刻**生效。否则会从 box-shadow:none 渐变出来（0.42s），
  // 视觉上就是「照片没了 → 影子先消失、再长回来」—— 用户说的「阴影跳一下」就是这个。
  const setCast = (v, instant) => {
    if (!v) return;
    const bf = els.cardBack ? els.cardBack.querySelector(".pcard__face") : null;
    [els.cardFront, bf].forEach((n) => {
      if (!n) return;
      if (!instant) { n.style.boxShadow = v; return; }
      n.style.transition = "none";
      n.style.boxShadow = v;
      void n.offsetWidth;          // 让这一帧立刻落定，别带着过渡起来
      n.style.transition = "";
    });
  };

  // 翻牌卡是 position:fixed + left:50% + translate(-50%,-50%)，
  // 它的 50% 是相对**内容区**（initial containing block，不含滚动条）算的；
  // 而 window.innerWidth 是**含**滚动条的。两者差了整整一条滚动条宽，
  // 拿 innerWidth/2 当中心基准，卡片就会整体向左偏半个滚动条（约 7~8px）——
  // 这就是「照片翻成卡片时永远有个向左的位移」的真正原因。
  const stageBox = () => {
    const de = document.documentElement;
    return {
      w: de.clientWidth || window.innerWidth || 1,
      h: de.clientHeight || window.innerHeight || 1,
    };
  };

  const measureStart = () => {
    const ph = els.photo;
    if (!ph || !els.cardGeom) return;
    const r = ph.getBoundingClientRect();
    // 照片带 -2° 旋转，rect 是被撑大的包围盒；尺寸要用 offsetWidth/Height
    const w = ph.offsetWidth || r.width;
    const h = ph.offsetHeight || r.height;
    if (w <= 0) return;
    const box = stageBox();
    els.cardGeom.dx = r.left + r.width / 2 - box.w / 2;
    els.cardGeom.dy = r.top + r.height / 2 - box.h / 2;
    els.cardGeom.sx = w / W;
    els.cardGeom.sy = h / H;
  };

  const measureEnd = () => {
    const cur = document.querySelector(".pcard.is-current");
    if (!cur || !els.cardGeom) return;
    const c = cur.getBoundingClientRect();
    if (c.width <= 0) return;
    const box = stageBox();
    els.cardGeom.dxEnd = c.left + c.width / 2 - box.w / 2;
    els.cardGeom.dyEnd = c.top + c.height / 2 - box.h / 2;
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

  /* ——— 标题带 ———
     不是淡入：它一露出来就是满不透明，但轨道起点在屏幕右边缘之外，
     所以看到的是"第一个 Featured Projects 从右边滑出来"，后面跟着一整溜源源不断往左走。
     入场速度按 (1-u)² 衰减，收尾时正好等于巡航速度，不会"滑到位就停"。 */
  const MQ_SPEED = 118;     // 巡航速度 px/秒
  const MQ_ENTRY = 2.6;     // 入场时长（秒）
  const MQ_STILL = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mqTrack = els.pmq ? els.pmq.querySelector(".mq__track") : null;
  let mqW = 0;              // 一组内容的宽度（滚出这个距离就折回来）
  let mqShown = false;
  let mqEnter = true;       // 是否还要演"从右边滑进来"
  let mqT = 0;
  let mqX = 0;
  let mqLast = 0;
  let mqRaf = 0;

  const mqMeasure = () => {
    const g = mqTrack ? mqTrack.querySelector(".mq__group") : null;
    mqW = g ? g.offsetWidth : 0;
  };

  const mqPaint = () => {
    if (mqTrack) mqTrack.style.transform = `translate3d(${mqX.toFixed(1)}px, 0, 0)`;
  };

  const mqTick = (now) => {
    mqRaf = 0;
    const dt = Math.min(0.06, (now - mqLast) / 1000);
    mqLast = now;
    mqT += dt;
    const vw = window.innerWidth || 1;
    const W = mqW || vw * 2;
    const u = Math.min(1, mqT / MQ_ENTRY);
    // 入场项 (1-u)^1.9：起点在屏幕右侧外（+vw），衰减到 0 后只剩匀速巡航，
    // 两者相加所以在 t=MQ_ENTRY 时速度正好等于巡航速度，不会"滑到位就停"。
    // 指数取 1.9 而不是 2 —— 起步没那么"甩"，收尾一样平滑
    const enter = mqEnter ? vw * Math.pow(1 - u, 1.9) : 0;
    mqX = enter - MQ_SPEED * mqT;
    // 内容以 W 为周期，掉出一个周期就整体挪回来（此时画面已铺满，挪回去看不出接缝）
    while (mqX <= -W) mqX += W;
    mqPaint();
    mqRaf = requestAnimationFrame(mqTick);
  };

  const mqShow = (on, instant) => {
    if (!mqTrack || on === mqShown) return;
    mqShown = on;
    if (on) {
      mqMeasure();
      mqEnter = !(instant || MQ_STILL);
      mqT = 0;
      mqX = mqEnter ? (window.innerWidth || 1) : 0;   // 不演入场就从中性位置开始巡航
      mqPaint();
      if (!MQ_STILL) {
        mqLast = performance.now();
        if (!mqRaf) mqRaf = requestAnimationFrame(mqTick);
      }
    } else if (mqRaf) {
      cancelAnimationFrame(mqRaf);
      mqRaf = 0;
    }
  };
  let firstApply = true;

  // 导航里的 #home / #about / #projects 在叠屏布局下没有位置可跳，改成滚到对应时间点
  const ANCHORS = { home: 0, about: 1.2, projects: 5.15 };
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
    // 裂开完成后整层收掉：迷宫里的高亮胶囊（.ws__found 里的 rect）自己写了
    // visibility: visible，只给组设 hidden 藏不干净，会有一块橙色虚线残留在
    // Projects 屏上盖住卡片。整层给 opacity 0 最稳，也不会触发重新排版
    if (hero) hero.style.opacity = p1 > 0.999 ? "0" : "";

    // —— About 内部：滑过一条线就放进一块，动画自己慢慢播完 ——
    // 倒放回迷宫期间例外：四块内容全都保持「已进场」，整页一起合上，
    // 而不是滑一下缩回去一块。等合完（playTo 结束）才恢复常态。
    STEPS().forEach(({ el, at }) => {
      if (!el) return;
      if (homeRewind) { el.classList.add("is-in"); return; }
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
      // 先记住照片「此刻在屏幕上的样子」：鼠标停在 About 区时它是歪的（rotateX/rotateY + 1.03 缩放），
      // 翻牌卡必须从**这个**位置和大小接手。之前是先把它瞬间掰正、再按掰正后的位置量 ——
      // 于是照片忽然回正缩回去，看起来就是卡片「跳一下」。
      const box2 = stageBox();
      const before = els.photo ? els.photo.getBoundingClientRect() : null;
      if (els.photo) {
        els.photo.style.transition = "none";
        els.photo.style.transform = "rotate(-2deg)";
      }
      syncCard();
      settleDeck();     // 把被鼠标吸歪的卡片按回去
      readShadows();    // 接住照片此刻的阴影（悬停时更大）和真卡此刻的阴影
      measure();        // 重新量起点与终点
      // 起点改成「掰正之前」的样子，接得上用户眼睛看到的那一帧
      if (before && before.width > 0 && els.cardGeom) {
        els.cardGeom.dx = before.left + before.width / 2 - box2.w / 2;
        els.cardGeom.dy = before.top + before.height / 2 - box2.h / 2;
        els.cardGeom.sx = before.width / W;
        els.cardGeom.sy = before.height / H;
      }
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
    // 终点姿态要和真卡一致（3° 后仰），否则卡片内部内容会因为透视不同而错位
    if (els.cardInner) els.cardInner.style.transform = `rotateY(${(easeIO(pF) * 180).toFixed(2)}deg)`;

    // —— Projects 的其他元素：两侧卡、标签浮现，标题带最后才出来 ——
    const pR = clamp01((t - TL.revealA) / (TL.revealB - TL.revealA));
    // 真卡先在完全相同的位置"垫"上来（pR 0→0.55 铺满），翻牌卡一直不透明地压在上面；
    // 标签错后一拍，让画面一直有东西在变，直到时间轴最后一帧（不会出现"到了却不结束"的干等）
    const pIn = Math.min(1, pR / 0.55);
    const pText = clamp01((pR - 0.42) / 0.58);

    // 阴影：翻过 90° 换成「卡片」那一套（这时卡片侧成一条线，看不出切换），
    // 正反两面写同一个值 —— 正面藏、背面露的那一帧，两面的影子完全一样，所以不跳
    const wantShadow = pF > 0.5 ? cardShadow : photoShadow;
    if (wantShadow && wantShadow !== lastShadow) {
      const instant = lastShadow === null;   // null = 刚接手（readShadows 之后的第一帧）
      lastShadow = wantShadow;
      setCast(wantShadow, instant);
    }
    if (els.pdeck) els.pdeck.style.opacity = String(pIn);
    if (els.ptags) els.ptags.style.opacity = String(pText);
    // 标题带：牌组和标签都铺满之后才露出来（不做淡入，见 mqShow 的入场）
    const pT = clamp01((t - TL.titleA) / (TL.titleB - TL.titleA));
    const mqOn = pT > 0;
    if (els.pmq) els.pmq.style.opacity = mqOn ? "1" : "0";
    if (els.pback) els.pback.style.opacity = String(pT);   // 出口跟着标题带一起出现
    // 刷新直接落在本屏时（第一次 apply 就已经在结尾），不要再演一遍入场
    mqShow(mqOn, firstApply && t >= TL.titleB - 0.01);
    firstApply = false;
    // 叠化交接：真卡已铺满，两张牌像素级重合，叠化本身看不出东西；但要是显卡上有半像素的
    // 栅格差异，也会被这个过渡摊平，而不是"啪"地换一张牌
    const cardFade = clamp01((pR - 0.6) / 0.18);
    if (els.card) els.card.style.opacity = String(pM > 0 ? 1 - cardFade : 0);

    // 已经让开的那几屏不能再挡点击（否则 About 的按钮、卡片都点不到）
    if (hero) hero.style.pointerEvents = p1 > 0.9 ? "none" : "";
    if (about) about.style.pointerEvents = pM > 0.9 ? "none" : "";
    // 注意这里是"显示完成才可交互"，之前写反了：pR 高时反而把整个 Projects 屏禁用了指针
    if (projects) projects.style.pointerEvents = pR >= 0.999 ? "" : "none";
    if (els.pdeck) els.pdeck.style.pointerEvents = pR >= 0.999 ? "" : "none";

    stage.dataset.phase =
      t < TL.splitA ? "hero" : t < TL.morphA ? "about" : t < TL.revealA ? "card" : "projects";
  };

  // 滚动位置只当时间轴用：手一动就开始播放，所以这里不再记"停留点"
  let prevT = 0;
  let playing = false;
  let playRaf = 0;
  let lastY = window.scrollY;
  /* 正在「整段倒放回字母迷宫」：这段时间 About 的四块内容一律保持显示，
     不能跟着滚动位置一个个缩回去（用户 2026-11-06 要求）。 */
  let homeRewind = false;


  // 播放曲线：起步就有速度（不再"等它缓过来"），结尾仍然收得住。
  // 之前用 easeInOutCubic，头 300ms 只走 0.4%，用户滚完得干等半秒才看见东西动；
  // 现在 1-(1-k)^1.6，第一个 100ms 就能走掉全程的 6%，手指和画面是连着的
  const easePlay = (k) => 1 - Math.pow(1 - k, 1.6);

  // 从当前位置缓动滚到 toY（forceDur 只给「连对后自动裂开」用，其余沿用原曲线）
  const playTo = (toY, rewind, forceDur) => {
    if (window.__hsNoAuto) return;   // 调试用：关掉自动播放，便于逐点检查
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
    const full = (TL.titleB - TL.morphA) * (window.innerHeight || 1);
    // 比原来短一点：整段动画不留"空转"的尾巴
    const dur = forceDur || 760 + 1650 * Math.min(1, dist / (full || 1));

    playing = true;
    const t0 = performance.now();
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      window.scrollTo(0, Math.round(from + (toY - from) * easePlay(k)));
      if (k < 1) {
        playRaf = requestAnimationFrame(tick);
      } else {
        playing = false;
        root.style.scrollBehavior = prevBehavior;
        // 播完就等于"用户刚滚到这里"，下一次滚动可以从这里接着判断方向
        lastY = window.scrollY;
        prevT = window.scrollY / (window.innerHeight || 1);
        // 倒放结束：这时已经回到迷宫、About 被两片底色完全盖住，
        // 再把四块内容的状态交回时间轴（不会看到它们消失）
        if (rewind) { homeRewind = false; apply(); }
      }
    };
    playRaf = requestAnimationFrame(tick);
  };

  /* 字母迷宫连对后（仅电脑端）：从 y=0 自动播完「上下两半裂开」，
     停在 TL.splitB（裂开完成、About 底色露出），1.0s。
     About 的标题 / 四块内容仍由用户自己往下滚一站一站看到（用户 2026-11-08 选）。
     复用 playTo 的曲线与 playing 输入屏蔽，时间轴本身一行不改。 */
  window.__homePlaySplit = () => {
    playTo(TL.splitB * (window.innerHeight || 1), false, 1000);
  };

  // 前进：About 完整 → Projects（停留区静止，先对齐到动画起点，看不出跳）
  const playForward = () => {
    wAcc = 0; wLock = 0;     // 进/出这一屏时把滚轮攒的量清干净
    const vh = window.innerHeight || 1;
    const startY = Math.max(window.scrollY, TL.morphA * vh);
    if (startY !== window.scrollY) {
      const root = document.documentElement;
      const b = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      window.scrollTo(0, startY);
      root.style.scrollBehavior = b;
    }
    playTo(TL.titleB * vh);
  };

  // 后退：Projects → About 完整（翻牌倒放）
  const playBack = () => {
    wAcc = 0; wLock = 0;
    const vh = window.innerHeight || 1;
    // 用户可能把卡片 hover 歪了，先在牌面还看得见时按回原位，
    // 否则翻牌卡和真实卡在交叉淡化时会错位
    settleDeck();
    // 重新克隆"当前这张"：用户可能已经在牌堆里翻到了第 3 张，
    // 不倒放前同步的话，翻回去的还是上次进来时那张（会看到卡片突然换了一张）
    syncCard();
    settleDeck();     // 鼠标可能还停在某张牌上（歪的），先按回原位再量落点
    readShadows();    // 悬停时真卡阴影更大，重新接一次
    measureEnd();
    playTo(TL.morphA * vh);
  };

  /* 从「About 全部显示」一屏直接倒放回字母迷宫（用户 2026-11-06 要求）：
     不是让四个内容块一个个往回缩，而是两片底色合拢、上下两半字母合回去 ——
     也就是 0.12~1.1 那段「裂开」的倒放。
     ★ 2.75（About 全显示）到 1.1 之间 p1 一直是 1，画面完全没变化，
       所以先把位置对到 1.1 再倒放，中间不会有 1.6 屏的空转停顿。 */
  const playHome = () => {
    wAcc = 0; wLock = 0;
    const vh = window.innerHeight || 1;
    const startY = Math.min(window.scrollY, TL.splitB * vh);
    homeRewind = true;      // 先立起来，跳位那一帧元素才不会被收回
    if (startY !== window.scrollY) {
      const root = document.documentElement;
      const b = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      window.scrollTo(0, startY);
      root.style.scrollBehavior = b;
    }
    playTo(0, true);
  };

  const onScroll = () => {
    const vh = window.innerHeight || 1;
    const t = window.scrollY / vh;
    const step = window.scrollY - lastY;   // 这一次事件滚了多少（px）

    if (playing) {
      lastY = window.scrollY;
      prevT = t;
      if (!raf) raf = requestAnimationFrame(apply);
      return;
    }

    // 不再等"手停下来 300ms 再滑一次"：滚轮一动，动画就跟着开始。
    // 前进：滑到动画起点（About 完整后再往下 0.35 屏）就自己走完整个转场，
    // 手不用停、也不用再滚第二下。playForward 会先把页面对齐到动画起点，
    // 这段区间（2.75~3.10）画面完全没变化，所以对齐那一下看不出跳
    if (step > 2 && prevT < TL.morphA + 0.02 && t >= TL.morphA - 0.03 && t < TL.revealB) {
      playForward();
      lastY = window.scrollY;
      prevT = window.scrollY / vh;
      if (!raf) raf = requestAnimationFrame(apply);
      return;
    }
    // 后退：在 Projects 这一屏里往上动一点就自动倒放回 About
    if (step < -2 && prevT >= TL.revealB - 0.02) {
      playBack();
      lastY = window.scrollY;
      prevT = window.scrollY / vh;
      if (!raf) raf = requestAnimationFrame(apply);
      return;
    }

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

  /* ——— Projects 屏：滚轮翻牌 ———
     · 往下 = 切下一张（右边的卡转到中间，中间的转到左边）
     · 往上 = 切上一张（左边的卡转到中间）
     01→02→03→04 一条直线，两头不绕圈：第 1 张左边没有牌、第 4 张右边没有牌。
     · 第 1 张（SunLink）再往上滚 = 退回 About（整段倒放），因为左边本来就没有牌了
     · 第 4 张再往下滚 = 停住（右边没有牌，这一屏是终点）
     顶部那行小字也仍然可以点，效果一样。
     节奏：一次滑动只切一张，不管滚多滚少；两张之间至少隔 300ms。 */
  const W_GATE = 40;       // 攒够 40px 才算"一次滑动"（鼠标一格 100~150，触控板碎步也能攒到）
  const W_LOCK = 300;      // 两次换牌的最小间隔（换牌过渡 0.72s，允许下一张接上去）
  let wAcc = 0;            // 本次滑动攒的位移
  let wLock = 0;           // 下一次允许换牌的时间点

  const onDeckWheel = (e) => {
    if (playing) return;                       // 播放中交给 blockInput 吞掉
    const deck = els.pdeck;
    if (!deck || !deck.__deck) return;
    const vh = window.innerHeight || 1;
    if (window.scrollY / vh < TL.revealB - 0.01) return;   // 还没到 Projects 屏，正常滚动
    e.preventDefault();                        // 这一屏的滚轮全部由我们接管

    const now = performance.now();
    if (now < wLock) return;                   // 冷却中：这次滑动的量算进上一张，不再多切
    if (wAcc && Math.sign(wAcc) !== Math.sign(e.deltaY)) wAcc = 0;   // 中途反向就重新计
    wAcc += e.deltaY;
    if (Math.abs(wAcc) < W_GATE) return;
    const dir = wAcc > 0 ? 1 : -1;
    wAcc = 0;                                  // 每次切完清零，不攒零头 —— 否则偶尔会一次滑出两张
    wLock = now + W_LOCK;

    // 已经是最前面那张（SunLink），再往上滚就退出这一屏、倒放回 About
    if (dir < 0 && deck.__deck.index() === 0) {
      playBack();
      return;
    }
    deck.__deck.step(dir);
  };
  window.addEventListener("wheel", onDeckWheel, { passive: false });

  /* ——— 一手势一推进（About 内部的内容节点）———
     ★ 用户报：About 里「Explore More 按钮出现」和「切到 Projects」
       会被一次猛滑连着做完，中间那一屏（About 内容已经全显示、按钮刚出来）
       根本停不住，只有把滚轮拨得极轻才会停在那里。
     首页整条是一条「滚动位置当时间轴」的长轨道（6.6 屏高），滚多少画面走多少，
     没有天然的分段，所以只能靠滚轮闸门来补：
       一串连续滚轮最多推进到**下一个内容节点**，到点后同一串剩下的格全部吞掉，
       必须停手再滑一次才继续。
     反向的节点比正向早 0.14 屏 —— 因为退场判定用的是 t < at - 0.12，
     停在 at 上反而退不掉，会卡在「滑了但按钮还在」。 */
  const STOPS = [
    { at: TL.info, rev: TL.info - 0.14 },
    { at: TL.intro, rev: TL.intro - 0.14 },
    { at: TL.skills, rev: TL.skills - 0.14 },
    { at: TL.btn, rev: TL.btn - 0.14 },
  ];
  /* ★ 二次修（用户反馈「还是能一下冲到 Projects」）：
     上一版用「两格之间的间隔 > 250ms 就算停手」。真实鼠标拨轮的节奏并不均匀，
     一串猛滑常见 200 / 300 / 180 / 400ms，中间只要有一格超过 250ms，下一格就被
     当成「停手之后的新一次」，于是照样一下冲过去。
     现在只认**最后一只滚轮之后安静了多久**：每次按住都把手里的期限往后推 520ms，
     只要手还在拨（哪怕一格 400ms）就一直按住；真正停手半秒以上，第一次滚动才放行。
     另加两个保险：① 25 格兜底，绝不锁死；② 位置守卫 —— 按住期间万一被惯性 /
     合成器合并的滚动推走了，直接拉回节点上。 */
  const HOLD_MS = 520;        // 最后一只滚轮之后要安静这么久，才算「停手」
  const HOLD_MAX_MS = 8000;   // 单次按住最长 8 秒（兜底）：1~4 秒的猛滑都能按满，异常情况也不会卡死人
  let holdUntil = 0;          // 到期时间；0 = 没在按住
  let holdY = 0;              // 按住时应该停住的位置（px）
  let holdDir = 0;
  let holdStart = 0;

  // 落到节点上：时间轴是纯几何的，不能带平滑滚动，否则会从节点上飘过去
  const parkAt = (y) => {
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, Math.round(y));
    root.style.scrollBehavior = prev;
  };

  const startHold = (y, dir, now) => {
    holdY = Math.round(y);
    holdDir = dir;
    holdStart = now;
    holdUntil = now + HOLD_MS;
    parkAt(holdY);
  };
  const clearHold = () => { holdUntil = 0; holdY = 0; holdDir = 0; holdStart = 0; };

  /* 位置守卫：按住期间只允许待在节点上。
     惯性滚动、浏览器合并后的滚动、滚动链这些都可能绕过 wheel 事件，
     光靠滚轮拦截补不齐，所以再看一眼位置。 */
  const onHoldScroll = () => {
    if (!holdUntil) return;
    if (performance.now() >= holdUntil) { clearHold(); return; }
    const y = window.scrollY;
    if (holdDir > 0 ? y > holdY + 2 : y < holdY - 2) parkAt(holdY);
  };
  window.addEventListener("scroll", onHoldScroll, { passive: true });

  const onStepWheel = (e) => {
    if (playing) { clearHold(); return; }      // 自动播放中：blockInput 已经在吞
    if (e.ctrlKey) return;
    const d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    if (!d) return;

    const now = performance.now();
    const vh = window.innerHeight || 1;
    const y = window.scrollY;
    const t0 = y / vh;
    const dir = d > 0 ? 1 : -1;

    /* ① 还在「按住」状态里：手没停够，同方向一律按住，并把期限往后推 */
    if (holdUntil) {
      if (now >= holdUntil) {
        clearHold();                            // 安静够了：这一次是「新的一次」，放行
      } else if (dir !== holdDir) {
        clearHold();                            // 中途反向：立刻放行
      } else if (now - holdStart < HOLD_MAX_MS) {
        holdUntil = now + HOLD_MS;              // 手还在拨：续命
        e.preventDefault();
        if (holdDir > 0 ? y > holdY + 2 : y < holdY - 2) parkAt(holdY);
        return;
      } else {
        clearHold();                            // 兜底：按了 2.5 秒还没停手，放行一次
      }
    }

    // 已经进了翻牌转场（≈3.07 屏）：交给 onScroll 里的 playForward，这里不碰
    if (y >= (TL.morphA - 0.03) * vh) return;

    /* ② 已经站在「按钮屏」上，再往下滑一格的意图就是进转场。
       否则还得再攒 0.35 屏（约三格）才有反应，用户会觉得「滑了没动」 */
    if (dir > 0 && t0 >= TL.btn - 0.02) {
      e.preventDefault();
      startHold(TL.btn * vh, 1, now);
      playForward();
      return;
    }

    /* ②′ 同一屏往上滑 = 直接倒放回字母迷宫（整页合上），
       不是让四块内容一个个往回缩。 */
    if (dir < 0 && t0 >= TL.btn - 0.02) {
      e.preventDefault();
      clearHold();
      playHome();
      return;
    }

    /* ③ 这一格会跨过哪个节点？跨过就截停在节点上，并按住这一串剩下的格。
       ★ 判据按**像素**算、留 6px 容差：落位后实际位置和节点常差零点几像素
         （高精度滚动、滚轮自带的平滑动画都会造成），容差太小的话同一格会被
         反复判成「跨过同一个节点」，每格都截停又被覆盖 —— 1366×768 上死在这。 */
    const y1 = y + d;
    const TOL = 6;
    let hitY = null;
    STOPS.forEach((n) => {
      const line = (dir > 0 ? n.at : n.rev) * vh;
      const crossed = dir > 0
        ? line > y + TOL && line <= y1
        : line < y - TOL && line >= y1;
      if (!crossed) return;
      if (hitY === null || (dir > 0 ? line < hitY : line > hitY)) hitY = line;
    });
    if (hitY === null) return;            // 没跨节点：正常滚，保留原来的连贯手感

    e.preventDefault();
    startHold(hitY, dir, now);
  };
  window.addEventListener("wheel", onStepWheel, { passive: false });

  // 顶部那行小字：轻量出口，点它倒放回 About me
  if (els.pback) {
    els.pback.addEventListener("click", (e) => {
      e.preventDefault();
      if (playing) return;
      playBack();
    });
  }

  prevT = window.scrollY / (window.innerHeight || 1);   // 刷新时可能带着滚动位置回来，别误判成"跳了一大下"
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    measure();
    mqMeasure();     // 字号随视口变，组的宽度要重新量
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
