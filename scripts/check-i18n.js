#!/usr/bin/env node
/**
 * Checks that the Turkish and English translation files stay in sync and that
 * every key used in the HTML pages and scripts actually exists.
 *
 * Usage: npm run check:i18n
 * Exits with code 1 if anything is missing, so it can run in CI.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

// Load the dictionaries exactly the way the browser does.
const sandbox = { window: {} };
vm.createContext(sandbox);
for (const lang of ['tr', 'en']) {
    vm.runInContext(read(`assets/js/i18n/${lang}.js`), sandbox);
}
const { tr, en } = sandbox.window.IEEE_I18N;
const trKeys = new Set(Object.keys(tr));
const enKeys = new Set(Object.keys(en));

// Collect every key referenced by the site.
const used = new Set();
const htmlFiles = fs.readdirSync(root).filter(f => f.endsWith('.html'));
for (const file of htmlFiles) {
    const html = read(file);
    for (const [, key] of html.matchAll(/data-i18n(?:-html)?="([\w.]+)"/g)) used.add(key);
    for (const [, spec] of html.matchAll(/data-i18n-attr="([^"]+)"/g)) {
        spec.split(';').forEach(pair => {
            const key = (pair.split(':')[1] || '').trim();
            if (key) used.add(key);
        });
    }
}
const scripts = read('assets/js/app.js') + read('assets/js/data/team.js');
for (const [, key] of scripts.matchAll(/\bt\('([\w.]+)'\)/g)) used.add(key);
for (const [, key] of scripts.matchAll(/roleKey: "([\w.]+)"/g)) used.add(key);

const problems = [];
const report = (label, keys) => {
    if (keys.length) problems.push(`${label}:\n  - ${keys.join('\n  - ')}`);
};

report('Keys in tr.js but missing from en.js', [...trKeys].filter(k => !enKeys.has(k)));
report('Keys in en.js but missing from tr.js', [...enKeys].filter(k => !trKeys.has(k)));
report('Keys used in the site but missing from tr.js', [...used].filter(k => !trKeys.has(k)));

const unused = [...trKeys].filter(k => !used.has(k));
if (unused.length) {
    console.warn(`Note: ${unused.length} key(s) are defined but not used:\n  - ${unused.join('\n  - ')}`);
}

if (problems.length) {
    console.error(problems.join('\n\n'));
    process.exit(1);
}

console.log(`i18n OK — ${trKeys.size} keys in tr/en, ${used.size} used across ${htmlFiles.length} pages.`);
