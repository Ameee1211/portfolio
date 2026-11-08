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
        /* ★ 必须保留 section 自己的 id：CSS 里有 4 条 #shapes 专属规则
           （padding-bottom 78px / .ch-views--four margin 24 0 16 /
            .ch-p--after margin-top 14px）。以前 removeAttribute("id") 让克隆
            section 从 900 变成 954 高，flex 居中的标题／正文／尾段整体上移 18px，
           转场收尾飞行层一撤，文字就跳回真实位置 —— 用户说的「跳动」就是这个。
           只移除内部子元素的 id，section 自身的 id 保留。 */
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

  /* ---------- 03 ↔ 04：三列收成参数表（用户 2026-11-08 口述方案） ----------
     ① 与 ② 同时启动：03 三列区（含真实 3D 模型）淡出，同时上下各长出一条横线，
        横线从中心向两端展开、并向中间收拢，直到变成 04 参数表的两条长横线。
     ③ 横线长到位之后，04 的文字才开始出现：标题/正文/尾段打字机式逐字打入，
        参数表 8 格与 3 条竖线按列从右往左错开淡入。
     ★★ 全程不 clone 03 的 model-viewer：只把真实三列区整体淡出（3D 一直是
        同一个实时旋转的节点），两条横线、参数表、逐字文字都在透明飞行层里画。
        绝不会出现上两轮「先变静态图片、再开始转」的断层。
     ★ 文字全程零位移：03 的字在自己位置逐字擦掉，04 的字在自己位置逐字打出。
     反向按用户给的顺序反演（距离变大 → 文字淡出 → 三框出现 → 图片淡入 → 文字刷回），
     用 frame(1-k) 做对称反演。 */
  const CH_34_MORPH = (() => {
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
      const c = ctx;
      if (!c) return;
      ctx = null;
      busy = false;
      if (c.fly.parentNode) c.fly.remove();
      c.hideList.forEach((el, i) => { el.style.visibility = c.savedVis[i]; });
      c.rowEl.style.opacity = c.savedRowOpacity;
      c.rowEl.style.transform = c.savedRowTransform;
      c.s4.style.backgroundColor = c.savedBg4;
      c.s3.style.position = c.savedS3Pos;
      c.s3.style.zIndex = c.savedS3Z;
    };

    const morph = (dir) => {
      if (busy || ctx) return true;
      const s3 = document.getElementById("prints");
      const s4 = document.getElementById("params");
      if (!s3 || !s4) return false;
      const rowEl = s3.querySelector(".ch-prints-row");
      const parEl = s4.querySelector(".ch-params");
      if (!rowEl || !parEl) return false;

      const fwd = dir > 0;
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;
      const top3 = topOf(s3);
      const top4 = Math.ceil(topOf(s4));
      const end3 = Math.max(top3, top3 + s3.offsetHeight - vh);
      const nowY = window.scrollY;
      const yA = fwd ? nowY : end3;      // 03 侧视口基准
      const yB = fwd ? top4 : nowY;      // 04 侧视口基准
      const toY = fwd ? top4 : end3;
      const R = (el, base) => {
        const r = el.getBoundingClientRect();
        return { l: r.left, t: r.top + window.scrollY - base, w: r.width, h: r.height };
      };
      const row = R(rowEl, yA);          // 03 三列区（含图注）
      const par = R(parEl, yB);          // 04 参数表

      /* ★★ 反向触发时真实页面停在 04 顶部，04 的文字和参数表也在视口里。
         只藏 03 的文字是不够的：淡紫底褪去后真实 04 会整片透出来，
         和飞行层的 03 文字叠成一团 —— 这就是用户说的「诡异」。
         正反两个方向都把两页的文字 + 04 参数表统一交给飞行层。 */
      const realText = [...s3.querySelectorAll(".ch-eyebrow,.ch-h2,.ch-p")];
      const realText4 = [...s4.querySelectorAll(".ch-eyebrow,.ch-h2,.ch-p")];
      const hideList = [...realText, ...realText4, parEl];

      /* 文字拆成单字符，用 CSS transition 做柔和的逐字出现/消失。
         只改跨越阈值的那几个 span，避免每帧写几百个 DOM 属性。 */
      const split = (host) => {
        const c = host.cloneNode(true);
        const t = (c.textContent || "").replace(/\s+/g, " ").trim();
        c.textContent = "";
        c.style.whiteSpace = "pre-wrap";
        const spans = [];
        for (const ch of t) {
          const sp = document.createElement("span");
          sp.textContent = ch;
          sp.style.cssText = "transition:opacity .12s linear;";
          c.appendChild(sp);
          spans.push(sp);
        }
        return { el: c, spans };
      };
      /* ★ 字符在「每一行内部」必须从左到右连续出现/消失（打字机、退格感），
         不能在同一行里跳着显隐 —— 那样会变成 "Sam nt op" 这种碎字。
         「不要整齐划一」靠的是块与块之间的启动延迟 + 速度差：
         第一行慢/少、第二行快/多、第三行再慢、第四行最快。 */
      const SPEED = [0.85, 1.20, 0.80, 1.05];
      const DELAY = [0.00, 0.08, 0.16, 0.24];
      const makeTextLayer = (sec, base, tag) => {
        const box = document.createElement("div");
        box.className = "ch-m34-text ch-m34-text--" + tag;
        box.style.cssText =
          "position:absolute;left:0;top:0;width:" + vw + "px;height:" + vh + "px;";
        const groups = [...sec.querySelectorAll(".ch-eyebrow,.ch-h2,.ch-p")].map((el, bi) => {
          const g = split(el);
          const r = R(el, base);
          g.el.style.cssText +=
            "position:absolute;left:" + r.l.toFixed(1) + "px;top:" + r.t.toFixed(1) + "px;" +
            "width:" + r.w.toFixed(1) + "px;margin:0;";
          g.speed = SPEED[bi] || 1;
          g.delay = DELAY[bi] || 0;
          box.appendChild(g.el);
          return g;
        });
        return { box, groups };
      };
      const initType = (layer, shown) => {
        layer.groups.forEach((g) => {
          g.spans.forEach((sp) => { sp.style.opacity = shown ? "1" : "0"; });
          g.last = shown ? g.spans.length : 0;
        });
      };
      const setType = (groups, prog, show) => {
        groups.forEach((g) => {
          const n = g.spans.length;
          if (!n) return;
          /* 端点严格固定：prog=0 / 1 时字符全隐 / 全显，不会擦不干净或打不满。
             延迟与速度只改变中途形状，于是各行进度刻意参差不齐。 */
          const u = Math.max(0, Math.min(1, (prog - g.delay) / (1 - g.delay)));
          const local = Math.pow(u, 1 / g.speed);
          const ratio = show ? local : 1 - local;
          const target = Math.round(ratio * n);
          if (g.last === target) return;
          const lo = Math.min(g.last, target), hi = Math.max(g.last, target);
          for (let i = lo; i < hi; i++) {
            g.spans[i].style.opacity = (i < target) ? "1" : "0";
          }
          g.last = target;
        });
      };

      /* 先克隆（此时真实文字还正常），再把真实 03 的文字藏起来交给飞行层。
         ★ 只隐藏文字，三列图区（含 model-viewer）留在真实 DOM 里继续渲染。 */
      const oldText = makeTextLayer(s3, yA, "old");
      const newText = makeTextLayer(s4, yB, "new");
      const savedVis = hideList.map((el) => el.style.visibility);
      const savedRowOpacity = rowEl.style.opacity;
      const savedRowTransform = rowEl.style.transform;
      const savedBg4 = s4.style.backgroundColor;
      hideList.forEach((el) => { el.style.visibility = "hidden"; });
      /* 反向：把 04 的淡紫底临时换成奶油，飞行层淡紫褪去后露出的才是 03 的奶油底。
         并把真实 03 三列区（含 3D 真身）平移进当前视口，三框才真的「出现」。
         正向 shift=0，完全不设，行为一点不变。 */
      if (!fwd) s4.style.backgroundColor = "#f7f1e8";
      const shift = nowY - yA;
      if (!fwd && shift) rowEl.style.transform = "translateY(" + shift.toFixed(1) + "px)";
      /* ★★ 04 的 section 在 DOM 里排在 03 后面、且背景不透明，会把平移过来的
         三框整个盖住（elementFromPoint 命中的是 04 的 .ch-wrap）。
         给 03 临时提一层，低于飞行层 15、高于 04 的 auto。 */
      const savedS3Pos = s3.style.position, savedS3Z = s3.style.zIndex;
      if (!fwd) { s3.style.position = "relative"; s3.style.zIndex = "1"; }

      const fly = document.createElement("div");
      fly.className = "ch-fly ch-fly--34";
      fly.style.cssText =
        /* 透明容器：底色由单独的 bg 层淡入，前半段能透出真实 3D */
        "position:fixed;inset:0;z-index:15;overflow:hidden;pointer-events:none;";

      const bg = document.createElement("div");
      bg.style.cssText = "position:absolute;inset:0;background:#f1eefb;will-change:opacity;";
      fly.appendChild(bg);

      /* 两条横线：从中心向两端展开，同时上下向中间收拢 */
      const mkLine = () => {
        const d = document.createElement("div");
        d.className = "ch-m34-line";
        d.style.cssText =
          "position:absolute;height:1px;background:rgba(43,26,18,0.12);" +
          "will-change:left,top,width;";
        fly.appendChild(d);
        return d;
      };
      const lineT = mkLine(), lineB = mkLine();

      /* 参数表：clone 真实 .ch-params，只留 8 格和列间竖线，上下边由横线画 */
      const cellsBox = parEl.cloneNode(true);
      cellsBox.classList.add("ch-m34-cells");
      cellsBox.style.cssText =
        "position:absolute;left:" + par.l.toFixed(1) + "px;top:" + par.t.toFixed(1) + "px;" +
        "width:" + par.w.toFixed(1) + "px;margin:0;visibility:visible;" +
        "border-top-color:transparent;border-bottom-color:transparent;";
      const cells = [...cellsBox.querySelectorAll(":scope > div")];
      cells.forEach((c) => { c.style.opacity = "0"; });
      fly.appendChild(cellsBox);

      fly.appendChild(oldText.box);
      fly.appendChild(newText.box);
      document.body.appendChild(fly);

      const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
      const es = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
      const T = 1500;
      const LINE_DONE = 0.62;   // 横线长到位的时间点；04 文字一律在这之后才出现

      const frame = (p) => {
        /* 背景奶油 → 淡紫 */
        bg.style.opacity = String(es(cl((p - 0.10) / 0.62)));

        /* ① 真实三列区（含 3D 真身）淡出，与横线生长同时启动。
           稍微拉长一点，让中段还能看见正在转的 3D，不会一下子空掉。 */
        rowEl.style.opacity = String(1 - es(cl((p - 0.00) / 0.56)));

        /* ② 横线：中心展开 + 上下收拢 */
        const g = es(cl(p / LINE_DONE));
        const w = par.w * g;
        const l = par.l + (par.w - w) / 2;
        const yT = row.t + (par.t - row.t) * g;
        const yB = (row.t + row.h) + ((par.t + par.h) - (row.t + row.h)) * g;
        [lineT, lineB].forEach((d, i) => {
          d.style.left = l.toFixed(1) + "px";
          d.style.width = w.toFixed(1) + "px";
          d.style.top = (i === 0 ? yT : yB).toFixed(1) + "px";
          d.style.opacity = g > 0.01 ? "1" : "0";
        });

        /* ③ 03 文字逐字擦掉（收拢期间）；04 文字等横线长到位后才逐字打入 */
        setType(oldText.groups, es(cl((p - 0.00) / 0.52)), false);
        setType(newText.groups, es(cl((p - LINE_DONE) / 0.34)), true);

        /* ④ 参数表 8 格 + 竖线按列从右往左错开淡入，同样等到横线长到位 */
        cells.forEach((c, i) => {
          const order = 3 - (i % 4);        // 最右列先
          c.style.opacity = String(es(cl((p - LINE_DONE - order * 0.055) / 0.20)));
        });
      };

      /* ★★ 反向不是正向倒放（用户 2026-11-08：倒放「非常诡异」）。
         倒放会让横线往中心缩短、文字倒着长回来、图片在横线没张到位就出现。
         按用户口述重排一套顺序，同一批元素、同一套打字机，只换步骤与节奏：
         ① 04 文字刷新成 03 文字 → ② 两条横线中间的参数表文字淡出
         → ③ 两条横线保持全宽、距离从 152 张到 452（03 三列区）
         → ④ 三框（含真实 3D 真身）在横线张到位之后才淡入。 */
      const frameBack = (k) => {
        bg.style.opacity = String(1 - es(cl((k - 0.10) / 0.60)));

        /* ① 文字刷新：04 逐字擦掉、03 逐字打入（行内连续，块间错落） */
        const t = es(cl(k / 0.30));
        setType(newText.groups, t, false);
        setType(oldText.groups, t, true);

        /* ② 参数表 8 格 + 竖线一起淡出，不按列 */
        const cellOut = 1 - es(cl((k - 0.30) / 0.18));
        cells.forEach((c) => { c.style.opacity = String(cellOut); });

        /* ③ 横线：宽度始终是 1160，只有上下距离变大（k=0.70 张到位） */
        const g = es(cl((k - 0.42) / 0.28));
        const yT = par.t + (row.t - par.t) * g;
        const yB = (par.t + par.h) + ((row.t + row.h) - (par.t + par.h)) * g;
        const lineOut = 1 - es(cl((k - 0.84) / 0.16));
        [lineT, lineB].forEach((d, i) => {
          d.style.left = par.l.toFixed(1) + "px";
          d.style.width = par.w.toFixed(1) + "px";
          d.style.top = (i === 0 ? yT : yB).toFixed(1) + "px";
          d.style.opacity = String(lineOut);
        });

        /* ④ 横线张开到位后，三个图片框（含真实 3D）才淡入，留足 30% 时长 */
        rowEl.style.opacity = String(es(cl((k - 0.70) / 0.30)));
      };

      busy = true;
      ctx = { fly, toY, hideList, savedVis, rowEl, savedRowOpacity,
        savedRowTransform, s4, savedBg4, s3, savedS3Pos, savedS3Z };
      // 反向的起手是 04 完整页面，所以初始字符状态与正向相反
      initType(oldText, fwd);
      initType(newText, !fwd);
      if (fwd) frame(0); else frameBack(0);
      const t0 = performance.now();
      let landed = false;
      const tick = (now) => {
        if (!ctx) return;
        const k = Math.min(1, (now - t0) / T);
        if (fwd) frame(k); else frameBack(k);
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
        if (!cur || cur.id !== "prints" || !next || next.id !== "params") return false;
        return morph(1);
      },
      up: (cur, prev) => {
        if (!cur || cur.id !== "params" || !prev || prev.id !== "prints") return false;
        return morph(-1);
      },
      busy: () => busy
    };
  })();

  /* ---------- 04 → 05：上横线当片材被真空吸下去（用户 2026-11-08 选方案 B） ----------
     ★ 只用 04 参数表现有的两根横线，不新增片材元素：
       上横线（border-top）两端钉死、中间下垂成弧，压到下横线（border-bottom）为止；
       下横线全程不动；8 格参数按列从左到右被压得下沉 + 熄灭。
     ★ 05 的 <video autoplay loop> 全程是真实节点：不 clone、不用 poster 占位。
       把真实 #mould 平移进当前视口并提一层，直接淡入；transform 与落位后的
       scrollY 变化正好抵消，清除时零跳变。
     ★ 只做正向。05 → 04 用户指定保持普通上移，up 一律返回 false。
     ★ 定时 1.5s 播放（用户 2026-11-08 改口：不要滚轮驱动）：
       进度只由时间推进；转场期间 busy=true 让分页器吞掉滚轮，
       一串猛滑仍只翻一次页，播完直接落位。
     ★ 下压的那根上横线加粗成 2.5px 深可可棕（--ch-cocoa-deep #402417），
       下横线保持页面原本的 1px 细线，全程不动。
     ★ 用户 2026-11-08 追加两点：
       · 真实 .ch-params 的 border-top 在转场期间设透明、飞行层也不再重复画下横线，
         屏幕上只剩被压弯的那根粗棕线（原位那根细直线不再残留）。
       · 04 的标题 + 两段正文逐字符拆成 inline 片段，字符保持水平、整体下垂，压到最底淡出。
     ★★ 文字与粗线「永远平行」（用户 2026-11-08 再改口）：
       文字只占线的左半 / 三分之二，但要当成和线一样长、右半边是透明文字，
       所以每个字符用**整条线的全局 U = (x - 线左端)/线宽**算下垂，不是文字块自己的宽度。
       于是只有最左侧固定（文字左对齐），右端跟着线继续往下走、不回弹；
       幅度也必须用同一个 sag（不再等比缩放），文字与线处处垂直间距恒定。
       首帧 --warp=0，字符位置与真实页面严丝合缝。
  */
  const CH_45_MORPH = (() => {
    let ctx = null;
    let busy = false;

    const chJump = (v) => {
      const root = document.documentElement;
      const prev = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      const max = root.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.max(0, Math.min(v, max)));
      root.style.scrollBehavior = prev;
    };
    const clear = () => {
      const c = ctx;
      if (!c) return;
      ctx = null;
      busy = false;
      window.removeEventListener("scroll", c.onScroll);
      if (c.fly.parentNode) c.fly.remove();
      c.cells.forEach((el, i) => { el.style.cssText = c.savedCells[i]; });
      c.wrap4.style.opacity = c.savedWrap4;
      c.s4.style.backgroundColor = c.savedBg4;
      c.parEl.style.borderTopColor = c.savedBorderTop;
      c.textBlocks.forEach((b) => {
        b.el.innerHTML = b.html;
        b.el.style.opacity = b.savedOpacity;
        b.el.style.removeProperty("--warp");
      });
      c.KEYS.forEach((k, i) => { c.s5.style[k] = c.savedS5[i]; });
    };

    const morph = () => {
      if (busy || ctx) return true;
      const s4 = document.getElementById("params");
      const s5 = document.getElementById("mould");
      if (!s4 || !s5) return false;
      const parEl = s4.querySelector(".ch-params");
      const wrap4 = s4.querySelector(".ch-wrap");
      if (!parEl || !wrap4) return false;

      const nowY = window.scrollY;
      const top5 = Math.ceil(s5.getBoundingClientRect().top + window.scrollY);
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;
      const r = parEl.getBoundingClientRect();
      const par = { l: r.left, t: r.top, w: r.width, h: r.height };
      const cells = [...parEl.querySelectorAll(":scope > div")];
      const savedCells = cells.map((el) => el.style.cssText);
      const savedWrap4 = wrap4.style.opacity;
      const savedBg4 = s4.style.backgroundColor;
      const KEYS = ["transform", "position", "zIndex", "backgroundColor", "opacity"];
      const savedS5 = KEYS.map((k) => s5.style[k]);

      /* ① 原位那根细直线是真实 .ch-params 的 border-top，压弯后不该还留着。
         转场期间设透明；飞行层也不再重复画下横线（真实 border-bottom 本来就在）。 */
      const savedBorderTop = parEl.style.borderTopColor;
      parEl.style.borderTopColor = "transparent";

      /* ② 标题 + 两段正文：逐字符拆成 inline 片段，按「整条粗线的全局 U」下垂。
         不拆行、不换字体、不重建排版：首帧 --warp=0 时与真实页面完全一致。
         position:relative + top 对 inline 元素生效，且不影响周围排版。 */
      const textBlocks = [...s4.querySelectorAll(".ch-h2, .ch-p")].map((el) => {
        const html = el.innerHTML;
        const savedOpacity = el.style.opacity;
        const norm = (el.textContent || "").replace(/\s+/g, " ").trim();
        const frag = document.createDocumentFragment();
        const chars = [];
        for (const ch of norm) {
          const sp = document.createElement("span");
          sp.textContent = ch;
          sp.style.cssText = "position:relative;display:inline;" +
            "top:calc(var(--warp,0px) * var(--k,0));";
          frag.appendChild(sp);
          chars.push(sp);
        }
        el.textContent = "";
        el.appendChild(frag);
        /* ★ 全局 U = (字符中心 x - 粗线左端)/粗线宽，不是文字块自己的宽度。
           二次贝塞尔 M l t Q (l+w/2) (t+2sag) (l+w) t 的
           y(U) = t + 4*sag*U*(1-U)，且 x(U) = l + U*w 是线性的。
           文字虽只到 U≈0.62，但用同一个 U 就等于「右半边有透明文字」，
           与粗线处处平行；U=0 的左端位移为 0（文字左对齐，只需左侧固定）。 */
        chars.forEach((sp) => {
          const cr = sp.getBoundingClientRect();
          const U = par.w ? (cr.left + cr.width / 2 - par.l) / par.w : 0;
          const uu = Math.max(0, Math.min(1, U));
          sp.style.setProperty("--k", (4 * uu * (1 - uu)).toFixed(4));
        });
        return { el, html, savedOpacity };
      });

      s5.style.transform = "translateY(" + (nowY - top5).toFixed(1) + "px)";
      s5.style.position = "relative";
      s5.style.zIndex = "2";
      s5.style.backgroundColor = "#f7f1e8";
      s5.style.opacity = "0";

      /* 飞行层完全透明：只画被压弯的那根线，文字与视频都用真实 DOM */
      const fly = document.createElement("div");
      fly.className = "ch-fly ch-fly--45";
      fly.style.cssText =
        "position:fixed;inset:0;z-index:15;overflow:hidden;pointer-events:none;background:transparent;";
      const NS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("width", String(vw));
      svg.setAttribute("height", String(vh));
      svg.style.cssText = "position:absolute;left:0;top:0;overflow:visible;will-change:opacity;";
      const mkPath = (stroke, width) => {
        const q = document.createElementNS(NS, "path");
        q.setAttribute("fill", "none");
        q.setAttribute("stroke", stroke);
        q.setAttribute("stroke-width", String(width));
        svg.appendChild(q);
        return q;
      };
      /* 只有这一根：加粗的深巧克力棕片材线。下横线由真实 border-bottom 承担。 */
      const arc = mkPath("#402417", 2.5);
      fly.appendChild(svg);
      document.body.appendChild(fly);

      const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
      const es = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
      const A = 0.55;   // 阶段一：压弧 + 8 格熄灭；阶段二：05 淡入

      const frame = (p) => {
        /* g1 线性：进度推进一分，弧就实实在在多下垂一段 */
        const g1 = cl(p / A);
        /* ★ 两页文字必须严格排队：04 先退干净、05 才淡入。
           长交叉淡化会让两个标题（y=209 / y=132）叠成实心重影，
           和 03→04 那轮修过的问题同源。 */
        const out4 = 1 - es(cl((p - A) / 0.18));
        const in5 = es(cl((p - A - 0.14) / 0.31));
        /* 两端固定在参数表上边，控制点 y = t + 2*sag：
           二次贝塞尔中点正好落在 t + sag，sag 到 par.h 时中点贴住下横线。 */
        const sag = par.h * g1;
        /* 文字与粗线用同一个 sag（不再等比缩小）：字符位移 = sag*4U(1-U)，
           与线 y = t + 4*sag*U*(1-U) 完全平行。每帧每块只写一个 CSS 变量，
           字符自己用 calc() 算 top，开销极小。 */
        textBlocks.forEach((b) => {
          b.el.style.setProperty("--warp", sag.toFixed(2) + "px");
          b.el.style.opacity = String(1 - es(cl((g1 - 0.78) / 0.22)));
        });
        const cx = par.l + par.w / 2;
        arc.setAttribute("d",
          "M" + par.l.toFixed(1) + " " + par.t.toFixed(1) +
          " Q" + cx.toFixed(1) + " " + (par.t + 2 * sag).toFixed(1) +
          " " + (par.l + par.w).toFixed(1) + " " + par.t.toFixed(1));
        svg.style.opacity = String(out4);
        /* 8 格按列从左到右：被压过时轻微下沉 + 熄灭，不新增任何元素 */
        cells.forEach((el, i) => {
          const t = es(cl((g1 - (i % 4) * 0.14) / 0.42));
          el.style.opacity = String(1 - t);
          el.style.transform = "translateY(" + (5 * t).toFixed(1) + "px)";
        });
        /* 04 文字先退干净，05（含真实 video）随后淡入。
           04 的淡紫底同步褪成奶油：05 半透明时透上来的是奶油而不是紫雾。 */
        wrap4.style.opacity = String(out4);
        const bgT = 1 - out4;
        const C4 = [241, 238, 251], C5 = [247, 241, 232];
        s4.style.backgroundColor = "rgb(" + C4.map((v, j) =>
          Math.round(v + (C5[j] - v) * bgT)).join(",") + ")";
        s5.style.opacity = String(in5);
        fly.dataset.p = p.toFixed(3);
        fly.dataset.sag = sag.toFixed(1);
      };

      let finishing = false;

      const finish = () => {
        if (!ctx || finishing) return;
        finishing = true;
        frame(1);
        chJump(top5);
        clear();
      };
      /* 被导航点击 / 键盘滚动打断时，直接还原真实 DOM，不强行落位 */
      const onScroll = () => {
        if (!ctx || finishing) return;
        if (Math.abs(window.scrollY - nowY) > 4) clear();
      };
      /* ★ 定时播放：进度只由时间推进，滚轮不再驱动。
         一串猛滑在 busy 期间全被分页器吞掉，1.5s 播完时手势早已结束，
         所以直接落位不会再出现「剩余格被当成新手势」的问题。 */
      const T = 1500;
      const t0 = performance.now();
      const tick = (now) => {
        if (!ctx || finishing) return;
        const p = Math.min(1, (now - t0) / T);
        frame(p);
        if (p >= 1) { finish(); return; }
        requestAnimationFrame(tick);
      };

      window.addEventListener("scroll", onScroll);
      busy = true;
      ctx = { fly, cells, savedCells, wrap4, savedWrap4, s4, savedBg4,
        parEl, savedBorderTop, textBlocks,
        s5, savedS5, KEYS, onScroll, baseY: nowY };
      frame(0);
      requestAnimationFrame(tick);
      return true;
    };

    return {
      down: (cur, next) => {
        if (!cur || cur.id !== "params" || !next || next.id !== "mould") return false;
        return morph();
      },
      up: () => false,   // 05 → 04 保持原来的普通上移
      busy: () => busy
    };
  })();

  /* ---------- 05 ↔ 06：同一条 1160 栅格上「框内换画」（用户 2026-11-08 选方案 B） ----------
     ★ 正向 05→06：05 段底几乎满屏是真空成型视频；真实 <video> 淡出，
       真实 #making 平移进当前视口、提层、自带淡紫底淡入 —— 框里画面从
       真空成型换成 06 的两朵成品花，随后标题与 4 张步骤卡归位。
     ★ 全程不 clone：05 的 video 一直是同一个实时节点，06 用真实 section 平移，
       既没有「变 poster 静态图」的断层，也没有图片懒加载问题。
     ★ 反向 06→05 按用户要求「根据逻辑倒放，不要纯倒放」：
       单独写 frameBack，按「回到 05」的逻辑重排
       ① 06 的文字 / 4 卡先退 → ② 对比图淡出、真实视频淡入 → ③ 落到 05 段底，
       绝不是 frame(1-k) 那种时间反演（会让文字倒着长、框往回缩）。
     ★ 定时 1.5s；遵守铁律；导航点击中断时还原真实 DOM。
  */
  const CH_56_MORPH = (() => {
    let ctx = null;
    let busy = false;

    const chJump = (v) => {
      const root = document.documentElement;
      const prev = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      const max = root.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.max(0, Math.min(v, max)));
      root.style.scrollBehavior = prev;
    };
    const KEYS = ["transform", "position", "zIndex", "backgroundColor", "opacity"];
    const save = (el) => KEYS.map((k) => el.style[k]);
    const restore = (el, a) => KEYS.forEach((k, i) => { el.style[k] = a[i]; });

    const clear = () => {
      const c = ctx;
      if (!c) return;
      ctx = null;
      busy = false;
      window.removeEventListener("scroll", c.onScroll);
      if (c.fly.parentNode) c.fly.remove();
      restore(c.s5, c.saved5);
      restore(c.s6, c.saved6);
      c.parts.forEach((p) => { p.el.style.opacity = p.saved; });
      c.video.style.opacity = c.savedVideo;
    };

    const morph = (dir) => {
      if (busy || ctx) return true;
      const s5 = document.getElementById("mould");
      const s6 = document.getElementById("making");
      if (!s5 || !s6) return false;
      const video = s5.querySelector("video");
      const compareFig = s6.querySelector(".ch-compare figure");
      const copy = s6.querySelector(".ch-compare__copy");
      const steps = s6.querySelector(".ch-steps");
      const head = [...s6.querySelectorAll(".ch-eyebrow, .ch-h2")];
      if (!video || !compareFig || !copy || !steps) return false;

      const fwd = dir > 0;
      const nowY = window.scrollY;
      const top5 = Math.ceil(s5.getBoundingClientRect().top + window.scrollY);
      const top6 = Math.ceil(s6.getBoundingClientRect().top + window.scrollY);
      const vh = window.innerHeight;
      const end5 = Math.max(top5, top5 + s5.offsetHeight - vh);
      const toY = fwd ? top6 : end5;

      const saved5 = save(s5), saved6 = save(s6);
      const savedVideo = video.style.opacity;
      const parts = [compareFig, copy, steps, ...head].map((el) =>
        ({ el, saved: el.style.opacity }));

      /* 视频框在「触发当下视口」；06 对比图换算成「落位视口」坐标。
         正向先把 06 对齐到视频框顶，动画里再把这段对齐收掉 → 落位零跳变。 */
      const vTop = video.getBoundingClientRect().top;
      const cTopIn6 = compareFig.getBoundingClientRect().top + nowY - top6;
      const align = vTop - cTopIn6;
      const shift6 = nowY - top6;
      const shift5 = nowY - toY;

      if (fwd) {
        s6.style.transform = "translateY(" + (shift6 + align).toFixed(1) + "px)";
        s6.style.position = "relative";
        s6.style.zIndex = "2";
        s6.style.backgroundColor = "#f1eefb";
        s6.style.opacity = "0";
        video.style.opacity = "1";
        parts.forEach((p) => { p.el.style.opacity = "0"; });
      } else {
        s5.style.transform = "translateY(" + shift5.toFixed(1) + "px)";
        s5.style.position = "relative";
        s5.style.zIndex = "3";
        s5.style.backgroundColor = "#faf5ee";
        s5.style.opacity = "0";
        s6.style.position = "relative";
        s6.style.zIndex = "2";
      }

      /* 透明标记层：只用于状态判定，z=1 低于两页，不遮挡任何内容 */
      const fly = document.createElement("div");
      fly.className = "ch-fly ch-fly--56";
      fly.style.cssText = "position:fixed;inset:0;z-index:1;pointer-events:none;background:transparent;";
      document.body.appendChild(fly);

      const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
      const es = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);

      /* 正向：① 框内换画（视频 → 两朵花）② 对齐收掉、标题与 4 卡归位 */
      const frame = (p) => {
        const g1 = es(cl(p / 0.62));
        const g2 = es(cl((p - 0.62) / 0.38));
        s6.style.transform = "translateY(" + (shift6 + align * (1 - g2)).toFixed(1) + "px)";
        s6.style.opacity = String(g1);
        video.style.opacity = String(1 - g1);
        compareFig.style.opacity = "1";
        /* 右侧文字比换画稍晚才长出来，让前段专注「视频 → 两朵花」 */
        copy.style.opacity = String(es(cl((p - 0.36) / 0.30)));
        steps.style.opacity = String(g2);
        head.forEach((el) => { el.style.opacity = String(g2); });
        fly.dataset.p = p.toFixed(3);
      };

      /* ★ 反向：按「回到 05」的逻辑重排步骤，不是把正向倒着播。
         起手是 06 段底（4 张卡完整可见），所以先让 06 的内容退场，
         再换回视频，最后落到 05 段底 —— 每一步都是正向演的动作。 */
      const frameBack = (k) => {
        const out = 1 - es(cl(k / 0.32));
        const g = es(cl((k - 0.28) / 0.52));
        steps.style.opacity = String(out);
        copy.style.opacity = String(out);
        head.forEach((el) => { el.style.opacity = String(out); });
        compareFig.style.opacity = String(1 - g);
        s5.style.opacity = String(g);
        fly.dataset.p = k.toFixed(3);
      };

      let finishing = false;
      const finish = () => {
        if (!ctx || finishing) return;
        finishing = true;
        if (fwd) frame(1); else frameBack(1);
        chJump(toY);
        clear();
      };
      const onScroll = () => {
        if (!ctx || finishing) return;
        if (Math.abs(window.scrollY - nowY) > 4) clear();
      };
      const T = 1500;
      const t0 = performance.now();
      const tick = (now) => {
        if (!ctx || finishing) return;
        const p = Math.min(1, (now - t0) / T);
        if (fwd) frame(p); else frameBack(p);
        if (p >= 1) { finish(); return; }
        requestAnimationFrame(tick);
      };

      window.addEventListener("scroll", onScroll);
      busy = true;
      ctx = { fly, s5, s6, saved5, saved6, parts, video, savedVideo, onScroll };
      if (fwd) frame(0); else frameBack(0);
      requestAnimationFrame(tick);
      return true;
    };

    return {
      down: (cur, next) => {
        if (!cur || cur.id !== "mould" || !next || next.id !== "making") return false;
        return morph(1);
      },
      up: (cur, prev) => {
        if (!cur || cur.id !== "making" || !prev || prev.id !== "mould") return false;
        return morph(-1);
      },
      busy: () => busy
    };
  })();

  /* ---------- 06 ↔ 07：圆筒曲面连续转（用户 2026-11-08 选方案 C） ----------
     ★ 不是 4 个平面拼的 90° 立方体，也不是单张翻牌：
       4 张卡弯贴成一段圆柱弧面（中间正对、两侧斜着缩小），整个 drum
       绕竖轴连续转 180°；转到背面露出的就是 07 的四色花，最后展平落位。
       front 恒为 06 的 01–04 步骤卡，back 恒为 07 口味卡（逆序贴，
       用来抵消 rotateY(180°) 的左右镜像，落位后顺序仍是棕/粉/蓝绿/紫）。
     ★ 两页都用真实 section 平移 + 提层 + 自带底色淡入，不克隆 section
       （07 有 #colours 专属 padding 规则，克隆会丢样式）；真实卡片区
       临时 visibility:hidden，由飞行层的 3D 卡代替，结束恢复。
     ★ 反向按「同一套动作换主角」：phi 从 180° 连续转回 0°，
       front/back 与落位坐标整体对调，不是 frame(1-k) 时间反演。
  */
  const CH_67_MORPH = (() => {
    let ctx = null;
    let busy = false;

    const chJump = (v) => {
      const root = document.documentElement;
      const prev = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      const max = root.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.max(0, Math.min(v, max)));
      root.style.scrollBehavior = prev;
    };
    const KEYS = ["transform", "position", "zIndex", "backgroundColor", "opacity"];
    const save = (el) => KEYS.map((k) => el.style[k]);
    const restore = (el, a) => KEYS.forEach((k, i) => { el.style[k] = a[i]; });

    const clear = () => {
      const c = ctx;
      if (!c) return;
      ctx = null;
      busy = false;
      window.removeEventListener("scroll", c.onScroll);
      if (c.fly.parentNode) c.fly.remove();
      restore(c.s6, c.saved6);
      restore(c.s7, c.saved7);
      c.stepsEl.style.visibility = c.savedStepsVis;
      c.swEl.style.visibility = c.savedSwVis;
      c.srcWrap.style.opacity = c.savedSrcWrap;
      c.dstWrap.style.opacity = c.savedDstWrap;
    };

    const morph = (dir) => {
      if (busy || ctx) return true;
      const s6 = document.getElementById("making");
      const s7 = document.getElementById("colours");
      if (!s6 || !s7) return false;
      const stepsEl = s6.querySelector(".ch-steps");
      const swEl = s7.querySelector(".ch-swatches");
      const stepFigs = [...s6.querySelectorAll(".ch-steps figure")];
      const swFigs = [...s7.querySelectorAll(".ch-swatches figure")];
      if (!stepsEl || !swEl || stepFigs.length < 4 || swFigs.length < 4) return false;

      const fwd = dir > 0;
      const nowY = window.scrollY;
      const top6 = Math.ceil(s6.getBoundingClientRect().top + window.scrollY);
      const top7 = Math.ceil(s7.getBoundingClientRect().top + window.scrollY);
      const vh = window.innerHeight;
      const end6 = Math.max(top6, top6 + s6.offsetHeight - vh);
      const toY = fwd ? top7 : end6;
      const shift = nowY - toY;

      /* 起手卡片 rect（当前视口）／落位卡片 rect（换算到落位视口） */
      const srcRaw = (fwd ? stepFigs[0] : swFigs[0]).getBoundingClientRect();
      const dstRaw = (fwd ? swFigs[0] : stepFigs[0]).getBoundingClientRect();
      const src = { l: srcRaw.left, t: srcRaw.top, w: srcRaw.width, h: srcRaw.height };
      const dst = { l: dstRaw.left, t: dstRaw.top + shift, w: dstRaw.width, h: dstRaw.height };
      const gapStep = stepFigs[1].getBoundingClientRect().left - stepFigs[0].getBoundingClientRect().left;
      const gapSw = swFigs[1].getBoundingClientRect().left - swFigs[0].getBoundingClientRect().left;
      const srcGap = fwd ? gapStep : gapSw;
      const dstGap = fwd ? gapSw : gapStep;

      const saved6 = save(s6), saved7 = save(s7);
      const savedStepsVis = stepsEl.style.visibility;
      const savedSwVis = swEl.style.visibility;

      const dstSec = fwd ? s7 : s6;
      const srcSec0 = fwd ? s6 : s7;
      const srcWrap = srcSec0.querySelector(".ch-wrap");
      const dstWrap = dstSec.querySelector(".ch-wrap");
      const savedSrcWrap = srcWrap.style.opacity;
      const savedDstWrap = dstWrap.style.opacity;
      dstSec.style.transform = "translateY(" + shift.toFixed(1) + "px)";
      dstSec.style.position = "relative";
      dstSec.style.zIndex = "2";
      dstSec.style.backgroundColor = fwd ? "#2a1811" : "#f1eefb";
      dstSec.style.opacity = "0";
      const srcSec = fwd ? s6 : s7;
      srcSec.style.position = "relative";
      srcSec.style.zIndex = "1";
      stepsEl.style.visibility = "hidden";
      swEl.style.visibility = "hidden";

      const fly = document.createElement("div");
      fly.className = "ch-fly ch-fly--67";
      fly.style.cssText =
        "position:fixed;inset:0;z-index:15;pointer-events:none;background:transparent;" +
        "perspective:1600px;perspective-origin:50% 50%;";
      const drum = document.createElement("div");
      drum.style.cssText =
        "position:absolute;inset:0;transform-style:preserve-3d;" +
        "transform-origin:50% 50%;will-change:transform;";
      fly.appendChild(drum);

      /* 预取全部 8 张图，避免飞行层里 lazy 图来不及加载 */
      [...stepFigs, ...swFigs].forEach((fig) => {
        const im = fig.querySelector("img");
        if (im) { const pre = new Image(); pre.src = im.currentSrc || im.getAttribute("src"); }
      });

      const mkFace = (fig, dark) => {
        const face = document.createElement("div");
        face.style.cssText =
          "position:absolute;inset:0;backface-visibility:hidden;overflow:hidden;";
        /* 包一层同名祖先 class，后代选择器 .ch-steps img / .ch-swatches img 才生效 */
        const wrap = document.createElement("div");
        wrap.className = dark ? "ch-swatches" : "ch-steps";
        wrap.style.cssText =
          "display:grid;grid-template-columns:1fr;gap:0;margin:0;height:100%;";
        const clone = fig.cloneNode(true);
        clone.style.cssText = "margin:0;height:100%;";
        clone.querySelectorAll("img").forEach((im) => {
          im.loading = "eager";
          im.style.cssText += "width:100%;height:auto;";
        });
        wrap.appendChild(clone);
        face.appendChild(wrap);
        return face;
      };

      const cards = [0, 1, 2, 3].map((i) => {
        const box = document.createElement("div");
        box.style.cssText =
          "position:absolute;transform-style:preserve-3d;will-change:left,top,width,height,transform;";
        const front = mkFace(stepFigs[i], false);
        /* ★ back 逆序：drum 转 180° 后左右镜像，逆序贴图才能让
           落位画面从左到右仍是 棕 / 粉 / 蓝绿 / 紫 */
        const back = mkFace(swFigs[3 - i], true);
        back.style.transform = "rotateY(180deg)";
        box.appendChild(front);
        box.appendChild(back);
        drum.appendChild(box);
        return box;
      });
      document.body.appendChild(fly);

      const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
      const es = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
      const lerp = (a, b, t) => a + (b - a) * t;

      const frame = (p) => {
        /* 三段：① 0–28% 只弯成曲面（不转，让观众看清中间正对 / 两侧斜缩）
           ② 28–78% 曲面连续转 180°  ③ 78–100% 展平落位 */
        const curve = es(cl(p / 0.28)) * (1 - es(cl((p - 0.78) / 0.22)));
        const turn = cl((p - 0.28) / 0.50);
        const phi = fwd ? 180 * turn : 180 * (1 - turn);
        drum.style.transform = "rotateY(" + phi.toFixed(2) + "deg)";
        const g = es(p);
        cards.forEach((box, i) => {
          const a = (i - 1.5) * 24 * curve;
          /* Z 位移只保留一小部分：过大时透视会把 4 张卡向屏幕中心收缩、互相挤叠。
             曲面感主要由 rotateY 的倾斜提供，Z 只做轻微的前后层次。 */
          const z = 420 * (Math.cos(a * Math.PI / 180) - 1) * 0.32 * curve;
          box.style.left = lerp(src.l + i * srcGap, dst.l + i * dstGap, g).toFixed(1) + "px";
          box.style.top = lerp(src.t, dst.t, g).toFixed(1) + "px";
          box.style.width = lerp(src.w, dst.w, g).toFixed(1) + "px";
          box.style.height = lerp(src.h, dst.h, g).toFixed(1) + "px";
          box.style.transform = "rotateY(" + a.toFixed(2) + "deg) translateZ(" + z.toFixed(1) + "px)";
        });
        dstSec.style.opacity = String(es(cl((p - 0.20) / 0.60)));
        /* ★ 两页文字严格排队，避免 07 的白色标题提前透出来和 06 文字叠成重影：
           06 内容先退干净，07 内容等底色铺过半才淡入，中间一段由 3D 曲面撑住。 */
        srcWrap.style.opacity = String(1 - es(cl(p / 0.34)));
        dstWrap.style.opacity = String(es(cl((p - 0.56) / 0.34)));
        fly.dataset.p = p.toFixed(3);
        fly.dataset.phi = phi.toFixed(1);
        fly.dataset.curve = curve.toFixed(3);
      };

      let finishing = false;
      const finish = () => {
        if (!ctx || finishing) return;
        finishing = true;
        frame(1);
        chJump(toY);
        clear();
      };
      const onScroll = () => {
        if (!ctx || finishing) return;
        if (Math.abs(window.scrollY - nowY) > 4) clear();
      };
      const T = 1500;
      const t0 = performance.now();
      const tick = (now) => {
        if (!ctx || finishing) return;
        const p = Math.min(1, (now - t0) / T);
        frame(p);
        if (p >= 1) { finish(); return; }
        requestAnimationFrame(tick);
      };

      window.addEventListener("scroll", onScroll);
      busy = true;
      ctx = { fly, s6, s7, saved6, saved7, stepsEl, swEl, savedStepsVis, savedSwVis,
        srcWrap, dstWrap, savedSrcWrap, savedDstWrap, onScroll };
      frame(0);
      requestAnimationFrame(tick);
      return true;
    };

    return {
      down: (cur, next) => {
        if (!cur || cur.id !== "making" || !next || next.id !== "colours") return false;
        return morph(1);
      },
      up: (cur, prev) => {
        if (!cur || cur.id !== "colours" || !prev || prev.id !== "making") return false;
        return morph(-1);
      },
      busy: () => busy
    };
  })();

  /* 六个专属转场共用一个钩子：首屏↔01 → 01↔02 → 03↔04 → 04→05（单向） → 05↔06 → 06↔07 */
  const CH_TRANSITIONS = {
    down: (cur, next) => CH_HERO_MORPH.down(cur, next) || CH_12_MORPH.down(cur, next) ||
      CH_34_MORPH.down(cur, next) || CH_45_MORPH.down(cur, next) ||
      CH_56_MORPH.down(cur, next) || CH_67_MORPH.down(cur, next),
    /* 05 → 04 刻意不接 CH_45_MORPH：用户要普通上移 */
    up: (cur, prev) => CH_HERO_MORPH.up(cur, prev) || CH_12_MORPH.up(cur, prev) ||
      CH_34_MORPH.up(cur, prev) || CH_56_MORPH.up(cur, prev) || CH_67_MORPH.up(cur, prev),
    busy: () => CH_HERO_MORPH.busy() || CH_12_MORPH.busy() || CH_34_MORPH.busy() ||
      CH_45_MORPH.busy() || CH_56_MORPH.busy() || CH_67_MORPH.busy()
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
