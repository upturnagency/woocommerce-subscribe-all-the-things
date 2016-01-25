/* global wcsatt_admin_params */
jQuery( function($) {

	var $wcsatt_data_tab    = $( '#wcsatt_data' );
	var $wcsatt_schemes     = $wcsatt_data_tab.find( '.subscription_schemes' );
	var wcsatt_block_params = {
			message:    null,
			overlayCSS: {
				background: wcsatt_admin_params.post_id !== '' ? '#fff' : '#f1f1f1',
				opacity:    0.6
			}
		};

	/* ------------------------------------*/
	/* Subscription Schemes
	/* ------------------------------------*/

	$.fn.wcsatt_scripts = function() {

		$( this ).find( '.help_tip, .tips' ).tipTip( {
			'attribute': 'data-tip',
			'fadeIn':    50,
			'fadeOut':   50,
			'delay':     200
		} );
	};

	// Unused (for now).
	if ( wcsatt_admin_params.post_id === '' ) {

		$wcsatt_data_tab.on( 'click', 'h3', function() {

			var p = $( this ).closest( '.wc-metabox' );
			var c = p.find( '.wc-metabox-content' );

			if ( p.hasClass( 'closed' ) ) {
				c.show();
			} else {
				c.hide();
			}

			p.toggleClass( 'closed' );

		} );

		$wcsatt_data_tab.find( '.wc-metabox' ).each( function() {

			var p = $( this );
			var c = p.find( '.wc-metabox-content' );

			if ( p.hasClass( 'closed' ) ) {
				c.hide();
			}
		} );

	}

	// Price override method.
	$wcsatt_schemes.on( 'change', 'select.subscription_pricing_method_input', function() {

		var override_method = $( this ).val();

		$( this ).closest( '.subscription_scheme_product_data' ).find( '.subscription_pricing_method' ).hide();
		$( this ).closest( '.subscription_scheme_product_data' ).find( '.subscription_pricing_method_' + override_method ).show();

	} );

	$wcsatt_schemes.find( 'select.subscription_pricing_method_input' ).change();

	// Hide "default to" option when "force subscription" is checked.
	$wcsatt_data_tab.find( 'input#_wcsatt_force_subscription' ).on( 'change', function() {

		if ( $( this ).is( ':checked' ) ) {
			$wcsatt_data_tab.find( '.wcsatt_default_status' ).hide();
		} else {
			$wcsatt_data_tab.find( '.wcsatt_default_status' ).show();
		}

	} ).change();

	// Remove.
	$wcsatt_data_tab.on( 'click', 'button.remove_row', function() {

		var $parent = $( this ).closest( '.subscription_scheme' );

		$parent.find('*').off();
		$parent.remove();
		subscription_schemes_row_indexes();
	} );

	// Expand.
	$wcsatt_data_tab.on( 'click', '.expand_all', function() {
		$wcsatt_schemes.find( '.wc-metabox > .wc-metabox-content' ).show();
		return false;
	} );

	// Close.
	$wcsatt_data_tab.on( 'click', '.close_all', function() {
		$wcsatt_schemes.find( '.wc-metabox > .wc-metabox-content' ).hide();
		return false;
	} );

	// Add.
	var subscription_schemes_metabox_count = $wcsatt_data_tab.find( '.wc-metabox' ).length;

	$wcsatt_data_tab.on( 'click', 'button.add_subscription_scheme', function () {

		$wcsatt_data_tab.block( wcsatt_block_params );

		subscription_schemes_metabox_count++;

		var data = {
			action:  'wcsatt_add_subscription_scheme',
			post_id:  wcsatt_admin_params.post_id,
			index:    subscription_schemes_metabox_count,
			security: wcsatt_admin_params.add_subscription_scheme_nonce
		};

		$.post( wcsatt_admin_params.wc_ajax_url, data, function ( response ) {

			$wcsatt_schemes.append( response.markup );

			var added = $wcsatt_schemes.find( '.subscription_scheme' ).last();

			added.wcsatt_scripts();

			added.find( 'select.subscription_pricing_method_input' ).change();

			subscription_schemes_row_indexes();

			$wcsatt_data_tab.unblock();
			$wcsatt_data_tab.trigger( 'woocommerce_subscription_scheme_added', response );

		}, 'json' );

		return false;
	} );

	// Init metaboxes.
	init_subscription_schemes_metaboxes();

	function subscription_schemes_row_indexes() {
		$wcsatt_schemes.find( '.subscription_scheme' ).each( function( index, el ) {
			$( '.position', el ).val( parseInt( $(el).index( '.subscription_schemes .subscription_scheme' ) ) );
			var ind = '#' + ( index + 1 ).toString();
			$( '.scheme-title', el ).html( ind );
		} );
	}


	function init_subscription_schemes_metaboxes() {

		// Initial order.
		var subscription_schemes = $wcsatt_schemes.find( '.subscription_scheme' ).get();

		subscription_schemes.sort( function( a, b ) {
		   var compA = parseInt( $(a).attr( 'rel' ) );
		   var compB = parseInt( $(b).attr( 'rel' ) );
		   return ( compA < compB ) ? -1 : ( compA > compB ) ? 1 : 0;
		} );

		$( subscription_schemes ).each( function( idx, itm ) {
			$wcsatt_schemes.append( itm );
		} );

		// Component ordering.
		$wcsatt_schemes.sortable( {
			items:                '.subscription_scheme',
			cursor:               'move',
			axis:                 'y',
			handle:               'h3',
			scrollSensitivity:    40,
			forcePlaceholderSize: true,
			helper:               'clone',
			opacity:              0.65,
			placeholder:          'wc-metabox-sortable-placeholder',
			start:function( event,ui ){
				ui.item.css( 'background-color','#f6f6f6' );
			},
			stop:function( event,ui ){
				ui.item.removeAttr( 'style' );
				subscription_schemes_row_indexes();
			}
		} );
	}

} );