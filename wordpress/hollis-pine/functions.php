<?php
/**
 * Hollis & Pine — demo RTA storefront for testing the NuKitchen designer on WordPress.
 *
 * The page is front-page.php. The designer slot there takes a plugin's [nukitchen]
 * shortcode when one is registered; otherwise the bundled placeholder embed
 * (assets/nukitchen-embed.js, same file as the static site) mounts in it.
 * The cart is the theme's own (window.HollisPine in assets/store.js).
 */

add_action( 'after_setup_theme', function () {
	add_theme_support( 'title-tag' );
} );

add_action( 'wp_enqueue_scripts', function () {
	$ver = wp_get_theme()->get( 'Version' );
	$uri = get_template_directory_uri();
	wp_enqueue_style( 'hollis-pine', get_stylesheet_uri(), array(), $ver );
	$deps = array();
	if ( is_front_page() && ! shortcode_exists( 'nukitchen' ) ) {
		wp_enqueue_script( 'nukitchen-embed-placeholder', $uri . '/assets/nukitchen-embed.js', array(), $ver, true );
		$deps[] = 'nukitchen-embed-placeholder';
	}
	wp_enqueue_script( 'hollis-pine-store', $uri . '/assets/store.js', $deps, $ver, true );
} );

add_filter( 'document_title_parts', function ( $parts ) {
	if ( is_front_page() ) {
		$parts['tagline'] = 'RTA Kitchen Cabinets';
	}
	return $parts;
} );
