// ==UserScript==
// @name         OPR Keyboard Shortcut
// @version      0.1
// @namespace    https://github.com/DeepAQ/SmartIntel
// @description  Add keyboard shortcut support to OPR
// @match        *://opr.ingress.com/recon
// @grant        none
// @require      https://code.jquery.com/jquery-3.2.1.min.js
// ==/UserScript==

(function() {
	var keymap = [
		['1', '2', '3', '4', '5'],
		['q', 'w', 'e', 'r', 't'],
		['a', 's' ,'d', 'f', 'g'],
		['z', 'x' ,'c', 'v', 'b'],
		['6', '7' ,'8', '9', '0'],
		['y', 'u' ,'i', 'o', 'p']
	];
    $('body').on('keydown', function (e) {
		if (e.keyCode == 13 && e.ctrlKey) {
			$('.big-submit-button').click();
			return;
		}
		for (var i in keymap) {
			for (var j in keymap[i]) {
				if (keymap[i][j] == e.key) {
					$('.btn-group').eq(i).find('button').eq(j).click();
					return;
				}
			}
		}
	});
})();
