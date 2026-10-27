/*!
 * nukitchen-embed.js — the NuKitchen 3D designer, embeddable on a retailer's site.
 *
 * This is the file a retailer would paste. It is the HOST half of the
 * integration: it mounts the designer in an iframe, hands it the retailer's
 * catalog, and passes finished designs / parts lists back to the page.
 *
 *   <div id="nk-designer"></div>
 *   <script src="nukitchen-embed.js"></script>
 *   <script>
 *     NuKitchen.mount('#nk-designer', {
 *       retailer: 'your-shop-id',
 *       appUrl:   'https://<nukitchen embed url>',   // omit → preview placeholder
 *       catalog:  { currency: 'USD', lines: [...] },
 *       onAddToCart(order) { ... },                  // the designer's "Add to cart"
 *       onDesignSaved(design) { ... },               // optional
 *       launcher: { image, label },                  // optional: a picture + button in the page;
 *     });                                            //   the designer opens full screen on click
 *   </script>
 *
 * Message protocol (window.postMessage, JSON objects, origin-checked both ways):
 *   every message:  { source: 'nukitchen', v: 1, type, payload }
 *   app  → host     'ready'         { appVersion }
 *   host → app      'init'          { retailer, catalog, parentOrigin }
 *   app  → host     'resize'        { height }                    (optional)
 *   app  → host     'design:saved'  { designId, name, shareUrl }
 *   app  → host     'cart:add'      { designId, lines: [{ sku, qty, name, unitPrice }] }
 *
 * STATUS: the live app does not speak this protocol yet and cannot be framed
 * (it sends X-Frame-Options: SAMEORIGIN). Until it can, mount() without an
 * appUrl renders a clearly-labelled placeholder that emits the same events
 * through the same code path, so the host page can be built and tested now.
 */
(function () {
  'use strict';

  var PROTOCOL = 1;
  var SOURCE = 'nukitchen';

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) {
      if (k === 'style') n.style.cssText = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    (children || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  // One place every inbound event goes through — the real iframe and the
  // placeholder both call it, so the host's handlers are exercised identically.
  function dispatch(opts, type, payload) {
    if (type === 'cart:add' && typeof opts.onAddToCart === 'function') opts.onAddToCart(payload);
    if (type === 'design:saved' && typeof opts.onDesignSaved === 'function') opts.onDesignSaved(payload);
    if (typeof opts.onEvent === 'function') opts.onEvent(type, payload);
  }

  function mountLive(host, opts) {
    var appOrigin = new URL(opts.appUrl, location.href).origin;
    var src = new URL(opts.appUrl, location.href);
    src.searchParams.set('embed', '1');
    src.searchParams.set('retailer', opts.retailer || '');
    src.searchParams.set('parent', location.origin);

    var frame = el('iframe', {
      src: src.toString(),
      title: 'Kitchen designer',
      allow: 'fullscreen; clipboard-write',
      style: 'width:100%;height:' + (opts.fill ? '100%' : (opts.height || 720) + 'px') + ';border:0;display:block;border-radius:inherit;'
    });
    host.appendChild(frame);

    function send(type, payload) {
      frame.contentWindow.postMessage({ source: SOURCE, v: PROTOCOL, type: type, payload: payload }, appOrigin);
    }

    window.addEventListener('message', function (e) {
      if (e.origin !== appOrigin || e.source !== frame.contentWindow) return;
      var m = e.data;
      if (!m || m.source !== SOURCE || m.v !== PROTOCOL) return;
      if (m.type === 'ready') {
        send('init', { retailer: opts.retailer, catalog: opts.catalog, parentOrigin: location.origin });
      } else if (m.type === 'resize') {
        if (!opts.fill && m.payload && m.payload.height > 0) frame.style.height = Math.min(Math.max(m.payload.height, 480), 1400) + 'px';
      } else {
        dispatch(opts, m.type, m.payload);
      }
    });

    return { send: send, frame: frame };
  }

  // Base look for the launcher and the full-screen designer. Inserted FIRST in
  // <head>, so any rule the store writes for these classes wins.
  var CSS =
    '.nk-launch{position:relative;display:block;width:100%;padding:0;border:0;background:#111614;cursor:pointer;overflow:hidden;border-radius:inherit;font:inherit;color:inherit}' +
    '.nk-launch img{display:block;width:100%;height:auto;aspect-ratio:16/10;object-fit:cover;transition:transform .4s ease}' +
    '.nk-launch:hover img{transform:scale(1.02)}' +
    '.nk-launch-label{position:absolute;left:50%;bottom:24px;transform:translateX(-50%);white-space:nowrap;padding:14px 26px;border-radius:999px;background:#fff;color:#14201b;font-weight:700;font-size:1.05rem;box-shadow:0 6px 24px rgba(0,0,0,.25)}' +
    '.nk-launch:focus-visible{outline:3px solid #fff;outline-offset:-6px}' +
    '.nk-overlay{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;background:#111614}' +
    '.nk-overlay[hidden]{display:none}' +
    '.nk-overlay-bar{flex:none;display:flex;justify-content:flex-end;padding:6px 8px;background:#111614}' +
    '.nk-overlay-close{width:36px;height:36px;border:0;border-radius:8px;background:rgba(255,255,255,.1);color:#fff;font-size:20px;line-height:1;cursor:pointer}' +
    '.nk-overlay-close:hover{background:rgba(255,255,255,.2)}' +
    '.nk-overlay iframe{flex:1;min-height:0}' +
    'html.nk-open{overflow:hidden}';
  function injectCss() {
    if (document.getElementById('nk-embed-css')) return;
    var s = el('style', { id: 'nk-embed-css' });
    s.textContent = CSS;
    document.head.insertBefore(s, document.head.firstChild);
  }

  // A picture and a button in the page; the designer loads only on the first
  // click (the store's page pays nothing for it until then) and opens full
  // screen over the page, as the app is everywhere else. Closing keeps it, so
  // the design is there on the next open. Add to cart closes it: the store's
  // cart is what the shopper wants to see next.
  function mountLauncher(host, opts) {
    injectCss();
    var label = opts.launcher.label || 'Design your kitchen in 3D';
    var launch = el('button', { type: 'button', class: 'nk-launch' }, [
      opts.launcher.image ? el('img', { src: opts.launcher.image, alt: '', loading: 'lazy' }) : null,
      el('span', { class: 'nk-launch-label', text: label })
    ]);
    host.appendChild(launch);

    var overlay = null, live = null;
    function close() {
      overlay.hidden = true;
      document.documentElement.classList.remove('nk-open');
      launch.focus();
    }
    function open() {
      if (!overlay) {
        var x = el('button', { type: 'button', class: 'nk-overlay-close', 'aria-label': 'Close the designer', title: 'Close', text: '✕' });
        x.addEventListener('click', close);
        overlay = el('div', { class: 'nk-overlay', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Kitchen designer' },
          [el('div', { class: 'nk-overlay-bar' }, [x])]);
        document.body.appendChild(overlay);
        live = mountLive(overlay, Object.assign({}, opts, {
          fill: true,
          onAddToCart: function (order) {
            close();
            if (typeof opts.onAddToCart === 'function') opts.onAddToCart(order);
          }
        }));
      }
      overlay.hidden = false;
      document.documentElement.classList.add('nk-open');
      live.frame.focus();
    }
    launch.addEventListener('click', open);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay && !overlay.hidden) close(); });
    return { open: open, close: close, get frame() { return live && live.frame; } };
  }

  function mountPlaceholder(host, opts) {
    var cat = opts.catalog || { lines: [] };
    var skuCount = cat.lines.reduce(function (n, l) { return n + (l.skus ? l.skus.length : 0); }, 0);
    var log = el('div', { class: 'nk-ph-log', text: 'Catalog handed to designer: ' + cat.lines.length + ' cabinet lines, ' + skuCount + ' SKUs.' });

    var simulate = el('button', { type: 'button', class: 'nk-ph-btn', text: 'Simulate “Add design to cart”' });
    simulate.addEventListener('click', function () {
      var order = typeof opts.sampleOrder === 'function' ? opts.sampleOrder() : { lines: [] };
      log.textContent = 'Designer sent cart:add — ' + order.lines.length + ' lines (simulated).';
      dispatch(opts, 'cart:add', order);
    });

    var box = el('div', { class: 'nk-ph' }, [
      el('span', { class: 'nk-ph-badge', text: 'PLACEHOLDER · not the live app' }),
      el('div', { class: 'nk-ph-grid', 'aria-hidden': 'true' }),
      el('div', { class: 'nk-ph-body' }, [
        el('strong', { class: 'nk-ph-title', text: 'The NuKitchen 3D designer loads here' }),
        el('p', { text: 'Shoppers draw their room, drop in cabinets from this store’s lines, and send the finished parts list straight to the cart. This box is a stand-in until the app is embed-ready.' }),
        simulate,
        log
      ])
    ]);
    host.appendChild(box);
    return { send: function () {}, frame: null };
  }

  window.NuKitchen = {
    version: '0.1.0-preview',
    mount: function (target, opts) {
      var host = typeof target === 'string' ? document.querySelector(target) : target;
      if (!host) throw new Error('NuKitchen.mount: no element for ' + target);
      opts = opts || {};
      host.classList.add('nk-host');
      if (!opts.appUrl) return mountPlaceholder(host, opts);
      return opts.launcher ? mountLauncher(host, opts) : mountLive(host, opts);
    }
  };
})();
