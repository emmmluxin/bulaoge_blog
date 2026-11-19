(() => {
    const PER_PAGE = 5;
    const essaysEl = document.getElementById("essays");
    const pageInfo = document.getElementById("pageInfo");
    const totalPages = Math.max(1, Math.ceil(NOTES.length / PER_PAGE));

    const formatDate = (time) => new Date(time * 1000).toLocaleString();
    const noteUrl = (name) => `/notes/${encodeURIComponent(name)}/`;

    const currentPage = () => {
        const page = parseInt(location.hash.slice(1), 10);
        return page >= 1 && page <= totalPages ? page : 1;
    };

    const renderPage = (page) => {
        essaysEl.innerHTML = "";
        if (!NOTES.length) {
            essaysEl.innerHTML = '<p class="empty">还没有文章。</p>';
        }
        NOTES.slice((page - 1) * PER_PAGE, page * PER_PAGE).forEach(([name, time], i) => {
            const card = document.createElement("a");
            card.className = "card ripple";
            card.href = noteUrl(name);
            card.style.animationDelay = `${150 + i * 90}ms`;
            card.innerHTML = '<h2 class="card-title"></h2><p class="card-meta">更新于 <time></time></p>';
            card.querySelector(".card-title").textContent = name;
            card.querySelector("time").textContent = formatDate(time);
            essaysEl.appendChild(card);
        });
        pageInfo.textContent = `${page} / ${totalPages}`;
    };

    const goTo = (page) => {
        const target = Math.min(Math.max(page, 1), totalPages);
        if (target !== currentPage()) location.hash = `#${target}`;
    };

    const renderArchive = () => {
        const archive = document.getElementById("archive");
        archive.innerHTML = "";
        const groups = new Map();
        NOTES.forEach(([name, time]) => {
            const date = new Date(time * 1000);
            const key = `${date.getFullYear()} / ${String(date.getMonth() + 1).padStart(2, "0")}`;
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(name);
        });
        groups.forEach((names, key) => {
            const group = document.createElement("div");
            group.className = "archive-group open";

            const head = document.createElement("button");
            head.type = "button";
            head.className = "archive-month ripple";
            head.textContent = `${key}（${names.length}）`;
            head.addEventListener("click", () => group.classList.toggle("open"));

            const list = document.createElement("div");
            list.className = "archive-list";
            const inner = document.createElement("div");
            inner.className = "archive-inner";
            names.forEach((name) => {
                const link = document.createElement("a");
                link.className = "archive-link";
                link.href = noteUrl(name);
                link.textContent = name;
                inner.appendChild(link);
            });
            list.appendChild(inner);
            group.append(head, list);
            archive.appendChild(group);
        });
    };

    const initClock = () => {
        if (typeof CLOCK === "undefined" || !CLOCK.slots || !CLOCK.slots.length) return;
        const timeEl = document.getElementById("clockTime");
        const badgeEl = document.getElementById("clockBadge");
        const moodEl = document.getElementById("clockMood");
        const dotEl = document.getElementById("clockDot");
        const nowEl = document.getElementById("clockNow");
        const pad = (n) => String(n).padStart(2, "0");

        const update = () => {
            const d = new Date();
            const hour = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
            const slot = CLOCK.slots.find((s) => hour >= s.start && hour < s.end) || CLOCK.slots[0];
            timeEl.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${CLOCK.timezone_label || ""}`.trim();
            badgeEl.textContent = slot.label;
            moodEl.textContent = `当前状态：${slot.mood}`;
            dotEl.dataset.tone = slot.tone || "focus";
            nowEl.style.left = `${(hour / 24 * 100).toFixed(2)}%`;
        };

        update();
        setInterval(update, 1000);
        window.__updateClock = (nextClock) => {
            if (nextClock) Object.assign(CLOCK, nextClock);
            update();
        };
    };

    const initMusic = () => {
        if (typeof MUSIC === "undefined" || !MUSIC.length) return;
        const tagEl = document.getElementById("musicTag");
        const trackEl = document.getElementById("musicTrack");
        const noteEl = document.getElementById("musicNote");
        const bodyEl = document.getElementById("musicBody");
        const nextBtn = document.getElementById("musicNext");
        let index = 0;

        const show = (i) => {
            if (!MUSIC.length) {
                tagEl.textContent = "";
                trackEl.textContent = "暂无曲目";
                noteEl.textContent = "";
                return;
            }
            const item = MUSIC[i % MUSIC.length];
            tagEl.textContent = item.tag || "";
            trackEl.textContent = item.artist ? `${item.title} — ${item.artist}` : item.title;
            noteEl.textContent = item.note || "";
        };

        show(index);
        if (MUSIC.length < 2) nextBtn.style.display = "none";
        nextBtn.addEventListener("click", () => {
            if (MUSIC.length < 2) return;
            index = (index + 1) % MUSIC.length;
            bodyEl.classList.add("swap");
            setTimeout(() => {
                show(index);
                bodyEl.classList.remove("swap");
            }, 140);
        });
        window.__updateMusic = (nextMusic) => {
            if (Array.isArray(nextMusic)) {
                MUSIC.length = 0;
                MUSIC.push(...nextMusic);
            }
            index = 0;
            nextBtn.style.display = MUSIC.length < 2 ? "none" : "";
            show(0);
        };
    };

    const initHitokoto = () => {
        if (typeof HITOKOTO === "undefined") return;
        const textEl = document.getElementById("hitokotoText");
        const fromEl = document.getElementById("hitokotoFrom");
        const bodyEl = document.getElementById("hitokotoBody");
        const nextBtn = document.getElementById("hitokotoNext");
        if (!textEl || !nextBtn) return;

        let index = HITOKOTO.length > 1 ? Math.floor(Math.random() * HITOKOTO.length) : 0;

        const show = (i) => {
            if (!HITOKOTO.length) {
                textEl.textContent = "暂无一言";
                fromEl.textContent = "";
                return;
            }
            const item = HITOKOTO[i % HITOKOTO.length];
            textEl.textContent = item.text || "";
            fromEl.textContent = item.from ? `—— ${item.from}` : "";
        };

        show(index);
        nextBtn.style.display = HITOKOTO.length < 2 ? "none" : "";
        nextBtn.addEventListener("click", () => {
            if (HITOKOTO.length < 2) return;
            index = (index + 1) % HITOKOTO.length;
            bodyEl.classList.add("swap");
            setTimeout(() => {
                show(index);
                bodyEl.classList.remove("swap");
            }, 160);
        });

        window.__updateHitokoto = (nextList) => {
            if (Array.isArray(nextList)) {
                HITOKOTO.length = 0;
                HITOKOTO.push(...nextList);
            }
            index = 0;
            nextBtn.style.display = HITOKOTO.length < 2 ? "none" : "";
            show(0);
        };
    };

    document.querySelectorAll("[data-go]").forEach((button) => {
        button.addEventListener("click", () => {
            const page = currentPage();
            goTo({ first: 1, prev: page - 1, next: page + 1, last: totalPages }[button.dataset.go]);
        });
    });

    const randomBtn = document.getElementById("random");
    if (randomBtn) {
        randomBtn.addEventListener("click", () => {
            if (!NOTES.length) return;
            const [name] = NOTES[Math.floor(Math.random() * NOTES.length)];
            document.body.classList.add("leaving");
            setTimeout(() => {
                location.href = noteUrl(name);
            }, 280);
        });
    }

    window.addEventListener("hashchange", () => renderPage(currentPage()));

    renderPage(currentPage());
    renderArchive();
    initClock();
    initMusic();
    initHitokoto();
    pangu.autoSpacingPage();

    window.__updateNotes = (nextNotes) => {
        if (Array.isArray(nextNotes)) {
            NOTES.length = 0;
            NOTES.push(...nextNotes);
        }
        renderPage(currentPage());
        renderArchive();
    };
})();
