// Custom mermaid init for mdbook — converts <code class="language-mermaid"> to rendered diagrams
// without needing the mdbook-mermaid preprocessor (which has UTF-8 parsing issues).
(() => {
    const darkThemes = ['ayu', 'navy', 'coal'];
    const classList = document.getElementsByTagName('html')[0].classList;

    let isDark = false;
    for (const cssClass of classList) {
        if (darkThemes.includes(cssClass)) {
            isDark = true;
            break;
        }
    }

    mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        securityLevel: 'loose',
    });

    // Find all mermaid code blocks and render them
    const codeBlocks = document.querySelectorAll('code.language-mermaid');
    codeBlocks.forEach((codeBlock, index) => {
        const pre = codeBlock.parentElement;
        if (!pre || pre.tagName !== 'PRE') return;

        const mermaidDiv = document.createElement('pre');
        mermaidDiv.classList.add('mermaid');
        mermaidDiv.textContent = codeBlock.textContent;
        pre.parentNode.replaceChild(mermaidDiv, pre);
    });

    // Now run mermaid on the converted elements
    mermaid.run();

    // Theme switch: reload to re-render diagrams
    for (const theme of ['ayu', 'navy', 'coal', 'light', 'rust']) {
        const btn = document.getElementById(theme);
        if (btn) {
            btn.addEventListener('click', () => {
                setTimeout(() => window.location.reload(), 100);
            });
        }
    }
})();
