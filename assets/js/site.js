/*
 * Stux.Digital pages - shared behaviour: the theme toggle (stuxdigital-theme), the browser
 * window's address bar (shows where the page is actually served), the footer's version link
 * and copyright years, the winding background path from the lightbulb (through the progress
 * steps), and the page-title message for pages shown in an iframe.
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

    // The logo's winding path, as a dotted line behind the page, from a glowing lightbulb. With
    // progress steps it starts at the bulb (beside the card), sweeps into the steps row and winds
    // through every step to the last, brighter as far as the current step; without steps it runs
    // from the bottom-left of the screen up to the bulb. It's drawn in page coordinates and redrawn
    // whenever the layout moves, with gaps cut where it passes under the bulb and the step dots, so
    // it always starts and ends exactly on them. Phones have no room beside the card: there the
    // path just winds through the steps.
    (function () {
        var NS = 'http://www.w3.org/2000/svg';
        var steps = [].slice.call(document.querySelectorAll('.steps .step'));
        var reached = 0;
        steps.forEach(function (s, i) {
            if (s.classList.contains('step--done') || s.classList.contains('step--current')) reached = i;
        });
        function svgEl(tag, attrs) {
            var e = document.createElementNS(NS, tag);
            for (var k in attrs) e.setAttribute(k, attrs[k]);
            return e;
        }
        var svg = svgEl('svg', { 'class': steps.length ? 'page-path' : 'page-path page-path--behind', 'aria-hidden': 'true', focusable: 'false' });
        var mask = svgEl('mask', { id: 'page-path-gaps', maskUnits: 'userSpaceOnUse' });
        var defs = svgEl('defs', {});
        defs.appendChild(mask);
        var track = svgEl('path', { 'class': 'track', mask: 'url(#page-path-gaps)' });
        var bright = svgEl('path', { 'class': 'reached', mask: 'url(#page-path-gaps)' });
        svg.appendChild(defs);
        svg.appendChild(track);
        svg.appendChild(bright);
        var bulb = document.createElement('span');
        bulb.className = steps.length ? 'path-bulb' : 'path-bulb path-bulb--behind';
        bulb.setAttribute('aria-hidden', 'true');
        bulb.innerHTML = '<svg class="ico" viewBox="0 0 24 24" focusable="false"><path d="M9 21h6v-1.5H9zm3-19a7 7 0 0 0-4.2 12.6c.5.4.7.9.7 1.4v1.5h7V16c0-.5.2-1 .7-1.4A7 7 0 0 0 12 2z"/></svg>';
        document.body.appendChild(svg);
        document.body.appendChild(bulb);

        function f(n) { return n.toFixed(1); }
        // A wave from a to b: up then down (or the reverse), so consecutive steps snake.
        function wave(a, b, i) {
            var w = (i % 2 ? -1 : 1) * 20, dx = (b[0] - a[0]) / 3;
            return ' C' + f(a[0] + dx) + ' ' + f(a[1] + w) + ' ' + f(b[0] - dx) + ' ' + f(b[1] - w) + ' ' + f(b[0]) + ' ' + f(b[1]);
        }
        // A smooth curve through points (Catmull-Rom as Béziers).
        function smooth(p) {
            var d = 'M' + f(p[0][0]) + ' ' + f(p[0][1]);
            for (var i = 0; i < p.length - 1; i++) {
                var p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
                d += ' C' + f(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + f(p1[1] + (p2[1] - p0[1]) / 6) + ' ' +
                    f(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + f(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + f(p2[0]) + ' ' + f(p2[1]);
            }
            return d;
        }
        function centre(el) {
            var r = el.getBoundingClientRect();
            return [r.left + r.width / 2 + window.scrollX, r.top + r.height / 2 + window.scrollY, r.width / 2];
        }

        function draw() {
            // Measure the page without the path, so it never keeps the page as big as it last was.
            svg.setAttribute('width', 0);
            svg.setAttribute('height', 0);
            var W = document.documentElement.scrollWidth, H = document.documentElement.scrollHeight;
            var vw = window.innerWidth, vh = window.innerHeight;
            svg.setAttribute('width', W);
            svg.setAttribute('height', H);
            svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
            var holes = [], trackD = '', brightD = '', b = null;
            if (steps.length) {
                var dots = steps.map(function (s) { return centre(s.querySelector('.step-dot')); });
                var card = steps[0].closest('.browser, .card') || steps[0].parentNode;
                var cr = card.getBoundingClientRect();
                var cardLeft = cr.left + window.scrollX, cardTop = cr.top + window.scrollY;
                if (cardLeft >= 110) {
                    b = [cardLeft - 62, cardTop + 70];
                    var d1 = dots[0], into = ' C' + f(b[0] - 14) + ' ' + f(b[1] + (d1[1] - b[1]) * 0.7) + ' ' +
                        f(d1[0] - (d1[0] - b[0]) * 0.55) + ' ' + f(d1[1] + 26) + ' ' + f(d1[0]) + ' ' + f(d1[1]);
                    trackD = brightD = 'M' + f(b[0]) + ' ' + f(b[1]) + into;
                } else {
                    trackD = brightD = 'M' + f(dots[0][0]) + ' ' + f(dots[0][1]);
                }
                for (var i = 1; i < dots.length; i++) {
                    var seg = wave(dots[i - 1], dots[i], i);
                    trackD += seg;
                    if (i <= reached) brightD += seg;
                }
                if (!b && !reached) brightD = '';
                dots.forEach(function (d) { holes.push([d[0], d[1], d[2] + 6]); });
            } else if (vw >= 640) {
                b = [vw * 0.93 - 26, vh * 0.09 + 26];
                trackD = smooth([[-30, vh - 30], [vw * 0.22, vh * 0.7], [vw * 0.47, vh * 0.66], [vw * 0.66, vh * 0.42], [vw * 0.8, vh * 0.3], b]);
            }
            if (b) {
                bulb.style.left = f(b[0] - 26) + 'px';
                bulb.style.top = f(b[1] - 26) + 'px';
                bulb.hidden = false;
                holes.push([b[0], b[1], 32]);
            } else {
                bulb.hidden = true;
            }
            track.setAttribute('d', trackD);
            bright.setAttribute('d', steps.length ? brightD : '');
            while (mask.firstChild) mask.removeChild(mask.firstChild);
            mask.appendChild(svgEl('rect', { x: 0, y: 0, width: W, height: H, fill: '#fff' }));
            holes.forEach(function (h) { mask.appendChild(svgEl('circle', { cx: f(h[0]), cy: f(h[1]), r: f(h[2]), fill: '#000' })); });
        }
        draw();
        window.addEventListener('resize', draw);
        window.addEventListener('load', draw);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
        if (window.ResizeObserver) new ResizeObserver(draw).observe(document.body);
    })();

    // Shown inside another site's iframe: tell it this page's title.
    if (window.parent !== window) {
        var origin = document.referrer ? new URL(document.referrer).origin : '*';
        window.parent.postMessage({ type: 'page-title', title: document.title }, origin);
    }
})();
