# Cabworkdesign

Demo storefront at [cabworkdesign.com](https://cabworkdesign.com): **Hollis & Pine Cabinet Supply**, a made-up RTA cabinet shop that shows how the NuKitchen 3D designer would embed on a retailer's site.

- `index.html`: the storefront (header, hero, four cabinet lines, the "Design Your Kitchen" section, a cart drawer).
- `nukitchen-embed.js`: the file a retailer would paste. `NuKitchen.mount('#el', { retailer, appUrl, catalog, onAddToCart })` mounts the designer in an iframe and passes messages both ways with `postMessage`. The protocol is documented at the top of the file.

**Status:** placeholder. The live app can't be framed yet (it sends `X-Frame-Options: SAMEORIGIN`, and it sits behind a password curtain), so `appUrl` is `null`. In that mode the embed shows a labelled stand-in whose "Simulate" button sends a sample parts list through the same `cart:add` path the real app would use. Once the app has an embed build, set `appUrl`.
