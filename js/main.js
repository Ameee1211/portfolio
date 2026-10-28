/* ============================================================
   main.js — 读取 js/content.js 的数据并渲染页面
   日后改内容请改 content.js，不需要动这个文件
   ============================================================ */

(function () {
  const $ = (id) => document.getElementById(id);

  /* ---------- 导航 ---------- */
  function renderNav() {
    const nav = SITE.nav;
    $("navBrand").textContent = nav.brand;

    const linksEl = $("navLinks");
    nav.links.forEach((item) => {
      if (item.dropdown) {
        const wrap = document.createElement("div");
        wrap.className = "nav__item";
        const parent = document.createElement("a");
        parent.className = "nav__link";
        parent.href = "#projects";
        parent.textContent = item.label;
        const menu = document.createElement("div");
        menu.className = "nav__dropdown";
        item.dropdown.forEach((d) => {
          const a = document.createElement("a");
          a.href = d.anchor;
          a.textContent = d.label;
          menu.appendChild(a);
        });
        wrap.appendChild(parent);
        wrap.appendChild(menu);
        linksEl.appendChild(wrap);
      } else {
        const a = document.createElement("a");
        a.className = "nav__link";
        a.href = item.href;
        a.textContent = item.label;
        linksEl.appendChild(a);
      }
    });

    $("navCta").textContent = nav.cta.label;
    $("navCta").href = nav.cta.href;

    // 移动端菜单开关
    $("navBurger").addEventListener("click", () => {
      document.getElementById("nav").classList.toggle("is-open");
    });
    // 点击链接后收起移动端菜单
    linksEl.addEventListener("click", () => {
      document.getElementById("nav").classList.remove("is-open");
    });
  }

  /* ---------- Hero ---------- */
  function renderHero() {
    const h = SITE.hero;
    $("heroGreeting").textContent = h.greeting;
    $("heroName").textContent = h.name;
    $("heroRole").textContent = h.role;
    $("heroSubrole").textContent = "· " + h.subrole;
    $("heroSlogan").textContent = h.slogan;
    $("heroBadge").textContent = h.badge;
    $("heroScrollText").textContent = h.scrollHint;
    $("heroPhoto").src = h.photo;
  }

  /* ---------- 项目卡片 ---------- */
  function renderProjects() {
    const grid = $("projectsGrid");
    grid.innerHTML = "";

    SITE.projects.forEach((p, i) => {
      const card = document.createElement("article");
      card.className = "project-card reveal";
      card.id = "proj-" + p.id;
      card.style.transitionDelay = (i % 2) * 90 + "ms";

      // 封面
      const cover = document.createElement("div");
      cover.className = "project-card__cover";
      if (p.cover) {
        const img = document.createElement("img");
        img.src = p.cover;
        img.alt = p.title + " cover";
        img.loading = "lazy";
        cover.appendChild(img);
      } else {
        const ph = document.createElement("div");
        ph.className = "project-card__placeholder";
        ph.innerHTML =
          "<span>" + p.title + "</span><small>Cover coming soon</small>";
        cover.appendChild(ph);
      }
      card.appendChild(cover);

      // 内容
      const body = document.createElement("div");
      body.className = "project-card__body";

      const title = document.createElement("h3");
      title.className = "project-card__title";
      title.textContent = p.title;
      body.appendChild(title);

      const desc = document.createElement("p");
      desc.className = "project-card__desc";
      desc.textContent = p.description;
      body.appendChild(desc);

      const tags = document.createElement("div");
      tags.className = "project-card__tags";
      p.tags.forEach((t) => {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = t;
        tags.appendChild(tag);
      });
      body.appendChild(tags);

      const more = document.createElement("a");
      more.className = "project-card__more" + (p.link ? "" : " is-disabled");
      if (p.link) more.href = p.link;
      more.innerHTML =
        'View project <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14m0 0l-6-6m6 6l-6 6"/></svg>';
      body.appendChild(more);

      card.appendChild(body);
      grid.appendChild(card);
    });
  }

  /* ---------- 过渡语 / 关于 / 页脚 ---------- */
  function renderRest() {
    $("storyTitle").textContent = SITE.story.title;
    $("storyText").textContent = SITE.story.text;

    $("aboutHeading").textContent = SITE.about.heading;
    const lines = $("aboutLines");
    SITE.about.lines.forEach((t) => {
      const p = document.createElement("p");
      p.textContent = t;
      lines.appendChild(p);
    });

    $("footerEmail").textContent = SITE.footer.email;
    $("footerEmail").href = "mailto:" + SITE.footer.email;
    $("footerNote").textContent = SITE.footer.note;
    $("footerCopy").textContent = SITE.footer.copyright;
  }

  /* ---------- 滚动效果 ---------- */
  function bindScroll() {
    const nav = document.getElementById("nav");
    window.addEventListener("scroll", () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 10);
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  }

  renderNav();
  renderHero();
  renderProjects();
  renderRest();
  bindScroll();
})();
