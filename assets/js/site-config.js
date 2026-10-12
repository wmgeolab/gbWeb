(function () {
    'use strict';
    var config = window.geoBoundariesConfig || { origin: window.location.origin };
    var siteHosts = [
        'geoboundaries.org', 'www.geoboundaries.org',
        'geoboundaries-dev.org', 'www.geoboundaries-dev.org',
        'geoboundaries.geolab.wm.edu'
    ];

    window.geoBoundariesURL = function (value) {
        if (typeof value !== 'string' || !value) return value;
        if (/^(?:www\.)?geoboundaries(?:-dev)?\.org(?:[/?#]|$)/i.test(value)) value = 'https://' + value;
        var url;
        try {
            url = new URL(value, config.origin + window.location.pathname);
        } catch (_error) {
            return value;
        }
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return value;
        if (siteHosts.includes(url.hostname) || url.origin === config.origin) {
            var origin = /^\/api(?:\/|$)/i.test(url.pathname) ? config.apiOrigin || config.origin : config.origin;
            return origin + url.pathname + url.search + url.hash;
        }
        return value;
    };

    // API/CSV metadata can contain production URLs even in a development build.
    window.geoBoundariesResponse = function rewrite(value) {
        if (typeof value === 'string') {
            return /^(?:https?:\/\/|\/)/i.test(value) ? window.geoBoundariesURL(value) : value;
        }
        if (Array.isArray(value)) return value.map(rewrite);
        if (value && typeof value === 'object') {
            return Object.fromEntries(Object.entries(value).map(function (entry) {
                return [entry[0], rewrite(entry[1])];
            }));
        }
        return value;
    };
}());
