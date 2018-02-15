// ==UserScript==
// @name         OPR Show EXIF Info
// @version      0.1
// @namespace    https://github.com/DeepAQ/SmartIntel
// @description  Show EXIF info of photos in OPR
// @match        *://opr.ingress.com/recon
// @require      https://cdn.bootcss.com/zepto/1.2.0/zepto.min.js
// @require      https://cdn.bootcss.com/exif-js/2.3.0/exif.min.js
// ==/UserScript==

(function() {
    var tagsToShow = ['DateTime', 'Make', 'Model', 'Software', 'GPSLatitude', 'GPSLongitude'];

    var getExif = function (url) {
        var img = document.createElement('img');
        img.src = url;
        img.onload = function () {
            EXIF.getData(img, function () {
                var tags = EXIF.getAllTags(this);
                var info = '';
                for (var key in tagsToShow) {
                    if (tags[tagsToShow[key]]) {
                        info += tagsToShow[key] + ': ' + tags[tagsToShow[key]] + '<br />';
                    }
                }
                if (info !== '') {
                    info = '<small class="gold">EXIF</small><br>' + info;
                } else {
                    info = '<small class="gold">EXIF</small><br />no data available';
                }
                $('#descriptionDiv').append('<div>' + info + '</div>');
            });
        };
    };

    var tryGetImgUrl = function () {
        var url = $('.center-cropped-img').attr('src');
        if (!url) {
            setTimeout(tryGetImgUrl, 1000);
        } else {
            getExif((url + '=s0').replace('http:', 'https:'));
        }
    };

    tryGetImgUrl();
})();
