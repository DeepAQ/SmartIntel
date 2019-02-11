// ==UserScript==
// @name         OPR Keyboard Shortcut
// @version      0.3
// @namespace    https://github.com/DeepAQ/SmartIntel
// @description  Add keyboard shortcut support to OPR
// @match        *://opr.ingress.com/recon
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/zepto/1.2.0/zepto.min.js
// ==/UserScript==

(function() {
	var items = ['Total', 'Title', 'Significance', 'Uniqueness', 'Location', 'Accessibility'];
    var btns = [0, 4, 5, 6, 10, 11];
	var current = 0;
	var updateItem = function () {
        $('#current_item').html(items[current]);
	};
	$('.navbar-collapse').append('<h4 style="float:left;">Now grading: <span id="current_item"></span></h4>');
	updateItem();
    $('body').on('keydown', function (e) {
		if (e.keyCode == 13 && e.ctrlKey) {
			$('.big-submit-button').click();
            setInterval(function () {
                if ($('.modal-dialog').length > 0) {
                    window.location.reload();
                }
            }, 500);
			return;
		}
		if (e.key >= '1' && e.key <= '5') {
			$('.btn-group').eq(btns[current]).find('button').eq(e.key - '1').click();
			current = (current + 1) % items.length;
			updateItem();
			return;
		}
		if (e.key == '.') {
			current = (current + 1) % items.length;
			updateItem();
			return;
		}
		if (e.key == ',') {
			current = (current - 1) % items.length;
			updateItem();
			return;
		}
	});
})();
