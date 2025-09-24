/* global cbk_enhanced_params */

jQuery( function ( $ ) {
	'use strict' ;

	var wc_blocks_checkout = window.wc.blocksCheckout;
	try {
		$( document.body ).on( 'cbk-block-enhanced-init' , function () {
			wc_blocks_checkout.extensionCartUpdate( {
				namespace: 'cbk-credit-debit-cashback',
				data: {
					action : 'credit-debit-cashback',
				},
			} );
		} ) ;

		$( document.body ).trigger( 'cbk-block-enhanced-init' ) ;
	} catch ( err ) {
		window.console.log( err ) ;
	}

} ) ;
