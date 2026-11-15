// Hollis & Pine — the demo store: catalog, cabinet lines, cart, and the NuKitchen embed.
// (Was inline in index.html; a file so the page can forbid inline scripts.)
// ---------- The shop's catalog (what a retailer's backend would provide) ----------
// Retailer SKU = line prefix + the industry-standard cabinet code. `code` is
// the generic code NuKitchen's catalog speaks (B30, W3030, SB36 …), which is
// how the designer maps a shop's products onto its 3D models.
var BASE_PRICES = {
  B12: 233, B15: 255, B18: 276, B24: 320, B30: 363, B36: 406, SB36: 356, DB18: 371,
  W1230: 121, W1530: 139, W1830: 156, W2430: 191, W3030: 226, W3630: 261,
  T1884: 457, BF3: 35, WF330: 35, TF396: 95, TK8: 35
};
var NAMES = {
  B12: '12" Base', B15: '15" Base', B18: '18" Base', B24: '24" Base', B30: '30" Base', B36: '36" Base',
  SB36: '36" Sink Base', DB18: '18" 3-Drawer Base', W1230: '12"×30" Wall', W1530: '15"×30" Wall',
  W1830: '18"×30" Wall', W2430: '24"×30" Wall', W3030: '30"×30" Wall', W3630: '36"×30" Wall',
  T1884: '18"×84" Pantry', BF3: '3" Base Filler', WF330: '3"×30" Wall Filler', TF396: '3"×96" Tall Filler', TK8: '8 ft Toe Kick'
};
var LINES = [
  { id: 'AS', name: 'Aspen White Shaker', door: 'shaker', finish: 'Painted white', factor: 1.00,
    construction: 'Face frame', blurb: 'Our best seller. A clean five-piece shaker door in a durable catalyzed white.' },
  { id: 'HN', name: 'Harbor Blue Shaker', door: 'shaker', finish: 'Painted slate blue', factor: 1.08,
    construction: 'Face frame', blurb: 'A soft slate blue for islands and statement walls. Pairs with black pulls.' },
  { id: 'SC', name: 'Sedona Natural Oak', door: 'shaker', finish: 'Oak, clear coat', factor: 1.05,
    construction: 'Face frame', blurb: 'Solid oak shaker doors under a clear matte coat, so the grain does the talking.' },
  { id: 'LG', name: 'Linea Graphite', door: 'shaker', finish: 'Matte graphite', factor: 0.93,
    construction: 'Frameless (European)', blurb: 'Near-black shaker on full-overlay frameless boxes. Made for brass hardware.' }
];
// …and every other part NuKitchen's designer can put in a cart (nukitchen-parts.js, loaded
// first), so a design's cart is the whole design.
if (typeof NK_PARTS === 'object') Object.keys(NK_PARTS).forEach(function (code) {
  if (!(code in BASE_PRICES)) { BASE_PRICES[code] = NK_PARTS[code][0]; NAMES[code] = NK_PARTS[code][1]; }
});
function price(line, code) { return Math.round(BASE_PRICES[code] * line.factor * 100) / 100; }
function tenByTen(line) {
  var kit = ['SB36','B30','B24','DB18','B15','W3030','W3630','W2430','W2430','W1530','BF3','WF330','TK8','TK8'];
  return kit.reduce(function (s, c) { return s + price(line, c); }, 0);
}
var CATALOG = {
  currency: 'USD',
  lines: LINES.map(function (l) {
    return {
      id: l.id, name: l.name, doorStyle: l.door, finish: l.finish, construction: l.construction,
      skus: Object.keys(BASE_PRICES).map(function (code) {
        return { sku: l.id + '-' + code, code: code, name: NAMES[code], price: price(l, code) };
      })
    };
  })
};

// ---------- Render cabinet lines ----------
function money(n) { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function moneyShort(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
var DOOR_LABEL = { shaker: 'Shaker', raised: 'Raised panel', slab: 'Flat slab' };

document.getElementById('lineGrid').innerHTML = LINES.map(function (l) {
  return '<article class="line-card">' +
    '<img class="swatch" src="photos/line-' + l.id.toLowerCase() + '.webp" alt="' + l.name + ' cabinets" loading="lazy">' +
    '<div class="line-body"><h3>' + l.name + '</h3>' +
    '<div class="tag-row"><span class="tag">' + DOOR_LABEL[l.door] + '</span><span class="tag">' + l.finish + '</span><span class="tag">' + l.construction + '</span></div>' +
    '<p>' + l.blurb + '</p>' +
    '<div class="price"><div><small>10×10 kitchen from</small><br><strong>' + moneyShort(tenByTen(l)) + '</strong></div>' +
    '<div class="r"><small>30" base</small><br><strong>' + money(price(l, 'B30')) + '</strong></div></div>' +
    '</div></article>';
}).join('');

// ---------- Cart ----------
var cart = [];   // { sku, name, qty, unitPrice, fromDesign }
function addLines(lines, fromDesign) {
  lines.forEach(function (ln) {
    var hit = cart.find(function (c) { return c.sku === ln.sku; });
    if (hit) hit.qty += ln.qty; else cart.push({ sku: ln.sku, name: ln.name, qty: ln.qty, unitPrice: ln.unitPrice, fromDesign: fromDesign });
  });
  renderCart(fromDesign);
}
function renderCart(designName) {
  // a part sold by area (countertop, backsplash: qty in sq ft) is one item in the count
  var count = cart.reduce(function (s, c) { return s + (Number.isInteger(c.qty) ? c.qty : 1); }, 0);
  var total = cart.reduce(function (s, c) { return s + c.qty * c.unitPrice; }, 0);
  document.getElementById('cartCount').textContent = count;
  document.getElementById('cartTotal').textContent = money(total);
  var body = document.getElementById('cartBody');
  if (!cart.length) { body.innerHTML = '<p class="empty">Your cart is empty. Try designing a kitchen.</p>'; return; }
  body.innerHTML = (designName ? '<div class="cart-src">Added from your 3D design: ' + designName + '</div>' : '') +
    cart.map(function (c) {
      return '<div class="cart-row"><span>' + c.name + '</span><span class="amt">' + money(c.qty * c.unitPrice) + '</span>' +
        '<small>' + c.sku + ' · ' + (Number.isInteger(c.qty) ? 'qty ' + c.qty : (Math.round(c.qty * 100) / 100) + ' sq ft') + ' × ' + money(c.unitPrice) + '</small></div>';
    }).join('');
}
function openCart(open) { document.body.classList.toggle('cart-open', open); }
document.getElementById('cartBtn').onclick = function () { openCart(true); };
document.getElementById('cartClose').onclick = function () { openCart(false); };
document.getElementById('drawerBg').onclick = function () { openCart(false); };
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') openCart(false); });
renderCart();

// ---------- The embed ----------
// The designer from NuKitchen's production deploy: a picture and a button
// here; the designer opens full screen on click and its Add to cart lands
// in the cart above.
NuKitchen.mount('#nk-designer', {
  retailer: 'hollis-and-pine',
  appUrl: 'https://nukitchen-3d.vercel.app/embed.html',
  launcher: { image: 'kitchen.webp', label: 'Design your kitchen in 3D', title: 'Hollis & Pine' },
  catalog: CATALOG,
  onAddToCart: function (order) {
    addLines(order.lines, order.name || 'My Kitchen');
    openCart(true);
  }
});
