// ==UserScript==
// @name         IITC: Export missions to IngressMM (by DeepAQ)
// @namespace    http://smartintel.imaq.cn/
// @version      1.2
// @description  Export missions in view to IngressMM
// @author       DeepAQ
// @include        https://*.ingress.com/intel*
// @include        http://*.ingress.com/intel*
// @match          https://*.ingress.com/intel*
// @match          http://*.ingress.com/intel*
// @include        https://*.ingress.com/mission/*
// @include        http://*.ingress.com/mission/*
// @match          https://*.ingress.com/mission/*
// @match          http://*.ingress.com/mission/*
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @connect      ingressmm.com
// ==/UserScript==

var portals = [];
var missions = [];

unsafeWindow.exportMissions = {};

unsafeWindow.exportMissions.log = function (s) {
    $('#missions_export_result').append(s + '<br />');
    $('#missions_export_result')[0].scrollTop = $('#missions_export_result')[0].scrollHeight;
};

unsafeWindow.exportMissions.processMissions = function () {
    if (missions.length > 0) {
        var mission = missions[0];
        missions = missions.slice(1);
        exportMissions.log('>>> Processing mission: ' + mission[1] + ' (' + missions.length + ' left)');
        unsafeWindow.postAjax('getMissionDetails', {
            guid: mission[0]
        }, function (result) {
            GM_xmlhttpRequest({
                method: 'POST',
                url: 'http://ingressmm.com/post.php',
                data: $.param({data: result.result}),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
            });
            exportMissions.processMissions();
        }, function () {
            exportMissions.log('Error loading mission data');
            exportMissions.processMissions();
        });
    } else {
        exportMissions.processPortals();
    }
};

unsafeWindow.exportMissions.processPortals = function () {
    if (portals.length > 0) {
        var po = portals[0];
        portals = portals.slice(1);
        exportMissions.log('>> Processing portal: ' + po.options.data.title + ' (' + portals.length + ' left)');
        unsafeWindow.postAjax('getTopMissionsForPortal', {
            guid: po.options.guid,
        }, function (data) {
            if (data.result) {
                missions = data.result;
            }
            exportMissions.processMissions();
        }, function (error) {
            exportMissions.log('Error loading portal missions');
            exportMissions.processPortals();
        });
    } else {
        exportMissions.log('> Done!');
    }
};

unsafeWindow.exportMissions.start = function () {
    dialog({
        html: '<div id="missions_export_result" style="height: 400px; overflow-y: scroll;">',
        title: 'AQMH Mission Exporter',
        width: '500px',
    }).dialog('option', 'buttons', {
        'Abort': function () {
            portals = [];
            missions = [];
            $(this).dialog('close');
        },
    });
    var bounds = unsafeWindow.map.getBounds();
    for (var guid in unsafeWindow.portals) {
        var po = unsafeWindow.portals[guid];
        if (po.options && po.options.data) {
            if (po.options.data.latE6 > bounds.getSouth() * 1E6 &&
                po.options.data.latE6 < bounds.getNorth() * 1E6 &&
                po.options.data.lngE6 > bounds.getWest() * 1E6 &&
                po.options.data.lngE6 < bounds.getEast() * 1E6 &&
                (po.options.data.mission || po.options.data.mission50plus)
            ) {
                portals.push(po);
            }
        }
    }
    exportMissions.log("> Found " + portals.length + " mission start portals in view!");
    exportMissions.processPortals();
};

var setup = function () {
    $('#toolbox').append('<a onclick="window.exportMissions.start();">Export missions</a>');
};

setTimeout(setup, 1000);
