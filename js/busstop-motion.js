/* ============================================================
   Auto-Signaled Bus Stop — 动效层（仅电脑端）
   ------------------------------------------------------------
   · 不改任何文案、图片、海报、3D 模型、既有 tab / 滑块 / 影片交互
   · 只在 >=1024px 且 hover:hover 的桌面端生效
   · 通过 window.BS_MOTION 接进共用的 initSectionPager
   · 每条板块边界一套专属分镜；正向播专属，反向镜像倒放
   ============================================================ */

(function () {
  "use strict";

  const DESKTOP = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";
  if (!window.matchMedia(DESKTOP).matches) return;          // 手机端整块不加载
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.documentElement.classList.add("bs-motion");

  const $ = (s, root) => (root || document).querySelector(s);
  const $$ = (s, root) => [...(root || document).querySelectorAll(s)];
  const R = (n) => n.getBoundingClientRect();
  const absTop = (n) => R(n).top + window.scrollY;
  const topOf = (n) => absTop(n);
  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
  const clampY = (v) => Math.max(0, Math.min(v, maxScroll()));
  const EASE = "cubic-bezier(0.16, 0.84, 0.28, 1)";
  const POP = "cubic-bezier(0.34, 1.24, 0.5, 1)";
  const clamp01 = (v) => Math.max(0, Math.min(1, v));

  const IDS = ["top", "overview", "problem", "direction", "product", "elements", "poster", "issues"];
  const SEC = {};
  IDS.forEach((id) => { SEC[id] = document.getElementById(id); });
  const ORDER = IDS.map((id) => SEC[id]).filter(Boolean);

  const jumpTo = (y) => {
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, clampY(y));
    root.style.scrollBehavior = prev;
  };

  /* ---------- 飞行层 ---------- */
  const makeLayer = () => {
    const el = document.createElement("div");
    el.className = "bs-fly";
    document.body.appendChild(el);
    return el;
  };

  const prop = (L, cls, r, extra) => {
    const n = document.createElement("div");
    n.className = "bs-fly__el " + (cls || "bs-fly__dot");
    n.style.width = Math.max(1, r.width) + "px";
    n.style.height = Math.max(1, r.height) + "px";
    n.style.left = r.left + "px";
    n.style.top = r.top + "px";
    if (extra) Object.assign(n.style, extra);
    L.appendChild(n);
    return n;
  };

  // 元素在「落位后视口」里的坐标
  const landingRect = (el, landSec) => {
    const r = R(el);
    return { left: r.left, top: absTop(el) - topOf(landSec), width: r.width, height: r.height };
  };

  /* ============================================================
     左侧索引 → 线路：文字一字不动，短横线换成站点，加虚线和小车
     ============================================================ */
  const ROUTE = { bus: null, items: [], rail: null, sync: null };

  const busSVG = `
    <svg viewBox="0 0 36 22" aria-hidden="true" focusable="false">
      <rect x="2" y="2" width="30" height="14" rx="5" fill="#ffc93c"/>
      <rect x="6" y="5" width="9" height="6" rx="1.5" fill="#fff" opacity="0.85"/>
      <rect x="17" y="5" width="9" height="6" rx="1.5" fill="#fff" opacity="0.85"/>
      <circle class="bs-bus__wheel" cx="10" cy="17" r="3" fill="#55489e" stroke="#fff" stroke-width="1"/>
      <circle class="bs-bus__wheel" cx="25" cy="17" r="3" fill="#55489e" stroke="#fff" stroke-width="1"/>
      <circle class="bs-bus__lamp" cx="32" cy="8" r="2" fill="#fff" opacity="0"/>
    </svg>`;

  function initRoute() {
    const rail = $("#bsIndex");
    if (!rail) return;
    ROUTE.rail = rail;
    const bus = document.createElement("span");
    bus.className = "bs-index__bus";
    bus.innerHTML = busSVG;
    bus.title = "You are here";
    rail.appendChild(bus);
    ROUTE.bus = bus;

    const sync = () => {
      const items = $$(".bs-index__item", rail);
      ROUTE.items = items;
      const probe = window.scrollY + 90;
      let idx = 0;
      ORDER.forEach((s, i) => { if (topOf(s) <= probe) idx = i; });
      const railIdx = Math.max(0, idx - 1);            // 索引栏不含 hero
      items.forEach((it, i) => {
        it.classList.toggle("is-past", i < railIdx);
        it.classList.toggle("is-active", i === railIdx);
      });
      const active = items[Math.min(railIdx, items.length - 1)];
      if (active && bus) bus.style.transform = `translateY(${active.offsetTop + active.offsetHeight / 2 - 10}px)`;
      if (bus) {
        const atEnd = window.scrollY >= maxScroll() - 60;
        bus.classList.toggle("is-lit", atEnd);
        bus.style.opacity = atEnd ? "0.4" : "1";
      }
    };
    ROUTE.sync = sync;
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    rail.addEventListener("mouseover", (e) => {
      const it = e.target.closest && e.target.closest(".bs-index__item");
      if (!it || !bus) return;
      bus.style.transform = `translateY(${it.offsetTop + it.offsetHeight / 2 - 10}px)`;
    });
    rail.addEventListener("mouseleave", sync);
    sync();
  }

  /* ============================================================
     段内：入场触发 + 少量交互增强（不改既有功能）
     ============================================================ */
  function initAmbient() {
    const io = new IntersectionObserver(
      (es) => es.forEach((en) => { if (en.isIntersecting) en.target.classList.add("is-live"); }),
      { threshold: 0.12 }
    );
    ORDER.forEach((s) => io.observe(s));

    $$(".bs-stats > div", SEC.problem).forEach((n) => {
      n.addEventListener("pointerenter", () => {
        n.animate([{ transform: "none" }, { transform: "translateY(-3px)" }, { transform: "none" }],
          { duration: 420, easing: EASE });
      });
    });

    // tab 切换时让面板滑入重播（tab 本身的选中逻辑完全不动）
    const el = $("#bsEl");
    if (el) {
      $$(".bs-el__tab", el).forEach((t) => {
        t.addEventListener("click", () => {
          const panel = $(".bs-el__panel.is-active", el);
          if (!panel) return;
          panel.getAnimations().forEach((a) => a.cancel());
          void panel.offsetWidth;
          panel.animate(
            [{ opacity: 0, transform: "translateX(26px)" }, { opacity: 1, transform: "none" }],
            { duration: 420, easing: EASE }
          );
        });
      });
    }

    const fig = $(".bs-poster__fig", SEC.poster);
    if (fig) {
      fig.addEventListener("pointermove", (e) => {
        const r = R(fig);
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        fig.style.transform = `translate(${(px * 8).toFixed(1)}px, ${(py * 8).toFixed(1)}px)`;
      });
      fig.addEventListener("pointerleave", () => { fig.style.transform = ""; });
    }
  }

  /* ============================================================
     七条专属分镜 + 一条收尾
     ------------------------------------------------------------
     play(L, S, D)：S = 当前显示的段，D = 落位后的段。
     正向 S=左段/D=右段；反向 S=右段/D=左段，因此同一段代码自动镜像。
     ============================================================ */
  let MORPH = null;      // 首屏→01 那条专属转场的复原上下文

  const SCENES = {
    /* 1. 首屏 → 01：深色底像圆一样缩回去 → 只剩 Bus Stop + 3D 模型
       → 模型边转边淡出 → 小车拖黄线从左往右带出 01 的文字
       → 保留的 Bus Stop 落进标题里 bus stop 的位置，原句淡入（文案一字不改） */
    "top>overview": {
      dur: 2200,
      noBg: true,       // 换章由首屏自己的圆收缩完成，不要通用背景幕
      plainUp: true,    // 01 上滑回首屏：交回分页器做普通上移，不播转场
      play(L) {
        const hero = SEC.top;
        const ov = SEC.overview;
        const W = window.innerWidth;

        /* ---- 量真实范围（Range，不用改 HTML 结构） ---- */
        const h1 = $(".bs-hero__title", hero);
        const tNode = [...h1.childNodes]
          .filter((n) => n.nodeType === 3 && /Bus Stop/.test(n.textContent)).pop();
        const rW = document.createRange(); rW.selectNodeContents(tNode);
        const from = rW.getBoundingClientRect();                 // 首屏的 "Bus Stop"

        const h2 = $(".bs-h2", ov);
        const t2 = h2.firstChild;
        const at = t2.textContent.indexOf("bus stop");
        const r2 = document.createRange();
        r2.setStart(t2, at); r2.setEnd(t2, at + 8);
        const ovAbs = topOf(ov);
        const rr = r2.getBoundingClientRect();
        const to = { left: rr.left, top: rr.top + window.scrollY - ovAbs, height: rr.height };

        const rows = [$(".bs-eyebrow", ov), $(".bs-p", ov), ...$$(".bs-law", ov)].filter(Boolean);
        const rowRects = rows.map((n) => {
          const r = R(n);
          return { left: r.left, width: r.width };
        });
        const all = [h2, ...rows];

        /* ---- 首屏：其他字淡掉；深色底剪成一个收缩的圆；模型暂时固定住继续转 ---- */
        hero.classList.add("is-morph");
        document.documentElement.classList.add("bs-hero-morph");
        hero.style.setProperty("--bs-iris", "150%");
        const art = $(".bs-hero__art", hero);
        const artSaved = art.getAttribute("style") || "";
        const ar = R(art);
        Object.assign(art.style, {
          position: "fixed", left: ar.left + "px", top: ar.top + "px",
          width: ar.width + "px", height: ar.height + "px",
          right: "auto", bottom: "auto", transform: "none", zIndex: "44",
        });

        /* 01 的内容先藏起来，由小车一行一行带出 */
        ov.classList.add("is-morphing");

        /* ---- 飞行的 "Bus Stop"：纯视觉克隆，原文案一个字都不动 ---- */
        const word = document.createElement("div");
        word.className = "bs-fly__el bs-fly__word";
        word.textContent = "Bus Stop";
        const cs = getComputedStyle(h1);
        Object.assign(word.style, {
          left: from.left + "px", top: from.top + "px",
          width: from.width + "px", height: from.height + "px",
          lineHeight: from.height + "px", fontSize: cs.fontSize,
          fontWeight: cs.fontWeight, letterSpacing: cs.letterSpacing,
          fontFamily: cs.fontFamily, color: "#fff", transformOrigin: "0 0",
        });
        L.appendChild(word);

        /* ---- 小车 + 车尾黄线（复用左侧索引栏那辆小巴） ---- */
        const busY = from.bottom - 2;   // 紧贴字的下沿，黄线正好落在正文上方
        const busW = 40, busH = 24;
        const travel = W - from.left - busW - 40;
        const bus = document.createElement("div");
        bus.className = "bs-fly__el bs-fly__bus";
        bus.innerHTML = busSVG;
        Object.assign(bus.style, {
          left: from.left + "px", top: busY + "px",
          width: busW + "px", height: busH + "px", opacity: "0",
        });
        L.appendChild(bus);
        const line = document.createElement("div");
        line.className = "bs-fly__el bs-fly__bar";
        Object.assign(line.style, {
          left: from.left + "px", top: (busY + busH / 2 - 1.5) + "px",
          width: travel + "px", height: "3px", transformOrigin: "0 50%", opacity: "0",
        });
        L.appendChild(line);

        const T = { iris: 700, jump: 700, fade0: 700, fade1: 1200,
                    bus0: 700, bus1: 1450, word0: 1450, word1: 1960, end: 2200 };
        const scale = to.height / from.height;
        const dx = to.left - from.left, dy = to.top - from.top;
        const c0 = [255, 255, 255], c1 = [36, 31, 61];

        // 切页是这个转场的骨架，用定时器独立触发：逐帧循环万一被 3D 模型卡住，
        // 也不能把「跳到 01」这一步漏掉（finish 里还有一次同位置的兜底）。
        setTimeout(() => { jumpTo(ovAbs); }, T.jump);

        // 圆心＝屏幕正中。字在左侧，圆边扫过它的时候正好把字从白翻成深墨，
        // 否则深色底一退，白字就直接糊在浅底上了。
        const H0 = window.innerHeight;
        const ref = Math.sqrt(W * W + H0 * H0) / Math.SQRT2;
        const nx = Math.max(from.left, Math.min(W / 2, from.left + from.width));
        const ny = Math.max(from.top, Math.min(H0 / 2, from.top + from.height));
        const dist = Math.hypot(W / 2 - nx, H0 / 2 - ny);
        const t0 = performance.now();
        const tick = (now) => {
          if (!hero.classList.contains("is-morph")) return;    // 已被 cleanup，停
          const el = now - t0;

          /* ① 深色底像圆一样缩回去（圆心＝屏幕正中） */
          const pi = clamp01(el / T.iris);
          // 150% 覆盖全屏 → 0%：往屏幕正中收
          const pct = 150 * Math.pow(1 - pi, 3);
          hero.style.setProperty("--bs-iris", pct.toFixed(2) + "%");

          /* ② 圆边扫过这个字的同时，字由白翻成深墨（浅底上始终看得清） */
          const R = (pct / 100) * ref;
          const cover = clamp01((R - dist) / 55 + 0.5);   // 1＝还在深色圆里
          word.style.color = "rgb(" + c1.map((v, i) => Math.round(v + (c0[i] - v) * cover)).join(",") + ")";

          /* ③ 3D 模型一直在转，只是透明度慢慢到 0 */
          art.style.opacity = String(1 - clamp01((el - T.fade0) / (T.fade1 - T.fade0)));

          /* ④ 小车从左往右开，车尾黄线跟着长；线扫到哪，那一行就显到哪 */
          const pb = clamp01((el - T.bus0) / (T.bus1 - T.bus0));
          const bx = from.left + travel * pb;
          const bo = clamp01(pb * 14) * clamp01((1 - pb) * 14);
          bus.style.transform = "translateX(" + (travel * pb).toFixed(1) + "px)";
          bus.style.opacity = bo.toFixed(3);
          line.style.transform = "scaleX(" + pb.toFixed(4) + ")";
          line.style.opacity = bo.toFixed(3);
          rows.forEach((n, i) => {
            const q = rowRects[i];
            const vis = clamp01((bx - q.left) / Math.max(1, q.width));
            // 量化到 2% 一档：mask-image 每帧重写会拖累主线程（3D 模型同时在渲染）
            const step = Math.round(vis * 50);
            if (n.__vstep === step) return;
            n.__vstep = step;
            if (vis <= 0) { n.style.opacity = "0"; return; }
            n.style.opacity = "1";
            if (vis >= 1) {
              n.style.maskImage = ""; n.style.webkitMaskImage = "";
            } else {
              const stop = (step * 2).toFixed(2);
              const soft = Math.max(0, step * 2 - 5).toFixed(2);
              const m = "linear-gradient(90deg,#000 0%,#000 " + soft + "%,rgba(0,0,0,0) " + stop + "%)";
              n.style.maskImage = m; n.style.webkitMaskImage = m;
            }
          });

          /* ⑤ 底色此刻已经一致（跳页由定时器在 700ms 完成，这里只管视觉） */

          /* ⑥ 最后一拍：字落进标题里 bus stop 的位置，然后交叉淡入原句 */
          const pw = clamp01((el - T.word0) / (T.word1 - T.word0));
          const pe = 1 - Math.pow(1 - pw, 3);
          word.style.transform = "translate(" + (dx * pe).toFixed(1) + "px," +
            (dy * pe).toFixed(1) + "px) scale(" + (1 + (scale - 1) * pe).toFixed(4) + ")";
          const pfOut = clamp01((el - T.word1) / 80);
          const pfIn = clamp01((el - (T.word1 + 80)) / 160);
          word.style.opacity = String(1 - pfOut);
          h2.style.opacity = String(pfIn);

          if (el < T.end) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);

        MORPH = { hero, ov, art, artSaved, all, word };
      },
      cleanup() {
        if (!MORPH) return;
        const m = MORPH; MORPH = null;
        m.hero.classList.remove("is-morph");
        m.hero.style.removeProperty("--bs-iris");
        document.documentElement.classList.remove("bs-hero-morph");
        m.art.setAttribute("style", m.artSaved);
        // 先摘 is-live：否则一摘 is-morphing，通用 bsRise 会立刻从头重播一次
        m.ov.classList.remove("is-live");
        m.all.forEach((n) => {
          n.style.opacity = "1"; n.style.transform = "none"; n.style.clipPath = "none";
          n.style.maskImage = ""; n.style.webkitMaskImage = "";
          delete n.__vstep;
          n.getAnimations().forEach((a) => a.cancel());
        });
        m.ov.classList.remove("is-morphing");
      },
    },

    /* 2. 四条 law 收成四个圆点，飞到四个统计数字上 */
    "overview>problem": {
      dur: 1250,
      play(L, S, D) {
        const src = $$(".bs-law", S);
        const dst = $$(".bs-stats > div", D);
        for (let i = 0; i < 4; i++) {
          if (!src[i] || !dst[i]) continue;
          const r = R(src[i]);
          const n = prop(L, "bs-fly__dot", { left: r.left + 8, top: r.top + r.height / 2 - 6, width: 12, height: 12 });
          const t = landingRect(dst[i], D);
          n.animate(
            [{ transform: "translate(0,0) scale(1)", opacity: 1 },
             { transform: `translate(${t.left + 4 - (r.left + 8)}px, ${t.top + 8 - (r.top + r.height / 2 - 6)}px) scale(0.5)`, opacity: 0.1 }],
            { duration: 760, delay: i * 90, easing: POP, fill: "both" }
          );
        }
      },
    },

    /* 3. 统计数字变成四支箭头，落到四条 insight 上 */
    "problem>direction": {
      dur: 1300,
      play(L, S, D) {
        const src = $$(".bs-stats > div", S);
        const dst = $$(".bs-insights li", D);
        for (let i = 0; i < 4; i++) {
          if (!src[i] || !dst[i]) continue;
          const r = R(src[i]);
          const n = prop(L, "bs-fly__bar", { left: r.left, top: r.top + 12, width: r.width * 0.7, height: 3 });
          const t = landingRect(dst[i], D);
          const dx = t.left - r.left;
          const dy = t.top + 14 - (r.top + 12);
          n.animate(
            [{ transform: "translate(0,0) rotate(0deg)", opacity: 1 },
             { transform: `translate(${dx * 0.4}px, ${dy * 0.25}px) rotate(-32deg)`, opacity: 0.9, offset: 0.5 },
             { transform: `translate(${dx}px, ${dy}px) rotate(0deg)`, opacity: 0.1 }],
            { duration: 820, delay: i * 100, easing: EASE, fill: "both" }
          );
        }
      },
    },

    /* 4. 保留下来的想法收拢成卡，飞到 3D 模型框 */
    "direction>product": {
      dur: 1400,
      play(L, S, D) {
        const kept = $$(".bs-kill__item:not(.bs-kill__item--out)", S);
        const dstEl = $(".bs-model3d", D) || $(".bs-prod", D);
        if (!kept.length || !dstEl) return;
        const t = landingRect(dstEl, D);
        kept.slice(0, 7).forEach((el, i) => {
          const r = R(el);
          const n = prop(L, "bs-fly__tile", { left: r.left, top: r.top, width: r.width, height: r.height },
            { background: "rgba(255,255,255,.94)" });
          n.animate(
            [{ transform: "translate(0,0) scale(1)", opacity: 1 },
             { transform: `translate(${t.left + t.width / 2 - (r.left + r.width / 2)}px, ${t.top + t.height / 2 - (r.top + r.height / 2)}px) scale(0.06)`, opacity: 0 }],
            { duration: 800, delay: i * 65, easing: POP, fill: "both" }
          );
        });
      },
    },

    /* 5. 从模型中心炸出五个零件，飞进五个 tab（小车在这里卸货） */
    "product>elements": {
      dur: 1650,
      play(L, S, D) {
        const srcEl = $(".bs-model3d", S) || $(".bs-prod", S) || $(".bs-wrap", S);
        const tabs = $$(".bs-el__tab", D);
        if (!srcEl || !tabs.length) return;
        const r = R(srcEl);
        if (ROUTE.bus) ROUTE.bus.classList.add("is-lit");
        tabs.forEach((tab, i) => {
          const t = landingRect(tab, D);
          const n = prop(L, "bs-fly__tile", {
            left: r.left + r.width / 2 - 16,
            top: r.top + r.height / 2 - 16,
            width: 32, height: 32,
          }, { background: "#ffc93c", borderRadius: "8px" });
          n.animate(
            [{ transform: "translate(0,0) scale(0.6) rotate(0deg)", opacity: 0 },
             { transform: `translate(${(i - 2) * 46}px, ${-58 - (i % 2) * 26}px) scale(1) rotate(${(i - 2) * 16}deg)`, opacity: 1, offset: 0.38 },
             { transform: `translate(${t.left + t.width / 2 - (r.left + r.width / 2)}px, ${t.top + t.height / 2 - (r.top + r.height / 2)}px) scale(0.28) rotate(0deg)`, opacity: 0 }],
            { duration: 940, delay: i * 90, easing: EASE, fill: "both" }
          );
          setTimeout(() => { tab.animate([{ transform: "scale(1)" }, { transform: "scale(1.08)" }, { transform: "scale(1)" }], { duration: 380, easing: POP }); }, 940 + i * 90);
        });
      },
    },

    /* 6. 五个 tab 收拢，围出海报的方框 */
    "elements>poster": {
      dur: 1350,
      play(L, S, D) {
        const tabs = $$(".bs-el__tab", S);
        const fig = $(".bs-poster__fig", D);
        if (!tabs.length || !fig) return;
        const t = landingRect(fig, D);
        const pts = [
          { x: t.left, y: t.top }, { x: t.left + t.width, y: t.top },
          { x: t.left + t.width, y: t.top + t.height }, { x: t.left, y: t.top + t.height },
          { x: t.left + t.width / 2, y: t.top + t.height / 2 },
        ];
        tabs.forEach((tab, i) => {
          const r = R(tab);
          const n = prop(L, "bs-fly__dot", { left: r.left + 6, top: r.top + 6, width: 10, height: 10 },
            { background: "#7469b6" });
          n.animate(
            [{ transform: "translate(0,0)", opacity: 1 },
             { transform: `translate(${pts[i].x - (r.left + 6)}px, ${pts[i].y - (r.top + 6)}px)`, opacity: 0.2 }],
            { duration: 780, delay: i * 70, easing: EASE, fill: "both" }
          );
        });
      },
    },

    /* 7. 海报向上卷起，露出五张 issue 卡 */
    "poster>issues": {
      dur: 1250,
      play(L, S, D) {
        const fig = $(".bs-poster__fig", S) || $(".bs-poster", S);
        const issues = $$(".bs-issue", D);
        if (fig) {
          const r = R(fig);
          const cover = prop(L, "bs-fly__tile", { left: r.left, top: r.top, width: r.width, height: r.height },
            { background: "#f7f5fc", transformOrigin: "50% 100%" });
          cover.animate(
            [{ transform: "scaleY(1)", opacity: 1 }, { transform: "scaleY(0.02)", opacity: 0 }],
            { duration: 720, easing: EASE, fill: "both" }
          );
        }
        issues.slice(0, 5).forEach((n, i) => {
          n.animate(
            [{ opacity: 0, transform: "translateY(18px)" }, { opacity: 1, transform: "none" }],
            { duration: 420, delay: 380 + i * 90, easing: EASE, fill: "both" }
          );
        });
      },
    },
  };

  /* ============================================================
     统一调度：遮住上一段 → 播专属分镜 → 落位 → 复原 → 解锁
     ============================================================ */
  let busy = false;

  function run(fromSec, toSec, dir) {
    const key = dir > 0 ? fromSec.id + ">" + toSec.id : toSec.id + ">" + fromSec.id;
    const scene = SCENES[key];
    const landSec = toSec;
    busy = true;

    const finish = () => {
      try {
        if (scene && scene.cleanup) scene.cleanup();
        jumpTo(topOf(landSec));
        $$(".bs-fly").forEach((n) => n.remove());
        ORDER.forEach((s) => s.classList.remove("is-veiled", "is-dim"));
        $$(".bs-issue").forEach((n) => {
          n.getAnimations().forEach((a) => a.cancel());
          n.style.opacity = ""; n.style.transform = "";
        });
        $$(".bs-el__tab").forEach((n) => { n.getAnimations().forEach((a) => a.cancel()); });
        if (ROUTE.bus) ROUTE.bus.classList.remove("is-lit");
        if (ROUTE.sync) ROUTE.sync();
      } catch (e) {
        console.warn("[bs-motion] cleanup failed:", e);
      } finally {
        busy = false;                 // 清理出错也不能把页面卡在锁定态
      }
    };

    if (!scene) { finish(); return true; }   // 没配分镜的边界：直接落位，不套模板

    const [leftId, rightId] = key.split(">");
    const S = dir > 0 ? SEC[leftId] : SEC[rightId];   // 当前显示的那一段
    const D = dir > 0 ? SEC[rightId] : SEC[leftId];   // 落位后的那一段
    const L = makeLayer();

    // 换章靠背景色推进：一层和目标段同色的幕慢慢盖上来，
    // 上一段的内容是被这层幕"读淡"的，不是啪地整块隐藏。
    // 幕放在飞行层最底，道具始终在它上面。
    if (!scene.noBg) {
      const bg = document.createElement("div");
      bg.className = "bs-fly__bg";
      bg.style.background = getComputedStyle(landSec).backgroundColor || "#f7f5fc";
      L.appendChild(bg);
      bg.animate([{ opacity: 0 }, { opacity: 1 }],
        { duration: Math.round(scene.dur * 0.74), easing: "ease", fill: "both" });
    }

    try {
      scene.play(L, S, D);
    } catch (e) {
      console.warn("[bs-motion] scene failed:", key, e);
    }
    let done = false;
    const finishOnce = () => { if (done) return; done = true; finish(); };
    setTimeout(finishOnce, scene.dur);
    setTimeout(finishOnce, scene.dur + 900);   // 主线程被 3D 模型占住时的兜底解锁
    return true;
  }

  window.BS_MOTION = {
    busy: () => busy,
    down(cur, next) {
      if (busy || !cur || !next) return false;
      return run(cur, next, 1);
    },
    up(cur, prev) {
      if (busy || !cur || !prev) return false;
      const sc = SCENES[prev.id + ">" + cur.id];
      if (sc && sc.plainUp) return false;   // 01 → 首屏：直接上移，不播任何转场
      return run(cur, prev, -1);
    },
    route: ROUTE,
  };

  // busstop.js 会在 DOMContentLoaded 里重写 #bsIndex 的 innerHTML，
  // 所以要等它跑完再把小车/站点挂上去；再补一个监听器兜底（索引栏若被重建会自动补回）。
  function boot() {
    initRoute();
    initAmbient();
    const rail = $("#bsIndex");
    if (rail && window.MutationObserver) {
      new MutationObserver(() => {
        if (!rail.querySelector(".bs-index__bus")) {
          const bus = document.createElement("span");
          bus.className = "bs-index__bus";
          bus.innerHTML = busSVG;
          bus.title = "You are here";
          rail.appendChild(bus);
          ROUTE.bus = bus;
        }
        if (ROUTE.sync) ROUTE.sync();
      }).observe(rail, { childList: true });
    }
  }
  const later = () => setTimeout(boot, 0);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", later);
  else later();
})();
