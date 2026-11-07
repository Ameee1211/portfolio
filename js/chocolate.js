/* ============================================================
   Auto-Signaled Bus Stop — 项目页交互
   1) 左侧板块索引（深色区自动反白）
   2) 分页滚动：一次手势 = 一屏；板块没到底先滚到底
   3) 首屏提示滚动后淡出
   4) 影片：点击后才加载
   ============================================================ */

(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);

  const CH_SECTIONS = [
    { id: "top", label: "Intro" },
    { id: "overview", label: "Short" },
    { id: "shapes", label: "Shapes" },
    { id: "prints", label: "Prints" },
    { id: "params", label: "Params" },
    { id: "mould", label: "Mould" },
    { id: "making", label: "Making" },
    { id: "colours", label: "Flavours" },
    { id: "box", label: "Package" },
    { id: "changes", label: "Known Issues" },
  ];

  /* ---------- 索引：一朵小花 + 四种口味色（用户 2026-11-07 选 A+C） ---------- */
  /* 四项循环，取自 07 Flavours 的四张实拍：棕 / 草莓粉 / 蓝莓绿 / 薰衣草紫。
     棕、粉正好是项目色板里的 --ch-cocoa、--ch-rose。 */
  const CH_FLAVOURS = ["#5a3a26", "#c98a8a", "#6f9a8d", "#a894bd"];

  /* 一朵完整的俯视小花，不是一片花瓣：5 片圆润花瓣 + 一圈内卷弧 + 花心。
     形态取自 cho-brown.webp（圆形底座、一层层卷进去的浅浮雕），16px 下也认得出是花。
     ★ 旋转放在外层 <g> 的 transform 属性上，不能放 <ellipse> —— CSS 里要用
       transform 给花瓣做「卷开」，会覆盖 ellipse 自己的 transform 属性，五瓣会叠成一瓣。 */
  const CH_FLOWER_SVG =
    '<svg class="ch-index__flower" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<g class="ch-index__petals">' +
        [0, 72, 144, 216, 288]
          .map((a) => '<g transform="rotate(' + a + ' 12 12)">' +
            '<ellipse cx="12" cy="6.4" rx="3" ry="4.6"/></g>')
          .join("") +
      "</g>" +
      '<circle class="ch-index__swirl" cx="12" cy="12" r="5.2"/>' +
      '<circle class="ch-index__core" cx="12" cy="12" r="2.4"/>' +
    "</svg>";

  function chRenderIndex() {
    const rail = $("#chIndex");
    if (!rail) return null;
    rail.innerHTML = CH_SECTIONS.slice(1)
      .map(
        (s, i) =>
          `<a class="ch-index__item" href="#${s.id}" data-id="${s.id}" ` +
          `style="--ch-flavour:${CH_FLAVOURS[i % CH_FLAVOURS.length]}">` +
          CH_FLOWER_SVG +
          `<span>${String(i + 1).padStart(2, "0")} ${s.label}</span></a>`
      )
      .join("") +
      `<span class="ch-index__bloom" aria-hidden="true">${CH_FLOWER_SVG}</span>`;
    return rail;
  }

  function chInitIndex(rail) {
    if (!rail) return;
    const items = [...rail.querySelectorAll(".ch-index__item")];
    const secs = CH_SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (!secs.length) return;

    const setActive = () => {
      const mid = window.innerHeight * 0.45;
      let current = secs[0];
      secs.forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) current = s;
      });
      const activeIdx = items.findIndex((it) => it.dataset.id === current.id);
      items.forEach((it, i) => {
        it.classList.toggle("is-active", i === activeIdx);
        it.classList.toggle("is-past", activeIdx >= 0 && i < activeIdx);
      });
      // 深色板块上让索引反白
      rail.classList.toggle("is-light", current.classList.contains("ch-sec--ink"));
      // 首屏不显示索引，滚过之后才淡入
      rail.classList.toggle("is-on", window.scrollY > window.innerHeight * 0.4);
      // 到最后一节：索引栏顶部浮出一朵合拢的完成花
      rail.classList.toggle("is-bloom", current.id === "changes");
    };

    setActive();
    window.addEventListener("scroll", setActive, { passive: true });
    window.addEventListener("resize", setActive);

    items.forEach((it) => {
      it.addEventListener("click", (e) => {
        e.preventDefault();
        const el = document.getElementById(it.dataset.id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /* ---------- 分页 ---------- */
  function chInitPager() {
    const main = $("#chMain");
    if (!main) return;
    const sections = CH_SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);
    window.initSectionPager({ main, sections, hero: main.querySelector(".ch-hero") });
  }

  /* ---------- 首屏提示 ---------- */
  function chInitCue() {
    const cue = $(".ch-hero__cue");
    if (!cue) return;
    const check = () => cue.classList.toggle("is-gone", window.scrollY > 60);
    check();
    window.addEventListener("scroll", check, { passive: true });
  }

  /* ---------- 影片 ---------- */
  function chInitFilm() {
    const gate = $("#bsFilmGate");
    const frame = $("#bsFilm");
    if (!gate || !frame) return;
    const play = () => {
      if (frame.querySelector("video")) return;
      const v = document.createElement("video");
      v.src = "assets/video/busstop.mp4";
      v.controls = true;
      v.autoplay = true;
      v.playsInline = true;
      v.preload = "metadata";
      frame.appendChild(v);
      gate.remove();
    };
    gate.addEventListener("click", play);
    gate.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        play();
      }
    });
  }

  /* ---------- 启动 ---------- */

  /* ---------- 3D 模型：占位图淡出 / CDN 失败回落本地 ---------- */
  function chInitModels() {
    const list = document.querySelectorAll("model-viewer");
    list.forEach((mv) => {
      const local = mv.getAttribute("data-local-src");
      const poster = mv.parentElement && mv.parentElement.querySelector(".ch-hero__poster");

      const hidePoster = () => { if (poster) poster.classList.add("is-hidden"); };
      if (mv.loaded) hidePoster();
      mv.addEventListener("load", hidePoster);

      // CDN 偶发失败：先重试一次，再退回仓库本地文件
      let retried = false;
      mv.addEventListener("error", () => {
        if (!local) return;
        const cur = mv.getAttribute("src") || "";
        if (cur.indexOf("jsdelivr") !== -1 && !retried) {
          retried = true;
          const again = cur;
          mv.removeAttribute("src");
          setTimeout(() => mv.setAttribute("src", again + (again.indexOf("?") === -1 ? "?retry=1" : "&retry=1")), 1500);
          return;
        }
        if (cur !== local) mv.setAttribute("src", local);
      });
    });
  }


  /* ---------- 04 模型缩放：滚轮会带走页面滚动，改用滑杆 ---------- */
  function chInitZoom() {
    const mv = document.querySelector("#product model-viewer");
    const range = document.getElementById("bsZoom");
    if (!mv || !range) return;
    const NEAR = 8; // 与 min-radius 对齐
    const FAR = 14; // 与 max-radius 对齐（再远会被 model-viewer 的包围球钳住）

    const apply = () => {
      const t = Number(range.value) / 100;
      const radius = FAR - t * (FAR - NEAR);
      let theta = 62;
      let phi = 74;
      try {
        if (typeof mv.getCameraOrbit === "function") {
          const o = mv.getCameraOrbit();
          if (o && isFinite(o.theta) && isFinite(o.phi)) {
            theta = (o.theta * 180) / Math.PI;
            phi = (o.phi * 180) / Math.PI;
          }
        }
      } catch (e) {
        /* 模型还没升级成自定义元素时按默认机位算 */
      }
      const orbit = theta.toFixed(2) + "deg " + phi.toFixed(2) + "deg " + radius.toFixed(2) + "m";
      mv.setAttribute("camera-orbit", orbit);
      if (typeof mv.jumpCameraToGoal === "function") mv.jumpCameraToGoal();
    };

    range.addEventListener("input", apply);
  }


  /* ---------- 05 元素切换（Bench / Desk / Sign / Screen / Club）---------- */
  function chInitElements() {
    const root = document.getElementById("bsEl");
    if (!root) return;
    const tabs = Array.from(root.querySelectorAll(".ch-el__tab"));
    const panels = Array.from(root.querySelectorAll(".ch-el__panel"));

    const select = (key) => {
      tabs.forEach((t) => {
        const on = t.dataset.el === key;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      panels.forEach((p) => p.classList.toggle("is-active", p.id === "el-" + key));
    };

    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(t.dataset.el));
      t.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
        e.preventDefault();
        const next = tabs[(i + (e.key === "ArrowDown" ? 1 : tabs.length - 1)) % tabs.length];
        next.focus();
        select(next.dataset.el);
      });
    });
  }

  function boot() {
    chInitIndex(chRenderIndex());
    chInitPager();
    chInitCue();
    chInitVideo();
  }

  /* ---------- 06 成型视频：按引擎选源，进视口才播，离开就停 ---------- */
  function chInitVideo() {
    const v = document.querySelector(".ch-video video");
    if (!v) return;

    // Safari / iOS 对 VP9 WebM 支持不可靠（选了 webm 却解不出画面），改给 HEVC mp4
    const ua = navigator.userAgent;
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isSafari = /Safari/.test(ua) && !/Chrome|Chromium|CriOS|Edg|OPR|Firefox/.test(ua);
    const pick = isIOS || isSafari ? v.dataset.mp4 : v.dataset.webm;
    if (pick && v.getAttribute("src") !== pick) v.src = pick;

    // 自动播放被拒（iOS 省电模式等）时露出控件，至少能点一下
    const play = () => {
      const pr = v.play();
      if (pr && pr.catch) pr.catch(() => { v.controls = true; });
    };

    if (!("IntersectionObserver" in window)) {
      play();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) play();
          else v.pause();
        });
      },
      { threshold: 0.2 }
    );
    io.observe(v);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
