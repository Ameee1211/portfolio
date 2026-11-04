/* ============================================================
   Auto-Signaled Bus Stop — 动效层（仅电脑端）
   ------------------------------------------------------------
   · 不改任何文案、图片、海报、3D 模型、既有 tab / 滑块 / 影片交互
   · 只在 >=1024px 且 hover:hover 的桌面端生效
   · 通过 window.BS_MOTION 接进共用的 initSectionPager
   · 每条板块边界一套专属分镜；正向播专属，反向镜像倒放
   · 例外：01 ↔ 02 不播任何转场，正反向都走分页器自带的普通 pin
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
  let CARD = null;       // 03↔04 整屏卡片切换的复原上下文

  const SCENES = {
    /* 1. 首屏 → 01：深色底整屏淡成浅色 → 大号小巴从屏幕最左开出
       → 车尾擦掉首屏标题、长出 01 标题 → 车轮下的黄线带出标题下方所有内容
       → 3D 模型在小车开过标题时开始淡出 */
    "top>overview": {
      dur: 2600,
      noBg: true,       // 换章由首屏自己整屏淡色完成，不要通用背景幕
      plainUp: true,    // 01 上滑回首屏：交回分页器做普通上移，不播转场
      play(L) {
        const hero = SEC.top;
        const ov = SEC.overview;
        const W = window.innerWidth;
        const ovAbs = topOf(ov);

        /* ---- 量：首屏标题 / 01 标题与它下面的每一行 ---- */
        const h1 = $(".bs-hero__title", hero);
        const h1r = R(h1);
        const h1cs = getComputedStyle(h1);
        const h2 = $(".bs-h2", ov);
        const eyebrow = $(".bs-eyebrow", ov);
        const rows = [eyebrow, h2, $(".bs-p", ov), ...$$(".bs-law", ov)].filter(Boolean);
        // 此刻还没跳页，把 scrollY 的差补上 = 落位后的视口坐标
        const landing = (n) => {
          const r = R(n);
          return { left: r.left, top: r.top + window.scrollY - ovAbs, width: r.width, height: r.height };
        };
        const rects = rows.map(landing);
        const h2r = landing(h2);
        const pRect = landing($(".bs-p", ov));

        /* ---- 首屏：整屏深色淡掉（不是圆，也不会有黑块），其他字消失，模型固定住继续转 ---- */
        hero.classList.add("is-morph");
        document.documentElement.classList.add("bs-hero-morph");
        const art = $(".bs-hero__art", hero);
        const artSaved = art.getAttribute("style") || "";
        const ar = R(art);
        Object.assign(art.style, {
          position: "fixed", left: ar.left + "px", top: ar.top + "px",
          width: ar.width + "px", height: ar.height + "px",
          right: "auto", bottom: "auto", transform: "none", zIndex: "44",
        });
        ov.classList.add("is-morphing");   // 01 的内容先藏起来，等小巴带出来

        /* ---- 首屏标题的视觉克隆（真实 h1 已被 is-morph 隐掉；innerHTML 原样复制） ---- */
        const oldTitle = document.createElement("div");
        oldTitle.className = "bs-fly__el bs-fly__h1";
        oldTitle.innerHTML = h1.innerHTML;
        Object.assign(oldTitle.style, {
          left: h1r.left + "px", top: h1r.top + "px",
          width: h1r.width + "px", height: h1r.height + "px",
          fontSize: h1cs.fontSize, fontWeight: h1cs.fontWeight,
          letterSpacing: h1cs.letterSpacing, lineHeight: h1cs.lineHeight,
          fontFamily: h1cs.fontFamily, color: "#fff",
        });
        L.appendChild(oldTitle);

        /* ---- 大号小巴：高度 = 01 标题两行字（91px），宽按 SVG 36:22 比例 ---- */
        const busH = h2r.height;                    // 91 = 01 标题两行字加起来
        const busW = Math.round(busH * 36 / 22);    // 149
        const busTop = h2r.top;                     // 和 01 标题同一行，正好完全盖住那两行
        // 黄线落在「标题底 → 正文顶」的空白中间，不再划到 your behalf. 这两个词
        const gapY = (h2r.top + h2r.height + pRect.top) / 2;
        const travel = W;                           // 车尾从 0 开到屏幕最右
        // 黄线不从屏幕最左画起：左边缘那条是索引栏，线划过去会压在导航文字上。
        // 起点改成第一板块内容的左边缘（188），线只在车尾越过它之后才出现。
        const lineLeft = h2r.left;
        const lineSpan = W - lineLeft;
        const bus = document.createElement("div");
        bus.className = "bs-fly__el bs-fly__bus";
        bus.innerHTML = busSVG;
        Object.assign(bus.style, {
          left: "0px", top: busTop + "px", width: busW + "px", height: busH + "px",
          opacity: "0",
        });
        L.appendChild(bus);
        const line = document.createElement("div");
        line.className = "bs-fly__el bs-fly__bar";
        Object.assign(line.style, {
          left: lineLeft + "px", top: (gapY - 1.5) + "px", width: lineSpan + "px", height: "3px",
          transformOrigin: "0 50%", opacity: "0",
        });
        L.appendChild(line);

        const T = { bg: 450, jump: 460, bus0: 460, bus1: 2260,
                    fade0: 620, fade1: 1320, lineOut0: 2260, lineOut1: 2520, end: 2600 };
        const c0 = [255, 255, 255], c1 = [36, 31, 61];

        // 切页独立定时触发：逐帧循环万一被 3D 模型卡住，也不能漏掉（finish 里还有同位置兜底）
        setTimeout(() => { jumpTo(ovAbs); }, T.jump);

        const t0 = performance.now();
        const tick = (now) => {
          if (!hero.classList.contains("is-morph")) return;    // 已被 cleanup，停
          const el = now - t0;

          /* ① 旧标题随着背景变浅，由白翻成深墨（浅底上才看得见、才谈得上被擦掉） */
          // 前半段还是深底就保持白字，等底色差不多浅了再快速翻深墨：
          // 线性翻色会有一段灰字压在灰底上，整整 0.2s 看不清
          const pc = clamp01((el - 140) / 200);
          oldTitle.style.color = "rgb(" + c0.map((v, i) => Math.round(v + (c1[i] - v) * pc)).join(",") + ")";

          /* ② 3D 模型一直在转，小车开过标题时开始淡到 0 */
          art.style.opacity = String(1 - clamp01((el - T.fade0) / (T.fade1 - T.fade0)));

          /* ③ 小巴从屏幕最左往右开；车尾拖一条黄线，最后淡掉 */
          const pb = clamp01((el - T.bus0) / (T.bus1 - T.bus0));
          const edge = travel * pb;                       // 车尾 x
          bus.style.transform = "translateX(" + edge.toFixed(1) + "px)";
          bus.style.opacity = pb >= 1 ? "0" : Math.min(1, pb * 30).toFixed(3);
          const lineFade = 1 - clamp01((el - T.lineOut0) / (T.lineOut1 - T.lineOut0));
          // 车尾还在内容左边缘以左时，线长为 0（左侧索引栏那段完全没有线）
          const lineVis = clamp01((edge - lineLeft) / lineSpan);
          line.style.transform = "scaleX(" + lineVis.toFixed(4) + ")";
          line.style.opacity = (Math.min(1, lineVis * 20) * lineFade).toFixed(3);

          /* ④ 车尾擦掉首屏标题：车尾右侧还是旧标题 */
          const cut = Math.max(0, Math.min(h1r.width, edge - h1r.left));
          oldTitle.style.clipPath = "inset(0 0 0 " + cut.toFixed(1) + "px)";

          /* ⑤ 车尾左侧长出 01 的标题和标题下面的所有内容（线扫到哪显到哪） */
          rows.forEach((n, i) => {
            const q = rects[i];
            const vis = clamp01((edge - q.left) / Math.max(1, q.width));
            const step = Math.round(vis * 50);   // 量化到 2%，别每帧重写 mask
            if (n.__vstep === step) return;
            n.__vstep = step;
            if (vis <= 0) { n.style.opacity = "0"; return; }
            n.style.opacity = "1";
            if (vis >= 1) {
              n.style.maskImage = ""; n.style.webkitMaskImage = "";
            } else {
              const stop = (step * 2).toFixed(2), soft = Math.max(0, step * 2 - 5).toFixed(2);
              const m = "linear-gradient(90deg,#000 0%,#000 " + soft + "%,rgba(0,0,0,0) " + stop + "%)";
              n.style.maskImage = m; n.style.webkitMaskImage = m;
            }
          });

          if (el < T.end) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);

        MORPH = { hero, ov, art, artSaved, rows };
      },
      cleanup() {
        if (!MORPH) return;
        const m = MORPH; MORPH = null;
        m.hero.classList.remove("is-morph");
        document.documentElement.classList.remove("bs-hero-morph");
        m.art.setAttribute("style", m.artSaved);
        // 先摘 is-live：否则一摘 is-morphing，通用 bsRise 会立刻从头重播一次
        m.ov.classList.remove("is-live");
        m.rows.forEach((n) => {
          n.style.opacity = "1"; n.style.transform = "none"; n.style.clipPath = "none";
          n.style.maskImage = ""; n.style.webkitMaskImage = "";
          delete n.__vstep;
          n.getAnimations().forEach((a) => a.cancel());
        });
        m.ov.classList.remove("is-morphing");
      },
    },

    /* 2. 01 ↔ 02：不要专属转场，正反向都只用最普通的页面 pin
       （用户 2026-11-04 指定：这一段就是用户滑一下、页面直接往下移到 02，
        不管滚轮滚多少都直接到 02；回程同样。不要圆点飞、不要背景幕、不要吞滚轮。）
       标 plain 后 down/up 会返回 false，交回共用分页器走它自己的 go() 平滑滚动。 */
    "overview>problem": { plain: true },

    /* 3. 02 ↔ 03：跟 01↔02 一样，正反两个方向都是最普通的页面 pin，
       不播「四个统计数字变箭头飞到四条 insight」那条分镜。
       落位到 03 顶之后，板块内的四次下滑由 STAGE 接管。 */
    "problem>direction": { plain: true },

    /* 4. 03 ↔ 04：整屏卡片 3D 切换（参考 GSAP Effect 031「Scrolling sections」）
       · 03 卡片钉在顶部，绕 X 轴向后倒退，压成一条带透视的窄梯形
       · 04 卡片从下方平推上来铺满（它是平的，不变形）
       · 回程整段倒放。两张卡片就是真实的 section，不克隆、不搬 DOM，
         3D 模型 / 影片 / 滑杆 / 原型按钮全都照常可用
       · 一次下滑完整播一遍（不做 scrub），结束后由 finish() 落位 */
    "direction>product": {
      dur: 1150,
      noBg: true,          // 卡片自带背景，不要通用背景幕
      play(L, S, D, dir) {
        const A = SEC.direction;    // 03 卡片（浅色）
        const B = SEC.product;      // 04 卡片（深紫）
        const main = $("#bsMain");
        const H = A.offsetHeight;   // 04 在文档流里距 03 顶的距离
        const savedA = A.getAttribute("style") || "";
        const savedB = B.getAttribute("style") || "";
        // 索引栏是常驻 UI，别被 3D 卡片的斜边切成两半
        const rail = $("#bsIndex");
        const savedRail = rail ? rail.style.zIndex : null;
        if (rail) rail.style.zIndex = "50";
        // 卡片退场 / 推进时露出的深色底，就是链接里那圈黑底
        main.classList.add("bs-cardmode");
        A.style.transformOrigin = "50% 0%";
        /* ★ 27" / 高 DPI 屏上 03 会「像电视坏了一样一条条闪」：
           整屏 section 含 212 个 inline-block 词 span，做 3D 变换时会被光栅成一张
           超大纹理，GPU 按 tile 分块重绘，旋转到接近 90° 时文字行压到亚像素，
           tile 边界就出现横条撕裂；15" 纹理小、不分块，所以看不出来。
           三重防御：① 不提前 will-change（避免预分配超大合成层）
                     ② 内容在明显压扁前淡掉，之后 GPU 只转一张纯色矩形
                     ③ 最大角度 78° 而不是 88°，避开极端透视压缩。
           内容淡出用 CSS 变量挂在 A 上，cleanup 恢复 A 的 style 时会自动清掉。 */
        A.style.backfaceVisibility = "hidden";

        const setP = (p) => {
          A.style.transform = "perspective(1400px) rotateX(" + (-78 * p).toFixed(2) + "deg)";
          B.style.transform = "translateY(" + (-H * p).toFixed(1) + "px)";
          A.style.setProperty("--bs-card-fade", (1 - clamp01((p - 0.08) / 0.3)).toFixed(3));
        };
        setP(dir > 0 ? 0 : 1);
        if (dir < 0) {
          // 回程：先把视觉摆成「正向末帧」（04 铺满、03 压扁），再瞬时把滚动位置
          // 换回 03 顶。B 有 translateY(-H) 补偿，这一下用户完全看不见。
          jumpTo(topOf(A));
        }
        void A.offsetWidth;

        const t0 = performance.now();
        const tick = (now) => {
          if (!main.classList.contains("bs-cardmode")) return;   // cleanup 已跑，停
          const q = clamp01((now - t0) / 1150);
          const e = q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;
          setP(dir > 0 ? e : 1 - e);
          if (q < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        CARD = { A, B, main, savedA, savedB, rail, savedRail };
      },
      cleanup() {
        if (!CARD) return;
        const c = CARD; CARD = null;
        c.main.classList.remove("bs-cardmode");
        c.A.setAttribute("style", c.savedA);
        c.B.setAttribute("style", c.savedB);
        if (c.rail) c.rail.style.zIndex = c.savedRail || "";
        // 回程落位与 play 开头的补偿是同一个滚动位置，浏览器不会再派发 scroll，
        // 索引栏会一直留在 04 深色板块的反白态（白字糊在 03 浅底上）。补一次同步。
        window.dispatchEvent(new Event("scroll"));
      },
    },

    /* 5. 04 ↔ 05：和 01 ↔ 02 一样，正反两个方向都是最普通的页面 pin */
    "product>elements": { plain: true },

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
      scene.play(L, S, D, dir);   // 第 4 个参数给 03↔04 卡片分镜判断正/反向
    } catch (e) {
      console.warn("[bs-motion] scene failed:", key, e);
    }
    let done = false;
    const finishOnce = () => { if (done) return; done = true; finish(); };
    setTimeout(finishOnce, scene.dur);
    setTimeout(finishOnce, scene.dur + 900);   // 主线程被 3D 模型占住时的兜底解锁
    return true;
  }

  /* ============================================================
     03「Choosing a direction」：钉在一屏，四次下滑逐批收紧
     ------------------------------------------------------------
     参考 GSAP Effect 097「Tightening word lines」：每一行先被词距
     拉得很开，再逐行收紧回自然宽度；文字始终清晰、不淡出。
     用户指定的两点不同：
       · 一次下滑 = 完整收紧一次并永久固定在原位（不做 scrub 来回变）
       · 文字留在 03 板块原本的位置，不随页面滚走
     内容一字不改：拆词只发生在运行时，最终布局与原来一致。
     ============================================================ */
  const STAGE = {
    sec: SEC.direction,
    active: false, hidden: false, step: 0,
    // full = 03 是从 04 卡片切回来的：四批内容一次性全在，不再分四次拉出来，
    // 再下滑就直接卡片切回 04。从 02 正常下来时 full=false，仍走四次分段。
    full: false,
    lockUntil: 0, suppressUntil: 0,
    words: [], solids: [],
  };
  const TW_EASE = "transform .82s cubic-bezier(0.16,0.84,0.28,1), opacity .5s ease";

  function splitWords(host) {
    const tw = document.createTreeWalker(host, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    const texts = [];
    while (tw.nextNode()) texts.push(tw.currentNode);
    const out = [];
    texts.forEach((t) => {
      const frag = document.createDocumentFragment();
      t.nodeValue.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        const s = document.createElement("span");
        s.className = "bs-tw";
        s.textContent = part;
        frag.appendChild(s);
        out.push(s);
      });
      t.parentNode.replaceChild(frag, t);
    });
    return out;
  }

  function stageBuild() {
    const ch = [...STAGE.sec.querySelector(".bs-wrap").children];
    // ch = [eyebrow, h2, p1, ol, p2, kill, p3]
    const groups = [
      { b: 1, nodes: [ch[1], ch[2]] },                 // 大标题 + 导语
      { b: 2, nodes: $$("li > span", ch[3]) },         // 01/02/03/04 四条
      { b: 3, nodes: [ch[4]] },                        // Crazy 8s 那段
      { b: 4, nodes: [ch[6]] },                        // 最后一段
    ];
    groups.forEach((g) => g.nodes.forEach((host) => {
      // 两条两列的 insight 是窄列，摊开幅度要收小，否则左列末尾会撞到右列的编号
      splitWords(host).forEach((el) => STAGE.words.push({ el, host, b: g.b, tight: g.b === 2, line: 0, dx: 0 }));
    }));
    $$("li > b", ch[3]).forEach((el) => STAGE.solids.push({ el, b: 2, idx: 0, kind: "num" }));
    $$(".bs-kill__item", ch[5]).forEach((el) => STAGE.solids.push({ el, b: 4, idx: 0, kind: "tag" }));
  }

  // 量出每个词「自然位置」与「等间距摊开位置」的差，按行分组、逐行编号
  function stageMeasure() {
    STAGE.words.forEach((w) => {
      w.el.style.transition = "none";
      w.el.style.transform = "none";
      w.el.style.opacity = "";
    });
    STAGE.solids.forEach((s) => {
      s.el.style.transition = "none";
      s.el.style.transform = "none";
      s.el.style.opacity = "";
    });
    void STAGE.sec.offsetWidth;
    for (let b = 1; b <= 4; b++) {
      const lines = new Map();
      STAGE.words.filter((w) => w.b === b).forEach((w) => {
        const key = Math.round(w.el.getBoundingClientRect().top / 6);  // 6px 容差，同行词归一组
        if (!lines.has(key)) lines.set(key, []);
        lines.get(key).push(w);
      });
      [...lines.entries()].sort((a, c) => a[0] - c[0]).forEach(([, row], li) => {
        const hr = row[0].host.getBoundingClientRect();
        const first = row[0].el.getBoundingClientRect();
        const last = row[row.length - 1].el.getBoundingClientRect();
        const naturalW = Math.max(1, last.right - first.left);
        // 左端第一个词不动，后面的词按序逐个往右推：词距均匀拉大、
        // dx 严格递增（不会越位挤成一团），也不会往左撞到 01/02/03/04 编号。
        // 展开量按「这一行还空多少」算，给个下限保证短行也看得出词距被拉开。
        const gap0 = Math.max(14, ((hr.width - naturalW) / Math.max(1, row.length - 1)) * 1.25);
        const gap = row[0].tight ? Math.min(gap0, 8) : gap0;
        row.forEach((w, i) => {
          w.dx = Math.round(i * gap);
          w.line = li;
        });
      });
      STAGE.solids.filter((s) => s.b === b).forEach((s, i) => { s.idx = i; });
    }
  }

  // 回到「只有 03 — Choosing a direction」：内容全部占位但隐藏，词处于拉宽态
  function stageReset() {
    stageMeasure();
    STAGE.sec.classList.add("is-staged");
    STAGE.words.forEach((w) => {
      w.el.style.transition = "none";
      w.el.style.transform = "translateX(" + w.dx + "px)";
      w.el.style.opacity = "0";
    });
    STAGE.solids.forEach((s) => {
      s.el.style.transition = "none";
      // 编号只微微错开（不撞正文首个词）；标签原地轻微变宽，不横向挤到邻居
      s.el.style.transform = s.kind === "num" ? "translateX(-8px)" : "scaleX(1.08)";
      s.el.style.opacity = "0";
    });
    void STAGE.sec.offsetWidth;
    STAGE.step = 0;
    STAGE.hidden = true;
    STAGE.active = false;
    STAGE.full = false;
  }

  // 04 → 03 回程：03 直接显示完整信息，不播收紧、不需要再下滑四次
  function stageShowAll() {
    STAGE.words.forEach((w) => {
      w.el.style.transition = "none";
      w.el.style.transform = "none";
      w.el.style.opacity = "1";
    });
    STAGE.solids.forEach((s) => {
      s.el.style.transition = "none";
      s.el.style.transform = "none";
      s.el.style.opacity = "1";
    });
    void STAGE.sec.offsetWidth;
    STAGE.step = 4;
    STAGE.full = true;
    STAGE.hidden = false;
    STAGE.active = true;
    STAGE.suppressUntil = 0;
  }

  // 第 k 批：逐行（列表/标签逐项）收紧到自然排版，然后永久固定
  function stageReveal(k) {
    const ws = STAGE.words.filter((w) => w.b === k);
    const ss = STAGE.solids.filter((s) => s.b === k);
    ws.forEach((w) => {
      w.el.style.transition = TW_EASE;
      w.el.style.transitionDelay = (w.line * 0.085).toFixed(3) + "s";
    });
    ss.forEach((s) => {
      s.el.style.transition = TW_EASE;
      s.el.style.transitionDelay = (s.idx * 0.055).toFixed(3) + "s";
    });
    void STAGE.sec.offsetWidth;    // 让浏览器先记住「拉宽+透明」这一帧
    ws.forEach((w) => { w.el.style.transform = "none"; w.el.style.opacity = "1"; });
    ss.forEach((s) => { s.el.style.transform = "none"; s.el.style.opacity = "1"; });
    STAGE.step = k;
  }

  function stageLeave() {
    STAGE.active = false;
    STAGE.hidden = false;
    STAGE.suppressUntil = performance.now() + 900;
    STAGE.sec.classList.remove("is-staged");
  }

  function stageCheck() {
    if (busy) return;               // 卡片切换播放中不做任何激活 / 重置
    const now = performance.now();
    if (now < STAGE.suppressUntil) return;
    const dt = topOf(STAGE.sec);
    const y = window.scrollY;
    const vh = window.innerHeight;
    if (STAGE.full) {
      STAGE.active = Math.abs(y - dt) <= 6;   // 完整态：只管钉不钉住，绝不再 reset 隐藏
      return;
    }
    if (STAGE.active) {
      if (Math.abs(y - dt) > vh * 0.55) stageLeave();   // 被索引点击/拖动带走，别锁死
      return;
    }
    // 03 已基本滚出视口时静默重置：用户看不到内容消失，下次进来又是只有 eyebrow
    if (!STAGE.hidden && (y < dt - vh * 0.6 || y > dt + vh * 0.6)) stageReset();
    if (Math.abs(y - dt) <= 6 && now > STAGE.suppressUntil) {
      if (!STAGE.hidden) stageReset();
      STAGE.active = true;
    }
  }

  // 当前板块还有多少内容没滚到（板块比视口高时 > 0）。
  // 15" 笔记本 1366×768 上 02 / 03 都比视口高约 140px，那 140px 正好是
  // 用户想看的最底部信息；27" 上 room=0，一整页就能看全。
  const roomLeft = (sec) =>
    Math.max(0, clampY(topOf(sec) + sec.offsetHeight - window.innerHeight) - window.scrollY);

  /* ============================================================
     ★ 用户设定的全站滚动铁律（2026-11-04，明确要求「一定要记住」）：
       屏幕放不下一个板块时，用户在这个板块里不管一次滚轮滑得多大、
       连续多少格，都最多只能滑到「看见这个板块最底部的文字」；
       必须停手、再滑一次，才允许切到下一个板块。
       绝不允许「猛滑一下」连带着把翻页也做掉（有些用户习惯滚轮拨很大一下）。
       用户 2026-11-04 追加：**上滑也要一样**，小屏上一串上滑不能连退好几个板块。
     实现：一串「同方向」连续滚轮（相邻两格间隔 <= GESTURE_GAP）算一个手势，
     一个手势只放行一次推进（滚到段底 / 出一批内容 / 直达 / 翻页都算推进），
     同一串里剩下的滚轮格全部吞掉；换方向立刻算新的一次操作。
     板块放得下时没有「先看段底」这一步，但仍遵守一手势一次，
     避免出完最后一批就顺势翻走。
     ============================================================ */
  const GESTURE_GAP = 220;
  let lastWheelAt = 0, lastWheelDir = 0, gestureId = 0, usedGesture = -1;
  function wheelGesture(dir) {
    const now = performance.now();
    // 同一方向 + 间隔短 = 同一串；换方向立刻算新的一次操作
    // （用户滑下去又马上滑回来必须马上响应，不能被当成惯性吞掉）
    if (dir !== lastWheelDir || now - lastWheelAt > GESTURE_GAP) gestureId++;
    lastWheelAt = now;
    lastWheelDir = dir;
    return gestureId;
  }

  // 返回 true = 这一格被 03 分段动画消费，分页器不翻页
  function stageIntercept(dir) {
    const g = wheelGesture(dir);
    // 上滑 / 下滑都遵守：一串大幅滚轮只放行第一格推进，同一串剩下的格全部吞掉，
    // 必须停手再滑一次才能继续（小屏上一串上滑也不能连退好几个板块）。
    if (g === usedGesture) return true;
    usedGesture = g;
    const now = performance.now();
    if (!STAGE.active) {
      // 02 → 03：跟 01→02 一样「一滚直接到下一板块」。
      // 02 比视口高一点（1440×900 下多 12px、1366×768 下多 144px），
      // 通用 pin 会先滚到段底、再滚一次才翻页 —— 用户会觉得第一下滑没反应。
      // 这里直接平移到 03 顶，把这一格消费掉（不改变其它任何板块的 pin 规则）。
      if (dir > 0) {
        const y = window.scrollY;
        const dt = topOf(SEC.direction);
        const pt = topOf(SEC.problem);
        if (y >= pt - 4 && y < dt - 4) {
          // 放不下就别抢这一格：交回分页器先滚到 02 段底，让用户看全最底部信息；
          // 滚到底后下一次下滑才会一滚直达 03。放得下（room<=24）仍是一滚直达。
          if (roomLeft(SEC.problem) > 24) return false;
          stageReset();
          STAGE.suppressUntil = 0;      // 别让上一次离开时的抑制挡住落位激活
          window.scrollTo({ top: dt, behavior: "smooth" });
          return true;
        }
      }
      return false;
    }
    if (dir > 0) {
      if (now < STAGE.lockUntil) return true;         // 一次手势只推一批
      if (STAGE.full || STAGE.step >= 4) {
        // 完整态（从 04 回来）/ 四批出齐：本该直接整屏卡片切到 04。
        // 但内容放不下时先让这一格交回分页器滚到 03 段底，把最后一段看完，
        // 下一次下滑才切 04；27" 上 room=0，仍是原来的「直接切」。
        if (roomLeft(SEC.direction) > 24) return false;
        stageLeave();
        run(SEC.direction, SEC.product, 1);
        return true;
      }
      stageReveal(STAGE.step + 1);
      STAGE.lockUntil = now + 200;
      return true;
    }
    // 上滑：已出现的内容全部保留，一次直接退回 02（普通 pin 交回分页器）
    stageLeave();
    return false;
  }

  window.BS_MOTION = {
    busy: () => busy,
    intercept: stageIntercept,
    down(cur, next) {
      if (busy || !cur || !next) return false;
      // 进 03 之前先把四批收起来：平移途中看到的就是「只有 eyebrow」，
      // 不会等落位才「啪」一下把内容全藏掉
      if (next.id === "direction") { stageReset(); STAGE.suppressUntil = 0; }
      const sc = SCENES[cur.id + ">" + next.id];
      if (sc && sc.plain) return false;    // 普通页面 pin，不播转场
      return run(cur, next, 1);
    },
    up(cur, prev) {
      if (busy || !cur || !prev) return false;
      // 从 04 卡片切回 03：03 一次性显示完整信息，不再分四次下滑拉出来
      if (prev.id === "direction") stageShowAll();
      const sc = SCENES[prev.id + ">" + cur.id];
      // plain = 双向都普通（01↔02、02↔03、04↔05）；plainUp = 只有回程普通（01 → 首屏）
      if (sc && (sc.plain || sc.plainUp)) return false;
      return run(cur, prev, -1);
    },
    route: ROUTE,
  };

  // busstop.js 会在 DOMContentLoaded 里重写 #bsIndex 的 innerHTML，
  // 所以要等它跑完再把小车/站点挂上去；再补一个监听器兜底（索引栏若被重建会自动补回）。
  function boot() {
    initRoute();
    initAmbient();
    stageBuild();
    stageReset();
    window.addEventListener("scroll", stageCheck, { passive: true });
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
