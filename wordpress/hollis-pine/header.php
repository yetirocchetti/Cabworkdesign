<?php
/**
 * Demo ribbon + sticky header with the cart button.
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Demo storefront: a fictional RTA cabinet shop showing how the NuKitchen 3D designer embeds on a retailer's site.">
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
  <div class="demo-bar">Demo storefront — Hollis &amp; Pine is a fictional shop built to show how the NuKitchen designer embeds on a retailer’s site. Nothing here is for sale.</div>

  <header>
    <div class="wrap head">
      <a class="logo" href="<?php echo esc_url( home_url( '/' ) ); ?>">
        <svg class="logo-mark" viewBox="0 0 32 32" aria-hidden="true"><rect x="2" y="4" width="28" height="24" rx="3" fill="#2f5d4e"/><rect x="6" y="8" width="9" height="16" rx="1" fill="none" stroke="#e0b45f" stroke-width="2"/><rect x="17" y="8" width="9" height="16" rx="1" fill="none" stroke="#e0b45f" stroke-width="2"/></svg>
        Hollis &amp; Pine
      </a>
      <nav aria-label="Main">
        <a href="<?php echo esc_url( home_url( '/#lines' ) ); ?>">Cabinet Lines</a>
        <a href="<?php echo esc_url( home_url( '/#design' ) ); ?>" class="hot">Design Your Kitchen</a>
        <a href="<?php echo esc_url( home_url( '/#why' ) ); ?>">Why RTA</a>
        <a href="<?php echo esc_url( home_url( '/#contact' ) ); ?>">Contact</a>
      </nav>
      <button class="cart-btn" type="button" id="cartBtn" aria-label="Open cart">Cart <span class="cart-count" id="cartCount">0</span></button>
    </div>
  </header>

