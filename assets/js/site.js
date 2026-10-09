/*
 * Stux.Digital pages - shared behaviour: the theme toggle (stuxdigital-theme), the browser
 * window's address bar (shows where the page is actually served), the footer's version link
 * and copyright years, the two winding paths (in the background and through the progress
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

    // Two copies of the logo's winding path, each starting at a lightbulb, like the logo itself.
    // The background one starts at a glowing bulb in the top corner and winds down behind the
    // card to the bottom-left of the screen (wider screens only). The steps' one starts at the
    // first step (the Idea bulb) and winds through every step to the last, brighter as far as the
    // current step. Both are redrawn whenever the layout moves, and both flow away from their bulb.
    var NS = 'http://www.w3.org/2000/svg';
    function svgEl(tag, attrs) {
        var e = document.createElementNS(NS, tag);
        for (var k in attrs) e.setAttribute(k, attrs[k]);
        return e;
    }
    function f(n) { return n.toFixed(1); }
    function redrawOnLayout(draw, el) {
        draw();
        window.addEventListener('resize', draw);
        window.addEventListener('load', draw);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
        if (window.ResizeObserver) new ResizeObserver(draw).observe(el);
    }

    // The background path, from its bulb. Cut away under the bulb, so it starts at its edge.
    (function () {
        var svg = svgEl('svg', { 'class': 'bg-path', 'aria-hidden': 'true', focusable: 'false' });
        var defs = svgEl('defs', {});
        var mask = svgEl('mask', { id: 'bg-path-gap', maskUnits: 'userSpaceOnUse' });
        var rect = svgEl('rect', { x: 0, y: 0, fill: '#fff' });
        var hole = svgEl('circle', { fill: '#000' });
        mask.appendChild(rect);
        mask.appendChild(hole);
        defs.appendChild(mask);
        var path = svgEl('path', { mask: 'url(#bg-path-gap)' });
        svg.appendChild(defs);
        svg.appendChild(path);
        var bulb = document.createElement('span');
        bulb.className = 'bg-bulb';
        bulb.setAttribute('aria-hidden', 'true');
        bulb.innerHTML = '<svg class="ico" viewBox="0 0 24 24" focusable="false"><path d="M9 21h6v-1.5H9zm3-19a7 7 0 0 0-4.2 12.6c.5.4.7.9.7 1.4v1.5h7V16c0-.5.2-1 .7-1.4A7 7 0 0 0 12 2z"/></svg>';
        document.body.appendChild(svg);
        document.body.appendChild(bulb);
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
        function draw() {
            var vw = window.innerWidth, vh = window.innerHeight;
            svg.setAttribute('viewBox', '0 0 ' + vw + ' ' + vh);
            rect.setAttribute('width', vw);
            rect.setAttribute('height', vh);
            var b = [vw * 0.93 - 26, vh * 0.09 + 26];
            bulb.style.left = f(b[0] - 26) + 'px';
            bulb.style.top = f(b[1] - 26) + 'px';
            hole.setAttribute('cx', f(b[0]));
            hole.setAttribute('cy', f(b[1]));
            hole.setAttribute('r', 32);
            path.setAttribute('d', smooth([b, [vw * 0.8, vh * 0.3], [vw * 0.66, vh * 0.42], [vw * 0.47, vh * 0.66],
                [vw * 0.22, vh * 0.7], [-30, vh - 30]]));
        }
        redrawOnLayout(draw, document.body);
    })();

    // The steps' path, from the Idea bulb through every step's dot to the last.
    document.querySelectorAll('.steps').forEach(function (list) {
        var steps = [].slice.call(list.querySelectorAll('.step'));
        if (steps.length < 2) return;
        var svg = svgEl('svg', { 'class': 'steps-path', 'aria-hidden': 'true', focusable: 'false' });
        var track = svgEl('path', { 'class': 'track' });
        var bright = svgEl('path', { 'class': 'reached' });
        svg.appendChild(track);
        svg.appendChild(bright);
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
                var d = 'M' + f(pts[0][0]) + ' ' + f(pts[0][1]);
                for (var i = 1; i < n; i++) {
                    var a = pts[i - 1], b = pts[i], w = (i % 2 ? -1 : 1) * 20, dx = (b[0] - a[0]) / 3;
                    d += ' C' + f(a[0] + dx) + ' ' + f(a[1] + w) + ' ' + f(b[0] - dx) + ' ' + f(b[1] - w) + ' ' + f(b[0]) + ' ' + f(b[1]);
                }
                return d;
            }
            track.setAttribute('d', through(pts.length));
            bright.setAttribute('d', reached ? through(reached + 1) : '');
        }
        redrawOnLayout(draw, list);
    });

    // Shown inside another site's iframe: tell it this page's title.
    if (window.parent !== window) {
        var origin = document.referrer ? new URL(document.referrer).origin : '*';
        window.parent.postMessage({ type: 'page-title', title: document.title }, origin);
    }
})();
