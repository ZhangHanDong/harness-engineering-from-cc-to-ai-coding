(() => {
    const rightButtons = document.querySelector('.right-buttons');
    if (!rightButtons) return;

    const loc = window.location;
    const segments = loc.pathname.split('/').filter(Boolean);
    const trailingSlash = loc.pathname.endsWith('/');
    const isLocal = loc.protocol === 'file:' || loc.hostname === 'localhost' || loc.hostname === '127.0.0.1';

    // Detect current language: 'zh', 'en', 'vi'
    let currentLang = 'zh';
    if (isLocal) {
        if (loc.port === '3001') currentLang = 'en';
        else if (loc.port === '3002') currentLang = 'vi';
    } else {
        if (segments.includes('en')) currentLang = 'en';
        else if (segments.includes('vi')) currentLang = 'vi';
    }

    const knownContentRoots = new Set([
        'appendix', 'part1', 'part2', 'part3', 'part4', 'part5', 'part6', 'part7',
        'index.html', 'preface.html', '404.html', 'print.html', 'toc.html',
    ]);

    function getTargetUrl(targetLang) {
        if (isLocal && loc.port) {
            let targetPort = '3000';
            if (targetLang === 'en') targetPort = '3001';
            else if (targetLang === 'vi') targetPort = '3002';
            return `${loc.protocol}//${loc.hostname}:${targetPort}${loc.pathname}${loc.search}${loc.hash}`;
        }

        // Deployed
        let prefix = [];
        let rest = [];
        const enIdx = segments.indexOf('en');
        const viIdx = segments.indexOf('vi');
        const langIdx = enIdx >= 0 ? enIdx : viIdx;

        if (langIdx >= 0) {
            prefix = segments.slice(0, langIdx);
            rest = segments.slice(langIdx + 1);
        } else {
            const first = segments[0];
            const looksLikeContent = !first
                || knownContentRoots.has(first)
                || /^part\d+$/.test(first)
                || first.endsWith('.html');
            prefix = looksLikeContent ? [] : [first];
            rest = looksLikeContent ? segments : segments.slice(1);
        }

        let targetSegments;
        if (targetLang === 'zh') {
            targetSegments = prefix.concat(rest);
        } else {
            targetSegments = prefix.concat([targetLang], rest);
        }
        const targetPath = `/${targetSegments.join('/')}${trailingSlash ? '/' : ''}`;
        return `${targetPath}${loc.search}${loc.hash}`;
    }

    function appendButton(url, labelText, titleText) {
        const link = document.createElement('a');
        link.className = 'icon-button language-switcher-button';
        link.href = url;
        link.title = titleText;
        link.setAttribute('aria-label', titleText);

        const label = document.createElement('span');
        label.className = 'language-switcher-label';
        label.textContent = labelText;
        link.appendChild(label);

        rightButtons.insertBefore(link, rightButtons.firstChild);
    }

    const languages = [
        { code: 'vi', label: 'VI', title: 'Switch to Vietnamese' },
        { code: 'en', label: 'EN', title: 'Switch to English' },
        { code: 'zh', label: '中文', title: 'Switch to Chinese' }
    ];

    // Filter out current language and append in reverse order (insertBefore prepends)
    languages
        .filter(l => l.code !== currentLang)
        .reverse()
        .forEach(l => {
            appendButton(getTargetUrl(l.code), l.label, l.title);
        });
})();
