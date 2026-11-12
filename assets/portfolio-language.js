(() => {
    const switcher = document.querySelector('[data-portfolio-languages]');
    const page = switcher?.dataset.portfolioLanguages;
    const catalog = window.portfolioTranslations?.[page];
    if (!catalog) return;

    const buttons = Array.from(switcher.querySelectorAll('button[data-language]'));
    const preferenceKey = 'portfolio-language';
    const attributes = ['alt', 'aria-label', 'title', 'placeholder'];
    const metadata = 'meta[name="description"], meta[property="og:title"], meta[property="og:description"]';
    const excluded = 'script, style, code, pre, noscript, [data-portfolio-languages]';
    const slots = /\{(\d+)\}/g;
    const normalize = (value) => value.replace(/[\t\n\r\f ]+/g, ' ').replace(/^ | $/g, '');
    const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const originals = new WeakMap();
    let language;

    const templates = Object.entries(window.portfolioTranslationTemplates?.[page] ?? {}).map(([source, target]) => {
        const indices = Array.from(source.matchAll(slots), (match) => Number(match[1]));
        const parts = source.split(/\{\d+\}/);
        return {
            target,
            indices,
            specificity: parts.join('').length,
            pattern: new RegExp('^' + parts.map(escapeRegex).join('(.+?)') + '$'),
        };
    }).sort((left, right) => right.specificity - left.specificity);

    function translate(value) {
        if (language !== 'en' || typeof value !== 'string') return value;
        const key = normalize(value);
        if (Object.hasOwn(catalog, key)) return catalog[key];
        if (key.length > 1500) return value;
        for (const { pattern, indices, target } of templates) {
            const match = pattern.exec(key);
            if (!match) continue;
            const substitutions = Object.fromEntries(indices.map((index, position) => [index, match[position + 1]]));
            return target.replace(slots, (_, index) => {
                const fragment = substitutions[index];
                return Object.hasOwn(catalog, fragment) ? catalog[fragment] : fragment;
            });
        }
        if (/ [·—|] /.test(key)) {
            const parts = key.split(/( [·—|] )/);
            const translated = parts.map((part) => Object.hasOwn(catalog, part) ? catalog[part] : part).join('');
            if (translated !== key) return translated;
        }
        return value;
    }

    function updateValue(node, field, value, localizedValue, write) {
        const records = originals.get(node);
        const record = records?.get(field);
        if (record?.localized === value) {
            if (language === 'pt') {
                write(record.source);
                records.delete(field);
            }
            return;
        }
        records?.delete(field);
        if (localizedValue === value) return;
        const nextRecords = records ?? new Map();
        nextRecords.set(field, { source: value, localized: localizedValue });
        originals.set(node, nextRecords);
        write(localizedValue);
    }

    function updateText(node) {
        const value = node.nodeValue;
        const translated = translate(value);
        const localized = translated === value ? value
            : value.match(/^[\t\n\r\f ]*/)[0] + translated + value.match(/[\t\n\r\f ]*$/)[0];
        updateValue(node, 'text', value, localized, (next) => {
            const option = node.parentElement;
            if (option?.matches('option:not([value])')) option.value = option.value;
            node.nodeValue = next;
        });
    }

    function updateAttribute(element, attribute) {
        const value = element.getAttribute(attribute);
        if (value === null) return;
        updateValue(element, attribute, value, translate(value), (next) => element.setAttribute(attribute, next));
    }

    function updateLink(link) {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#')) return;
        const url = new URL(href, document.baseURI);
        const localPage = url.pathname === '/' || url.pathname.endsWith('.html')
            || /^\/(dashboards\/(comercial|financeiro|logistico)|projects\/churn-analytics)\/?$/.test(url.pathname);
        if (url.origin !== location.origin || !localPage) return;
        let localized = href;
        if (language === 'en') {
            url.searchParams.set('lang', 'en');
            localized = url.href;
        }
        updateValue(link, 'href', href, localized, (next) => link.setAttribute('href', next));
    }

    const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });
    function updateElement(element) {
        for (const attribute of attributes) updateAttribute(element, attribute);
        if (element.matches(metadata)) updateAttribute(element, 'content');
        if (element.matches('a[href]')) updateLink(element);
        if (language === 'en' && element.matches('time[datetime]') && /^\d{4}-\d{2}-\d{2}$/.test(element.dateTime)
            && element.firstChild?.nodeType === Node.TEXT_NODE && element.childNodes.length === 1) {
            const node = element.firstChild;
            const formatted = dateFormatter.format(new Date(element.dateTime));
            updateValue(node, 'text', node.nodeValue, formatted, (next) => { node.nodeValue = next; });
        }
    }

    function updateNode(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            if (!node.closest(excluded)) updateElement(node);
        } else if (node.nodeType === Node.TEXT_NODE && node.parentElement && !node.parentElement.closest(excluded)) {
            const parent = node.parentElement;
            if (!parent.closest('svg') || parent.matches('text, tspan, title, desc')) updateText(node);
        }
    }

    function updateTree(root) {
        updateNode(root);
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                return node.nodeType === Node.ELEMENT_NODE && node.matches(excluded)
                    ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
            },
        });
        while (walker.nextNode()) updateNode(walker.currentNode);
    }

    const observer = new MutationObserver((records) => {
        observer.disconnect();
        for (const record of records) {
            if (record.type === 'childList') record.addedNodes.forEach(updateTree);
            else updateNode(record.target);
        }
        observe();
    });

    function observe() {
        if (language === 'en') observer.observe(document.documentElement, {
            subtree: true,
            childList: true,
            characterData: true,
            attributes: true,
            attributeFilter: [...attributes, 'content', 'href'],
        });
    }

    window.portfolioLanguage = { translate };

    function applyLanguage(nextLanguage, updateUrl = false) {
        observer.disconnect();
        language = nextLanguage;
        const english = language === 'en';
        document.documentElement.lang = english ? 'en-US' : 'pt-BR';
        updateTree(document.documentElement);
        switcher.setAttribute('aria-label', english ? 'Site language' : 'Idioma do site');
        buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
        if (updateUrl) {
            const url = new URL(location.href);
            url.searchParams.set('lang', language);
            history.replaceState(history.state, '', url);
        }
        try { localStorage.setItem(preferenceKey, language); } catch { /* Storage can be unavailable. */ }
        observe();
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
