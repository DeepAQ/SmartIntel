// ==UserScript==
// @name         OPR Show EXIF Info
// @version      0.4.2
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

    var distance = function (lat1, lng1, lat2, lng2) {
        var dx = Math.abs(lng1 - lng2);
        var dy = Math.abs(lat1 - lat2);
        var b = (lat1 + lat2) / 2.0;
        var lx = (dx / 180.0 * Math.PI) * 6367000.0 * Math.cos(b / 180.0 * Math.PI);
        var ly = 6367000.0 * dy / 180.0 * Math.PI;
        // var l = Math.sqrt(lx * lx + ly * ly);
        return (lat1 < lat2 ? '⇑' : '⇓') + Math.ceil(lx) + 'm ' + (lng1 < lng2 ? '⇒' : '⇐') + Math.ceil(ly) + 'm';
    };

    var getExif = function (url) {
        var img = document.createElement('img');
        img.src = url;
        img.onload = function () {
            EXIF.getData(img, function () {
                var tags = EXIF.getAllTags(this);
                console.log(tags);
                var info = '';
                for (var key in tagsToShow) {
                    if (tags[tagsToShow[key]]) {
                        info += tagsToShow[key] + ': ' + tags[tagsToShow[key]];
                        if (tagsToShow[key] == 'GPSLatitude' || tagsToShow[key] == 'GPSLongitude') {
                            var ref = tags[tagsToShow[key] + 'Ref'];
                            var negative = (ref == 'S' || ref == 'W');
                            info += ref + ' (' + (negative ? -1 : 1) * dms_to_deg(tags[tagsToShow[key]]) + ')';
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
                    var deglat = (tags['GPSLatitudeRef'] == 'S' ? -1 : 1) * dms_to_deg(tags['GPSLatitude']);
                    var deglon = (tags['GPSLongitudeRef'] == 'W' ? -1 : 1) * dms_to_deg(tags['GPSLongitude']);
                    var portalPos = /@([^,]+),([^,]+)$/.exec(document.evaluate("//*[@ng-bind='subCtrl.pageData.streetAddress']/parent::a").iterateNext().search);
                    var portalLat = Number(portalPos[1]);
                    var portalLng = Number(portalPos[2]);
                    info += 'Distance (portal -> photo): ' + distance(portalLat, portalLng, deglat, deglon) + '<br />';
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
