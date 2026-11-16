/**
 * Minimal client-side localization (Turkish / English).
 *
 * Load order on every page:
 *   assets/js/i18n/tr.js → assets/js/i18n/en.js → assets/js/i18n.js → assets/js/app.js
 *
 * Markup API
 *   data-i18n="key"                 Sets the element's textContent.
 *   data-i18n-suffix=" | IEEE TEDU" Optional fixed text appended after data-i18n
 *                                   (used for <title> on post pages).
 *   data-i18n-html="key"            Sets innerHTML (only for our own trusted strings
 *                                   that contain markup, e.g. <br> or <span>).
 *   data-i18n-attr="attr:key;..."   Sets one or more attributes, e.g.
 *                                   data-i18n-attr="placeholder:contact.namePlaceholder".
 *   data-set-lang="tr|en"           A button that switches the language.
 *
 * JavaScript API (window.I18n)
 *   I18n.t(key)        Translated string for the current language.
 *   I18n.lang          Current language code.
 *   I18n.setLang(code) Switch language, re-translate the page and fire
 *                      a "languagechange" event on document.
 *
 * Language resolution order: ?lang= URL parameter → saved choice → browser
 * language (Turkish browsers get "tr", everyone else "en").
 * The Turkish text written directly in the HTML is only a no-JS fallback.
 */
(function () {
    'use strict';

    const SUPPORTED = ['tr', 'en'];
    const DEFAULT_LANG = 'tr';
    const STORAGE_KEY = 'ieee-tedu-lang';
    const dictionaries = window.IEEE_I18N || {};

    function readStoredLang() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            return null; // Storage can be blocked (private mode, strict cookie settings).
        }
    }

    function storeLang(lang) {
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (e) {
            /* Not critical: the choice just won't persist. */
        }
    }

    function detectLang() {
        const fromUrl = new URLSearchParams(window.location.search).get('lang');
        if (SUPPORTED.includes(fromUrl)) return fromUrl;

        const stored = readStoredLang();
        if (SUPPORTED.includes(stored)) return stored;

        const browser = (navigator.language || '').toLowerCase();
        if (browser) return browser.startsWith('tr') ? 'tr' : 'en';

        return DEFAULT_LANG;
    }

    let currentLang = detectLang();

    function t(key) {
        const dict = dictionaries[currentLang] || {};
        if (key in dict) return dict[key];

        const fallback = dictionaries[DEFAULT_LANG] || {};
        if (key in fallback) {
            console.warn(`[i18n] Missing "${currentLang}" translation for "${key}"`);
            return fallback[key];
        }

        console.warn(`[i18n] Unknown translation key "${key}"`);
        return key;
    }

    function translatePage(root) {
        const scope = root || document;

        scope.querySelectorAll('[data-i18n]').forEach(el => {
            el.textContent = t(el.dataset.i18n) + (el.dataset.i18nSuffix || '');
        });

        scope.querySelectorAll('[data-i18n-html]').forEach(el => {
            el.innerHTML = t(el.dataset.i18nHtml);
        });

        scope.querySelectorAll('[data-i18n-attr]').forEach(el => {
            el.dataset.i18nAttr.split(';').forEach(pair => {
                const [attr, key] = pair.split(':').map(s => s.trim());
                if (attr && key) el.setAttribute(attr, t(key));
            });
        });

        document.querySelectorAll('[data-set-lang]').forEach(btn => {
            const isActive = btn.dataset.setLang === currentLang;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', String(isActive));
        });

        document.documentElement.lang = currentLang;
    }

    function setLang(lang) {
        if (!SUPPORTED.includes(lang) || lang === currentLang) return;
        currentLang = lang;
        storeLang(lang);
        translatePage();
        document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
    }

    document.addEventListener('click', event => {
        const btn = event.target.closest('[data-set-lang]');
        if (btn) setLang(btn.dataset.setLang);
    });

    window.I18n = {
        t,
        setLang,
        translatePage,
        get lang() { return currentLang; },
        get locale() { return currentLang === 'tr' ? 'tr-TR' : 'en-US'; }
    };

    // Scripts are loaded at the end of <body>, so the DOM is already parsed here.
    translatePage();
})();
