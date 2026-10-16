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
 *     });
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
      style: 'width:100%;height:' + (opts.height || 720) + 'px;border:0;display:block;border-radius:inherit;'
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
      } else if (m.type === 'resize' && m.payload && m.payload.height > 0) {
        frame.style.height = Math.min(Math.max(m.payload.height, 480), 1400) + 'px';
      } else {
        dispatch(opts, m.type, m.payload);
      }
    });

    return { send: send, frame: frame };
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
      return opts.appUrl ? mountLive(host, opts) : mountPlaceholder(host, opts);
    }
  };
})();
