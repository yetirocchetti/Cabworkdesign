# Cabworkdesign

Demo storefront at [cabworkdesign.com](https://cabworkdesign.com): **Hollis & Pine Cabinet Supply**, a made-up RTA cabinet shop that shows how the NuKitchen 3D designer would embed on a retailer's site.

- `index.html`: the storefront (header, hero, four cabinet lines, the "Design Your Kitchen" section, a cart drawer).
- `nukitchen-embed.js`: the file a retailer would paste. `NuKitchen.mount('#el', { retailer, appUrl, catalog, onAddToCart })` mounts the designer in an iframe and passes messages both ways with `postMessage`. The protocol is documented at the top of the file.

**Status:** placeholder. The live app can't be framed yet (it sends `X-Frame-Options: SAMEORIGIN`, and it sits behind a password curtain), so `appUrl` is `null`. In that mode the embed shows a labelled stand-in whose "Simulate" button sends a sample parts list through the same `cart:add` path the real app would use. Once the app has an embed build, set `appUrl`.

## WordPress version (for building the NuKitchen WordPress plugin)

The same store as a WordPress theme: `wordpress/hollis-pine/`, and the NuKitchen plugin: `wordpress/nukitchen/`. The static site above stays as it is.

**Run it locally, no Docker** (Node only; the designer from `npm run dev:web` in nukitchen-3d on :5173):

```
npx @wp-playground/cli@3.1.57 server --port=9400 --login \
  --mount=./wordpress/hollis-pine:/wordpress/wp-content/themes/hollis-pine \
  --mount=./wordpress/nukitchen:/wordpress/wp-content/plugins/nukitchen \
  --blueprint=./wordpress/local-blueprint.json
```

http://127.0.0.1:9400. The blueprint turns on the theme and the plugin and points the plugin at the local designer. Changes to the theme and plugin files show on reload; the site itself is gone when the server stops.

**Or with Docker:** `npx @wordpress/env start` (http://localhost:8888, admin / password). `.wp-env.json` loads the theme and the plugin; the plugin points at the production designer.

### The plugin (`wordpress/nukitchen/`)

- `[nukitchen]` on any page mounts the designer there (`assets/nukitchen-embed.js`, the same host script as the static site, and `assets/nukitchen-wp.js`).
- **On the page** (default): a picture of a kitchen with a "Design your kitchen in 3D" button. The designer loads only on the click and opens full screen over the page; × closes it and keeps the design, and Add to cart closes it and opens the store's cart. Or set it to show the designer itself in the page. The picture is `assets/kitchen.webp`, and the `nukitchen_launcher_image` filter swaps it.
- **Settings → NuKitchen:** store ID, on the page, button text, designer address (default the production `embed.html`), height in the page.
- **Catalog:** the page sets `window.nukitchenCatalog`, or PHP returns it from the `nukitchen_catalog` filter.
- **Cart:** "Add to cart" in the designer fires `nukitchen:cart-add` on `document`; the store's cart listens. A WooCommerce adapter is next.
- The designer only runs inside a site on its allowlist (nukitchen-3d `src/embed/retailer.js` `EMBED_PARENTS` and `vercel.json`). Localhost is allowed in development.

**Quick look in the browser, no install:** [open in WordPress Playground](https://playground.wordpress.net/?blueprint-url=https://raw.githubusercontent.com/yetirocchetti/Cabworkdesign/wordpress/wordpress/blueprint.json). It runs entirely in your tab, and changes vanish when you close it.

**What a plugin hooks into:**
- **The designer slot.** If a plugin registers the `[nukitchen]` shortcode, the "Design your kitchen" section renders it. Without one, the theme shows its own placeholder, the same one as the static site.
- **The catalog.** `window.HollisPine.catalog` (also `window.nukitchenCatalog`): four lines, each with SKUs such as `AS-B30` and the generic code (`B30`) that NuKitchen matches to its models.
- **The cart.** Call `HollisPine.addToCart({ name, lines: [{ sku, name, qty, unitPrice }] })`, or fire `document.dispatchEvent(new CustomEvent('nukitchen:cart-add', { detail: order }))`. The cart is the theme's own demo cart, not WooCommerce.
