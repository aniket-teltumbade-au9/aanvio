/* global cbk_wc_blocks_params */

jQuery(function ($) {
	'use strict';

	var wc_blocks_checkout = window.wc.blocksCheckout;
	var CBK_WC_Blocks_Script = {

		init: function () {
			this.trigger_on_page_load();

			$(document).on('change', '.cbk_debit_cashback', this.trigger_debit_cashback);
			$(document.body).on('click', '.cbk-debit-cashback-button-popup', this.debit_cashback_popup);
			$( document ).on( 'change' , '.wc-block-components-radio-control__input' , this.gateway_notice ) ;
		}, trigger_on_page_load: function () {
			if ('no' == cbk_wc_blocks_params.default_value) {
				$('.cbk_debit_cashback').prop('checked', true);
			} else {
				$('.cbk_debit_cashback').prop('checked', false);
			}

			if ('yes' != cbk_wc_blocks_params.custom_cashback_usage_enabled && 'no' == cbk_wc_blocks_params.default_value) {
				CBK_WC_Blocks_Script.debit_cashback('.cbk_debit_cashback');
			}
			$('.cbk-variation-cashback-notice').hide();
		}, trigger_debit_cashback: function (event) {
			event.preventDefault();
			var $this = $(event.currentTarget);
			CBK_WC_Blocks_Script.debit_cashback($this);
		}, debit_cashback: function ($this) {
			var debit_cashback = $($this).is(':checked') ? 'yes' : 'no',
				available_balance = $($this).attr('data-available_balance');

			if (available_balance) {
				CBK_WC_Blocks_Script.block($this);

				var data = ({
					action: 'cbk_debit_cashback',
					debit_cashback: debit_cashback,
					available_balance: available_balance,
					cbk_security: cbk_wc_blocks_params.debit_nonce,
				});
				$.post(cbk_wc_blocks_params.ajaxurl, data, function (res) {
					if (true === res.success) {
						$('body').trigger('update_checkout');
						$( document.body ).trigger( 'cbk-block-enhanced-init' ) ;
						if( 'yes' == res.data.success){
							window.alert(cbk_wc_blocks_params.applied_message);
						}else{
							window.alert(cbk_wc_blocks_params.removed_message);
						}
					} else {
						window.alert(res.data.error);
					}

					CBK_WC_Blocks_Script.unblock($this);
				}
				);
			}
		}, debit_cashback_popup: function (event) {
			event.preventDefault();
			var $this = $(event.currentTarget);
			var $amount = prompt(cbk_wc_blocks_params.cashback_field_label);
			if ($amount) {
				var data = ({
					action: 'cbk_debit_cashback_popup',
					cashback_amount: $amount,
					available_balance: $this.data('available_balance'),
					cbk_security: cbk_wc_blocks_params.debit_cashback_popup_nonce
				});
				$.post(cbk_wc_blocks_params.ajaxurl, data, function (res) {
					if (true === res.success) {
						$('.cbk-debit-field').hide();
						$( document.body ).trigger( 'cbk-block-enhanced-init' ) ;
						if( 'yes' == res.data.success){
							window.alert(cbk_wc_blocks_params.applied_message);
						}else{
							window.alert(cbk_wc_blocks_params.removed_message);
						}
					} else {
						window.alert(res.data.error);
					}
					$('body').trigger('update_checkout');
				});
			}
			return false;
		},gateway_notice: function (event) {
			if (cbk_wc_blocks_params.is_checkout && cbk_wc_blocks_params.gateway_cashback && 'yes' === cbk_wc_blocks_params.enable_gateway_cashback ) {
				var $this = $(event.currentTarget);
				$('.cbk_gateway_notice').remove();
				var gateway_id = $('input[name="radio-control-wc-payment-method-options"]:checked').val();
				var data = ({
					action: 'cbk_gateway_notice',
					gatewayid: gateway_id,
					is_user_logged_in: cbk_wc_blocks_params.is_user_logged_in,
					cbk_security: cbk_wc_blocks_params.gateway_nonce
				});
				$.post(cbk_wc_blocks_params.ajaxurl, data, function (response) {
					if (true === response.success) {
						if ('' != response.data.html) {
							$( '.wc-block-components-radio-control-accordion-content' ).append('<div class="woocommerce-info cbk_gateway_notice">'+response.data.html+'</div>');
						}
					} else {
						$('.cbk_gateway_notice').remove();
					}
				});
			}
		}, block: function (id) {
			if (!CBK_WC_Blocks_Script.is_blocked(id)) {
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

	CBK_WC_Blocks_Script.init();
});
