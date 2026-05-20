(function () {
    const rootPath = typeof path_to_root === "string" && path_to_root.length > 0
        ? path_to_root
        : "./";
    const bundlePath = `${rootPath}pagefind/`;
    const baseUrl = new URL(rootPath, window.location.href).pathname;
    const isZh = (document.documentElement.lang || "").toLowerCase().startsWith("zh");
    const labels = isZh
        ? {
            buttonTitle: "搜索这本书",
            loading: "正在加载搜索索引……",
            tip: "中文搜索已切换到 Pagefind。建议按词输入，例如“缓存 TTL”或“prompt cache”。",
            error: "搜索资源尚未生成，请稍后刷新页面，或等待 GitHub Pages 完成最新部署。",
        }
        : {
            buttonTitle: "Search this book",
            loading: "Loading search index…",
            tip: "",
            error: "Search assets are not available yet. Refresh later, or wait for GitHub Pages to finish the latest deployment.",
        };

    const state = {
        assetsPromise: null,
        initialized: false,
        open: false,
    };

    function isEditableTarget(target) {
        return Boolean(target && target.closest("input, textarea, select, [contenteditable='true']"));
    }

    function ensureSearchButton() {
        let button = document.getElementById("pagefind-search-toggle");
        if (button) {
            return button;
        }

        document.getElementById("search-toggle")?.remove();
        document.getElementById("search-wrapper")?.remove();

        const leftButtons = document.querySelector("#menu-bar .left-buttons");
        if (!leftButtons) {
            return null;
        }

        button = document.createElement("button");
        button.id = "pagefind-search-toggle";
        button.className = "icon-button";
        button.type = "button";
        button.title = `${labels.buttonTitle} (\`/\`)`;
        button.setAttribute("aria-label", labels.buttonTitle);
        button.setAttribute("aria-expanded", "false");
        button.innerHTML = '<i class="fa fa-search"></i>';
        button.addEventListener("click", () => {
            if (state.open) {
                closeSearch();
            } else {
                void openSearch();
            }
        });

        leftButtons.appendChild(button);
        return button;
    }

    function ensureSearchWrapper() {
        let wrapper = document.getElementById("pagefind-search-wrapper");
        if (wrapper) {
            return wrapper;
        }

        const page = document.querySelector(".page");
        const content = document.getElementById("content");
        if (!page || !content) {
            return null;
        }

        wrapper = document.createElement("div");
        wrapper.id = "pagefind-search-wrapper";
        wrapper.className = "hidden";
        wrapper.innerHTML = `
            <div class="pagefind-search-panel">
                ${labels.tip ? `<p class="pagefind-search-tip">${labels.tip}</p>` : ""}
                <div id="pagefind-search-root">${labels.loading}</div>
                <p id="pagefind-search-error" class="pagefind-search-error hidden"></p>
            </div>
        `;
        page.insertBefore(wrapper, content);
        return wrapper;
    }

    function setError(message) {
        const errorNode = document.getElementById("pagefind-search-error");
        const root = document.getElementById("pagefind-search-root");
        if (!errorNode || !root) {
            return;
        }
        if (message) {
            errorNode.textContent = message;
            errorNode.classList.remove("hidden");
            root.classList.add("hidden");
        } else {
            errorNode.textContent = "";
            errorNode.classList.add("hidden");
            root.classList.remove("hidden");
        }
    }

    function loadCss(href) {
        if (document.querySelector(`link[data-pagefind-ui="true"][href="${href}"]`)) {
            return;
        }
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        link.dataset.pagefindUi = "true";
        document.head.appendChild(link);
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (window.PagefindUI) {
                resolve();
                return;
            }

            const existing = document.querySelector(`script[data-pagefind-ui="true"][src="${src}"]`);
            if (existing) {
                existing.addEventListener("load", () => resolve(), { once: true });
                existing.addEventListener("error", () => reject(new Error(labels.error)), { once: true });
                return;
            }

            const script = document.createElement("script");
            script.src = src;
            script.dataset.pagefindUi = "true";
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(labels.error));
            document.body.appendChild(script);
        });
    }

    async function ensurePagefindUi() {
        if (state.initialized) {
            return;
        }

        if (!state.assetsPromise) {
            loadCss(`${bundlePath}pagefind-ui.css`);
            state.assetsPromise = loadScript(`${bundlePath}pagefind-ui.js`);
        }

        await state.assetsPromise;

        const root = document.getElementById("pagefind-search-root");
        if (!root) {
            return;
        }

        root.textContent = "";
        setError("");

        // eslint-disable-next-line no-new
        new window.PagefindUI({
            element: "#pagefind-search-root",
            bundlePath,
            baseUrl,
            showSubResults: true,
            showImages: false,
            excerptLength: isZh ? 24 : 18,
            resetStyles: false,
        });

        state.initialized = true;
    }

    function focusSearchInput() {
        const input = document.querySelector("#pagefind-search-wrapper .pagefind-ui__search-input");
        if (input instanceof HTMLInputElement) {
            input.focus();
            input.select();
        }
    }

    async function openSearch() {
        const wrapper = ensureSearchWrapper();
        const button = ensureSearchButton();
        if (!wrapper || !button) {
            return;
        }

        wrapper.classList.remove("hidden");
        button.setAttribute("aria-expanded", "true");
        state.open = true;

        try {
            await ensurePagefindUi();
            focusSearchInput();
        } catch (_error) {
            setError(labels.error);
        }
    }

    function closeSearch() {
        const wrapper = document.getElementById("pagefind-search-wrapper");
        const button = document.getElementById("pagefind-search-toggle");
        if (!wrapper || !button) {
            return;
        }
        wrapper.classList.add("hidden");
        button.setAttribute("aria-expanded", "false");
        state.open = false;
    }

    function init() {
        if (!document.getElementById("menu-bar")) {
            return;
        }

        ensureSearchButton();
        ensureSearchWrapper();

        document.addEventListener("keydown", event => {
            if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
                return;
            }

            if (event.key === "Escape" && state.open) {
                closeSearch();
                return;
            }

            if (isEditableTarget(event.target)) {
                return;
            }

            const key = event.key.toLowerCase();
            if (event.key === "/" || key === "s") {
                event.preventDefault();
                void openSearch();
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
