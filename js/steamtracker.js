/* ============================================================
   SteamTracker — 项目页交互
   1) 左侧板块索引（随板块明暗反白）
   2) 分页滚动：一次滚轮 = 一个板块；板块没到底就先滚到底
   3) 内嵌 App：点击后加载 iframe
   ============================================================ */

(function () {
  "use strict";

  const ST_SECTIONS = [
    { id: "overview", label: "The interface" },
    { id: "flow", label: "How it behaves" },
    { id: "app", label: "Try the app" },
    { id: "mockups", label: "Two mockups" },
    { id: "responsive", label: "Responsive" },
    { id: "built", label: "Built" },
    { id: "issues", label: "Known issues" },
  ];  function stRenderIndex() {
    const rail = document.createElement("nav");
    rail.className = "st-index";
    rail.setAttribute("aria-label", "Section index");
    rail.innerHTML = ST_SECTIONS.map(
      (sec, i) => `
      <a class="st-index__item" href="#${sec.id}" data-target="${sec.id}" aria-label="${sec.label}">
        <span class="st-index__num">${String(i + 1).padStart(2, "0")}</span>
        <span class="st-index__dot" aria-hidden="true"></span>
        <span class="st-index__label">${sec.label}</span>
      </a>`
    ).join("");
    document.body.appendChild(rail);
    return rail;
  }

  function stInitIndex(rail) {
    if (!rail) return;
    const hero = document.querySelector(".st-hero");
    const items = [...rail.querySelectorAll(".st-index__item")];
    const sections = ST_SECTIONS.map((sec) => document.getElementById(sec.id)).filter(Boolean);
    if (!sections.length) return;

    let raf = null;

    const place = () => {
      if (window.innerWidth < 1180) {
        rail.style.left = "";
        return;
      }
      const wraps = [...document.querySelectorAll(".st-sec .st-wrap")];
      if (!wraps.length) return;
      const contentLeft = Math.min(
        ...wraps.map(
          (w) => w.getBoundingClientRect().left + (parseFloat(getComputedStyle(w).paddingLeft) || 0)
        )
      );
      const railW = rail.offsetWidth || 120;
      const gap = Math.min(78, Math.max(24, contentLeft - railW - 24));
      rail.style.left = Math.max(8, Math.round(contentLeft - gap - railW)) + "px";
    };

    const sync = () => {
      raf = null;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const heroH = hero ? hero.offsetHeight : 0;
      rail.classList.toggle("is-visible", y > heroH - vh * 0.55);

      const probe = y + vh * 0.42;
      let active = -1;
      sections.forEach((sec, i) => {
        if (sec.offsetTop <= probe) active = i;
      });
      items.forEach((it, i) => it.classList.toggle("is-active", i === active));
      // 深色板块（06 / 08）上索引必须反白，否则深蓝的字在深底上根本看不见
      const dark = active >= 0 && sections[active].classList.contains("st-sec--ink");
      rail.classList.toggle("is-light", !!dark);
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

  /* ---------- 6. 分页滚动：一次滚轮 = 下一个板块 ----------
     规则与 about 页一致：板块必须先滚到底（底部留白完整露出），再滚一次才翻页 */
  function stInitPager() {
    const main = document.getElementById("stMain");
    if (!main) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const nav = document.querySelector(".nav");
    const hero = main.querySelector(".st-hero");
    const sections = ST_SECTIONS.map((sec) => document.getElementById(sec.id)).filter(Boolean);
    if (sections.length < 2) return;

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

    const step = (dir, delta, now, sinceLast) => {
      const y = window.scrollY;
      const idx = indexAt();
      const cur = idx >= 0 ? sections[idx] : null;

      // 一次手势至少走半屏，最多一屏 —— 读得完，又不会停在半路
      const page = Math.min(Math.max(delta, window.innerHeight * 0.5), window.innerHeight * 0.95);

      if (dir > 0) {
        if (cur) {
          const endY = endOf(cur);
          if (y < endY - EDGE) {
            const target = Math.min(y + page, endY);
            jump(target);
            if (target >= endY - 1) settleUntil = now + SETTLE_MS;
            return true;
          }
          if (now < settleUntil || sinceLast < GESTURE_GAP) return true;
        }
        const next = sections[idx + 1];
        if (!next) return false;
        const target = topOf(next);
        if (Math.abs(target - y) < 4) return false;
        go(target, 1);
        return true;
      }

      if (cur) {
        const curTop = topOf(cur);
        if (y > curTop + EDGE) {
          const target = Math.max(y - page, curTop);
          jump(target);
          if (target <= curTop + 1) settleUntil = now + SETTLE_MS;
          return true;
        }
        if (now < settleUntil || sinceLast < GESTURE_GAP) return true;
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

  /* ---------- 首屏：让 1536×950 的舞台铺满视口 ---------- */
  function stFitHero() {
    const stage = document.getElementById("stStage");
    const hero = document.querySelector(".st-hero");
    const inner = document.querySelector(".st-hero__inner");
    if (!stage || !hero) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (vw < 900) {
      // 窄屏：文字在上、设备在下，首屏随内容变高
      hero.style.minHeight = "";            // 先复位，量到真实的文字底边
      const k = vw / 560;
      const heroTop = hero.getBoundingClientRect().top;
      const base = inner
        ? inner.getBoundingClientRect().bottom - heroTop + 28
        : vh * 0.6;
      hero.style.minHeight = Math.round(base + 214 * k + 110) + "px";
      stage.style.setProperty("--k", k.toFixed(4));
      stage.style.setProperty("--tx", Math.round(vw / 2 - 1072 * k) + "px");
      stage.style.setProperty("--ty", Math.round(base - 352 * k) + "px");
      return;
    }

    hero.style.minHeight = "";
    const k = Math.max(vw / 1536, vh / 950);
    stage.style.setProperty("--k", k.toFixed(4));
    stage.style.setProperty("--tx", Math.round(vw / 2 - 768 * k) + "px");
    stage.style.setProperty("--ty", Math.round(vh / 2 - 475 * k) + "px");
  }

  /* ---------- 首屏：鼠标带动的轻微 3D 视角 ---------- */
  function stHeroTilt() {
    const hero = document.querySelector(".st-hero");
    const stage = document.getElementById("stStage");
    if (!hero || !stage) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;

    const tick = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      stage.style.setProperty("--ry", cx.toFixed(2) + "deg");
      stage.style.setProperty("--rx", cy.toFixed(2) + "deg");
      raf = Math.abs(tx - cx) > 0.06 || Math.abs(ty - cy) > 0.06 ? requestAnimationFrame(tick) : 0;
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 11;
      ty = -((e.clientY - r.top) / r.height - 0.5) * 7;
      start();
    });
    hero.addEventListener("mouseleave", () => {
      tx = 0;
      ty = 0;
      start();
    });
  }

  /* ---------- 内嵌 App ---------- */
  /* App 按 1440px 的桌面宽度渲染，再整体缩放到框里 —— 这样它看起来是电脑网页，
     而不是被挤成平板宽度。窄屏时退回 1:1，交给 App 自己的响应式布局。 */
  function stInitEmbed() {
    const frame = document.querySelector(".st-embed__frame");
    const gate = document.getElementById("stEmbedGate");
    if (!frame || !gate) return;
    gate.style.backgroundImage = "url(assets/img/stk-hero-app.webp)";

    const DESIGN_W = 1440;
    let iframe = null;

    const fit = () => {
      if (!iframe) return;
      const w = frame.clientWidth;
      if (w < 900) {
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.transform = "";
        return;
      }
      const s = w / DESIGN_W;
      iframe.style.width = DESIGN_W + "px";
      iframe.style.height = Math.round(frame.clientHeight / s) + "px";
      iframe.style.transform = "scale(" + s + ")";
    };

    gate.addEventListener("click", () => {
      if (iframe) return;
      iframe = document.createElement("iframe");
      iframe.title = "SteamTracker — the app itself";
      iframe.src = "apps/steamtracker/index.html?v=39";
      iframe.loading = "lazy";
      frame.appendChild(iframe);
      gate.remove();
      fit();
      window.addEventListener("resize", fit);
    });
  }

  /* ---------- 启动 ---------- */
  function boot() {
    stInitIndex(stRenderIndex());
    stInitPager();
    stInitEmbed();
    stFitHero();
    window.addEventListener("resize", stFitHero);
    // 字体加载完 / 内容回流之后再量一次，避免量到旧高度
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => setTimeout(stFitHero, 60));
    }
    [200, 600, 1200, 2400].forEach((t) => setTimeout(stFitHero, t));
    const innerEl = document.querySelector(".st-hero__inner");
    if (innerEl && window.ResizeObserver) {
      let locked = false;
      new ResizeObserver(() => {
        if (locked) return;
        locked = true;
        requestAnimationFrame(() => {
          stFitHero();
          locked = false;
        });
      }).observe(innerEl);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
