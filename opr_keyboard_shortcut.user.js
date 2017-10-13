// ==UserScript==
// @name         OPR Keyboard Shortcut
// @version      0.2
// @namespace    https://github.com/DeepAQ/SmartIntel
// @description  Add keyboard shortcut support to OPR
// @match        *://opr.ingress.com/recon
// @grant        none
// @require      https://code.jquery.com/jquery-3.2.1.min.js
// ==/UserScript==

(function() {
	var items = ['Total', 'Title', 'Significance', 'Uniqueness', 'Location', 'Accessibility'];
	var current = 0;
	var updateItem = function () {
        $('#current_item').html(items[current]);
	};
	$('.navbar-collapse').append('<h4 style="float:left;">Now grading: <span id="current_item"></span></h4>');
	updateItem();
    $('body').on('keydown', function (e) {
		if (e.keyCode == 13 && e.ctrlKey) {
			$('.big-submit-button').click();
			return;
		}
		if (e.key >= '1' && e.key <= '5') {
            var newPos = current < 4 ? current : current + 3;
			$('.btn-group').eq(newPos).find('button').eq(e.key - '1').click();
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
