/*
 * Site banners for Stux.Digital Clientpage - builds assets/site-banner.css's banners on these static pages.
 *
 * Only the dev banner is used here: it shows when dev-server.sh / dev-server.bat run (assets/dev-mode.js is answered with true). In dev mode,
 * ?banner=soon,maintenance,site previews the other variants; production never shows them.
 * Load order at the end of <body>: dev-mode.js, site-banners.js (this file), site-banner.js.
 */
(function () {
    'use strict';
    var NAME = 'Stux.Digital Clientpage';
    var COPY = {
        maintenance: ['Maintenance', 'status', NAME + ' is being updated and will be back shortly.'],
        soon: ['Coming soon', 'status', NAME + ' is launching soon.'],
        dev: ['Dev mode', 'note', 'Local preview of ' + NAME + '. Run <code>dev-server.sh --no-dev-mode</code> to see it as production does.'],
        site: ['Notice', 'note', 'A site notice for ' + NAME + ' appears here.']
    };
    var ORDER = ['maintenance', 'soon', 'dev', 'site'];

    if (!(window.SITE_DEV_MODE === true)) return;

    var show = ['dev'];
    var m = /[?&]banner=([^&#]*)/.exec(location.search);
    if (m) {
        decodeURIComponent(m[1]).toLowerCase().split(',').forEach(function (v) {
            v = v.trim();
            if (ORDER.indexOf(v) >= 0 && show.indexOf(v) < 0) show.push(v);
        });
    }

    // Pages that scroll something other than the document (html/body with a fixed height and
    // their own overflow) use the banner's fixed mode, so nothing slides under it.
    var root = document.documentElement;
    var oh = getComputedStyle(root).overflowY, ob = getComputedStyle(document.body).overflowY;
    var fixed = oh === 'hidden' || ob === 'hidden' || ob === 'auto' || ob === 'scroll';

    var box = document.createElement('div');
    box.className = 'site-banners' + (fixed ? ' site-banners--fixed' : '');
    box.setAttribute('data-site-banners', '');
    ORDER.forEach(function (v) {
        if (show.indexOf(v) < 0) return;
        var c = COPY[v];
        var el = document.createElement('div');
        el.className = 'site-banner site-banner--' + v;
        el.setAttribute('role', c[1]);
        var label = document.createElement('span');
        label.className = 'site-banner-label';
        label.textContent = c[0];
        var text = document.createElement('span');
        text.className = 'site-banner-text';
        text.innerHTML = c[2]; // fixed copy above, not user input
        el.appendChild(label);
        el.appendChild(text);
        box.appendChild(el);
    });
    document.body.insertBefore(box, document.body.firstChild);
    root.classList.add('has-site-banner');
    if (fixed) root.classList.add('site-banner-fixed');
})();
