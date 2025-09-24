/* global cbk_frontend_params */

jQuery(function ($) {
	'use strict';

	var CBK_Frontend = {

		init: function () {
			this.trigger_on_page_load();

			$('#order_review').on('click', 'input[name="payment_method"]', this.gateway_notice);
			$(document).on('click', '.cbk_pagination', this.cashback_pagination);
			//Update the cart when updating shipping.
			$(document.body).on('updated_shipping_method', this.updated_shipping_method);
			$(document.body).on('updated_checkout', this.update_cashback_notice);
			$(document.body).on('click', '.cbk-remove-debit-cashback', this.remove_cashback);
			$(document).on('change', 'input.variation_id', this.get_variation_notice);
			$(document).on('updated_cart_totals updated_wc_div', function (e) {
				$(document.body).trigger('cbk-enhanced-lightcase');
			});
			$( document ).on('change', '.cbk-date-filter-type', this.date_filter_type);
			$(document).on('click', '.cbk-eligible-product-list', this.get_eligible_product_list);
			$(document).on('click', '.cbk-product-cashback-list', this.get_product_cashback_list);
			$(document).on('click', '.cbk-restricted-product-list', this.get_restricted_product_list);
			$(document).on('click', '.cbk-restricted-gateway-list', this.get_restricted_gateway_list);
			$(document).on('click', '.cbk-restricted-shipping-list', this.get_restricted_shipping_list);
			$( document ).on( 'click' , '.cbk_copy_referral_url' , this.copy_to_clipboard ) ;
		}, get_variation_notice: function () {
			if ('' != $(this).val()) {
				var data = ({
					action: 'cbk_product_notice',
					variation_id: $(this).val(),
					cbk_security: cbk_frontend_params.product_nonce
				});
				$.post(cbk_frontend_params.ajaxurl, data, function (response) {
					if (true === response.success) {
						$('.cbk-variation-cashback-notice').show();
						$('.cbk-variation-cashback-notice').html(response.data.html);
					} else {
						$('.cbk-variation-cashback-notice').hide();
						window.alert(response.data.error);
					}
				});
			}
		}, update_cashback_notice: function (e, data) {
			if (data && data.fragments) {
				if (data.fragments.cbk_product_cashback_notices_html) {
					$('#cbk-checkout-notice-for-product-cashback').replaceWith(data.fragments.cbk_product_cashback_notices_html);
				}

				if (data.fragments.cbk_order_cashback_notices_html) {
					$('#cbk-checkout-notice-for-order-cashback').replaceWith(data.fragments.cbk_order_cashback_notices_html);
				}

				if (data.fragments.cbk_order_cashback_notices_html) {
					$('.cbk_gateway_notice').replaceWith(data.fragments.cbk_order_cashback_notices_html);
				}
			}
		}, updated_shipping_method: function () {
			$(document.body).trigger('wc_update_cart');
		}, trigger_on_page_load: function () {
			CBK_Frontend.gateway_notice();
			$('.cbk-variation-cashback-notice').hide();
			CBK_Frontend.toggle_date_filter_type('.cbk-date-filter-type');
		}, gateway_notice: function () {
			if (cbk_frontend_params.is_checkout && 'yes' === cbk_frontend_params.enable_gateway_cashback ) {
				CBK_Frontend.block('#order_review');
				$('.cbk_gateway_notice').remove();
				var gatewayid = $('.payment_methods input[name="payment_method"]:checked').val();
				var data = ({
					action: 'cbk_gateway_notice',
					gatewayid: gatewayid,
					is_user_logged_in: cbk_frontend_params.is_user_logged_in,
					cbk_security: cbk_frontend_params.gateway_nonce
				});
				$.post(cbk_frontend_params.ajaxurl, data, function (response) {
					if (true === response.success) {
						if ('' != response.data.html) {
							$( '.woocommerce-checkout-payment' ).find( '.payment_method_' + gatewayid ).first().append('<div class="woocommerce-info cbk_gateway_notice">'+response.data.html+'</div>');
						}
					} else {
						$('.cbk_gateway_notice').remove();
					}
					CBK_Frontend.unblock('#order_review');
				});
			}
		}, cashback_pagination: function (event) {
			event.preventDefault();
			var $this = $(event.currentTarget),
				table = $this.closest('table.cbk_cashback_table'),
				table_body = table.find('tbody'),
				current_page = $this.data('page');

			CBK_Frontend.block(table_body);

			var data = ({
				action: 'cbk_cashback_pagination',
				page_number: current_page,
				user_id: $(this).attr('data-userid'),
				page_url: cbk_frontend_params.current_page_url,
				cbk_date_filter: $('.cbk-date-filter-type').val(),
				cbk_security: cbk_frontend_params.cashback_pagination_nonce,
			});
			$.post(cbk_frontend_params.ajaxurl, data, function (res) {

				if (true === res.success) {
					table.html(res.data.html);

					table.find('.cbk_pagination').removeClass('current');
					table.find('.cbk_pagination_' + current_page).addClass('current');

					var next_page = current_page;
					if (current_page > 1) {
						next_page = current_page - 1;
					}

					var last_page = table.find('.cbk_last_pagination').data('page');
					if (current_page < last_page) {
						last_page = current_page + 1;
					}

					table.find('.cbk_next_pagination').data('page', last_page);
					table.find('.cbk_prev_pagination').data('page', next_page);
				} else {
					alert(res.data.error);
				}

				CBK_Frontend.unblock(table_body);
			}
			);
		}, remove_cashback: function (event) {
			event.preventDefault();
			var $this = $(event.currentTarget);
			var data = ({
				action: 'cbk_remove_cashback',
				available_balance: $this.data('available_balance'),
				cbk_security: cbk_frontend_params.remove_cashback_nonce
			});
			$.post(cbk_frontend_params.ajaxurl, data, function (res) {
				if (true === res.success) {
					$('body').trigger('update_checkout');
					$('.cbk-debit-field').show();
				} else {
					window.alert(res.data.error);
				}
			});
			return false;
		} , get_eligible_product_list : function ( e ) {
			e.preventDefault() ;
			let $this = $(e.currentTarget),
				wrapper = $('.cbk-product-cashback-notice');
				CBK_Frontend.block(wrapper);

			let data = ({
				action: 'cbk_display_eligible_product_list',
				product_lists: $(this).data('product_lists'),
				cbk_security: cbk_frontend_params.eligible_products_nonce,
			});

			$.post(cbk_frontend_params.ajaxurl, data, function (res) {
				if (true === res.success) {
					$('#cbk-eligible-products-list-modal').html(res.data.html);
					$(document.body).trigger('cbk-enhanced-lightcase');
					$('.cbk-popup-cashback-lightcase').trigger('click');
				} else {
					alert(res.data.error);
				}
				CBK_Frontend.unblock(wrapper);
			}
			);
		},get_product_cashback_list : function ( e ) {
			e.preventDefault() ;
			CBK_Frontend.block('.cbk_cashback_table');

			let data = ({
				action: 'cbk_display_product_cashback_list',
				product_lists: $(this).data('product_lists'),
				cbk_security: cbk_frontend_params.eligible_products_nonce,
			});

			$.post(cbk_frontend_params.ajaxurl, data, function (res) {
				if (true === res.success) {
					$('#cbk-eligible-products-list-modal').html(res.data.html);
					$(document.body).trigger('cbk-enhanced-lightcase');
					$('.cbk-popup-cashback-lightcase').trigger('click');
				} else {
					alert(res.data.error);
				}
				CBK_Frontend.unblock('.cbk_cashback_table');
			}
			);
		},get_restricted_product_list : function ( e ) {
			e.preventDefault() ;
			let $this = $(e.currentTarget),
				wrapper = $('.cbk-quantity-restricted-notice');
				CBK_Frontend.block(wrapper);

			let data = ({
				action: 'cbk_display_restricted_product_list',
				product_lists: $(this).data('product_lists'),
				cbk_security: cbk_frontend_params.eligible_products_nonce,
			});

			$.post(cbk_frontend_params.ajaxurl, data, function (res) {
				if (true === res.success) {
					$('#cbk-eligible-products-list-modal').html(res.data.html);
					$(document.body).trigger('cbk-enhanced-lightcase');
					$('.cbk-popup-cashback-lightcase').trigger('click');
				} else {
					alert(res.data.error);
				}
				CBK_Frontend.unblock(wrapper);
			}
			);
		},get_restricted_gateway_list : function ( e ) {
			e.preventDefault() ;
			let $this = $(e.currentTarget),
				wrapper = $('.cbk-gateway-restricted-notice');
				CBK_Frontend.block(wrapper);

			let data = ({
				action: 'cbk_display_restricted_gateway_list',
				gateway_lists: $(this).data('gateway_lists'),
				cbk_security: cbk_frontend_params.eligible_products_nonce,
			});

			$.post(cbk_frontend_params.ajaxurl, data, function (res) {
				if (true === res.success) {
					$('#cbk-eligible-products-list-modal').html(res.data.html);
					$(document.body).trigger('cbk-enhanced-lightcase');
					$('.cbk-popup-cashback-lightcase').trigger('click');
				} else {
					alert(res.data.error);
				}
				CBK_Frontend.unblock(wrapper);
			}
			);
		},get_restricted_shipping_list : function ( e ) {
			e.preventDefault() ;
			let $this = $(e.currentTarget),
				wrapper = $('.cbk-shipping-restricted-notice');
				CBK_Frontend.block(wrapper);

			let data = ({
				action: 'cbk_display_restricted_shipping_list',
				shipping_lists: $(this).data('shipping_lists'),
				cbk_security: cbk_frontend_params.eligible_products_nonce,
			});

			$.post(cbk_frontend_params.ajaxurl, data, function (res) {
				if (true === res.success) {
					$('#cbk-eligible-products-list-modal').html(res.data.html);
					$(document.body).trigger('cbk-enhanced-lightcase');
					$('.cbk-popup-cashback-lightcase').trigger('click');
				} else {
					alert(res.data.error);
				}
				CBK_Frontend.unblock(wrapper);
			}
			);
	},
	copy_to_clipboard : function () {
            var input = document.createElement( 'input' ) ;
            input.setAttribute( 'readonly' , false ) ;
            input.setAttribute( 'contenteditable' , true ) ;
            input.style.position = 'fixed' ; // prevent scroll from jumping to the bottom when focus is set.
            input.value = $( this ).attr( 'data-referral_url' ) ;
            document.body.appendChild( input ) ;

            var range = document.createRange() ;
            range.selectNodeContents( input ) ;
            var sel = window.getSelection() ;
            sel.removeAllRanges() ;
            sel.addRange( range ) ;
            input.setSelectionRange( 0 , 999999 ) ;

            input.focus() ;
            input.select() ;

            document.execCommand( 'copy' ) ;

            input.contentEditable = false ;
            input.readOnly = false ;

            $( '.cbk_copy_success_message' ).css( { display : 'block' } ).delay( 7000 ).fadeOut() ;

            input.remove() ;
        },date_filter_type: function (event) {
			event.preventDefault();
			CBK_Frontend.toggle_date_filter_type(this);
		}, toggle_date_filter_type: function ($this) {
			if ('custom_range' === $($this).val()) {
				$('.cbk-custom-date-range').show();
			} else {
				$('.cbk-custom-date-range').hide();
			}
		} , block: function (id) {
			if (!CBK_Frontend.is_blocked(id)) {
				$(id).addClass('processing').block({
					message: null,
					overlayCSS: {
						background: '#fff',
						opacity: 0.7
					}
				});
			}
		}, unblock: function (id) {
			$(id).removeClass('processing').unblock();
		}, is_blocked: function (id) {
			return $(id).is('.processing') || $(id).parents('.processing').length;
		}
	};

	CBK_Frontend.init();
});
