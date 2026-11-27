// A light curtain over the whole site (owner, 2026-11-27): the same password as the app's own gate,
// and the same one-day cookie. It keeps passers-by and crawlers out; it is not real security,
// since the check runs in the browser. The password is kept here only as its SHA-256.
(function () {
  var HASH = '9441024eb2ef00224fabf6be7916fa10e00e9cdd5f8a9e6f81afbbb44f00faa2';
  var COOKIE = 'cw_gate';
  var open = document.cookie.split('; ').indexOf(COOKIE + '=1') !== -1;
  var form = document.currentScript.hasAttribute('data-form');   // only the root page carries the form
  var root = document.currentScript.src.replace(/gate\.js.*$/, '');
  if (!form) {
    if (!open) { document.documentElement.style.visibility = 'hidden'; location.replace(root); }
    return;
  }
  if (open) { location.replace(root + 'store/'); return; }
  document.addEventListener('DOMContentLoaded', function () {
    var f = document.getElementById('gate'), input = document.getElementById('gate-pw'), err = document.getElementById('gate-err');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      crypto.subtle.digest('SHA-256', new TextEncoder().encode(input.value)).then(function (buf) {
        var hex = Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
        if (hex === HASH) {
          document.cookie = COOKIE + '=1; max-age=86400; path=/; SameSite=Lax; Secure';
          location.replace(root + 'store/');
        } else { err.hidden = false; input.value = ''; input.focus(); }
      });
    });
  });
})();
