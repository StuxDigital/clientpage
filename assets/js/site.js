/*
 * Stux.Digital pages - shared behaviour: the theme toggle (stuxdigital-theme), the browser
 * window's address bar (shows where the page is actually served), the footer's version link
 * and copyright years, the winding path through the progress steps, and the page-title
 * message for pages shown in an iframe.
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

    // Steps: one winding dotted path through every step's dot, first to last, like the path in
    // the logo, with a brighter path over it as far as the current step. Redrawn when the dots
    // move (resizing, fonts loading); on phones the 2×2 grid makes it snake down a row.
    document.querySelectorAll('.steps').forEach(function (list) {
        var NS = 'http://www.w3.org/2000/svg';
        var steps = [].slice.call(list.querySelectorAll('.step'));
        if (steps.length < 2) return;
        var svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('class', 'steps-path');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        var track = document.createElementNS(NS, 'path');
        track.setAttribute('class', 'track');
        var reachedPath = document.createElementNS(NS, 'path');
        reachedPath.setAttribute('class', 'reached');
        svg.appendChild(track);
        svg.appendChild(reachedPath);
        list.insertBefore(svg, list.firstChild);
        var reached = 0;
        steps.forEach(function (s, i) {
            if (s.classList.contains('step--done') || s.classList.contains('step--current')) reached = i;
        });
        function draw() {
            var box = list.getBoundingClientRect();
            var pts = steps.map(function (s) {
                var r = s.querySelector('.step-dot').getBoundingClientRect();
                return [r.left + r.width / 2 - box.left, r.top + r.height / 2 - box.top];
            });
            function through(n) {
                var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
                for (var i = 1; i < n; i++) {
                    var a = pts[i - 1], b = pts[i], wave = (i % 2 ? -1 : 1) * 20;
                    var dx = (b[0] - a[0]) / 3;
                    d += ' C' + (a[0] + dx).toFixed(1) + ' ' + (a[1] + wave).toFixed(1) + ' ' +
                        (b[0] - dx).toFixed(1) + ' ' + (b[1] - wave).toFixed(1) + ' ' +
                        b[0].toFixed(1) + ' ' + b[1].toFixed(1);
                }
                return d;
            }
            track.setAttribute('d', through(pts.length));
            reachedPath.setAttribute('d', reached ? through(reached + 1) : '');
        }
        draw();
        window.addEventListener('resize', draw);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    });

    // Shown inside another site's iframe: tell it this page's title.
    if (window.parent !== window) {
        var origin = document.referrer ? new URL(document.referrer).origin : '*';
        window.parent.postMessage({ type: 'page-title', title: document.title }, origin);
    }
})();
