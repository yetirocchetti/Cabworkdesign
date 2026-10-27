// The plugin's glue: mount the designer in every [nukitchen] box and hand its
// "Add to cart" to the store as a 'nukitchen:cart-add' event on document.
// Runs at DOMContentLoaded, after the store's own footer scripts, so a catalog
// the store sets on window.nukitchenCatalog is there by then.
(function () {
  'use strict';

  function mountAll() {
    var s = window.nukitchenSettings || {};
    var catalog = s.catalog || window.nukitchenCatalog;
    document.querySelectorAll('.nukitchen-designer').forEach(function (box) {
      if (!catalog) {
        box.textContent = 'The kitchen designer needs this store’s catalog.';
        return;
      }
      window.NuKitchen.mount(box, {
        retailer: s.retailer,
        appUrl: s.appUrl,
        height: s.height,
        catalog: catalog,
        onAddToCart: function (order) {
          document.dispatchEvent(new CustomEvent('nukitchen:cart-add', { detail: order }));
        }
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountAll);
  else mountAll();
})();
