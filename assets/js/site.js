/*
 * Stux.Digital pages - shared behaviour: the theme toggle (stuxdigital-theme), the browser
 * window's address bar (shows where the page is actually served), the footer's version link
 * and copyright years, and the page-title message for pages shown in an iframe.
 */
(function () {
    'use strict';
    var root = document.documentElement;

    // Theme: the <head> script already applied the saved/system theme before paint.
    var btn = document.getElementById('theme-toggle');
    function label() {
        if (!btn) return;
        var dark = root.getAttribute('data-theme') !== 'light';
        btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    }
    label();
    if (btn) {
        btn.addEventListener('click', function () {
            var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            root.setAttribute('data-theme', next);
            try { localStorage.setItem('stuxdigital-theme', next); } catch (e) {}
            label();
        });
    }

    // Address bar: the real host (a placeholder is served on many domains) and path.
    if (location.host) {
        document.querySelectorAll('[data-current-host]').forEach(function (el) { el.textContent = location.host; });
        document.querySelectorAll('[data-current-path]').forEach(function (el) {
            el.textContent = location.host + (location.pathname === '/' ? '' : location.pathname.replace(/\.html$/, ''));
        });
    }

    // Copyright years: "2026", or "2026-<this year>" once it's later.
    var y = new Date().getFullYear();
    document.querySelectorAll('[data-copyright-years]').forEach(function (el) {
        var s = parseInt(el.getAttribute('data-start'), 10);
        el.textContent = s >= y ? String(y) : s + '\u2013' + y;
    });

    // Footer version link: this site's VERSION.md. Keeps "Changelog" if it can't be read.
    if (window.fetch) {
        fetch('/VERSION.md', { cache: 'no-cache' })
            .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
            .then(function (v) {
                v = v.trim().replace(/^v/i, '');
                if (!/^\d+\.\d+\.\d+/.test(v)) return;
                document.querySelectorAll('[data-site-version]').forEach(function (a) {
                    a.textContent = 'v' + v;
                    a.title = 'Version ' + v + ': changelog';
                });
            })
            .catch(function () {});
    }

    // Shown inside another site's iframe: tell it this page's title.
    if (window.parent !== window) {
        var origin = document.referrer ? new URL(document.referrer).origin : '*';
        window.parent.postMessage({ type: 'page-title', title: document.title }, origin);
    }
})();
