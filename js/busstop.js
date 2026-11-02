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

  const BS_SECTIONS = [
    { id: "top", label: "Intro" },
    { id: "overview", label: "Short" },
    { id: "problem", label: "Why" },
    { id: "direction", label: "Insights" },
    { id: "product", label: "Product" },
    { id: "elements", label: "Elements" },
    { id: "poster", label: "Poster" },
    { id: "issues", label: "Issues" },
  ];

  /* ---------- 索引 ---------- */
  function bsRenderIndex() {
    const rail = $("#bsIndex");
    if (!rail) return null;
    rail.innerHTML = BS_SECTIONS.slice(1)
      .map(
        (s, i) =>
          `<a class="bs-index__item" href="#${s.id}" data-id="${s.id}">` +
          `<i></i><span>${String(i + 1).padStart(2, "0")} ${s.label}</span></a>`
      )
      .join("");
    return rail;
  }

  function bsInitIndex(rail) {
    if (!rail) return;
    const items = [...rail.querySelectorAll(".bs-index__item")];
    const secs = BS_SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (!secs.length) return;

    const setActive = () => {
      const mid = window.innerHeight * 0.45;
      let current = secs[0];
      secs.forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) current = s;
      });
      items.forEach((it) => it.classList.toggle("is-active", it.dataset.id === current.id));
      // 深色板块上让索引反白
      rail.classList.toggle("is-light", current.classList.contains("bs-sec--ink"));
      // 首屏不显示索引，滚过之后才淡入
      rail.classList.toggle("is-on", window.scrollY > window.innerHeight * 0.4);
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
  function bsInitPager() {
    const main = $("#bsMain");
    if (!main) return;
    const sections = BS_SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);
    window.initSectionPager({ main, sections, hero: main.querySelector(".bs-hero") });
  }

  /* ---------- 首屏提示 ---------- */
  function bsInitCue() {
    const cue = $(".bs-hero__cue");
    if (!cue) return;
    const check = () => cue.classList.toggle("is-gone", window.scrollY > 60);
    check();
    window.addEventListener("scroll", check, { passive: true });
  }

  /* ---------- 影片 ---------- */
  function bsInitFilm() {
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
  function bsInitModels() {
    const list = document.querySelectorAll("model-viewer");
    list.forEach((mv) => {
      const local = mv.getAttribute("data-local-src");
      const poster = mv.parentElement && mv.parentElement.querySelector(".bs-hero__poster");

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
  function bsInitZoom() {
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
  function bsInitElements() {
    const root = document.getElementById("bsEl");
    if (!root) return;
    const tabs = Array.from(root.querySelectorAll(".bs-el__tab"));
    const panels = Array.from(root.querySelectorAll(".bs-el__panel"));

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
    bsInitElements();
    bsInitModels();
    bsInitZoom();
    bsInitIndex(bsRenderIndex());
    bsInitPager();
    bsInitCue();
    bsInitFilm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
