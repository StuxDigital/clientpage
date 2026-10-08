/*
 * The /changelog page: renders this site's CHANGELOG.md client-side. No dependencies.
 * Section types always render in ORDER (unknown types last), whatever order the markdown
 * lists them in; their badge colours are in site.css (.cl-label-*).
 */
(function () {
    'use strict';
    var ORDER = ['Added', 'Changed', 'Fixed', 'Removed', 'Security', 'Deprecated'];
    var target = document.getElementById('changelog-body');
    if (!target) return;

    function esc(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function inline(s) {
        var codes = [];
        s = s.replace(/`([^`]+)`/g, function (_, c) { codes.push('<code>' + esc(c) + '</code>'); return '\u0000' + (codes.length - 1) + '\u0000'; });
        s = esc(s);
        s = s.replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/|#|mailto:)[^)\s]+)\)/g, '<a href="$2">$1</a>');
        s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        return s.replace(/\u0000(\d+)\u0000/g, function (_, n) { return codes[+n]; });
    }
    function rank(title) {
        var word = title.trim().split(/\s+/)[0].toLowerCase();
        for (var i = 0; i < ORDER.length; i++) if (ORDER[i].toLowerCase() === word) return i;
        return ORDER.length;
    }

    function render(md) {
        var releases = [], cur = null, sec = null;
        md.replace(/\r\n/g, '\n').split('\n').forEach(function (line) {
            var m;
            if ((m = line.match(/^##\s+(.+)$/))) {
                cur = { title: m[1].trim(), sections: [] }; sec = null; releases.push(cur);
            } else if (cur && (m = line.match(/^###\s+(.+)$/))) {
                sec = { title: m[1].trim(), items: [] }; cur.sections.push(sec);
            } else if (sec && (m = line.match(/^\s*-\s+(.+)$/))) {
                sec.items.push(m[1].trim());
            } else if (sec && sec.items.length && /^\s{2,}\S/.test(line)) {
                sec.items[sec.items.length - 1] += ' ' + line.trim();
            }
        });
        if (!releases.length) { target.innerHTML = '<p>No releases yet.</p>'; return; }
        target.innerHTML = releases.map(function (rel) {
            var sections = rel.sections.map(function (s, i) { return { s: s, i: i, r: rank(s.title) }; })
                .sort(function (a, b) { return (a.r - b.r) || (a.i - b.i); })
                .map(function (x) {
                    var known = x.r < ORDER.length;
                    var head = known ? '<span class="cl-label cl-label-' + ORDER[x.r].toLowerCase() + '">' + esc(x.s.title) + '</span>'
                                     : '<h3 class="cl-section">' + esc(x.s.title) + '</h3>';
                    return head + '<ul class="cl-list">' + x.s.items.map(function (it) { return '<li>' + inline(it) + '</li>'; }).join('') + '</ul>';
                }).join('');
            return '<section class="cl-entry"><h2 class="cl-version">' + inline(rel.title) + '</h2>' + sections + '</section>';
        }).join('');
    }

    fetch('/CHANGELOG.md', { cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then(render)
        .catch(function () {
            var gh = target.getAttribute('data-github');
            target.innerHTML = '<p>Couldn&rsquo;t load the changelog right now. See <a href="' + gh + '">CHANGELOG.md on GitHub</a> instead.</p>';
        });
})();
