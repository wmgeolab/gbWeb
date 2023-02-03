
// helpers for cleaning misc value types

function parseURL(url) {
    if (url.substring(0,4) != 'http') {
        url = 'http://'+url;
    };
    return url;
};

// helpers for working with values and tables

function getVals(xs, key) {
    var vals = [];
    for (x of xs) {
        val = x[key];
        vals.push(val);
    };
    return vals;
};

function getUniqueVals(xs, key) {
    var vals = [];
    for (x of xs) {
        val = x[key];
        if (!vals.includes(val)) {
            vals.push(val);
        };
    };
    return vals;
};

function groupBy(xs, key) {
    return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};

function filterBy(xs, key, value) {
    var filtered = [];
    for (x of xs) {
        if (x[key] == value) {
            filtered.push(x);
        };
    };
    return filtered;
};

function filterByFunc(xs, func) {
    var filtered = [];
    for (x of xs) {
        if (func(x) == true) {
            filtered.push(x);
        };
    };
    return filtered;
};

function sortBy(xs, key, reversed=false) {
    if (reversed == true) {
        var isTrue = -1;
    } else {
        var isTrue = 1;
    };
    xs.sort(function( a,b ){
        if (a[key] == null) {
            return 1; // not sure if this is right
        } else if (b[key] == null) {
            return -1; // not sure if this is right
        } else if (a[key] > b[key]) {
            return isTrue;
        } else if (a[key] < b[key]) {
            return -isTrue;
        } else {
            return 0;
        };
    });
};

function calcMean(values) {
    var mean = values.reduce((a, b) => a + b, 0) / values.length;
    return mean;
};

