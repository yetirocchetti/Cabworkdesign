<?php
/**
 * Plugin Name:       NuKitchen 3D Designer
 * Description:       Puts the NuKitchen 3D kitchen designer on any page with [nukitchen]. Shoppers design with your cabinet lines and send the parts list to your cart.
 * Version:           0.1.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            NuKitchen
 * License:           MIT
 * Text Domain:       nukitchen
 *
 * The designer runs on NuKitchen's server, framed in the page (assets/nukitchen-embed.js,
 * the same host script any site can paste). This plugin is the WordPress wrapper:
 * settings, the shortcode, and the hand-off to the store.
 *
 * What the store provides, in the page:
 *   - its catalog:  window.nukitchenCatalog = { currency, lines: [{ id, name, doorStyle, finish, skus: [{ sku, code, name, price }] }] }
 *                   (or the `nukitchen_catalog` filter, from PHP)
 *   - its cart:     listens for document 'nukitchen:cart-add' with detail = { designId, name, lines: [{ sku, name, qty, unitPrice }], unsold }
 */

defined( 'ABSPATH' ) || exit;

const NUKITCHEN_VERSION     = '0.1.0';
const NUKITCHEN_DEFAULT_APP = 'https://nukitchen-3d.vercel.app/embed.html';

function nukitchen_settings() {
	$s = get_option( 'nukitchen', array() );
	return array(
		'app_url'  => ! empty( $s['app_url'] ) ? $s['app_url'] : NUKITCHEN_DEFAULT_APP,
		'retailer' => ! empty( $s['retailer'] ) ? $s['retailer'] : sanitize_key( get_bloginfo( 'name' ) ),
		'display'  => ( $s['display'] ?? '' ) === 'inline' ? 'inline' : 'launcher',
		'label'    => ! empty( $s['label'] ) ? $s['label'] : __( 'Design your kitchen in 3D', 'nukitchen' ),
		'height'   => ! empty( $s['height'] ) ? (int) $s['height'] : 720,
	);
}

// ── The shortcode ────────────────────────────────────────────────────────────

add_action( 'wp_enqueue_scripts', function () {
	$base = plugin_dir_url( __FILE__ ) . 'assets/';
	wp_register_script( 'nukitchen-embed', $base . 'nukitchen-embed.js', array(), NUKITCHEN_VERSION, true );
	wp_register_script( 'nukitchen', $base . 'nukitchen-wp.js', array( 'nukitchen-embed' ), NUKITCHEN_VERSION, true );
} );

add_shortcode( 'nukitchen', function () {
	$s = nukitchen_settings();
	wp_enqueue_script( 'nukitchen' );
	wp_add_inline_script( 'nukitchen', 'window.nukitchenSettings = ' . wp_json_encode( array(
		'appUrl'   => $s['app_url'],
		'retailer' => $s['retailer'],
		'height'   => $s['height'],
		'launcher' => 'launcher' === $s['display'] ? array(
			'image' => apply_filters( 'nukitchen_launcher_image', plugin_dir_url( __FILE__ ) . 'assets/kitchen.webp' ),
			'label' => $s['label'],
			'title' => get_bloginfo( 'name' ),
		) : null,
		'catalog'  => apply_filters( 'nukitchen_catalog', null ),
	) ) . ';', 'before' );
	return '<div class="nukitchen-designer"></div>';
} );

// ── Settings → NuKitchen ─────────────────────────────────────────────────────

add_action( 'admin_init', function () {
	register_setting( 'nukitchen', 'nukitchen', array(
		'type'              => 'array',
		'sanitize_callback' => function ( $in ) {
			return array(
				'app_url'  => esc_url_raw( $in['app_url'] ?? '', array( 'https', 'http' ) ),
				'retailer' => sanitize_key( $in['retailer'] ?? '' ),
				'display'  => ( $in['display'] ?? '' ) === 'inline' ? 'inline' : 'launcher',
				'label'    => sanitize_text_field( $in['label'] ?? '' ),
				'height'   => max( 480, min( 1400, (int) ( $in['height'] ?? 720 ) ) ),
			);
		},
	) );
	add_settings_section( 'nukitchen_main', '', '__return_null', 'nukitchen' );
	$fields = array(
		'retailer' => array( __( 'Store ID', 'nukitchen' ), 'text' ),
		'display'  => array( __( 'On the page', 'nukitchen' ), array(
			'launcher' => __( 'A picture and a button; the designer opens full screen', 'nukitchen' ),
			'inline'   => __( 'The designer itself, in the page', 'nukitchen' ),
		) ),
		'label'    => array( __( 'Button', 'nukitchen' ), 'text' ),
		'app_url'  => array( __( 'Designer address', 'nukitchen' ), 'url' ),
		'height'   => array( __( 'Height in the page (px)', 'nukitchen' ), 'number' ),
	);
	foreach ( $fields as $key => list( $label, $type ) ) {
		add_settings_field( $key, $label, function () use ( $key, $type ) {
			$s = nukitchen_settings();
			if ( is_array( $type ) ) {
				printf( '<select id="%s" name="nukitchen[%s]">', esc_attr( $key ), esc_attr( $key ) );
				foreach ( $type as $value => $text ) {
					printf( '<option value="%s"%s>%s</option>', esc_attr( $value ), selected( $s[ $key ], $value, false ), esc_html( $text ) );
				}
				echo '</select>';
				return;
			}
			printf( '<input type="%s" id="%s" name="nukitchen[%s]" value="%s" class="regular-text">',
				esc_attr( $type ), esc_attr( $key ), esc_attr( $key ), esc_attr( $s[ $key ] ) );
		}, 'nukitchen', 'nukitchen_main', array( 'label_for' => $key ) );
	}
} );

add_action( 'admin_menu', function () {
	add_options_page( 'NuKitchen', 'NuKitchen', 'manage_options', 'nukitchen', function () {
		?>
		<div class="wrap">
			<h1>NuKitchen</h1>
			<p><?php esc_html_e( 'Put [nukitchen] on any page to show the designer there.', 'nukitchen' ); ?></p>
			<form action="options.php" method="post">
				<?php settings_fields( 'nukitchen' ); do_settings_sections( 'nukitchen' ); submit_button(); ?>
			</form>
		</div>
		<?php
	} );
} );

register_uninstall_hook( __FILE__, 'nukitchen_uninstall' );
function nukitchen_uninstall() {
	delete_option( 'nukitchen' );
}
