<?php get_header(); ?>

  <main id="top">
    <div class="hero">
      <div class="wrap hero-grid">
        <div>
          <p class="eyebrow">Ready-to-assemble kitchen cabinets</p>
          <h1>Solid-wood cabinets, shipped flat, built to last.</h1>
          <p class="lead">Plywood boxes, dovetail drawers and soft-close everything — at up to 50% below showroom prices. Design your kitchen in 3D, send it to the cart, and it ships in 3–5 business days.</p>
          <div class="hero-cta">
            <a class="btn" href="#design">Design Your Kitchen in 3D</a>
            <a class="btn ghost" href="#lines">Shop Cabinet Lines</a>
          </div>
          <ul class="perks">
            <li>Free shipping over $2,500</li>
            <li>Free door samples</li>
            <li>Lifetime box warranty</li>
          </ul>
        </div>
        <div class="hero-art" aria-hidden="true">
          <!-- Illustrated kitchen elevation -->
          <svg viewBox="0 0 560 380">
            <rect width="560" height="380" fill="#f3efe6"/>
            <rect y="300" width="560" height="80" fill="#d9cdb6"/>
            <rect x="0" y="170" width="560" height="10" fill="#e7e1d4"/>
            <!-- wall cabinets -->
            <g fill="#fbfaf7" stroke="#c9c2b3" stroke-width="2">
              <rect x="30" y="30" width="110" height="120"/><rect x="140" y="30" width="110" height="120"/>
              <rect x="350" y="30" width="90" height="120"/><rect x="440" y="30" width="90" height="120"/>
            </g>
            <g fill="none" stroke="#ddd6c7" stroke-width="2">
              <rect x="40" y="40" width="90" height="100"/><rect x="150" y="40" width="90" height="100"/>
              <rect x="360" y="40" width="70" height="100"/><rect x="450" y="40" width="70" height="100"/>
            </g>
            <!-- window -->
            <rect x="268" y="40" width="64" height="100" fill="#cfe2e6" stroke="#c9c2b3" stroke-width="4"/>
            <!-- counter -->
            <rect x="20" y="196" width="520" height="12" fill="#6e7a76"/>
            <!-- base cabinets -->
            <g fill="#2f5d4e" stroke="#244a3e" stroke-width="2">
              <rect x="30" y="208" width="100" height="92"/><rect x="130" y="208" width="100" height="92"/>
              <rect x="230" y="208" width="120" height="92"/><rect x="350" y="208" width="90" height="92"/>
              <rect x="440" y="208" width="90" height="92"/>
            </g>
            <g fill="none" stroke="#3f7464" stroke-width="2">
              <rect x="40" y="218" width="80" height="72"/><rect x="140" y="218" width="80" height="72"/>
              <rect x="240" y="218" width="100" height="72"/><rect x="360" y="218" width="70" height="20"/>
              <rect x="360" y="244" width="70" height="20"/><rect x="360" y="270" width="70" height="20"/>
              <rect x="450" y="218" width="70" height="72"/>
            </g>
            <g fill="#e0b45f">
              <rect x="114" y="230" width="3" height="18"/><rect x="143" y="230" width="3" height="18"/>
              <rect x="388" y="226" width="14" height="3"/><rect x="388" y="252" width="14" height="3"/><rect x="388" y="278" width="14" height="3"/>
              <rect x="508" y="230" width="3" height="18"/>
            </g>
            <path d="M292 196 v-20 q0-10 10-10 h10" stroke="#8b958f" stroke-width="4" fill="none"/>
          </svg>
        </div>
      </div>
    </div>

    <section id="lines">
      <div class="wrap">
        <div class="section-head">
          <p class="eyebrow">Our cabinet lines</p>
          <h2>Four lines. Every one in stock.</h2>
          <p>All lines use ¾" furniture-grade plywood boxes, full-extension soft-close drawers and hidden soft-close hinges. Prices shown for a standard 10×10 kitchen and a 30" base cabinet.</p>
        </div>
        <div class="lines" id="lineGrid"></div>
      </div>
    </section>

    <section id="design" class="design">
      <div class="wrap">
        <div class="section-head">
          <p class="eyebrow">Free 3D kitchen designer</p>
          <h2>Design your kitchen — then buy the exact parts list.</h2>
          <p>Draw your room, place cabinets from any Hollis &amp; Pine line, and see it in 3D. When it looks right, one click sends every cabinet, filler and toe kick to your cart.</p>
        </div>
        <div class="design-grid">
          <!-- ▼ THE EMBED. A NuKitchen plugin that registers [nukitchen] takes this slot;
               without one, the theme's placeholder designer mounts here. -->
          <?php if ( shortcode_exists( 'nukitchen' ) ) : ?>
            <div class="nk-host"><?php echo do_shortcode( '[nukitchen]' ); ?></div>
          <?php else : ?>
            <div id="nk-designer"></div>
          <?php endif; ?>
          <!-- ▲ -->
          <div>
            <ol class="steps">
              <li><div><strong>Draw your room</strong>Walls, windows and doors in inches.</div></li>
              <li><div><strong>Pick a line</strong>Every door style and finish we sell is in the designer.</div></li>
              <li><div><strong>Place cabinets</strong>Snap to walls, with clearance checks as you go.</div></li>
              <li><div><strong>Add to cart</strong>Your exact parts list, priced at today’s prices.</div></li>
            </ol>
            <p class="aside-note">Prefer a human? Our designers will turn your measurements into a free 3D plan within 48 hours.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="why">
      <div class="wrap">
        <div class="section-head">
          <p class="eyebrow">Why RTA</p>
          <h2>Showroom quality, without the showroom markup.</h2>
        </div>
        <div class="why">
          <div><h3>Assembles in 15 minutes</h3><p>Cam-lock boxes, pre-drilled hardware and a video guide for every cabinet.</p></div>
          <div><h3>Ships in 3–5 days</h3><p>Packed flat, insured, and delivered to your curb — no 10-week wait.</p></div>
          <div><h3>Real wood</h3><p>Solid hardwood doors and face frames. No particleboard, ever.</p></div>
          <div><h3>Contractor pricing</h3><p>Trade accounts get an extra 10% off and a dedicated rep.</p></div>
        </div>
      </div>
    </section>
  </main>

<?php get_footer(); ?>
