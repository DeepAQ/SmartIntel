// ==UserScript==
// @name         IngressMM: Fix China Map Offset
// @namespace    http://imaq.cn/
// @version      1.0
// @description  Fix China map offset for IngressMM
// @author       IMAQ
// @match        *://ingressmm.com/*
// @grant        none
// ==/UserScript==

/////////// begin WGS84 to GCJ-02 transformer /////////
var WGS84transformer = function () {
};
// Krasovsky 1940
//
// a = 6378245.0, 1/f = 298.3
// b = a * (1 - f)
// ee = (a^2 - b^2) / a^2;
WGS84transformer.prototype.a = 6378245.0;
WGS84transformer.prototype.ee = 0.00669342162296594323;

WGS84transformer.prototype.transform = function (wgLat, wgLng) {
    if (this.isOutOfMainlandChina(wgLat, wgLng))
        return {lat: wgLat, lng: wgLng};
    dLat = this.transformLat(wgLng - 105.0, wgLat - 35.0);
    dLng = this.transformLng(wgLng - 105.0, wgLat - 35.0);
    radLat = wgLat / 180.0 * Math.PI;
    magic = Math.sin(radLat);
    magic = 1 - this.ee * magic * magic;
    sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((this.a * (1 - this.ee)) / (magic * sqrtMagic) * Math.PI);
    dLng = (dLng * 180.0) / (this.a / sqrtMagic * Math.cos(radLat) * Math.PI);
    mgLat = wgLat + dLat;
    mgLng = wgLng + dLng;
    return {lat: mgLat, lng: mgLng};
};

WGS84transformer.prototype.isOutOfMainlandChina = function (lat, lng) {
    if (lat >= 21.8 && lat <= 25.3 && lng >= 120.0 && lng <= 122.0) return true;
    if (lng < 72.004 || lng > 137.8347) return true;
    if (lat < 0.8293 || lat > 55.8271) return true;
    return false;
};

WGS84transformer.prototype.transformLat = function (x, y) {
    var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0;
    return ret;
};

WGS84transformer.prototype.transformLng = function (x, y) {
    var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x / 30.0 * Math.PI)) * 2.0 / 3.0;
    return ret;
};
/////////// end WGS84 to GCJ-02 transformer /////////

$(window).load(function () {
    var WGS84toGCJ02 = new WGS84transformer();
    var old_con = google.maps.LatLng;
    var old_proto = google.maps.LatLng.prototype;
    google.maps.LatLng = function (a, b, c) {
        if (a && (void 0 !== a.lat || void 0 !== a.lng)) {
            var new_pos = WGS84toGCJ02.transform(a.lat, a.lng);
            a.lat = new_pos.lat;
            a.lng = new_pos.lng;
        } else {
            var new_pos = WGS84toGCJ02.transform(a, b);
            a = new_pos.lat;
            b = new_pos.lng;
        }
        return old_con.call(this, a, b, c);
    };
    google.maps.LatLng.prototype = old_proto;
});
