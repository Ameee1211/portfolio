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
      items.forEach((it, i) => {
        it.classList.toggle("is-active", i === active);
        // 已经走过的段落用淡青描边，和「当前」的实心块区分开
        it.classList.toggle("is-past", active >= 0 && i < active);
      });
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

    /* 一手势一次推进（用户 2026-11-06）：一串连续滚轮只放行一次推进，
       同一串里剩下的格全部吞掉，必须停手再滑一次。 */
    let flipGid = -1;
    let gidSeq = 0;
    /* ★ 到板块边界后「必须停手」才允许翻页（用户 2026-11-06） */
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

    /* ---------- 首屏 ↔ 01：笔电屏幕被抬起来，落进 01 的左图 ----------
       首屏的笔电屏幕是 HTML 画的（不是图片），所以直接把它搬进飞行层：
       抬起来 → 放大 → 落进 01 那张落地页截图的位置 → 交叉淡出成真图。
       同时深色的书桌场景淡出、浅色的 01 页面从下方升上来。
       反向（01 → 首屏）就是同一段倒着播。
       ★ 手机屏幕没有搬：它是竖的（110×233），01 右图是横的（513×385），
         硬搬会变形或者放大到糊，所以让它随深色场景一起淡出。 */
    let morphing = false;
    let morphCtx = null;

    const morphClear = () => {
      const c = morphCtx;
      if (!c) return;
      morphCtx = null;
      morphing = false;
      if (c.fly.parentNode) c.fly.remove();
      // 镜头动画恢复
      if (c.world) c.world.style.animationPlayState = "";
    };

    const morphBail = () => {
      if (!morphCtx) return;
      const y = morphCtx.toY;
      morphClear();
      jump(y);
      lockUntil = performance.now() + 400;
      lockTo = clampY(y);
    };

    const morphHero = (dir) => {
      if (morphing) return true;
      const o1 = sections[0];
      const lap = hero ? hero.querySelector(".st-screen--lap") : null;
      if (!hero || !o1 || !lap) return false;

      const img1 = o1.querySelector(".st-shots figure:nth-child(1) img");
      if (!img1) return false;

      // 首屏没有段内滚动，先把位置对齐到 0，几何才对得上
      if (dir > 0 && window.scrollY > 4) jump(0);
      else if (dir > 0) jump(0);

      const vh = document.documentElement.clientHeight;
      const cw = document.documentElement.clientWidth;
      const vw = Math.min(cw, hero.offsetWidth || cw);
      const landY = Math.ceil(topOf(o1));
      const toY = dir > 0 ? landY : 0;

      // 起点：首屏对齐（scrollY = 0）时笔电屏幕在视口里的位置
      const lr = lap.getBoundingClientRect();
      const from = { l: lr.left, t: lr.top + window.scrollY, w: lr.width, h: lr.height };
      // 终点：01 左图在「跳到 01 顶部」时的视口位置
      const ir = img1.getBoundingClientRect();
      const to = { l: ir.left, t: ir.top + window.scrollY - landY, w: ir.width, h: ir.height };
      if (from.w < 4 || to.w < 4) return false;

      // 落地前把图先拉过来，否则跳页那一帧会空一下
      img1.loading = "eager";
      const pre = new Image();
      pre.src = img1.getAttribute("src") || "";

      /* ★ 首屏的桌面场景有一条 14 秒循环的「镜头推近」动画（scale 1 ↔ 1.42）。
         转场期间必须把它冻在当前帧：否则起飞位置和克隆背景会对不上，
         回来时会看到笔电屏幕莫名变大、偏左。 */
      const worldEl = hero.querySelector(".st-hero__world");
      if (worldEl) worldEl.style.animationPlayState = "paused";
      const worldTf = worldEl ? getComputedStyle(worldEl).transform : "";

      const pageBg = (() => {
        const c = getComputedStyle(document.body).backgroundColor;
        return c && c !== "rgba(0, 0, 0, 0)" ? c : "#f7f6fa";
      })();

      const fly = document.createElement("div");
      fly.className = "st-flow";
      fly.style.cssText =
        "position:fixed;inset:0;z-index:40;overflow:hidden;pointer-events:none;" +
        "background:" + pageBg + ";perspective:1600px;perspective-origin:50% 50%;";

      /* ① 01 的整页克隆（从下方升上来，最后一帧和真实页面完全重合） */
      const bg = document.createElement("div");
      bg.style.cssText =
        "position:absolute;left:0;top:0;width:" + vw + "px;height:" + vh + "px;" +
        "overflow:hidden;background:" + pageBg + ";will-change:transform;";
      const bgInner = o1.cloneNode(true);
      bgInner.removeAttribute("id");
      bgInner.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
      bgInner.querySelectorAll("img").forEach((im) => { im.loading = "eager"; });
      /* 左图保持正常显示：飞行卡片就压在它正上方，看不出双份；
         等卡片淡出时下面正好是同一张图，接得住，不会露出空白。 */
      bgInner.style.cssText = "position:absolute;left:0;top:0;width:" + vw + "px;margin:0;";
      bg.appendChild(bgInner);
      fly.appendChild(bg);

      /* ② 首屏（书桌场景 + 文案），整体淡出 */
      const deep = document.createElement("div");
      deep.style.cssText =
        "position:absolute;left:0;top:0;width:" + vw + "px;height:" + vh + "px;" +
        "overflow:hidden;transform-origin:50% 46%;will-change:transform,opacity;";
      const deepInner = hero.cloneNode(true);
      deepInner.removeAttribute("id");
      deepInner.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
      /* 克隆会把入场动画从头播一遍 —— 标题还在 delay 里是透明的，画面会缺一块。
         所以把所有动画停在最终态；文案再额外确认一次透明度。 */
      deepInner.querySelectorAll("*").forEach((n) => {
        n.style.animation = "none";
        n.style.transition = "none";
      });
      deepInner.querySelectorAll(".st-hero__copy > *").forEach((n) => {
        n.style.opacity = "1";
        n.style.transform = "none";
      });
      const deepWorld = deepInner.querySelector(".st-hero__world");
      if (deepWorld) {
        deepWorld.style.animation = "none";
        if (worldTf && worldTf !== "none") deepWorld.style.transform = worldTf;
      }
      deepInner.style.cssText =
        "position:absolute;left:0;top:0;width:" + vw + "px;height:" + vh + "px;margin:0;";
      deep.appendChild(deepInner);
      fly.appendChild(deep);

      /* ③ 飞的那块：笔电屏幕里的界面（克隆，动画停掉，免得闪） */
      const card = document.createElement("div");
      card.style.cssText =
        "position:absolute;left:" + from.l + "px;top:" + from.t + "px;" +
        "width:" + from.w + "px;height:" + from.h + "px;overflow:hidden;background:#fff;" +
        "transform-origin:50% 50%;will-change:transform,box-shadow,opacity;";
      const lapClone = lap.cloneNode(true);
      lapClone.removeAttribute("id");
      lapClone.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
      lapClone.querySelectorAll("*").forEach((n) => {
        n.style.animation = "none";
        n.style.transition = "none";
      });
      /* 界面按它自己的原始尺寸摆进来，再整体等比缩放铺满卡片（cover）：
         直接写 100%×100% 会因为内部是固定高度的 flex，底部拉出一片空白。 */
      const lw = lap.offsetWidth || 360;
      const lh = lap.offsetHeight || 236;
      lapClone.style.cssText =
        "position:absolute;left:50%;top:50%;width:" + lw + "px;height:" + lh + "px;" +
        "margin:0;transform-origin:50% 50%;transform:translate(-50%,-50%) scale(1);";
      card.appendChild(lapClone);
      /* 再叠一层真图：这段的后半程让界面「变成」那张截图。
         笔电屏里是表单 + 卡片，01 左图是落地页截图，两者内容本来就不同，
         直接整卡淡出会看到两个东西在叠；在卡片内部换掉就顺得多。 */
      const shot = document.createElement("img");
      shot.src = img1.getAttribute("src") || "";
      shot.alt = "";
      shot.style.cssText =
        "position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;" +
        "display:block;opacity:0;will-change:opacity;";
      card.appendChild(shot);
      fly.appendChild(card);

      document.body.appendChild(fly);

      const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
      const es = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
      const T = 1500;

      const frame = (p) => {
        const lift = es(cl(p / 0.22));              // 抬起
        const move = es(cl((p - 0.06) / 0.52));     // 飞过去
        const rise = es(cl((p - 0.14) / 0.58));     // 浅色页升上来
        /* 卡片内部：界面 → 截图的替换。
           ★ 必须是「先退一层、再进一层」，两段**不能重叠**：
             重叠的话回退时两层同时半透明，卡片就透出下面的图，看着像鬼影。
             中间留 0.02 的纯白，约 20ms，肉眼看不到。 */
        const swapOut = es(cl((p - 0.54) / 0.10));   // 界面退
        const swapIn = es(cl((p - 0.66) / 0.14));    // 截图进
        // 整卡的收尾淡出，只留很薄的一段，交给真实图片接手
        const fade = es(cl((p - 0.92) / 0.08));

        const l = from.l + (to.l - from.l) * move;
        const t = from.t + (to.t - from.t) * move;
        const w = from.w + (to.w - from.w) * move;
        const h = from.h + (to.h - from.h) * move;

        /* 不做旋转：原屏幕在场景里是斜的（约 5°），但飞行卡片是正面的，
           一转就和底图错开。改成「淡入 + 上抬 9px」，第一帧和首屏完全一致。 */
        const lift2 = lift * (1 - move);
        card.style.left = l.toFixed(1) + "px";
        card.style.top = (t - 9 * lift2).toFixed(1) + "px";
        card.style.width = w.toFixed(1) + "px";
        card.style.height = h.toFixed(1) + "px";
        card.style.transform = "none";
        // 界面等比铺满卡片（cover），多出来的部分由卡片自己的 overflow 裁掉
        const sc = Math.max(w / lw, h / lh);
        lapClone.style.transform = "translate(-50%,-50%) scale(" + sc.toFixed(4) + ")";
        lapClone.style.opacity = String(1 - swapOut);
        card.style.borderRadius = (7 * (1 - move)).toFixed(1) + "px";
        /* 不放投影（用户 2026-11-06 要求）：抬起来时是靠圆角和位移说明它飞起来了，
           加投影反而像「贴上去的一块板」，和首屏那种平的光照不合。 */
        card.style.boxShadow = "none";
        card.style.opacity = String(cl(p / 0.08) * (1 - fade));
        shot.style.opacity = String(swapIn);

        // 深色场景淡出、轻微后退
        const out = es(cl(p / 0.44));
        deep.style.opacity = String(1 - out);
        deep.style.transform = "scale(" + (1 + 0.04 * out).toFixed(4) + ")";

        // 浅色页从下方升上来
        bg.style.transform = "translate3d(0," + (vh * (1 - rise)).toFixed(1) + "px,0)";
      };

      morphing = true;
      morphCtx = { fly, toY, world: worldEl };
      frame(dir > 0 ? 0 : 1);

      const t0 = performance.now();
      let landed = false;

      const tick = (now) => {
        if (!morphCtx) return;
        const k = Math.min(1, (now - t0) / T);
        const p = dir > 0 ? k : 1 - k;
        frame(p);

        if (!landed && k >= 1) {
          landed = true;
          jump(toY);
          morphClear();
          lockUntil = performance.now() + 360;
          lockDir = dir;
          lockTo = clampY(toY);
          // 交接后把首屏那份克隆留下的 visibility 清掉
          const realLap = hero.querySelector(".st-screen--lap");
          if (realLap) realLap.style.visibility = "";
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      return true;
    };

    /* ---------- 01 ↔ 02：02 整页被一个圆揭出来，慢慢盖住 01（用户 2026-11-06 改版） ----------
       ★ 上一版把「背景圆」和两个图片框拆开做（框拉长、换图、文字单独淡入），
         用户觉得效果不好，全部推翻。这一版只有一件事：
           底层 = 01 整页，静止不动
           上层 = 02 整页，**也静止不动**，只被 clip-path 的圆形窗口裁着
         圆从屏幕正中央一个点扩到铺满 → 02 露出的范围越来越大，直到整屏都是 02。
         反向就是同一个圆缩回去 → 01 从四周重新显现。
       除了圆的半径，画面里没有任何元素在动、缩放、淡入或位移。

       ★ 坐标系：飞行层是 fixed，01 / 02 各按「自己板块顶对齐视口顶」摆放，
         所以量位置要用 (文档 top - 该板块顶)。转场开始时先 jump 到起点板块顶，
         否则触发时停在 01 段底（比顶多 63px）会对不上。 */
    let circleCtx = null;

    const circleClear = () => {
      const c = circleCtx;
      if (!c) return;
      circleCtx = null;
      morphing = false;
      if (c.fly.parentNode) c.fly.remove();
    };

    const circleBail = () => {
      if (!circleCtx) return;
      const y = circleCtx.toY;
      circleClear();
      jump(y);
      lockUntil = performance.now() + 400;
      lockTo = clampY(y);
    };

    const circleMorph = (dir) => {
      if (morphing || circleCtx) return true;
      const s1 = sections[0];    // overview
      const s2 = sections[1];    // flow
      if (!s1 || !s2) return false;

      const land1 = Math.ceil(topOf(s1));
      const land2 = Math.ceil(topOf(s2));
      const toY = dir > 0 ? land2 : land1;
      jump(dir > 0 ? land1 : land2);

      const vh = document.documentElement.clientHeight;
      const cw = document.documentElement.clientWidth;
      const vw = Math.min(cw, s1.offsetWidth || cw, s2.offsetWidth || cw);

      const bodyBg = (() => {
        const c = getComputedStyle(document.body).backgroundColor;
        return c && c !== "rgba(0, 0, 0, 0)" ? c : "#f7f6fa";
      })();

      const fly = document.createElement("div");
      fly.className = "st-flow";
      fly.style.cssText =
        "position:fixed;inset:0;z-index:40;overflow:hidden;pointer-events:none;background:" + bodyBg + ";";

      /* 一整页克隆，静止摆放。02 的 section 自带 st-sec--sky 渐变背景，
         所以圆里露出来的就是完整的一屏 02（背景 + 标题 + 两张图），不用另铺底色。 */
      const layer = (sec, land) => {
        const box = document.createElement("div");
        box.style.cssText =
          "position:absolute;left:0;top:0;width:" + vw + "px;height:" + vh + "px;overflow:hidden;";
        const inner = sec.cloneNode(true);
        inner.removeAttribute("id");
        inner.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
        inner.querySelectorAll("img").forEach((im) => { im.loading = "eager"; });
        inner.style.cssText =
          "position:absolute;left:0;top:" + (topOf(sec) - land).toFixed(1) + "px;" +
          "width:" + vw + "px;margin:0;";
        box.appendChild(inner);
        fly.appendChild(box);
        return box;
      };

      layer(s1, land1);                       // 底层：01，始终不动
      const reveal = layer(s2, land2);        // 上层：02，只被圆裁着

      // 02 的图在 01 上是 lazy 的，先要过来，免得圆扩开那一瞬间图还是空的
      [...s2.querySelectorAll("img")].forEach((im) => {
        const pre = new Image();
        pre.src = im.getAttribute("src") || "";
      });

      /* 金色圆环：clip-path 裁出来的圆没有边可描，所以另起一层跟着半径一起长大。
         border-box 让描边往内画，外径正好等于圆的直径，和裁剪边界严丝合缝。
         外面那层很淡的光晕就是「柔边」，让窗口在浅色底上也能看清。 */
      const ring = document.createElement("div");
      ring.style.cssText =
        "position:absolute;left:50%;top:50%;border-radius:50%;pointer-events:none;" +
        "box-sizing:border-box;transform:translate(-50%,-50%);" +
        "border:2px solid rgba(198,150,62,0.92);" +
        "box-shadow:0 0 0 5px rgba(226,185,105,0.13), 0 0 22px 6px rgba(198,150,62,0.16);" +
        "will-change:width,height;";
      fly.appendChild(ring);

      document.body.appendChild(fly);

      const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
      const es = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
      const R_MAX = Math.hypot(cw, vh) / 2 + 2;
      const T = 1500;

      const frame = (p) => {
        const R = R_MAX * es(cl(p));
        reveal.style.clipPath = "circle(" + R.toFixed(1) + "px at 50% 50%)";
        const d = (2 * R).toFixed(1) + "px";
        ring.style.width = d;
        ring.style.height = d;
        // 半径接近 0 时不要留一个孤零零的小金点；铺满后环已在屏幕外，自然看不见
        ring.style.opacity = R < 3 || R >= R_MAX - 1 ? "0" : "1";
      };

      morphing = true;
      circleCtx = { fly, toY };
      frame(dir > 0 ? 0 : 1);

      const t0 = performance.now();
      let landed = false;
      const tick = (now) => {
        if (!circleCtx) return;
        const k = Math.min(1, (now - t0) / T);
        frame(dir > 0 ? k : 1 - k);
        if (!landed && k >= 1) {
          landed = true;
          jump(toY);
          circleClear();
          lockUntil = performance.now() + 360;
          lockDir = dir;
          lockTo = clampY(toY);
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      return true;
    };

    /* ---------- 02 ↔ 03：双板铰链（用户 2026-11-07 选 A 的铰链版） ----------
       两张整屏卡片绕各自的竖轴开合：当前页向后转开、往左后方退，下一页从右后方
       转进来铺满。中间那一帧两面同框，浅青和墨绿同时可见，边缘在画面中间相遇，
       看起来就是一本打开的书 / 两扇门，不需要真的做一个立方体，也不会露空白。

       ★ 反向不是倒放：两个方向跑的是**同一套 frame(u)，u 都从 0 走到 1**，
         只把「谁是被转开的、谁是转进来的」对调（和 07↔08 拎牌同一个思路）。

       ★ 02 比一屏高 770px，触发正向时用户停在 02 段底，不是顶部。
         所以 outgoing 那块卡必须按「触发当下视口里 section 顶的位置」摆放，
         incoming 按「落位后视口里 section 顶的位置」摆放，两者基准不同但各自无缝。

       ★ 03 的内嵌 App 是点击 Load the app 之后才创建 iframe 的。
         如果用户已经点开过，克隆里的 iframe 会重新加载并闪一下 —— 换成同色空板。 */
    let hingeCtx = null;

    const hingeClear = () => {
      const c = hingeCtx;
      if (!c) return;
      hingeCtx = null;
      morphing = false;
      if (c.fly.parentNode) c.fly.remove();
    };

    const hingeBail = () => {
      if (!hingeCtx) return;
      const y = hingeCtx.toY;
      hingeClear();
      jump(y);
      lockUntil = performance.now() + 400;
      lockTo = clampY(y);
    };

    const hingeMorph = (dir) => {
      if (morphing || hingeCtx) return true;
      const s2 = sections[1];    // flow
      const s3 = sections[2];    // app
      if (!s2 || !s3) return false;

      const dst = dir > 0 ? s3 : s2;
      const src = dir > 0 ? s2 : s3;
      const toY = Math.ceil(topOf(dst));

      const vh = document.documentElement.clientHeight;
      const cw = document.documentElement.clientWidth;
      const vw = Math.min(cw, s2.offsetWidth || cw, s3.offsetWidth || cw);
      const nowY = window.scrollY;

      // 容器底色跟着「即将到来的那一页」走，转开时露出的缝就是它的颜色
      const boxBg = dir > 0 ? "#0c2426" : "#eefafa";

      const fly = document.createElement("div");
      fly.className = "st-flow";
      fly.style.cssText =
        "position:fixed;inset:0;z-index:40;overflow:hidden;pointer-events:none;" +
        "background:" + boxBg + ";" +
        "perspective:1700px;perspective-origin:50% 50%;";

      const card = (sec, off) => {
        const box = document.createElement("div");
        box.style.cssText =
          "position:absolute;left:0;top:0;width:" + vw + "px;height:" + vh + "px;" +
          "overflow:hidden;transform-origin:50% 50%;backface-visibility:hidden;" +
          "will-change:transform,opacity;";
        const inner = sec.cloneNode(true);
        inner.removeAttribute("id");
        inner.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
        inner.querySelectorAll("img").forEach((im) => { im.loading = "eager"; });
        inner.querySelectorAll("iframe").forEach((f) => {
          const ph = document.createElement("div");
          ph.style.cssText = "width:100%;height:100%;background:#0D1A2B;";
          if (f.parentNode) f.parentNode.replaceChild(ph, f);
        });
        inner.style.cssText =
          "position:absolute;left:0;top:" + off.toFixed(1) + "px;width:" + vw + "px;margin:0;";
        box.appendChild(inner);
        fly.appendChild(box);
        return box;
      };

      // outgoing 用「当下视口」，incoming 用「落位后的视口」
      const out = card(src, topOf(src) - nowY);
      const inn = card(dst, topOf(dst) - toY);

      // 终点那页的图先要过来，免得转进来时还是空的
      [...dst.querySelectorAll("img")].forEach((im) => {
        const pre = new Image();
        pre.src = im.getAttribute("src") || "";
      });

      document.body.appendChild(fly);

      const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
      const es = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
      const T = 1500;
      const TURN = 55;          // 最大转角（度）

      /* ★ 两张整屏卡如果直接叠着转，上面那张会把下面那张盖住，看起来只是
         「一张斜卡盖过来」，不像两扇门同时打开。所以用屏幕中线当铰链，把可见
         区域切开：左半永远是当前页、右半永远是下一页。
         clip-path 的百分比是相对卡片自身（整屏），所以 50% 正好是中央轴；
         裁剪边界会跟着 rotateY 一起透视变形，两块在中线处始终严丝合缝。
           a=0   左页全屏可见、正对；右页完全裁掉
           a=0.5 左页只露左半、右页只露右半，各转 ±27.5°
           a=1   左页完全裁掉；右页全屏可见、正对
         两个方向都跑这套 frame，只是把 out / inn 换成不同的页面。 */
      const frame = (u) => {
        const a = es(cl(u));
        const b = 1 - a;
        out.style.transform =
          "rotateY(" + (-TURN * a).toFixed(2) + "deg) scale(" + (1 - 0.06 * a).toFixed(4) + ")";
        out.style.clipPath = "inset(0 " + (100 * a).toFixed(2) + "% 0 0)";
        inn.style.transform =
          "rotateY(" + (TURN * b).toFixed(2) + "deg) scale(" + (1 - 0.06 * b).toFixed(4) + ")";
        inn.style.clipPath = "inset(0 0 0 " + (100 * b).toFixed(2) + "%)";
      };

      morphing = true;
      hingeCtx = { fly, toY };
      frame(0);

      const t0 = performance.now();
      let landed = false;
      const tick = (now) => {
        if (!hingeCtx) return;
        const k = Math.min(1, (now - t0) / T);
        // 两个方向都从 0 走到 1：不是倒放，是同一套动作换个主角
        frame(k);
        if (!landed && k >= 1) {
          landed = true;
          jump(toY);
          hingeClear();
          lockUntil = performance.now() + 360;
          lockDir = dir;
          lockTo = clampY(toY);
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      return true;
    };

    const step = (dir, delta, gid) => {
      if (flipGid === gid) return true;
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
            if (target >= endY - 1) {
              flipGid = gid;
              edgeHold = 1; edgeHoldDir = 1; edgeHoldTicks = 0;
            }
            return true;
          }
        }
        const next = sections[idx + 1];
        if (!next) return false;
        flipGid = gid;
        // 首屏 → 01：笔电屏幕被抬起来落进左图
        if (!cur && next === sections[0] && morphHero(1)) return true;
        // 01 → 02：02 整页被圆揭出来
        if (cur === sections[0] && next === sections[1] && circleMorph(1)) return true;
        // 02 → 03：双板铰链
        if (cur === sections[1] && next === sections[2] && hingeMorph(1)) return true;
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
      // 01 → 首屏：同一段倒放
      if (cur === sections[0] && prev === hero && morphHero(-1)) return true;
      // 02 → 01：圆缩回中心，01 从四周显现
      if (cur === sections[1] && prev === sections[0] && circleMorph(-1)) return true;
      // 03 → 02：同一套铰链动作，换成 02 转进来
      if (cur === sections[2] && prev === sections[1] && hingeMorph(-1)) return true;
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
      if (morphing) { e.preventDefault(); return; }
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

  /* ---------- 首屏：让 1536×950 的舞台铺满视口 ---------- */
  function stFitHero() {
    const stage = document.getElementById("stStage");
    const hero = document.querySelector(".st-hero");
    const inner = document.querySelector(".st-hero__inner");
    if (!stage || !hero) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    /* ---------- 手机 / 竖屏：一屏之内，文案在上，场景在下 ---------- */
    if (vw <= 900) {
      hero.style.minHeight = "";
      const heroTop = hero.getBoundingClientRect().top;
      // 文字块底边（hero 内坐标）
      const textBottom = inner
        ? inner.getBoundingClientRect().bottom - heroTop
        : vh * 0.5;
      const sceneTop = textBottom + 8;
      const sceneH = Math.max(180, vh - sceneTop);

      // 照片里设备的可视范围（1024×972 坐标系）
      const EX0 = 174, EX1 = 895, EY0 = 368, EY1 = 805;
      const ew = EX1 - EX0;
      const eh = EY1 - EY0;
      // 留一点边，别让手机贴着屏幕边被切掉
      const k = Math.min(vw / ew, sceneH / eh) * 0.94;

      const tx = vw / 2 - ((EX0 + EX1) / 2) * k;
      const ty = sceneTop + (sceneH - eh * k) / 2 - EY0 * k;

      stage.style.setProperty("--k", k.toFixed(4));
      stage.style.setProperty("--tx", Math.round(tx) + "px");
      stage.style.setProperty("--ty", Math.round(ty) + "px");
      return;
    }

    /* ---------- 桌面 / 横屏：整屏铺满 ---------- */
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
