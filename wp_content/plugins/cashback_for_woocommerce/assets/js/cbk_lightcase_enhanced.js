jQuery(function ($) {
	'use strict';
	try {
		$(document.body).on('cbk-enhanced-lightcase', function () {
			var lightcases = $('.cbk-popup-cashback-lightcase');

			if ( ! lightcases.length ) {
				return;
			}

			lightcases.each( function ( ) {
				$( this ).lightcase( {
					href : $( this ).data( 'popup' ) ,
					onFinish : {
						foo : function ( ) {
							lightcase.resize( ) ;
						}
					} ,
				} ) ;
			} ) ;
		});
		$(document.body).trigger('cbk-enhanced-lightcase');
	} catch (err) {
		window.console.log(err);
	}

});
