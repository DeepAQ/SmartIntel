// ==UserScript==
// @name         IITC: DeepAQ SmartIntel Core
// @namespace    http://smartintel.imaq.cn/
// @version      1.0
// @description  SmartIntel code (perodic refresh)
// @author       DeepAQ
// @include        https://*.ingress.com/intel*
// @include        http://*.ingress.com/intel*
// @match          https://*.ingress.com/intel*
// @match          http://*.ingress.com/intel*
// @include        https://*.ingress.com/mission/*
// @include        http://*.ingress.com/mission/*
// @match          https://*.ingress.com/mission/*
// @match          http://*.ingress.com/mission/*
// @grant        none
// ==/UserScript==

(function () {
    window.DataCache.prototype.store = function (qk, data, freshTime) {
        this.remove(qk);
        var time = new Date().getTime();
        if (freshTime === undefined) freshTime = 1000;
        var expire = time + freshTime;
        var dataStr = JSON.stringify(data);
        this._cacheCharSize += dataStr.length;
        this._cache[qk] = {time: time, expire: expire, dataStr: dataStr};
    };

    window.MapDataRequest.prototype.refreshOnTimeout = function (seconds) {
        this.clearTimeout();
        console.log('starting map refresh in 3 seconds');
        var _this = this;
        this.timer = setTimeout(function () {
            _this.timer = setTimeout(function () {
                _this.timer = undefined;
                _this.refresh();
                window.chat.requestPublic();
            }, 3000);
        }, 0);
        this.timerExpectedTimeoutTime = new Date().getTime() + 1000;
    };

    addHook('portalDetailsUpdated', function (data) {
        setTimeout(function () {
            portalDetail.request(data.guid);
        }, 2000);
    });
})();
