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
    idle:
      "<b>Idle.</b> Nobody is giving and nobody is asking, so the street is quiet — every house is sitting between 21% and 99%, the state the street is in for most of the day.",
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
        new THREE.BoxGeometry(0.5, 0.028, ROOF_D * 0.6),
        new THREE.MeshStandardMaterial({
          color: 0x1b2c46,
          roughness: 0.32,
          metalness: 0.45,
          emissive: 0x0a1524,
          emissiveIntensity: 0.4,
        })
      );
      const nx = Math.sin(slope) * 0.016;
      panel.position.set(ROOF_W / 4 + nx, HOUSE_H + ROOF_H / 2 + Math.cos(slope) * 0.016, 0);
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
    const labels = houses.map((h) => {
      const el = document.createElement("span");
      el.className = "sl-label" + (h.data.status === "you" ? " is-you" : "");
      el.innerHTML = `<i style="background:#${COLORS[h.data.status === "you" ? "you" : h.data.status]
        .toString(16)
        .padStart(6, "0")}"></i>${h.data.name}`;
      host.appendChild(el);
      return { el, house: h };
    });

    /* --- 状态 --- */
    const state = { mode: "share", t: 0 };
    const flow = {
      share: [0, 3],
      receive: [5, 0],
      idle: null,
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
      tmp.copy(v).applyMatrix4(world.matrixWorld).project(camera);
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

      // 标签跟随
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

  /* ---------- 启动 ---------- */
  function boot() {
    initStateTabs();
    initPrototype();
    initCircuit();

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
