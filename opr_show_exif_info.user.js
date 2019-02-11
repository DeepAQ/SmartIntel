// ==UserScript==
// @name         OPR Show EXIF Info
// @version      0.5
// @namespace    https://github.com/DeepAQ/SmartIntel
// @description  Show EXIF info of photos in OPR
// @match        *://opr.ingress.com/recon
// @require      https://cdnjs.cloudflare.com/ajax/libs/zepto/1.2.0/zepto.min.js
// @require      https://github.com/mattiasw/ExifReader/releases/download/2.7.0/exif-reader.js
// ==/UserScript==

(function() {
    var tagsToShow = ['DateTime', 'Make', 'Model', 'Software'];

    var distance = function (lat1, lng1, lat2, lng2) {
        var dx = Math.abs(lng1 - lng2);
        var dy = Math.abs(lat1 - lat2);
        var b = (lat1 + lat2) / 2.0;
        var lx = (dx / 180.0 * Math.PI) * 6367000.0 * Math.cos(b / 180.0 * Math.PI);
        var ly = 6367000.0 * dy / 180.0 * Math.PI;
        return (lat1 < lat2 ? '⇑' : '⇓') + Math.ceil(ly) + 'm ' + (lng1 < lng2 ? '⇒' : '⇐') + Math.ceil(lx) + 'm';
    };

    var getExif = function (url) {
        console.log('[EXIF] Downloading full size photo...');
        fetch(url).then(function (req) {
            return req.arrayBuffer();
        }).then(function (buf) {
            var info = '';
            try {
                var tags = ExifReader.load(buf);
                console.log('[EXIF] tags:');
                console.log(tags);
                for (var key in tagsToShow) {
                    if (tags[tagsToShow[key]]) {
                        info += tagsToShow[key] + ': ' + tags[tagsToShow[key]].description;
                        if (tagsToShow[key] == 'GPSLatitude' || tagsToShow[key] == 'GPSLongitude') {
                            var ref = tags[tagsToShow[key] + 'Ref'].value[0];
                            var negative = (ref == 'S' || ref == 'W');
                            info += ref + ' (' + (negative ? -1 : 1) * tags[tagsToShow[key]].description + ')';
                        }
                        info += '<br />';
                    }
                }
                if (tags['GPSLatitude'] && tags['GPSLongitude']) {
                    var deglat = (tags['GPSLatitudeRef'].value[0] == 'S' ? -1 : 1) * tags['GPSLatitude'].description;
                    var deglon = (tags['GPSLongitudeRef'].value[0] == 'W' ? -1 : 1) * tags['GPSLongitude'].description;
                    info += 'GPSLatitude: ' + deglat + '<br />GPSLongitude: ' + deglon + '<br />';
                    var portalPos = /@([^,]+),([^,]+)$/.exec(document.evaluate("//*[@ng-bind='subCtrl.pageData.streetAddress']/parent::a").iterateNext().search);
                    var portalLat = Number(portalPos[1]);
                    var portalLng = Number(portalPos[2]);
                    info += 'Distance (portal -> photo): ' + distance(portalLat, portalLng, deglat, deglon) + '<br />';
                    // info += '<div class="btn-group"><a class="button btn btn-default" target="osm" href="https://www.openstreetmap.org/?mlat=' + deglat + '&amp;mlon=' + deglon + '&amp;zoom=15">Open in OSM</a></div>';
                }
            } catch (e) {}

            if (info !== '') {
                info = '<small class="gold">[EXIF]</small><br>' + info;
            } else {
                info = '<small class="gold">[EXIF]</small><br />No EXIF data present';
            }
            $('#descriptionDiv').append('<div>' + info + '</div>');
        });
    };

    var tryGetImgUrl = function () {
        var url = $('.center-cropped-img').attr('src');
        if (!url) {
            console.log('[EXIF] Waiting for photo to be loaded...');
            setTimeout(tryGetImgUrl, 1000);
        } else {
            console.log('[EXIF] Photo URL: ' + url);
            getExif((url + '=s0').replace('http:', 'https:'));
        }
    };

    tryGetImgUrl();
})();
