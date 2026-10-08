<?php
// Local dev router for dev-server.sh / dev-server.bat (never deployed: GitHub Pages leaves
// .github/ out). Serves the folder the way GitHub Pages does (/changelog -> changelog.html,
// the 404 page for anything missing) and, unless --no-dev-mode, answers /assets/dev-mode.js
// with `window.SITE_DEV_MODE = true` so the pages show the dev banner.
$root = rtrim($_SERVER['DOCUMENT_ROOT'], '/\\');
$path = rawurldecode((string) parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

if ($path === '/assets/dev-mode.js' && getenv('DEV_MODE') === '1') {
    header('Content-Type: application/javascript; charset=utf-8');
    header('Cache-Control: no-store');
    echo "window.SITE_DEV_MODE = true;\n";
    return true;
}

if (strpos($path, '..') !== false) {
    http_response_code(400);
    return true;
}

$file = $root . $path;
if (is_file($file)) {
    return false;
}
if (substr($path, -1) !== '/' && is_file($file . '.html')) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($file . '.html');
    return true;
}
if (is_dir($file) && (is_file($file . '/index.html') || is_file(rtrim($file, '/') . '/index.html'))) {
    return false;
}
http_response_code(404);
if (is_file($root . '/404.html')) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($root . '/404.html');
}
return true;
