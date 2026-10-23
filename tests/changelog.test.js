// Runs assets/js/changelog.js against a stub DOM: checks "## vYY.MM.DD" and "## vYY.MM.DD-N"
// headings are recognised and sections are sorted Added, Changed, Fixed, Removed, Security,
// Deprecated (unknown last). Run with: node tests/changelog.test.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const md = [
  '# Changelog', '', '## v26.10.24-1', '', '### Deprecated', '- d', '### Zed', '- z', '### Added', '- a',
  '### Security', '- s', '### Fixed', '- f', '### Removed', '- r', '### Changed', '- c', '',
  '## v26.10.24', '', '### Added', '- x', '', '## [1.0.7] - 2026-10-09', '', '### Changed', '- old', ''
].join('\n');
const target = { innerHTML: '', getAttribute: () => '' };
const ctx = {
  document: { getElementById: (id) => (id === 'changelog-body' ? target : null) },
  fetch: () => Promise.resolve({ ok: true, text: () => Promise.resolve(md) })
};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'assets/js/changelog.js'), 'utf8'), ctx);
setTimeout(() => {
  const html = target.innerHTML;
  assert(html.includes('<h2 class="cl-version">v26.10.24-1</h2>'), 'dash-N heading');
  assert(html.includes('<h2 class="cl-version">v26.10.24</h2>'), 'plain date heading');
  assert(html.includes('[1.0.7] - 2026-10-09'), 'old heading still renders');
  const first = html.split('<section')[1];
  const order = ['Added', 'Changed', 'Fixed', 'Removed', 'Security', 'Deprecated', 'Zed'].map((n) => first.indexOf('>' + n + '<'));
  assert(order.every((p) => p > 0) && order.every((p, i) => i === 0 || p > order[i - 1]), 'section order');
  console.log('ok   - changelog renderer');
}, 50);
