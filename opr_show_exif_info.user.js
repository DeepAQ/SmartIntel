// ==UserScript==
// @name         OPR Show EXIF Info
// @version      0.3
// @namespace    https://github.com/DeepAQ/SmartIntel
// @description  Show EXIF info of photos in OPR
// @match        *://opr.ingress.com/recon
// @require      https://cdn.bootcss.com/zepto/1.2.0/zepto.min.js
// @require      https://cdn.bootcss.com/exif-js/2.3.0/exif.min.js
// ==/UserScript==

(function() {
    var tagsToShow = ['DateTime', 'Make', 'Model', 'Software', 'GPSLatitude', 'GPSLongitude'];

    var dms_to_deg = function (dms) {
        var d = dms[0];
        var m = dms[1];
        var s = dms[2];
        return Math.round((d / 1 + m / 60 + s / 3600) * 1E6) / 1E6;
    };

    var getExif = function (url) {
        var img = document.createElement('img');
        img.src = url;
        img.onload = function () {
            EXIF.getData(img, function () {
                var tags = EXIF.getAllTags(this);
                var info = '';
                for (var key in tagsToShow) {
                    if (tags[tagsToShow[key]]) {
                        info += tagsToShow[key] + ': ' + tags[tagsToShow[key]];
                        if (tagsToShow[key] == 'GPSLatitude' || tagsToShow[key] == 'GPSLongitude') {
                            info += ' (' + dms_to_deg(tags[tagsToShow[key]]) + ')';
                        }
                        info += '<br />';
                    }
                }
                if (info !== '') {
                    info = '<small class="gold">[EXIF]</small><br>' + info;
                } else {
                    info = '<small class="gold">[EXIF]</small><br />No EXIF data present';
                }
                if (tags['GPSLatitude'] && tags['GPSLongitude']) {
                    var deglat = dms_to_deg(tags['GPSLatitude']);
                    var deglon = dms_to_deg(tags['GPSLongitude']);
                    info += '<div class="btn-group"><a class="button btn btn-default" target="osm" href="https://www.openstreetmap.org/?mlat=' + deglat + '&amp;mlon=' + deglon + '&amp;zoom=15">Open in OSM</a></div>';
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
