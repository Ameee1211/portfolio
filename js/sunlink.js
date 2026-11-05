/* ============================================================
   SunLink Neighbours — 项目页交互
   1) 三种电池状态切换
   2) Adobe XD 原型懒加载嵌入（三状态）
   3) 电路图 SPDT 开关
   4) 六户社区 3D 模型（three.js，拖拽旋转 + 电流动画）
   ============================================================ */

(function () {
  "use strict";

  /* ---------- 1. 三种电池状态 ---------- */
  function initStateTabs() {
    const tabs = [...document.querySelectorAll(".sl-tab[data-state]")];
    const panels = [...document.querySelectorAll(".sl-panel[data-panel]")];
    if (!tabs.length || !panels.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const key = tab.dataset.state;
        tabs.forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
        panels.forEach((p) => (p.hidden = p.dataset.panel !== key));
      });
    });
  }

  /* ---------- 2. XD 原型嵌入 ---------- */
  const XD = {
    green: {
      id: "652e1648-9f5c-46c7-9e9b-7e457586dc36-307d",
      label: "Full · green",
    },
    blue: {
      id: "71488978-8a59-4abd-90fe-fa0bc8448f2c-241b",
      label: "Balanced · blue",
    },
    red: {
      id: "837950d7-938b-4f6b-afe7-4154c32fdefb-d62a",
      label: "Insufficient · red",
    },
  };

  function initPrototype() {
    const frame = document.querySelector(".sl-embed__frame");
    const gate = document.getElementById("slEmbedGate");
    const link = document.getElementById("slEmbedLink");
    const tabs = [...document.querySelectorAll(".sl-tab[data-proto]")];
    if (!frame || !gate) return;

    let current = "green";
    let iframe = null;

    const viewUrl = (k) => `https://xd.adobe.com/view/${XD[k].id}/`;
    const embedUrl = (k) => `https://xd.adobe.com/embed/${XD[k].id}/?fullscreen&hints=off`;

    function sync() {
      if (link) link.href = viewUrl(current);
      if (gate) gate.style.backgroundImage = `url(assets/img/sl-panel-${current}.webp)`;
      if (iframe) iframe.src = embedUrl(current);
    }

    sync();

    gate.addEventListener("click", () => {
      if (iframe) return;
      iframe = document.createElement("iframe");
      iframe.title = "SunLink Neighbours interactive prototype";
      iframe.allow = "fullscreen";
      iframe.loading = "lazy";
      iframe.src = embedUrl(current);
      frame.appendChild(iframe);
      gate.remove();
      sync();
    });

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        current = tab.dataset.proto;
        tabs.forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
        sync();
      });
    });
  }

  /* ---------- 3. 电路图开关 ---------- */
  function initCircuit() {
    const box = document.getElementById("slCircuit");
    const lever = document.getElementById("slLever");
    const bBattery = document.getElementById("slSwitchBattery");
    const bInverter = document.getElementById("slSwitchInverter");
    if (!box || !lever) return;

    const TOP = 110;
    const BOTTOM = 250;
    let raf = 0;

    function setMode(mode) {
      box.dataset.mode = mode;
      if (bBattery) bBattery.setAttribute("aria-pressed", String(mode === "battery"));
      if (bInverter) bInverter.setAttribute("aria-pressed", String(mode === "inverter"));

      const from = Number(lever.getAttribute("y2"));
      const to = mode === "battery" ? TOP : BOTTOM;
      cancelAnimationFrame(raf);
      const t0 = performance.now();
      const tick = (now) => {
        const k = Math.min(1, (now - t0) / 240);
        const e = 1 - Math.pow(1 - k, 3);
        lever.setAttribute("y2", (from + (to - from) * e).toFixed(1));
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    if (bBattery) bBattery.addEventListener("click", () => setMode("battery"));
    if (bInverter) bInverter.addEventListener("click", () => setMode("inverter"));
  }

  /* ---------- 4. 六户社区 3D ---------- */
  const HOOD = [
    { name: "You", status: "you" },
    { name: "James", status: "full" },
    { name: "Billy", status: "low" },
    { name: "Amanda", status: "low" },
    { name: "Alice", status: "low" },
    { name: "Brady", status: "full" },
  ];

  const COPY = {
    share:
      "<b>Sharing.</b> Your house is full, Amanda's is empty — the current leaves your roof, passes through the shared bus in the middle, and arrives at her battery.",
    balanced:
      "<b>Balanced.</b> Nobody is giving and nobody is asking: every house sits between 21% and 99%, which is where a street spends most of its day.",
    receive:
      "<b>Receiving.</b> Your battery is below 20% and Brady's is full. The current runs the other way along the same cable — the street is symmetric, anyone can be either end of it.",
  };

  const COLORS = {
    full: 0x6fd39a,
    low: 0xf07474,
    balanced: 0x5b9fdd,
    you: 0x9fdcb4,
  };

  function init3D() {
    const host = document.getElementById("sl3dCanvas");
    const caption = document.getElementById("sl3dCaption");
    if (!host) return;
    if (!window.THREE) {
      host.insertAdjacentHTML(
        "beforeend",
        '<div class="sl-3d__fallback">3D model needs WebGL — open on a desktop browser.</div>'
      );
      return;
    }

    const THREE = window.THREE;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* --- 渲染器 --- */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 16 / 9, 0.1, 100);
    camera.position.set(0, 8.1, 11.9);
    camera.lookAt(0, 0.05, 0);

    /* --- 灯光 --- */
    scene.add(new THREE.HemisphereLight(0xdfeaf7, 0x3a2f24, 0.85));

    const key = new THREE.DirectionalLight(0xfff6e8, 1.85);
    key.position.set(4.6, 8.4, 5.2);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -6.5;
    key.shadow.camera.right = 6.5;
    key.shadow.camera.top = 6.5;
    key.shadow.camera.bottom = -6.5;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 24;
    key.shadow.bias = -0.0012;
    key.shadow.radius = 3;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x8fb8e0, 0.55);
    fill.position.set(-6, 3.4, -4.6);
    scene.add(fill);

    /* --- 纸板地面 --- */
    function cardboardTexture() {
      const c = document.createElement("canvas");
      c.width = c.height = 512;
      const g = c.getContext("2d");
      g.fillStyle = "#c8a87c";
      g.fillRect(0, 0, 512, 512);
      for (let y = 0; y < 512; y += 7) {
        g.fillStyle = y % 14 === 0 ? "rgba(160,126,86,0.14)" : "rgba(255,238,214,0.10)";
        g.fillRect(0, y, 512, 2);
      }
      for (let i = 0; i < 900; i++) {
        g.fillStyle = `rgba(120,92,60,${Math.random() * 0.05})`;
        g.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
      }
      const t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(3, 3);
      t.anisotropy = 4;
      return t;
    }

    const board = new THREE.Mesh(
      new THREE.BoxGeometry(9.9, 0.16, 9.9),
      new THREE.MeshStandardMaterial({
        map: cardboardTexture(),
        color: 0xffffff,
        roughness: 0.96,
        metalness: 0,
      })
    );
    board.position.y = -0.08;
    board.receiveShadow = true;
    scene.add(board);

    const world = new THREE.Group();
    scene.add(world);

    /* --- 材质 --- */
    const matPla = new THREE.MeshStandardMaterial({
      color: 0xf1efea,
      roughness: 0.82,
      metalness: 0.02,
    });
    const matRoof = new THREE.MeshStandardMaterial({
      color: 0xe6e3dd,
      roughness: 0.85,
      metalness: 0.02,
    });
    const matDoor = new THREE.MeshStandardMaterial({
      color: 0x8b6a48,
      roughness: 0.8,
    });
    const matCable = new THREE.MeshStandardMaterial({
      color: 0x1d1a18,
      roughness: 0.72,
      metalness: 0.06,
    });

    /* 三棱柱屋顶 */
    function prism(w, h, l) {
      const hw = w / 2;
      const hl = l / 2;
      const v = [
        [-hw, 0, hl], [hw, 0, hl], [0, h, hl],      // 前
        [-hw, 0, -hl], [hw, 0, -hl], [0, h, -hl],   // 后
      ];
      const faces = [
        [0, 1, 2], [5, 4, 3],           // 前后三角
        [0, 2, 5], [0, 5, 3],           // 左坡
        [1, 4, 5], [1, 5, 2],           // 右坡
        [0, 3, 4], [0, 4, 1],           // 底
      ];
      const pos = [];
      faces.forEach((f) => f.forEach((i) => pos.push(...v[i])));
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.computeVertexNormals();
      return g;
    }

    /* --- 一栋房子 --- */
    const HOUSE_W = 1.16;
    const HOUSE_H = 0.8;
    const HOUSE_D = 1.5;
    const ROOF_W = 1.38;
    const ROOF_H = 0.46;
    const ROOF_D = 1.68;

    function makeHouse(i) {
      const g = new THREE.Group();

      const body = new THREE.Mesh(new THREE.BoxGeometry(HOUSE_W, HOUSE_H, HOUSE_D), matPla);
      body.position.y = HOUSE_H / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      g.add(body);

      const roof = new THREE.Mesh(prism(ROOF_W, ROOF_H, ROOF_D), matRoof);
      roof.position.y = HOUSE_H;
      roof.castShadow = true;
      roof.receiveShadow = true;
      g.add(roof);

      // 太阳能板（贴在 +x 坡面）
      const slope = Math.atan2(ROOF_H, ROOF_W / 2);
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.026, ROOF_D * 0.5),
        new THREE.MeshStandardMaterial({
          color: 0x1b2c46,
          roughness: 0.32,
          metalness: 0.45,
          emissive: 0x0a1524,
          emissiveIntensity: 0.4,
        })
      );
      // 沿坡面从屋脊往下 46% 处放，四周留出屋面的边，像真的打印模型
      const t = 0.46;
      const cx = (ROOF_W / 2) * t;
      const cy = ROOF_H * (1 - t);
      const nx = Math.sin(slope) * 0.015;
      const ny = Math.cos(slope) * 0.015;
      panel.position.set(cx + nx, HOUSE_H + cy + ny, 0);
      panel.rotation.z = -slope;
      panel.castShadow = true;
      g.add(panel);

      // 电池/逆变器盒子 + 状态屏
      const boxMat = new THREE.MeshStandardMaterial({ color: 0xd8d5cf, roughness: 0.7 });
      const dev = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.08), boxMat);
      dev.position.set(-0.14, 0.44, HOUSE_D / 2 + 0.03);
      dev.castShadow = true;
      g.add(dev);

      const screenMat = new THREE.MeshStandardMaterial({
        color: COLORS.full,
        emissive: COLORS.full,
        emissiveIntensity: 0.55,
        roughness: 0.4,
      });
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.19, 0.24), screenMat);
      screen.position.set(-0.14, 0.44, HOUSE_D / 2 + 0.075);
      g.add(screen);

      // 门（+z 侧面）
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.52, 0.04), matDoor);
      door.position.set(0.28, 0.26, HOUSE_D / 2 + 0.01);
      g.add(door);

      // 底座
      const plinth = new THREE.Mesh(
        new THREE.BoxGeometry(HOUSE_W + 0.08, 0.05, HOUSE_D + 0.08),
        new THREE.MeshStandardMaterial({ color: 0xdbd7d0, roughness: 0.9 })
      );
      plinth.position.y = 0.025;
      plinth.receiveShadow = true;
      g.add(plinth);

      return {
        group: g,
        screen,
        screenMat,
        panelMat: panel.material,
        anchor: new THREE.Vector3(0, HOUSE_H + ROOF_H + 0.34, 0),
      };
    }

    /* --- 布局：六户围成一圈，第一户在正前方 --- */
    const R = 3.05;
    const houses = [];
    HOOD.forEach((h, i) => {
      const a = (i / HOOD.length) * Math.PI * 2;
      const x = Math.sin(a) * R;
      const z = Math.cos(a) * R;
      const made = makeHouse(i);
      made.group.position.set(x, 0, z);
      made.group.rotation.y = Math.atan2(x, z);
      made.data = h;
      made.angle = a;
      world.add(made.group);
      houses.push(made);
    });

    /* --- 中心 hub --- */
    const hub = new THREE.Group();
    const drum = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 0.54, 48),
      new THREE.MeshStandardMaterial({ color: 0x231b16, roughness: 0.45, metalness: 0.28 })
    );
    drum.position.y = 0.27;
    drum.castShadow = true;
    drum.receiveShadow = true;
    hub.add(drum);
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.41, 0.41, 0.03, 48),
      new THREE.MeshStandardMaterial({ color: 0x150f0c, roughness: 0.7 })
    );
    cap.position.y = 0.55;
    hub.add(cap);
    world.add(hub);

    /* --- 线缆 --- */
    const cables = [];
    houses.forEach((h, i) => {
      const p = h.group.position;
      const dir = new THREE.Vector3(-p.x, 0, -p.z).normalize();
      const start = new THREE.Vector3(0, HOUSE_H + ROOF_H - 0.02, 0)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), h.group.rotation.y)
        .add(p);
      const skirt = start.clone().add(dir.clone().multiplyScalar(0.34)).setY(0.06);
      const nearHub = dir.clone().multiplyScalar(0.62).setY(0.06);
      const topHub = new THREE.Vector3(
        dir.x * 0.42,
        0.58,
        dir.z * 0.42
      );
      const mid = skirt.clone().lerp(nearHub, 0.5).setY(0.045);
      const curve = new THREE.CatmullRomCurve3([start, skirt, mid, nearHub, topHub], false, "catmullrom", 0.4);

      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 70, 0.028, 7, false), matCable);
      tube.castShadow = true;
      world.add(tube);

      // 电流粒子
      const dots = [];
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xffd479, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending });
      for (let k = 0; k < 3; k++) {
        const d = new THREE.Mesh(new THREE.SphereGeometry(0.058, 10, 10), dotMat.clone());
        d.visible = false;
        world.add(d);
        dots.push({ mesh: d, phase: k / 3 });
      }
      cables.push({ curve, dots, tube });
    });

    /* --- 名字标签 --- */
    const hex = (n) => "#" + n.toString(16).padStart(6, "0");
    const labels = houses.map((h) => {
      const el = document.createElement("span");
      el.className = "sl-label" + (h.data.status === "you" ? " is-you" : "");
      el.innerHTML = `<i></i>${h.data.name}`;
      host.appendChild(el);
      const dot = el.querySelector("i");
      dot.style.background = hex(COLORS[h.data.status === "you" ? "balanced" : h.data.status]);
      h.dot = dot;                 // 让 paint() 能同步改小圆点颜色
      h.hex = hex;
      return { el, house: h };
    });

    /* --- 状态 --- */
    const state = { mode: "share", t: 0 };
    const flow = {
      share: [0, 3],     // 你家 → Amanda
      receive: [5, 0],   // Brady → 你家
      balanced: null,
    };

    function paint() {
      const f = flow[state.mode];
      houses.forEach((h, i) => {
        let tone = h.data.status;
        if (h.data.status === "you") {
          tone = state.mode === "share" ? "full" : state.mode === "receive" ? "low" : "balanced";
        }
        const c = COLORS[tone];
        h.screenMat.color.setHex(c);
        h.screenMat.emissive.setHex(c);
        h.screenMat.emissiveIntensity = 0.75;
        // 名字旁的小圆点必须和房子上的电池灯同色
        if (h.dot) h.dot.style.background = h.hex(c);

        const lit = f && (i === f[0] || i === f[1]);
        h.panelMat.emissive.setHex(lit ? 0x14442d : 0x0a1524);
        h.panelMat.emissiveIntensity = lit ? 0.26 : 0.4;
      });

      cables.forEach((c, i) => {
        const on = f && (i === f[0] || i === f[1]);
        c.dots.forEach((d) => (d.mesh.visible = !!on));
      });

      if (caption) caption.innerHTML = COPY[state.mode];
    }

    function setMode(mode) {
      if (!flow.hasOwnProperty(mode)) return;
      state.mode = mode;
      document.querySelectorAll(".sl-3d__btn").forEach((b) => {
        b.setAttribute("aria-pressed", String(b.dataset.mode === mode));
      });
      paint();
    }

    document.querySelectorAll(".sl-3d__btn").forEach((b) => {
      b.addEventListener("click", () => setMode(b.dataset.mode));
    });

    paint();

    /* --- 交互：拖拽旋转 --- */
    let dragging = false;
    let lastX = 0;
    let vel = 0;
    const el = renderer.domElement;

    host.addEventListener("pointerdown", (e) => {
      dragging = true;
      lastX = e.clientX;
      host.classList.add("is-dragging");
    });
    window.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      world.rotation.y += dx * 0.0075;
      vel = dx * 0.0075;
    });
    window.addEventListener("pointerup", () => {
      dragging = false;
      host.classList.remove("is-dragging");
    });

    /* --- 尺寸 --- */
    const CAM = { y: 7.9, z: 11.5 };
    function resize() {
      const w = host.clientWidth || 900;
      const h = host.clientHeight || 480;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // 窄屏（手机）时把相机按比例推远，保证六栋房子都在画面里
      const k = Math.min(1.95, Math.max(1, 1.52 / camera.aspect));
      camera.position.set(0, CAM.y * k, CAM.z * k);
      camera.lookAt(0, 0.05, 0);
      camera.updateProjectionMatrix();
    }
    resize();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(host);
    else window.addEventListener("resize", resize);

    /* --- 循环 --- */
    const tmp = new THREE.Vector3();
    let visible = true;
    let last = performance.now();

    function project(v) {
      // v 必须是已经转换到世界坐标的点；再乘 world.matrixWorld 会叠加一次旋转，
      // 名字就会和房子转速对不上（旧 bug）
      tmp.copy(v).project(camera);
      return {
        x: (tmp.x * 0.5 + 0.5) * host.clientWidth,
        y: (-tmp.y * 0.5 + 0.5) * host.clientHeight,
        z: tmp.z,
      };
    }

    function frame(now) {
      requestAnimationFrame(frame);
      if (!visible) return;
      const dt = Math.min(48, now - last) / 1000;
      last = now;

      if (!dragging) {
        if (Math.abs(vel) > 0.00002) {
          world.rotation.y += vel;
          vel *= 0.94;
        } else if (!reduced) {
          world.rotation.y += dt * 0.075;
        }
      }

      // 粒子沿曲线流动
      state.t += dt * 0.34;
      const f = flow[state.mode];
      cables.forEach((c, i) => {
        if (!f) return;
        const dirOut = i === f[0];
        const dirIn = i === f[1];
        if (!dirOut && !dirIn) return;
        c.dots.forEach((d) => {
          let t = (state.t + d.phase) % 1;
          if (dirIn) t = 1 - t;
          const pos = c.curve.getPointAt(Math.min(0.999, Math.max(0.001, t)));
          d.mesh.position.copy(pos);
          const s = 0.75 + Math.sin(t * Math.PI) * 0.55;
          d.mesh.scale.setScalar(s);
        });
      });

      // 标签跟随：先确保矩阵是最新的，再投影
      world.updateMatrixWorld(true);
      labels.forEach(({ el, house }) => {
        const p = project(house.anchor.clone().applyMatrix4(house.group.matrixWorld));
        el.style.left = p.x + "px";
        el.style.top = p.y + "px";
        el.style.opacity = p.z > 1 ? "0" : "1";
      });

      renderer.render(scene, camera);
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        (ents) => ents.forEach((en) => (visible = en.isIntersecting)),
        { rootMargin: "120px" }
      ).observe(host);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- 5. 左侧索引 ---------- */
  const SL_SECTIONS = [
    { id: "overview", label: "Short version" },
    { id: "problem", label: "Why this exists" },
    { id: "concepts", label: "Direction" },
    { id: "states", label: "Three states" },
    { id: "usage", label: "How it's used" },
    { id: "prototype", label: "Prototype" },
    { id: "circuit", label: "The circuit" },
    { id: "model", label: "Street model" },
    { id: "physical", label: "Physical build" },
    { id: "iterations", label: "Five rounds" },
    { id: "issues", label: "Known issues" },
  ];

  /* 转场期间把索引栏临时锁在某个板块：卡片还没跳页，滚动位置没变，
     但索引得跟着卡片提前走一步，否则最后半秒画面已经是 02、索引还亮着 01。
     -1 = 不锁，按滚动位置正常算。 */
  let slIndexHold = -1;
  let slIndexSync = null;

  function slRenderIndex() {
    const rail = document.createElement("nav");
    rail.className = "sl-index";
    rail.setAttribute("aria-label", "Section index");
    rail.innerHTML =
      SL_SECTIONS.map(
        (sec, i) => `
      <a class="sl-index__item" href="#${sec.id}" data-target="${sec.id}" aria-label="${sec.label}">
        <span class="sl-index__num">${String(i + 1).padStart(2, "0")}</span>
        <span class="sl-index__dot" aria-hidden="true"></span>
        <span class="sl-index__label">${sec.label}</span>
      </a>`
      ).join("") + '<span class="sl-index__bus" aria-hidden="true"><i></i></span>';
    document.body.appendChild(rail);
    return rail;
  }

  function slInitIndex(rail) {
    if (!rail) return;
    const hero = document.querySelector(".sl-hero");
    const items = [...rail.querySelectorAll(".sl-index__item")];
    const sections = SL_SECTIONS.map((sec) => document.getElementById(sec.id)).filter(Boolean);
    if (!sections.length) return;

    let raf = null;

    const place = () => {
      if (window.innerWidth < 1180) {
        rail.style.left = "";
        return;
      }
      const wraps = [...document.querySelectorAll(".sl-sec .sl-wrap")];
      if (!wraps.length) return;
      const contentLeft = Math.min(
        ...wraps.map(
          (w) => w.getBoundingClientRect().left + (parseFloat(getComputedStyle(w).paddingLeft) || 0)
        )
      );
      const railW = rail.offsetWidth || 120;
      const gap = Math.min(78, Math.max(24, contentLeft - railW - 24));
      rail.style.left = Math.max(8, Math.round(contentLeft - gap - railW)) + "px";

      // 母线：从第一项中心拉到末项中心（端子正好落在每一行的中线上）
      const bus = rail.querySelector(".sl-index__bus");
      if (bus && items.length > 1) {
        const a = items[0].offsetTop + items[0].offsetHeight / 2;
        const last = items[items.length - 1];
        const b = last.offsetTop + last.offsetHeight / 2;
        bus.style.top = a + "px";
        bus.style.height = Math.max(0, b - a) + "px";
      }
    };

    const sync = () => {
      raf = null;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const heroH = hero ? hero.offsetHeight : 0;
      rail.classList.toggle("is-visible", y > heroH - vh * 0.55);

      /* 被锁住时，把探针挪到目标板块的顶边：选中项、已读项、母线充能
         三样会一起变成「已经在那一页」的样子，不会只有高亮跳而母线不动。 */
      const probe =
        slIndexHold >= 0 && sections[slIndexHold]
          ? sections[slIndexHold].offsetTop
          : y + vh * 0.42;
      let active = -1;
      sections.forEach((sec, i) => {
        if (sec.offsetTop <= probe) active = i;
      });
      items.forEach((it, i) => {
        it.classList.toggle("is-active", i === active);
        it.classList.toggle("is-past", i < active);
      });

      // 母线充能：和 is-active 同一个探针算连续进度，读到最后一段正好 100%
      const bus = rail.querySelector(".sl-index__bus");
      if (bus && sections.length > 1) {
        const a = sections[0].offsetTop;
        const b = sections[sections.length - 1].offsetTop;
        const p = b > a ? (probe - a) / (b - a) : 0;
        bus.style.setProperty("--sl-fill", Math.max(0, Math.min(1, p)).toFixed(4));
      }
      // 深色板块（06 / 08）上索引必须反白，否则深蓝的字在深底上根本看不见
      const dark = active >= 0 && sections[active].classList.contains("sl-sec--ink");
      rail.classList.toggle("is-light", !!dark);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(sync);
    };
    slIndexSync = onScroll;

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
  function slInitPager() {
    const main = document.getElementById("slMain");
    if (!main) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const nav = document.querySelector(".nav");
    const hero = main.querySelector(".sl-hero");
    const sections = SL_SECTIONS.map((sec) => document.getElementById(sec.id)).filter(Boolean);
    if (sections.length < 2) return;

    const THRESHOLD = 24;
    const LOCK_MS = 520;
    const GESTURE_GAP = 90;
    const SETTLE_MS = 240;
    const EDGE = 2;
    /* 刚落地时浏览器常常差几个像素（字体回流、取整），这不叫「在板块内部」。
       小于这个值直接吸附回顶边并继续处理这次滚轮，别单独吃掉一格 ——
       否则会看到页面自己往上跳几像素、里面的文字跟着移位一下。 */
    const NUDGE = 24;

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

    /* ---------- 首屏 → 01：把墙上的那块屏取下来，走进去 ----------
       用户 2026-11-05 指定：只做这一段下行。01 回首屏保持普通上移，不拦、不播。
       过程：房间沉进夜色只剩屏幕 → 屏幕脱离墙面回正、铺满视口
       → 再推近一点，从电池环里涌出一整片 01 的底色 → 跳页（看不见切换）。 */
    let morphing = false;
    let morphCtx = null;

    const morphClear = () => {
      const c = morphCtx;
      if (!c) return;
      morphCtx = null;
      morphing = false;
      c.src.style.visibility = c.srcVis;
      if (c.fly.parentNode) c.fly.remove();
      if (c.dusk.parentNode) c.dusk.remove();
      c.fadeEls.forEach((n) => {
        n.style.removeProperty("opacity");
        n.style.removeProperty("transform");
      });
    };

    /* 转场中途改窗口尺寸（或页面被外部跳走）：直接落位到 01，不卡在半路 */
    const morphBail = () => {
      if (!morphCtx) return;
      const ov = morphCtx.ov;
      const c = morphCtx;
      morphClear();
      c.kids.forEach((n) => {
        n.style.removeProperty("opacity");
        n.style.removeProperty("transform");
        n.style.removeProperty("transition");
      });
      jump(topOf(ov));
      lockUntil = performance.now() + 400;
    };

    /* ---------- 01 ↔ 02：三张说明卡原地长成四格数字条 ----------
       用户 2026-11-05 决定：第 4 张从行的右端展开；只有 39% 数着往上跳，
       另外三个直接出现；倒放时不倒着数（一直是 39）；时长 1.5 秒。

       两屏的卡片块左右边缘完全重合，所以整个过程页面一动不动 ——
       只有卡片本身在收缩、裂成四格。0.5 段是「文字收进左上角」，
       数字再从同一个角落长出来。 */
    let flowCtx = null;

    const flowClear = () => {
      const c = flowCtx;
      if (!c) return;
      flowCtx = null;
      morphing = false;
      c.srcCards.forEach((n) => n.style.removeProperty("visibility"));
      c.srcHead.forEach((n) => n.style.removeProperty("visibility"));
      if (c.fly.parentNode) c.fly.remove();
      /* 交还索引栏：这时滚动位置已经是目标板块，正常算出来的就是它 */
      slIndexHold = -1;
      if (slIndexSync) slIndexSync();
    };

    /* 转场中途改窗口尺寸（或页面被外部跳走）：直接落位，不卡在半路 */
    const flowBail = () => {
      if (!flowCtx) return;
      const to = flowCtx.to;
      flowClear();
      jump(topOf(to));
      lockUntil = performance.now() + 400;
    };

    const flowMorph = (dir) => {
      if (morphing || flowCtx) return true;

      const from = dir > 0 ? sections[0] : sections[1];
      const to = dir > 0 ? sections[1] : sections[0];
      if (!from || !to) return false;

      const srcWrap = from.querySelector(".sl-wrap");
      const dstWrap = to.querySelector(".sl-wrap");
      if (!srcWrap || !dstWrap) return false;

      const parts = (w) => ({
        brief: Array.from(w.querySelectorAll(".sl-brief__item")),
        stat: Array.from(w.querySelectorAll(".sl-stat")),
        head: Array.from(w.children).filter((n) => n.matches(".sl-eyebrow, .sl-h2, .sl-p")),
      });
      const S = parts(srcWrap);
      const D = parts(dstWrap);
      const oneCards = dir > 0 ? S.brief : D.brief;
      const srcCards = dir > 0 ? S.brief : S.stat;
      const dstCards = dir > 0 ? D.stat : D.brief;
      const srcHead = S.head;
      const h01 = dir > 0 ? S.head : D.head;
      const h02 = dir > 0 ? D.head : S.head;
      if (oneCards.length < 3 || srcCards.length < 3 || dstCards.length < 3) return false;
      if (!h01.length || !h02.length) return false;

      const dy = topOf(to) - window.scrollY;   // 跳页后，目标页元素会整体上移这么多
      const rect = (el) => {
        const r = el.getBoundingClientRect();
        return { l: r.left, t: r.top, w: r.width, h: r.height };
      };
      const at = (el) => {
        const r = rect(el);
        return { l: r.l, t: r.t - dy, w: r.w, h: r.h };
      };

      /* 01 那一排的右边缘：第 4 张卡就从这里展开 / 折回去 */
      const oneRects = oneCards.map((n) => (dir > 0 ? rect(n) : at(n)));
      const rowRight = Math.max.apply(null, oneRects.map((r) => r.l + r.w));
      const rowTop = Math.min.apply(null, oneRects.map((r) => r.t));
      const rowBot = Math.max.apply(null, oneRects.map((r) => r.t + r.h));
      const degen = { l: rowRight, t: rowTop, w: 0, h: rowBot - rowTop };

      /* 每一格都同时记下「01 里的样子」和「02 里的样子」。
         a 永远对应 u=0（01），b 永远对应 u=1（02）——
         这样倒放只是 u 从 1 走回 0，几何自动对，不用判断方向。 */
      const statCards = dir > 0 ? D.stat : S.stat;
      const total = Math.max(oneCards.length, statCards.length);
      const pairs = [];
      for (let i = 0; i < total; i++) {
        const brief = oneCards[i] || null;
        const stat = statCards[i] || null;
        const r01 = brief ? (dir > 0 ? rect(brief) : at(brief)) : degen;
        const r02 = stat ? (dir > 0 ? at(stat) : rect(stat)) : degen;
        pairs.push({
          a: r01,
          b: r02,
          f01: brief ? { el: brief, r: r01 } : null,
          f02: stat ? { el: stat, r: r02 } : null,
        });
      }

      const fly = document.createElement("div");
      fly.className = "sl-flow";
      const wash = document.createElement("div");
      wash.className = "sl-flow__wash";
      const pageBg = getComputedStyle(document.querySelector(".sl-page") || document.body).backgroundColor;
      wash.style.background = pageBg && pageBg !== "rgba(0, 0, 0, 0)" ? pageBg : "#f7f6fa";
      fly.appendChild(wash);

      /* 02 的底色（淡蓝渐变 + 右上角那圈线稿）：方向向下的那一次要它，
         这样跳页前屏幕上的底已经和 02 一模一样，线稿不会在跳的那一帧冒出来。
         方向向上不需要：那时底下那层底色是全不透明的，02 的底本来就被盖住。 */
      let bgLayer = null;
      if (dir > 0) {
        const cs = getComputedStyle(to);
        bgLayer = document.createElement("div");
        bgLayer.style.cssText =
          "position:absolute;left:0;top:0;width:100%;height:" + to.offsetHeight + "px;opacity:0;" +
          "background-image:" + cs.backgroundImage + ";background-position:" + cs.backgroundPosition +
          ";background-size:" + cs.backgroundSize + ";background-repeat:" + cs.backgroundRepeat +
          ";background-color:" + cs.backgroundColor + ";";
        fly.appendChild(bgLayer);
      }

      /* 两套标题都做成飞行层里的幽灵：底下那层底色不透明，
         真标题露不出来，所以 01 的标题也得由这一层自己负责，
         否则转场一开始标题就整块消失了。 */
      const place = (el, r, extra) => {
        const c = el.cloneNode(true);
        const nowrap = el.matches(".sl-eyebrow");
        c.style.cssText =
          "position:absolute;left:" + r.l.toFixed(1) + "px;top:" + r.t.toFixed(1) + "px;margin:0;" +
          (nowrap ? "width:max-content;white-space:nowrap;" : "width:" + r.w.toFixed(1) + "px;") +
          "will-change:opacity,transform;" + extra;
        fly.appendChild(c);
        return c;
      };
      const g01 = h01.map((el) => place(el, dir > 0 ? rect(el) : at(el), ""));
      const g02 = h02.map((el) => place(el, dir > 0 ? at(el) : rect(el), "opacity:0;"));

      /* 数字：记下它原本是多少、要不要千分位。
         正放时四个数字都从 0 数上去（用户 2026-11-05 要求）；
         倒放时原样显示，绝不倒着数。 */
      const countOf = (face) => {
        const el = face ? face.querySelector(".sl-stat__n") : null;
        if (!el || !el.firstChild || el.firstChild.nodeType !== 3) return null;
        const txt = el.firstChild.nodeValue;
        const digits = txt.replace(/[^\d]/g, "");
        if (!digits) return null;
        return { el, target: Number(digits), comma: txt.indexOf(",") >= 0 };
      };

      /* 卡片：一个白框负责几何，里面叠两层固定尺寸的内容，靠 overflow 裁，
         所以文字全程不重排（重排会露馅）。 */
      const boxes = pairs.map((p) => {
        const box = document.createElement("div");
        box.className = "sl-flow__card";
        box.style.cssText =
          "position:absolute;left:0;top:0;width:" + p.a.w.toFixed(1) + "px;height:" + p.a.h.toFixed(1) +
          "px;background:#fff;border:1px solid var(--sl-line);border-radius:16px;overflow:hidden;" +
          "transform:translate3d(" + p.a.l.toFixed(1) + "px," + p.a.t.toFixed(1) + "px,0);" +
          "will-change:transform,width,height;";
        const face = (src, r, extra) => {
          const c = src.cloneNode(true);
          c.style.cssText =
            "position:absolute;left:0;top:0;width:" + r.w.toFixed(1) + "px;height:" + r.h.toFixed(1) +
            "px;background:transparent;border-color:transparent;transform-origin:0 0;" + extra;
          box.appendChild(c);
          return c;
        };
        const f01 = p.f01 ? face(p.f01.el, p.f01.r, "will-change:opacity,transform;") : null;
        const f02 = p.f02 ? face(p.f02.el, p.f02.r, "opacity:0;will-change:opacity,transform;") : null;
        fly.appendChild(box);
        return { box, a: p.a, b: p.b, f01, f02, num: countOf(f02) };
      });

      /* 02 下面那条「Roof → Battery, full → and then what?」和来源行：
         以前是跳页后才淡入，看着像凭空冒出来。现在把它也做成飞行层里的幽灵，
         跟卡片一起浮上来，跳页那一刻它已经站在自己的位置上。
         （01 侧没有这类元素，所以倒放时这里是空的。） */
      const extras = Array.from(dstWrap.children).filter(
        (n) => !n.matches(".sl-brief, .sl-stats, .sl-eyebrow, .sl-h2, .sl-p")
      );
      const gEx = extras.map((el) => place(el, at(el), "opacity:0;"));

      srcCards.forEach((n) => { n.style.visibility = "hidden"; });
      srcHead.forEach((n) => { n.style.visibility = "hidden"; });
      document.body.appendChild(fly);

      const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
      const eSm = (t) => t * t * (3 - 2 * t);
      const rp = (v, a, b) => cl((v - a) / (b - a));
      const lerp = (a, b, t) => a + (b - a) * t;

      /* u：0 = 01 的样子，1 = 02 的样子。倒放就是把 u 从 1 走回 0，
         所以每一拍都自动镜像，不用另写一套。 */
      const frame = (u) => {
        const hOut = eSm(rp(u, 0, 0.30));
        g01.forEach((g) => {
          g.style.opacity = String(1 - hOut);
          g.style.transform = "translateY(" + (-10 * hOut).toFixed(1) + "px)";
        });

        g02.forEach((g, i) => {
          const t = eSm(rp(u, 0.36 + i * 0.03, 0.66 + i * 0.03));
          g.style.opacity = String(t);
          g.style.transform = "translateY(" + (12 * (1 - t)).toFixed(1) + "px)";
        });

        const swap = eSm(rp(u, 0.50, 0.86));
        wash.style.opacity = String(1 - swap);
        if (bgLayer) bgLayer.style.opacity = String(swap);

        /* 横幅跟在数字后面浮上来：比卡片慢一拍，落到位置时正好是跳页前 */
        gEx.forEach((g, i) => {
          const t = eSm(rp(u, 0.52 + i * 0.06, 0.84 + i * 0.06));
          g.style.opacity = String(t);
          g.style.transform = "translateY(" + (16 * (1 - t)).toFixed(1) + "px)";
        });

        boxes.forEach((b, i) => {
          const p = eSm(rp(u, 0.12 + i * 0.035, 0.54 + i * 0.035));
          const bw = lerp(b.a.w, b.b.w, p);
          b.box.style.transform =
            "translate3d(" + lerp(b.a.l, b.b.l, p).toFixed(1) + "px," + lerp(b.a.t, b.b.t, p).toFixed(1) + "px,0)";
          b.box.style.width = bw.toFixed(1) + "px";
          b.box.style.height = lerp(b.a.h, b.b.h, p).toFixed(1) + "px";
          b.box.style.borderRadius = (16 - 2 * p).toFixed(2) + "px";
          /* 收成一条线的那张（第 4 张的起止）别留一根白头发 */
          b.box.style.opacity = bw < 3 ? "0" : "1";

          if (b.f01) {
            const a = eSm(rp(u, 0.06, 0.30));
            b.f01.style.opacity = String(1 - a);
            b.f01.style.transform = "scale(" + (1 - 0.34 * a).toFixed(3) + ")";
          }
          if (b.f02) {
            const a = eSm(rp(u, 0.24, 0.56));
            b.f02.style.opacity = String(a);
            b.f02.style.transform = "scale(" + (0.74 + 0.26 * a).toFixed(3) + ")";
            /* 四个都数：从 0 数到它自己的值，四张错开 40ms。
               倒放时这段不跑，所以一直是最终值，不会倒着数 */
            if (dir > 0 && b.num && b.num.el.firstChild) {
              const c = eSm(rp(u, 0.30 + i * 0.03, 0.62 + i * 0.03));
              const v = Math.round(b.num.target * c);
              b.num.el.firstChild.nodeValue = b.num.comma ? v.toLocaleString("en-US") : String(v);
            }
          }
        });
      };

      morphing = true;
      flowCtx = { fly, wash, srcCards, srcHead, to };
      frame(dir > 0 ? 0 : 1);

      const T_JUMP = 1300;
      const T_END = 1520;
      const t0 = performance.now();
      let jumped = false;
      let indexMoved = false;

      const tick = (ts) => {
        if (!flowCtx) return;
        const el = ts - t0;
        const raw = Math.min(el / T_JUMP, 1);
        const u = dir > 0 ? raw : 1 - raw;

        frame(u);

        /* 索引栏跟着卡片走：四格基本成形（u≈0.58，约 760ms）就把选中项拨到目标板块，
           比跳页早半秒，CSS 的 0.3s 过渡结束时正好和画面同步。
           只拨一次，之后不管 u 怎么走都不再改，免得来回闪。 */
        if (!indexMoved && (dir > 0 ? u >= 0.58 : u <= 0.42)) {
          indexMoved = true;
          slIndexHold = dir > 0 ? 1 : 0;
          if (slIndexSync) slIndexSync();
        }

        if (!jumped && raw >= 1) {
          jumped = true;
          jump(topOf(to));
          /* 锁短一点：动画本身还要 220ms 才收尾，锁太长会把用户接下来的那次滚轮吃掉。
             lockTo 必须一起写，否则锁里比对的是上一次留下的旧目标。 */
          lockUntil = performance.now() + 320;
          lockDir = dir;
          lockTo = clampY(topOf(to));
        }

        if (el >= T_JUMP) {
          fly.style.opacity = String(cl(1 - (el - T_JUMP) / (T_END - T_JUMP)));
        }

        if (el < T_END) requestAnimationFrame(tick);
        else flowClear();
      };
      requestAnimationFrame(tick);
      return true;
    };

    /* ---------- 02 → 03：三份概念摆上桌，逐份扫过，最后落在第二份 ----------
       用户 2026-11-05 定：不再用卡片变形（01→02 已经用过）；
       蓝框只走 1 → 2 → 3，然后直接让 02 亮起来（不走回头路）；
       落选的两张**不压暗**（压暗字就看不清了，中间那张已经靠蓝边和浅蓝底区分开）；
       判词（Killed for / Kept because）必须等徽章落下之后才出 ——
       而且卡片是「先长高、上面的字一动不动，长完了判词才淡入」。
       反向 03 → 02 不播这段，交回分页器做普通上滑。 */
    let conCtx = null;

    const conClear = () => {
      const c = conCtx;
      if (!c) return;
      conCtx = null;
      morphing = false;
      c.restore.forEach(([el, prev]) => {
        if (prev == null) el.removeAttribute("style");
        else el.setAttribute("style", prev);
      });
      if (c.fly.parentNode) c.fly.remove();
      slIndexHold = -1;
      if (slIndexSync) slIndexSync();
    };

    const conBail = () => {
      if (!conCtx) return;
      const to = conCtx.to;
      conClear();
      jump(topOf(to));
      lockUntil = performance.now() + 400;
      lockTo = clampY(topOf(to));
    };

    const conceptMorph = () => {
      if (morphing || conCtx) return true;

      const from = sections[1];     // 02
      const to = sections[2];       // 03
      if (!from || !to) return false;
      const wrap02 = from.querySelector(".sl-wrap");
      const cards = Array.from(to.querySelectorAll(".sl-concept"));
      if (!wrap02 || cards.length !== 3) return false;

      const dy = topOf(to) - window.scrollY;
      const rect = (el) => {
        const r = el.getBoundingClientRect();
        return { l: r.left, t: r.top, w: r.width, h: r.height };
      };
      const at = (el) => {
        const r = rect(el);
        return { l: r.l, t: r.t - dy, w: r.w, h: r.h };
      };

      const fly = document.createElement("div");
      fly.className = "sl-flow";
      const wash = document.createElement("div");
      wash.className = "sl-flow__wash";
      const pageBg = getComputedStyle(document.querySelector(".sl-page") || document.body).backgroundColor;
      wash.style.background = pageBg && pageBg !== "rgba(0, 0, 0, 0)" ? pageBg : "#f7f6fa";
      wash.style.opacity = "0";
      fly.appendChild(wash);

      const place = (el, r, extra) => {
        const c = el.cloneNode(true);
        const nowrap = el.matches(".sl-eyebrow");
        c.style.cssText =
          "position:absolute;left:" + r.l.toFixed(1) + "px;top:" + r.t.toFixed(1) + "px;margin:0;" +
          (nowrap ? "width:max-content;white-space:nowrap;" : "width:" + r.w.toFixed(1) + "px;") +
          "will-change:opacity,transform;" + extra;
        fly.appendChild(c);
        return c;
      };

      /* 标题三件套：位置就是落位之后的位置，所以跳页那一帧看不出来 */
      const heads = Array.from(to.querySelectorAll(".sl-eyebrow, .sl-h2, .sl-p"))
        .map((el) => place(el, at(el), "opacity:0;"));

      /* 三张卡：盒子只管几何（高度会从 h0 长到 h1），里面的内容按 h1 固定排版、
         靠 overflow 裁 —— 长高的过程中字一个都不会动。
         h0 = 没有判词时的自然高度。三张按内容长度会算出不同值，
         取最大的那个统一用，否则这一排会出现三个不一样的下边缘，像坏了。 */
      const geo = cards.map((card) => {
        const r = at(card);
        const probe = card.cloneNode(true);
        probe.style.cssText = "position:absolute;left:-9999px;top:0;visibility:hidden;width:" + r.w + "px;";
        const pv = probe.querySelector(".sl-concept__verdict");
        if (pv) pv.remove();
        document.body.appendChild(probe);
        const h0 = Math.round(probe.offsetHeight);
        probe.remove();
        return { card, r, h0, h1: Math.round(r.h) };
      });
      const H0 = Math.max.apply(null, geo.map((g) => g.h0));

      const boxes = geo.map(({ card, r, h1 }) => {
        const h0 = H0;

        const box = document.createElement("div");
        box.className = "sl-flow__card";
        box.style.cssText =
          "position:absolute;left:0;top:0;width:" + r.w.toFixed(1) + "px;height:" + h0 + "px;" +
          "background:#fff;border:1px solid var(--sl-line);border-radius:18px;overflow:hidden;" +
          "transform:translate3d(" + r.l.toFixed(1) + "px," + r.t.toFixed(1) + "px,0);" +
          "will-change:transform,height,opacity;";
        const inner = card.cloneNode(true);
        inner.style.cssText =
          "position:absolute;left:-1px;top:-1px;width:" + r.w.toFixed(1) + "px;height:" + h1 + "px;" +
          "box-sizing:border-box;background:transparent;border-color:transparent;";
        const vin = inner.querySelector(".sl-concept__verdict");
        if (vin) vin.style.opacity = "0";
        /* 卡里的 Chosen 徽章要拿掉：它挂在卡的上边缘外面，会被盒子裁掉半截；
           真正那枚由下面单独的克隆负责「落下来」 */
        const bin = inner.querySelector(".sl-badge");
        if (bin) bin.remove();
        box.appendChild(inner);

        /* 选中态叠一层，而不是改盒子的样式：蓝边 + 淡蓝底可以整层淡入 */
        const pick = document.createElement("div");
        pick.style.cssText =
          "position:absolute;inset:0;border-radius:18px;opacity:0;pointer-events:none;" +
          "border:2px solid var(--sl-blue);box-sizing:border-box;" +
          "background:linear-gradient(180deg,rgba(255,255,255,.92) 0%,rgba(242,248,254,.96) 100%);" +
          "box-shadow:0 26px 60px -34px rgba(43,108,174,.55);will-change:opacity;";
        /* 垫在内容下面：这层是「选中态」的底和蓝边，绝不能盖住卡片里的字 */
        box.insertBefore(pick, inner);

        fly.appendChild(box);
        return {
          box, pick, verdict: vin,
          x: r.l, y: r.t, w: r.w, h0, h1,
          h: Math.max(60, h0),
        };
      });

      /* 扫过用的蓝框：一个薄框在三张之间平移 */
      const outline = document.createElement("div");
      outline.style.cssText =
        "position:absolute;left:0;top:0;border:2px solid var(--sl-blue);border-radius:20px;" +
        "opacity:0;pointer-events:none;will-change:transform,width,height,opacity;";
      fly.appendChild(outline);

      /* Chosen 徽章：从上方落到卡 02 的定格位置 */
      const badgeSrc = cards[1].querySelector(".sl-badge");
      const badge = badgeSrc ? place(badgeSrc, at(badgeSrc), "opacity:0;") : null;

      const restore = [[wrap02, wrap02.getAttribute("style")]];
      document.body.appendChild(fly);

      const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
      const es = (t) => t * t * (3 - 2 * t);
      const lerp = (a, b, t) => a + (b - a) * t;
      const eBack = (p) => {
        const c1 = 1.70158, c3 = c1 + 1;
        return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
      };

      const T_JUMP = 1520;
      const T_END = 1750;

      const frame = (t) => {
        /* ① 02 整体上移退场，底色同时铺上来（两者叠在一起，中间不空屏） */
        const out = es(cl(t / 300));
        wrap02.style.transform = "translateY(" + (-44 * out).toFixed(1) + "px)";
        wrap02.style.opacity = String(1 - out);
        wash.style.opacity = String(out);

        /* ② 03 的标题逐件浮起 */
        heads.forEach((g, i) => {
          const k = es(cl((t - (120 + i * 40)) / 340));
          g.style.opacity = String(k);
          g.style.transform = "translateY(" + (14 * (1 - k)).toFixed(1) + "px)";
        });

        /* ③ 三张卡从下方升起（此时都还没有判词，所以是短的那一版） */
        boxes.forEach((b, i) => {
          const k = es(cl((t - (260 + i * 80)) / 380));
          b.box.style.opacity = String(k);
          b.box.style.transform =
            "translate3d(" + b.x.toFixed(1) + "px," + (b.y + 150 * (1 - k)).toFixed(1) + "px,0)";
        });

        /* ④ 蓝框依次掠过 1 → 2 → 3（只去不回） */
        if (t >= 680) {
          const seg = cl((t - 680) / 140);
          const i = Math.min(1, Math.floor(seg));
          const p = es(cl(seg - i));
          const a = boxes[i], b = boxes[i + 1] || boxes[i];
          const x = lerp(a.x, b.x, p) - 5;
          const y = lerp(a.y, b.y, p) - 5;
          const w = lerp(a.w, b.w, p) + 10;
          const h = lerp(a.h, b.h, p) + 10;
          outline.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
          outline.style.width = w.toFixed(1) + "px";
          outline.style.height = h.toFixed(1) + "px";
          outline.style.opacity = String(Math.min(1, (t - 680) / 120) * (1 - es(cl((t - 960) / 120))));
        }

        /* ⑤ 02 号亮起来 + 徽章落下 */
        boxes[1].pick.style.opacity = String(es(cl((t - 980) / 160)));
        if (badge) {
          const p = cl((t - 1000) / 220);
          const k = eBack(p);
          badge.style.opacity = String(cl(p * 2.4));
          badge.style.transform = "translateY(" + (-18 * (1 - k)).toFixed(1) + "px)";
        }

        /* ⑥ 定了之后卡片才长高：上面的字一动不动，长完了判词才淡入 */
        const grow = es(cl((t - 1120) / 260));
        boxes.forEach((b) => {
          b.box.style.height = lerp(b.h0, b.h1, grow).toFixed(1) + "px";
        });
        const vk = es(cl((t - 1380) / 120));
        boxes.forEach((b) => {
          if (b.verdict) b.verdict.style.opacity = String(vk);
        });
      };

      morphing = true;
      conCtx = { fly, to, restore };
      frame(0);

      const t0 = performance.now();
      let jumped = false;
      let indexMoved = false;

      const tick = (ts) => {
        if (!conCtx) return;
        const t = ts - t0;
        frame(Math.min(t, T_JUMP));

        if (!indexMoved && t >= 620) {
          indexMoved = true;
          slIndexHold = 2;
          if (slIndexSync) slIndexSync();
        }

        if (!jumped && t >= T_JUMP) {
          jumped = true;
          jump(topOf(to));
          lockUntil = performance.now() + 320;
          lockDir = 1;
          lockTo = clampY(topOf(to));
        }
        if (t >= T_JUMP) {
          fly.style.opacity = String(cl(1 - (t - T_JUMP) / (T_END - T_JUMP)));
        }
        if (t < T_END) requestAnimationFrame(tick);
        else conClear();
      };
      requestAnimationFrame(tick);
      return true;
    };

    const morphDown = () => {

      const ov = sections[0];
      const src = document.querySelector(".sl-screen");
      const heroInner = hero.querySelector(".sl-hero__inner");
      const cue = hero.querySelector(".sl-hero__cue");
      if (!ov || !src) return false;

      const oldImg = src.querySelector("img");
      const r0 = src.getBoundingClientRect();
      if (!oldImg || r0.width < 80 || r0.height < 40) return false;

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      /* 起点：屏幕此刻在墙面上的矩形。贴屏矩阵的透视项只有 0.003，
         误差不到 2px，所以直接用矩形插值，不必真做 3D。 */
      const s0 = r0.width / 1000;
      const x0 = r0.left;
      const y0 = r0.top;

      /* 一次推到位：从墙面矩形直接推到「绿环居中」，中间不停在铺满视口那一档。
         绿环圆心在屏坐标 (138,234)
         （界面图 1361×950 里在 (187.5,319)，cover 到 1000×574 后 ×0.7346） */
      const RX = 138;
      const RY = 234;
      const S1 = Math.max(vw / 1000, vh / 574);
      const S2 = S1 * 2.05;
      /* 终点让环心落在视口正中；万一屏边会露出外面就夹住 */
      const x2 = Math.max(vw - 1000 * S2, Math.min(0, vw / 2 - RX * S2));
      const y2 = Math.max(vh - 574 * S2, Math.min(0, vh / 2 - RY * S2));

      /* 环心在屏幕坐标里的起点与终点：整段镜头都盯着这一点走，不许中途换目标 */
      const ring0x = x0 + RX * s0;
      const ring0y = y0 + RY * s0;
      const ring1x = x2 + RX * S2;
      const ring1y = y2 + RY * S2;

      /* 过曝的圆心就是环心最后停下的那一点 */
      const fp = ((ring1x / vw) * 100).toFixed(2) + "% " + ((ring1y / vh) * 100).toFixed(2) + "%";

      /* 白场要盖满整屏所需的半径：取环心到四个角里最远的那个。
         环被屏幕左边缘限制着，只能停在偏左的位置（约 31%），
         所以这个值比「环在正中」时的 71% 大得多，固定写死会漏掉右边一整条。 */
      const REF = Math.sqrt((vw * vw + vh * vh) / 2);
      const farCorner = Math.max(
        Math.hypot(ring1x, ring1y),
        Math.hypot(vw - ring1x, ring1y),
        Math.hypot(ring1x, vh - ring1y),
        Math.hypot(vw - ring1x, vh - ring1y)
      );
      const RMAX = (farCorner / REF) * 100 * 1.06;   // 6% 余量，别在最后一帧露缝

      const fly = document.createElement("div");
      fly.className = "sl-morph";
      const scr = document.createElement("div");
      scr.className = "sl-morph__screen";
      scr.appendChild(oldImg.cloneNode(true));
      const glare = document.createElement("span");
      glare.className = "sl-screen__glare";
      scr.appendChild(glare);
      const flat = document.createElement("div");
      flat.className = "sl-morph__flat";
      flat.style.clipPath = "circle(0% at " + fp + ")";
      fly.appendChild(scr);
      fly.appendChild(flat);

      const dusk = document.createElement("div");
      dusk.className = "sl-morph__dusk";
      hero.appendChild(dusk);

      const srcVis = src.style.visibility;
      src.style.visibility = "hidden";     // 由克隆体接管，避免两层重影
      document.body.appendChild(fly);

      const fadeEls = [heroInner, cue].filter(Boolean);
      const wrap = ov.querySelector(".sl-wrap");
      const kids = wrap ? Array.prototype.slice.call(wrap.children) : [];

      scr.style.transform = "translate3d(" + x0 + "px," + y0 + "px,0) scale(" + s0 + ")";

      morphing = true;
      morphCtx = { fly, dusk, src, srcVis, fadeEls, kids, ov };

      const T = {
        text1: 240,                    // 文字退场
        zoom0: 240, zoom1: 1300,       // 墙面 → 环心居中，一次连续，中途不减速
        flash0: 1300, flash1: 2000,    // 白场从环心铺开：慢，700ms
        jump: 1975,                    // 跳页（整屏已被白场盖住）
        fade1: 2190,                   // 飞行层淡出
        end: 2190,
      };

      const lerp = (a, b, t) => a + (b - a) * t;
      const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
      const eIo = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const eSm = (t) => t * t * (3 - 2 * t);
      const t0 = performance.now();
      let jumped = false;

      const tick = (ts) => {
        if (!morphCtx) return;
        const el = ts - t0;

        /* ① 右侧文案与滚动提示先退场，画面安静下来只剩屏幕 */
        const pt = cl(el / T.text1);
        const py = (-14 * pt).toFixed(1) + "px";
        const po = String(1 - pt);
        fadeEls.forEach((n) => {
          n.style.setProperty("opacity", po, "important");
          n.style.setProperty("transform", "translateY(" + py + ")", "important");
        });

        /* ② 房间沉进夜色（屏幕是克隆体，在飞行层里，不受影响） */
        dusk.style.opacity = String(0.62 * cl((el - 40) / 600));

        /* ③ 镜头推进：一条曲线走完。放大与位移同时发生，
           缩放按对数插值（推近的速度感才均匀），环心自己走直线到视口正中。
           中途没有停顿，也就没有「分两次放大」的断点。 */
        let cx = x2, cy = y2, cs = S2;
        if (el <= T.zoom1) {
          const p = eSm(cl((el - T.zoom0) / (T.zoom1 - T.zoom0)));
          cs = s0 * Math.pow(S2 / s0, p);
          cx = lerp(ring0x, ring1x, p) - RX * cs;
          cy = lerp(ring0y, ring1y, p) - RY * cs;
        }
        scr.style.transform =
          "translate3d(" + cx.toFixed(2) + "px," + cy.toFixed(2) + "px,0) scale(" + cs.toFixed(5) + ")";

        /* ④ 过曝：从电池环现在的中心往外铺一整块 01 的底色。
           半径上限按「到最远那个角」算，所以这 700ms 每一帧都在真扩，
           不会有一段时间在屏外空跑、也不会在跳页那一帧露缝。
           缓动用两端都收的 eSm，起手不猛、落地不撞，眼睛才不难受。 */
        if (el >= T.flash0) {
          const p = eSm(cl((el - T.flash0) / (T.flash1 - T.flash0)));
          const r = p * RMAX;
          const at = (((cx + RX * cs) / vw) * 100).toFixed(2) + "% " +
                     (((cy + RY * cs) / vh) * 100).toFixed(2) + "%";
          flat.style.clipPath = "circle(" + r.toFixed(2) + "% at " + at + ")";
        }

        /* ⑤ 白场铺满的那一帧跳页：底下和盖着的是同一个颜色 */
        if (!jumped && el >= T.jump) {
          jumped = true;
          jump(topOf(ov));
          lockUntil = performance.now() + 700;
          kids.forEach((n) => {
            n.style.transition = "none";
            n.style.opacity = "0";
            n.style.transform = "translateY(16px)";
          });
          requestAnimationFrame(() => {
            if (!morphCtx) return;
            kids.forEach((n, i) => {
              const d = i * 55;
              n.style.transition =
                "opacity .55s cubic-bezier(.2,.8,.2,1) " + d + "ms, transform .55s cubic-bezier(.2,.8,.2,1) " + d + "ms";
              n.style.opacity = "1";
              n.style.transform = "none";
            });
          });
        }

        /* ⑥ 飞行层淡出，01 从同色的底里浮出来 */
        if (el >= T.jump) {
          fly.style.opacity = String(cl(1 - (el - T.jump) / (T.fade1 - T.jump)));
        }

        if (el < T.end) requestAnimationFrame(tick);
        else morphClear();
      };
      requestAnimationFrame(tick);
      return true;
    };

    const step = (dir, delta, now, sinceLast) => {
      const y = window.scrollY;
      const idx = indexAt();
      const cur = idx >= 0 ? sections[idx] : null;

      if (dir > 0) {
        /* 首屏往下：交给专属转场，不再直接平滑滚过去。
           反向（01 → 首屏）一律走下面的普通上移，这里不碰。 */
        if (!cur && morphDown()) return true;
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
        const next = sections[idx + 1];
        if (!next) return false;
        /* 01 → 02：交给卡片分裂转场 */
        if (cur === sections[0]) return flowMorph(1);
        /* 02 → 03：交给「三份概念」转场 */
        if (cur === sections[1]) return conceptMorph();
        const target = topOf(next);
        if (Math.abs(target - y) < 4) return false;
        go(target, 1);
        return true;
      }

      if (cur) {
        const curTop = topOf(cur);
        if (y > curTop + NUDGE) {
          const target = Math.max(y - delta, curTop);
          jump(target);
          if (target <= curTop + 1) settleUntil = now + SETTLE_MS;
          return true;
        }
        /* 几像素的漂移：吸附回顶边，但这次滚轮继续往下走（该翻页就翻页） */
        if (y > curTop + EDGE) jump(curTop);
        if (now < settleUntil) return true;
      }
      const prev = idx > 0 ? sections[idx - 1] : hero;
      if (!prev) return false;
      /* 02 → 01：同一段倒放 */
      if (prev === sections[0]) return flowMorph(-1);
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
      const sinceLast = lastWheelAt ? now - lastWheelAt : 1e9;
      lastWheelAt = now;

      if (now < lockUntil) {
        if (Math.sign(d) !== lockDir) {
          /* 反向：解锁，但这一格必须拦下来。以前这里直接 return 不拦截，
             浏览器就自己滚了一下 —— 页面窜几像素、里面的文字跟着移位，看着像 bug。 */
          lockUntil = 0;
          acc = 0;
        } else if (Math.abs(window.scrollY - lockTo) > 2) {
          e.preventDefault();
          return;
        } else {
          lockUntil = 0;
        }
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
      if (morphing) { e.preventDefault(); return; }
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
    window.addEventListener("resize", () => { morphBail(); flowBail(); conBail(); });
  }

  /* ---------- 首屏：让 1536×934 的舞台铺满视口 ---------- */
  function slFitHero() {
    const stage = document.getElementById("slStage");
    const hero = document.querySelector(".sl-hero");
    const inner = document.querySelector(".sl-hero__inner");
    if (!stage || !hero) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    /* 手机 / 竖屏：文案在上，面板在下 */
    if (vw <= 900) {
      const heroTop = hero.getBoundingClientRect().top;
      const textBottom = inner ? inner.getBoundingClientRect().bottom - heroTop : vh * 0.5;
      const sceneTop = textBottom + 6;
      const sceneH = Math.max(170, vh - sceneTop);

      // 墙上面板的可视范围（1536×934 坐标系）
      const EX0 = 400, EX1 = 1010, EY0 = 290, EY1 = 700;
      const ew = EX1 - EX0;
      const eh = EY1 - EY0;
      const k = Math.min(vw / ew, sceneH / eh) * 0.98;

      const tx = vw / 2 - ((EX0 + EX1) / 2) * k;
      const ty = sceneTop + (sceneH - eh * k) / 2 - EY0 * k;

      stage.style.setProperty("--k", k.toFixed(4));
      stage.style.setProperty("--tx", Math.round(tx) + "px");
      stage.style.setProperty("--ty", Math.round(ty) + "px");
      return;
    }

    /* 桌面 / 横屏：整屏铺满，面板略偏左 */
    const k = Math.max(vw / 1536, vh / 934);
    // 面板右边缘固定在 56% 处，右侧留给文字
    const tx = vw * 0.56 - 967 * k;
    const ty = vh / 2 - 467 * k;
    stage.style.setProperty("--k", k.toFixed(4));
    stage.style.setProperty("--tx", Math.round(tx) + "px");
    stage.style.setProperty("--ty", Math.round(ty) + "px");

    // 文案从面板右边缘之后开始，宽度不够时退到“至少留 300px”
    const screenRight = 967 * k + tx;
    const rail = Math.min(screenRight + 56, vw - 300);
    hero.style.setProperty("--rail", Math.round(rail) + "px");
  }

  /* ---------- 启动 ---------- */
  function boot() {
    initStateTabs();
    initPrototype();
    initCircuit();
    slInitIndex(slRenderIndex());
    slInitPager();
    slFitHero();
    window.addEventListener("resize", slFitHero);
    // 字体与图片加载完再量一次，否则算出来的取景是过时的
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => setTimeout(slFitHero, 60));
    }
    [120, 400, 900, 1800].forEach((t) => setTimeout(slFitHero, t));
    const innerEl = document.querySelector(".sl-hero__inner");
    if (innerEl && window.ResizeObserver) {
      let busy = false;
      new ResizeObserver(() => {
        if (busy) return;
        busy = true;
        requestAnimationFrame(() => { slFitHero(); busy = false; });
      }).observe(innerEl);
    }

    const el = document.getElementById("sl3dCanvas");
    if (!el) return;
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (ents) => {
          if (ents.some((e) => e.isIntersecting)) {
            io.disconnect();
            init3D();
          }
        },
        { rootMargin: "300px" }
      );
      io.observe(el);
    } else {
      init3D();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
