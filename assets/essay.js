(() => {
    const article = document.getElementById("essay");
    const toc = document.getElementById("toc");

    const md = new Remarkable("full", {
        html: true,
        breaks: true,
        linkify: true,
        typographer: true,
        quotes: "\u201c\u201d\u2018\u2019",
        linkTarget: "_blank",
    });

    const formatDate = (time) => new Date(time * 1000).toLocaleString();

    article.innerHTML = md.render(ESSAY.text);
    article.querySelectorAll("li").forEach((li) => {
        const match = li.innerHTML.match(/^\[([ xX])\]\s*/);
        if (!match) return;
        const done = match[1].toLowerCase() === "x";
        li.className = done ? "task-item done" : "task-item";
        li.innerHTML = `<span class="task-box">${done ? "✓" : ""}</span>` + li.innerHTML.slice(match[0].length);
    });
    if (!article.querySelector("h1")) {
        const heading = document.createElement("h1");
        heading.textContent = ESSAY.title;
        article.prepend(heading);
    }

    if (ESSAY.folder === "notes") {
        const words = ESSAY.text.replace(/\s/g, "").length;
        const meta = document.createElement("div");
        meta.className = "essay-meta";
        meta.innerHTML = "<span>更新于 <time></time></span><span></span>";
        meta.querySelector("time").textContent = formatDate(ESSAY.time);
        meta.lastElementChild.textContent = `共 ${words} 字 · 预计阅读 ${Math.max(1, Math.ceil(words / 500))} 分钟`;
        const firstHeading = article.querySelector("h1");
        if (firstHeading) firstHeading.after(meta);
        else article.prepend(meta);
    }

    const headings = article.querySelectorAll("h1, h2, h3");
    const links = new Map();
    headings.forEach((heading, i) => {
        heading.id = `section-${i + 1}`;
        const link = document.createElement("a");
        link.className = `toc-link toc-${heading.tagName.toLowerCase()}`;
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent;
        toc.appendChild(link);
        links.set(heading, link);
    });
    if (!headings.length) {
        toc.innerHTML = '<p class="empty">暂无目录</p>';
    }

    if ("IntersectionObserver" in window && headings.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                toc.querySelectorAll(".active").forEach((el) => el.classList.remove("active"));
                links.get(entry.target).classList.add("active");
            });
        }, { rootMargin: "0px 0px -70% 0px" });
        headings.forEach((heading) => observer.observe(heading));
    }

    document.getElementById("toTop").addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    pangu.autoSpacingPage();
})();
