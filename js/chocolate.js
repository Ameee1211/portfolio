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
      .join("");
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

  /* ============================================================
     首屏 ↔ 01：四朵巧克力花脱模，飞进 01 的四格（用户 2026-11-07 选方案 A）
     ------------------------------------------------------------
     ★ 抠图口径：不用「沿花的真实轮廓逐像素抠」—— 那些花是手工脱模的，
       边缘本来就不平整，抠出来会带毛刺、缺口和灰盘残留（实测过，很难看）。
       改用 07 四张单图，按检测出的花心裁成【圆形 + 抗锯齿 + 1.5px 羽化】的
       透明 webp：边缘是数学上平滑的圆，螺旋纹理完整保留，四张完全统一。
       素材由 .workbuddy/design/_chcut.py 生成：fly-{brown,pink,blue,purple}.webp
     ★ 起点坐标是圆盘里四朵花的真实位置，按比例存（px/py/r 相对 .ch-hero__shot），
       所以换视口宽度也不会跑偏；终点运行时从 .ch-law 的 rect 取。
     ★ 反向不是倒放：四个小点从四格抽回、长回四朵花，奶油底收回深色。
     ============================================================ */
  /* ★ 按「起点 x 从左到右」排列，和四格 1→4 一一对应：
     若按盘子里的视觉顺序（棕/绿/粉/紫）配 1→4，紫花起点比粉花靠左、终点却更右，
     两条弧线会在中途交叉、两朵花叠在一起（实测过，很难看）。 */
  const CH_FLYERS = [
    { src: "fly-blue.webp",   px: 0.203, py: 0.553, r: 0.119 },  // 左下 蓝绿 → 格 1
    { src: "fly-brown.webp",  px: 0.273, py: 0.259, r: 0.100 },  // 左上 棕   → 格 2
    { src: "fly-purple.webp", px: 0.427, py: 0.754, r: 0.119 },  // 中下 灰紫 → 格 3
    { src: "fly-pink.webp",   px: 0.755, py: 0.625, r: 0.123 }   // 右侧 粉橙 → 格 4
  ];
  CH_FLYERS.forEach((f) => {
    const pre = new Image();
    pre.src = "assets/img/choc/" + f.src;
  });

  const CH_HERO_MORPH = (() => {
    let ctx = null;
    let busy = false;

    const topOf = (el) => el.getBoundingClientRect().top + window.scrollY;
    const chJump = (v) => {
      const root = document.documentElement;
      const prev = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      const max = root.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.max(0, Math.min(v, max)));
      root.style.scrollBehavior = prev;
    };
    const clear = () => {
      if (!ctx) return;
      if (ctx.fly.parentNode) ctx.fly.remove();
      ctx = null;
      busy = false;
    };

    const morph = (dir) => {
      if (busy || ctx) return true;
      const hero = document.getElementById("top");
      const one = document.getElementById("overview");
      const shot = hero && hero.querySelector(".ch-hero__shot");
      const laws = one ? [...one.querySelectorAll(".ch-law")] : [];
      if (!shot || laws.length < 4) return false;

      const yA = 0;                          // 首屏顶部视图
      const yB = Math.ceil(topOf(one));      // 01 顶部视图
      const toY = dir > 0 ? yB : yA;
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;

      // 文档坐标 → 指定 scrollY 下的视口坐标
      const R = (el, base) => {
        const r = el.getBoundingClientRect();
        return { l: r.left, t: r.top + window.scrollY - base, w: r.width, h: r.height };
      };
      const sr = R(shot, yA);
      const start = CH_FLYERS.map((f) => ({
        x: sr.l + sr.w * f.px,
        y: sr.t + sr.h * f.py,
        r: sr.w * f.r
      }));
      const end = laws.slice(0, 4).map((el) => {
        const r = R(el, yB);
        return { x: r.l + r.w / 2, y: r.t + r.h / 2, r: 9 };
      });

      const fly = document.createElement("div");
      fly.className = "ch-fly";
      fly.style.cssText =
        /* z-index 15 < .ch-index(20)：转场期间左侧小花索引栏要一直露着 */
        "position:fixed;inset:0;z-index:15;overflow:hidden;pointer-events:none;background:#150c09;";

      /* 克隆整屏：显式写回原元素的 left / width，避免 max-width + margin:auto
         在 absolute 定位下失效导致整屏左移。 */
      const layer = (sec, base) => {
        const box = document.createElement("div");
        box.style.cssText =
          "position:absolute;left:0;top:0;width:" + vw + "px;height:" + vh + "px;" +
          "overflow:hidden;will-change:transform,opacity;";
        const r = sec.getBoundingClientRect();
        const inner = sec.cloneNode(true);
        inner.removeAttribute("id");
        inner.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
        inner.querySelectorAll("img").forEach((im) => { im.loading = "eager"; });
        inner.style.cssText =
          "position:absolute;left:" + r.left.toFixed(1) + "px;" +
          "top:" + (topOf(sec) - base).toFixed(1) + "px;" +
          "width:" + r.width.toFixed(1) + "px;margin:0;";
        box.appendChild(inner);
        return box;
      };
      const oldL = layer(hero, yA);
      const bgB = document.createElement("div");
      bgB.style.cssText =
        "position:absolute;inset:0;background:#f7f1e8;will-change:opacity;";
      const newL = layer(one, yB);
      fly.appendChild(oldL);
      fly.appendChild(bgB);
      fly.appendChild(newL);

      const flyers = CH_FLYERS.map((f) => {
        const im = document.createElement("img");
        im.src = "assets/img/choc/" + f.src;
        im.alt = "";
        im.style.cssText =
          "position:absolute;display:block;border-radius:50%;" +
          "filter:drop-shadow(0 10px 18px rgba(20,10,6,0.38));" +
          "will-change:left,top,width,height,opacity;";
        fly.appendChild(im);
        return im;
      });
      document.body.appendChild(fly);

      const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
      const es = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
      const T = 1500;
      const fwd = dir > 0;

      const frame = (p) => {
        /* 背景：深棕 → 奶油（整层交叉淡化，不用帘子/揭幕） */
        bgB.style.opacity = String(fwd
          ? es(cl((p - 0.06) / 0.60))
          : 1 - es(cl((p - 0.10) / 0.62)));

        const outOld = fwd ? 1 - es(cl((p - 0.02) / 0.28)) : es(cl((p - 0.44) / 0.50));
        /* 01 文字很淡地提前托住画面，但主体淡入仍在花快落完之后 */
        const inNew = fwd ? es(cl((p - 0.46) / 0.50)) : 1 - es(cl((p - 0.02) / 0.30));
        oldL.style.opacity = String(outOld);
        oldL.style.transform = "translateY(" +
          ((fwd ? -18 : 22) * (1 - outOld)).toFixed(1) + "px)";
        newL.style.opacity = String(inNew);
        newL.style.transform = "translateY(" +
          ((fwd ? 22 : 18) * (1 - inNew)).toFixed(1) + "px)";

        flyers.forEach((im, i) => {
          const f = es(cl((p - 0.02 - i * 0.035) / 0.64));
          const from = fwd ? start[i] : end[i];
          const dest = fwd ? end[i] : start[i];
          // 二次贝塞尔；四条弧线抬升高度依次错开，像一朵朵被拎起来，不挤成一条
          const cx = (from.x + dest.x) / 2;
          const cy = Math.min(from.y, dest.y) - (58 + i * 30);
          const u = 1 - f;
          const x = u * u * from.x + 2 * u * f * cx + f * f * dest.x;
          const y = u * u * from.y + 2 * u * f * cy + f * f * dest.y;
          const size = from.r * 2 * (1 - f) + dest.r * 2 * f;
          const appear = es(cl((p - 0.02 - i * 0.035) / (fwd ? 0.10 : 0.14)));
          /* 两个方向都在飞到终点时化开：正向交给 01 文字，反向交给真实首屏里
             那四朵花（否则飞行图和盘里的花叠成重影，移除飞行层时会闪一下）。
             反向再加一道全局收尾，保证最后一朵不会拖到首屏完全恢复才消失。 */
          const byArrive = 1 - es(cl((f - 0.86) / 0.14));
          const vanish = fwd ? byArrive
            : Math.min(byArrive, 1 - es(cl((p - 0.80) / 0.20)));
          im.style.left = (x - size / 2).toFixed(1) + "px";
          im.style.top = (y - size / 2).toFixed(1) + "px";
          im.style.width = size.toFixed(1) + "px";
          im.style.height = size.toFixed(1) + "px";
          im.style.opacity = String(appear * vanish);
        });
      };

      busy = true;
      ctx = { fly, toY };
      /* 两个方向都是 p:0 → 1，frame() 内部按 dir 换起终点 —— 反向不是倒放 */
      frame(0);
      const t0 = performance.now();
      let landed = false;
      const tick = (now) => {
        if (!ctx) return;
        const k = Math.min(1, (now - t0) / T);
        frame(k);
        if (!landed && k >= 1) {
          landed = true;
          chJump(toY);
          clear();
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      return true;
    };

    return {
      down: (cur, next) => {
        if (!next || next.id !== "overview") return false;
        if (cur && cur.id !== "top") return false;
        return morph(1);
      },
      up: (cur, prev) => {
        if (!cur || cur.id !== "overview") return false;
        if (!prev || prev.id !== "top") return false;
        return morph(-1);
      },
      busy: () => busy
    };
  })();

  /* ---------- 01 ↔ 02：四格裂成四张卡（用户 2026-11-07 选方案 A） ----------
     两屏共用同一条四列栅格（x=140 起、总宽 1160、列距约 294）：
     01 是 1×4 连着的定律条，02 是四张分开的白卡。
     动作：三条竖线断开 → 四格原地圆角化、长到卡片尺寸 → 依次显影 v1→v4。
     反向：图先淡出 → 四张卡收回四格 → 步骤文字回来（同一套动作换主角，不倒放）。
     ★ 首屏→01 刚用过「四个独立飞行物」，这里全程没有飞行物；
       也不用帘子、圆形揭幕、索引游标（这些别的段落已用过）。 */
  const CH_12_MORPH = (() => {
    let ctx = null;
    let busy = false;

    // 四张版本图在 02 里是 lazy 加载，转场只有 1.5s，先提前取好
    ["cho-v1", "cho-v2", "cho-v3", "cho-v4"].forEach((n) => {
      const im = new Image();
      im.src = "assets/img/choc/" + n + ".webp";
    });

    const topOf = (el) => el.getBoundingClientRect().top + window.scrollY;
    const chJump = (v) => {
      const root = document.documentElement;
      const prev = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      const max = root.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.max(0, Math.min(v, max)));
      root.style.scrollBehavior = prev;
    };
    const clear = () => {
      if (!ctx) return;
      if (ctx.fly.parentNode) ctx.fly.remove();
      ctx = null;
      busy = false;
    };

    const morph = (dir) => {
      if (busy || ctx) return true;
      const s1 = document.getElementById("overview");
      const s2 = document.getElementById("shapes");
      if (!s1 || !s2) return false;
      const laws = [...s1.querySelectorAll(".ch-law")];
      const figs = [...s2.querySelectorAll(".ch-views--four figure")];
      if (laws.length < 4 || figs.length < 4) return false;

      const fwd = dir > 0;
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;
      const top1 = topOf(s1);
      const top2 = Math.ceil(topOf(s2));
      const end1 = Math.max(top1, top1 + s1.offsetHeight - vh);
      const nowY = window.scrollY;
      // 01 侧用「触发当下视口」/「反向落位视口」，02 侧同理，两方向都不跳位
      const yA = fwd ? nowY : end1;
      const yB = fwd ? top2 : nowY;
      const toY = fwd ? top2 : end1;

      const R = (el, base) => {
        const r = el.getBoundingClientRect();
        return { l: r.left, t: r.top + window.scrollY - base, w: r.width, h: r.height };
      };
      const A = laws.slice(0, 4).map((el) => R(el, yA));   // 01 四格
      const B = figs.slice(0, 4).map((el) => R(el, yB));   // 02 四张卡
      // 极窄桌面若 .ch-views--four 变成 2×2，四列栅格不成立 → 交回普通整页移动
      if (B.some((b, i) => i > 0 && Math.abs(b.t - B[0].t) > 8)) return false;

      const fly = document.createElement("div");
      fly.className = "ch-fly ch-fly--12";
      fly.style.cssText =
        /* z-index 15 < .ch-index(20)：左侧小花索引栏全程露着 */
        "position:fixed;inset:0;z-index:15;overflow:hidden;pointer-events:none;background:#f7f1e8;";

      const bgB = document.createElement("div");
      bgB.style.cssText =
        "position:absolute;inset:0;background:#f1eefb;will-change:opacity;";
      fly.appendChild(bgB);

      /* 两个文字层：各自整页克隆，把「四格 / 四卡」隐藏但保留占位，
         位置交给上面的 card 层负责，这样首尾帧都和真实页面严丝合缝。 */
      const layer = (sec, base, hideSel) => {
        const box = document.createElement("div");
        box.style.cssText =
          "position:absolute;left:0;top:0;width:" + vw + "px;height:" + vh + "px;" +
          "overflow:hidden;will-change:opacity,transform;";
        const inner = sec.cloneNode(true);
        inner.removeAttribute("id");
        inner.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
        inner.querySelectorAll("img").forEach((im) => { im.loading = "eager"; });
        inner.style.cssText =
          "position:absolute;left:0;top:" + (topOf(sec) - base).toFixed(1) + "px;" +
          "width:" + sec.getBoundingClientRect().width.toFixed(1) + "px;" +
          "margin:0;background:transparent;";
        inner.querySelectorAll(hideSel).forEach((n) => { n.style.visibility = "hidden"; });
        box.appendChild(inner);
        fly.appendChild(box);
        return box;
      };
      const tA = layer(s1, yA, ".ch-lawbox");
      const tB = layer(s2, yB, ".ch-views--four");

      /* 四枚卡：起点装 01 的步骤文字，终点装 02 的真实 figure 克隆。
         figure 固定按终点尺寸摆，卡在它周围变形、overflow 裁切，
         所以落位那一帧和真实 02 一模一样。 */
      const LINE = "43,26,18";
      const cards = laws.slice(0, 4).map((law, i) => {
        const box = document.createElement("div");
        box.className = "ch-m12-card";
        box.style.cssText =
          "position:absolute;box-sizing:border-box;overflow:hidden;" +
          "will-change:left,top,width,height;";
        const txt = law.cloneNode(true);
        txt.style.cssText =
          "position:absolute;left:0;top:0;width:100%;box-sizing:border-box;" +
          "border-left:0;padding-left:" + (i === 0 ? "0" : "18px") + ";";
        /* ★ figure 的样式全靠祖先选择器（.ch-views img / .ch-views--four figcaption），
           直接塞进卡里会退回 640×480 原图尺寸、图注被挤出裁掉。
           所以外面补一层同名的 ch-views ch-views--four 壳，只把 display 改成 block，
           后代选择器照样命中，宽高仍由卡控制。 */
        const wrap = document.createElement("div");
        wrap.className = "ch-views ch-views--four";
        wrap.style.cssText =
          "display:block;position:absolute;left:0;top:0;margin:0;" +
          "width:" + B[i].w.toFixed(1) + "px;height:" + B[i].h.toFixed(1) + "px;";
        const fig = figs[i].cloneNode(true);
        fig.style.margin = "0";
        fig.querySelectorAll("img").forEach((im) => { im.loading = "eager"; });
        wrap.appendChild(fig);
        box.appendChild(txt);
        box.appendChild(wrap);
        fly.appendChild(box);
        return { box, txt, fig: wrap };
      });
      document.body.appendChild(fly);

      const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
      const es = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
      const T = 1500;

      const frame = (p) => {
        /* 背景：奶油 ↔ 淡紫，整层交叉淡化（不用帘子） */
        bgB.style.opacity = String(fwd
          ? es(cl((p - 0.04) / 0.58))
          : 1 - es(cl((p - 0.08) / 0.60)));

        /* 标题 / 正文沿同一条左栅格换字。★ 必须「排队」而不是长交叉淡化：
           两页标题 y 不同（01 在 255 / 02 在 150），重叠会变成错行的重影。
           旧页退干净新页才进，中间那一小段由卡区正在显影的图片接住。 */
        const outOld = 1 - es(cl((p - 0.20) / 0.24));
        const inNew = es(cl((p - 0.44) / 0.32));
        const outA = fwd ? outOld : inNew;
        const inB = fwd ? inNew : outOld;
        /* ★ 文字只做原地淡入淡出，不做任何位移（用户 2026-11-07 明确要求）：
           之前两层各带 ±16px 的 translateY，02 的标题／正文／四张图下面那段
           文字会整层跳一下。这里连 tA 一起去掉，保证正反两个方向都不跳。 */
        tA.style.opacity = String(outA);
        tB.style.opacity = String(inB);

        const q = es(cl((p - 0.04) / 0.76));
        cards.forEach((c, i) => {
          const a = fwd ? A[i] : B[i];
          const b = fwd ? B[i] : A[i];
          c.box.style.left = (a.l + (b.l - a.l) * q).toFixed(1) + "px";
          c.box.style.top = (a.t + (b.t - a.t) * q).toFixed(1) + "px";
          c.box.style.width = (a.w + (b.w - a.w) * q).toFixed(1) + "px";
          c.box.style.height = (a.h + (b.h - a.h) * q).toFixed(1) + "px";

          /* 线、圆角、边框宽度都要按「当前靠哪一侧」判断，
             不能只看 q：反向起点是四张白卡（无线有圆角），终点才是四格。 */
          const lineAmt = fwd ? 1 - cl(q / 0.45) : cl((q - 0.55) / 0.45);
          const alpha = 0.12 * lineAmt;
          c.box.style.borderRadius = (10 * (fwd ? q : 1 - q)).toFixed(1) + "px";
          /* 中途白底最亮、两端透明，保证首尾帧和真实页面一模一样 */
          c.box.style.backgroundColor = "rgba(255,255,255," +
            (0.9 * Math.sin(Math.PI * q)).toFixed(3) + ")";
          c.box.style.borderStyle = "solid";
          const bw = (fwd ? q < 0.98 : q > 0.02) ? "1px" : "0";
          c.box.style.borderTopWidth = bw;
          c.box.style.borderBottomWidth = bw;
          c.box.style.borderLeftWidth = i === 0 ? "0" : bw;
          c.box.style.borderRightWidth = "0";
          c.box.style.borderColor = "rgba(" + LINE + "," + alpha.toFixed(3) + ")";

          /* 正向：v1→v4 依次显影；反向：图先淡出、步骤文字紧接着回来 */
          c.fig.style.opacity = String(fwd
            ? es(cl((p - 0.26 - i * 0.055) / 0.30))
            : 1 - es(cl((p - 0.02 - i * 0.02) / 0.24)));
          c.txt.style.opacity = String(fwd
            ? 1 - es(cl((p - 0.08) / 0.26))
            : es(cl((p - 0.28 - i * 0.03) / 0.40)));
        });
      };

      busy = true;
      ctx = { fly, toY };
      // 两个方向都是 p:0 → 1，frame 内部按 dir 换起终点 —— 反向不是倒放
      frame(0);
      const t0 = performance.now();
      let landed = false;
      const tick = (now) => {
        if (!ctx) return;
        const k = Math.min(1, (now - t0) / T);
        frame(k);
        if (!landed && k >= 1) {
          landed = true;
          chJump(toY);
          clear();
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      return true;
    };

    return {
      down: (cur, next) => {
        if (!cur || cur.id !== "overview" || !next || next.id !== "shapes") return false;
        return morph(1);
      },
      up: (cur, prev) => {
        if (!cur || cur.id !== "shapes" || !prev || prev.id !== "overview") return false;
        return morph(-1);
      },
      busy: () => busy
    };
  })();

  /* 两个专属转场共用一个钩子：先判首屏↔01，再判 01↔02 */
  const CH_TRANSITIONS = {
    down: (cur, next) => CH_HERO_MORPH.down(cur, next) || CH_12_MORPH.down(cur, next),
    up: (cur, prev) => CH_HERO_MORPH.up(cur, prev) || CH_12_MORPH.up(cur, prev),
    busy: () => CH_HERO_MORPH.busy() || CH_12_MORPH.busy()
  };

  /* ---------- 分页 ---------- */
  function chInitPager() {
    const main = $("#chMain");
    if (!main) return;
    const sections = CH_SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);
    window.initSectionPager({
      main,
      sections,
      hero: main.querySelector(".ch-hero"),
      transition: CH_TRANSITIONS
    });
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
