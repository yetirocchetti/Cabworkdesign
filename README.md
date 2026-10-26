# Cabworkdesign

Demo storefront at [cabworkdesign.com](https://cabworkdesign.com): **Hollis & Pine Cabinet Supply**, a made-up RTA cabinet shop that shows how the NuKitchen 3D designer would embed on a retailer's site.

- `index.html`: the storefront (header, hero, four cabinet lines, the "Design Your Kitchen" section, a cart drawer).
- `nukitchen-embed.js`: the file a retailer would paste. `NuKitchen.mount('#el', { retailer, appUrl, catalog, onAddToCart })` mounts the designer in an iframe and passes messages both ways with `postMessage`. The protocol is documented at the top of the file.

**Status:** placeholder. The live app can't be framed yet (it sends `X-Frame-Options: SAMEORIGIN`, and it sits behind a password curtain), so `appUrl` is `null`. In that mode the embed shows a labelled stand-in whose "Simulate" button sends a sample parts list through the same `cart:add` path the real app would use. Once the app has an embed build, set `appUrl`.

## WordPress version (for building the NuKitchen WordPress plugin)

The same store as a WordPress theme: `wordpress/hollis-pine/`. The static site above stays as it is.

**Run it locally** (needs Docker and Node):

```
npx @wordpress/env start      # http://localhost:8888, admin at /wp-admin (admin / password)
npx @wordpress/env stop
```

`.wp-env.json` installs WordPress 7.1.3 and turns the theme on. To load your plugin, add its folder to `"plugins"`, for example `"plugins": [ "../nukitchen-wp-plugin" ]`, or put it in a `.wp-env.override.json` so it stays out of this repo. Then run `npx @wordpress/env start` again.

**Quick look in the browser, no install:** [open in WordPress Playground](https://playground.wordpress.net/?blueprint-url=https://raw.githubusercontent.com/yetirocchetti/Cabworkdesign/wordpress/wordpress/blueprint.json). It runs entirely in your tab, and changes vanish when you close it.

**What a plugin hooks into:**
- **The designer slot.** If a plugin registers the `[nukitchen]` shortcode, the "Design your kitchen" section renders it. Without one, the theme shows its own placeholder, the same one as the static site.
- **The catalog.** `window.HollisPine.catalog`: four lines, each with SKUs such as `AS-B30` and the generic code (`B30`) that NuKitchen matches to its models.
- **The cart.** Call `HollisPine.addToCart({ name, lines: [{ sku, name, qty, unitPrice }] })`, or fire `document.dispatchEvent(new CustomEvent('nukitchen:cart-add', { detail: order }))`. The cart is the theme's own demo cart, not WooCommerce.
