// ==UserScript==
// @name         IngressMosaik calculate distance/mission
// @namespace    http://smartintel.imaq.cn/
// @version      0.1
// @description  try to take over the world!
// @author       DeepAQ
// @match        *://ingressmosaik.com/search?*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    $('.well').each(function () {
        var a = $(this).html().match(/(\d+) \(.*, (.+)m\)/i);
        if (a[2].endsWith('k')) {
            a[2] = a[2].substr(0, a[2].length - 1) * 1000;
        }
        var b = Math.round(a[2] / a[1]);
        if (b < 300) {
            $(this).append('<span style="color:#00FF00;">' + b + '</span>');
        } else if (b < 400) {
            $(this).append('<span style="color:#FF0000;">' + b + '</span>');
        } else {
            $(this).append(b);
        }
    });
})();
