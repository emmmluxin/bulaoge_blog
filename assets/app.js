(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.querySelectorAll(".reveal").forEach((el, i) => {
        el.style.animationDelay = `${Math.min(i, 10) * 60}ms`;
    });

    const toast = document.getElementById("toast");
    let toastTimer = 0;
    window.showToast = (message) => {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("show"), 2000);
    };

    const themeToggle = document.getElementById("themeToggle");
    const syncThemeIcon = () => {
        themeToggle.textContent = root.classList.contains("dark") ? "☀" : "☾";
    };
    const applyTheme = () => {
        root.classList.toggle("dark");
        localStorage.setItem("theme", root.classList.contains("dark") ? "dark" : "light");
        syncThemeIcon();
    };
    themeToggle.addEventListener("click", (event) => {
        if (reduceMotion) {
            applyTheme();
            return;
        }
        if (!document.startViewTransition) {
            root.classList.add("theme-fade");
            applyTheme();
            setTimeout(() => root.classList.remove("theme-fade"), 450);
            return;
        }
        const x = event.clientX || window.innerWidth - 40;
        const y = event.clientY || window.innerHeight - 40;
        const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
        document.startViewTransition(applyTheme).ready.then(() => {
            root.animate(
                { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
                { duration: 650, easing: "cubic-bezier(0.4, 0, 0.2, 1)", pseudoElement: "::view-transition-new(root)" }
            );
        });
    });
    syncThemeIcon();

    const menu = document.getElementById("menu");
    if (menu) {
        menu.addEventListener("click", () => {
            root.classList.toggle("sidebar-hidden");
            localStorage.setItem("sidebar", root.classList.contains("sidebar-hidden") ? "hidden" : "shown");
        });
    }

    document.addEventListener("click", (event) => {
        const copyBtn = event.target.closest("[data-copy]");
        if (!copyBtn) return;
        const value = copyBtn.dataset.copy;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(value).then(() => window.showToast(`已复制：${value}`)).catch(() => window.showToast(value));
        } else {
            const area = document.createElement("textarea");
            area.value = value;
            area.style.position = "fixed";
            area.style.opacity = "0";
            document.body.appendChild(area);
            area.select();
            document.execCommand("copy");
            area.remove();
            window.showToast(`已复制：${value}`);
        }
    });

    document.addEventListener("pointerdown", (event) => {
        const target = event.target.closest(".ripple");
        if (!target || event.button !== 0) return;
        const rect = target.getBoundingClientRect();
        const dx = Math.max(event.clientX - rect.left, rect.right - event.clientX);
        const dy = Math.max(event.clientY - rect.top, rect.bottom - event.clientY);
        const size = Math.hypot(dx, dy) * 2;
        const wave = document.createElement("span");
        wave.className = "ripple-wave";
        wave.style.width = wave.style.height = `${size}px`;
        wave.style.left = `${event.clientX - rect.left - size / 2}px`;
        wave.style.top = `${event.clientY - rect.top - size / 2}px`;
        target.appendChild(wave);
        wave.addEventListener("animationend", () => wave.remove());
    });

    document.addEventListener("click", (event) => {
        const link = event.target.closest("a.ripple");
        if (!link || reduceMotion || event.defaultPrevented) return;
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (link.target || link.hasAttribute("download") || link.origin !== location.origin) return;
        if (link.pathname === location.pathname && link.hash) return;
        event.preventDefault();
        document.body.classList.add("leaving");
        setTimeout(() => {
            location.href = link.href;
        }, 280);
    });

    window.addEventListener("pageshow", () => document.body.classList.remove("leaving"));
})();
