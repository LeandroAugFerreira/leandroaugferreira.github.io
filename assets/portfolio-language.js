(() => {
    const switcher = document.querySelector('[data-portfolio-languages]');
    if (!switcher) return;

    const catalog = window.portfolioTranslations?.[switcher.dataset.portfolioLanguages];
    if (!catalog) return;
    const buttons = Array.from(switcher.querySelectorAll('button'));
    const preferenceKey = 'portfolio-language';
    const supportedPaths = new Set(['/', '/index.html', '/curriculo.html', '/chronos.html']);
    const attributes = ['alt', 'aria-label', 'title', 'placeholder'];
    const normalize = (value) => value.replace(/[\t\n\r\f ]+/g, ' ').replace(/^ | $/g, '');
    const translations = [];
    let language;

    function record(value, write) {
        const key = normalize(value);
        if (Object.hasOwn(catalog, key)) {
            translations.push({
                write,
                original: value,
                translated: catalog[key],
            });
        }
    }

    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.parentElement?.closest('script, style, svg, code, pre, [data-portfolio-languages]')) continue;
        const original = node.nodeValue;
        const key = normalize(original);
        if (Object.hasOwn(catalog, key)) {
            const leading = original.match(/^[\t\n\r\f ]*/)[0];
            const trailing = original.match(/[\t\n\r\f ]*$/)[0];
            translations.push({
                write: (value) => { node.nodeValue = value; },
                original,
                translated: leading + catalog[key] + trailing,
            });
        }
    }

    for (const attribute of attributes) {
        document.querySelectorAll(`[${attribute}]`).forEach((element) => {
            if (!element.closest('svg, [data-portfolio-languages]')) {
                record(element.getAttribute(attribute), (value) => element.setAttribute(attribute, value));
            }
        });
    }

    document.querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"]').forEach((meta) => {
        record(meta.content, (value) => { meta.content = value; });
    });

    const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });
    document.querySelectorAll('time[datetime]').forEach((element) => {
        const isoDate = element.getAttribute('datetime');
        if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return;
        translations.push({
            write: (value) => { element.textContent = value; },
            original: element.textContent,
            translated: dateFormatter.format(new Date(isoDate)),
        });
    });

    const localizedLinks = Array.from(document.links).flatMap((link) => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#')) return [];
        const url = new URL(href, document.baseURI);
        return url.origin === location.origin && supportedPaths.has(url.pathname)
            ? [{ link, href, url }]
            : [];
    });

    window.portfolioLanguage = {
        translate(value) {
            return language === 'en' && Object.hasOwn(catalog, value) ? catalog[value] : value;
        },
    };

    function applyLanguage(nextLanguage, updateUrl = false) {
        language = nextLanguage;
        const english = language === 'en';
        document.documentElement.lang = english ? 'en-US' : 'pt-BR';
        translations.forEach(({ write, original, translated }) => write(english ? translated : original));
        switcher.setAttribute('aria-label', english ? 'Site language' : 'Idioma do site');
        buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
        localizedLinks.forEach(({ link, href, url }) => {
            if (english) {
                url.searchParams.set('lang', 'en');
                link.href = url.href;
            } else {
                link.setAttribute('href', href);
            }
        });
        if (updateUrl) {
            const url = new URL(location.href);
            url.searchParams.set('lang', language);
            history.replaceState(history.state, '', url);
        }
        try { localStorage.setItem(preferenceKey, language); } catch { /* Storage can be unavailable. */ }
        document.dispatchEvent(new Event('portfolio:languagechange'));
    }

    let savedLanguage;
    try { savedLanguage = localStorage.getItem(preferenceKey); } catch { /* Use Portuguese by default. */ }
    const requestedLanguage = new URLSearchParams(location.search).get('lang');
    const initialLanguage = ['pt', 'en'].includes(requestedLanguage) ? requestedLanguage : savedLanguage;
    applyLanguage(initialLanguage === 'en' ? 'en' : 'pt');
    buttons.forEach((button) => button.addEventListener('click', () => applyLanguage(button.dataset.language, true)));
    switcher.hidden = false;
})();
