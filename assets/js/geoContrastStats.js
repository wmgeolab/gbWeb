
function updateGbStats(features) {
    // calc stats
    var stats = calcSpatialStats(features);
    //alert(JSON.stringify(stats));
    // show in display
    var name = document.getElementById('gb-boundary-select').value;
    for (elem of document.querySelectorAll('.gb-source-title')) {
        elem.innerText = name;
    };
    var lvl = document.getElementById('gb-admin-level-select').value;
    document.getElementById('stats-gb-level').innerText = lvl;
    document.getElementById('stats-gb-area').innerText = stats.area.toLocaleString('en-US', {maximumFractionDigits:0}) + ' km2';
    document.getElementById('stats-gb-circumf').innerText = stats.circumf.toLocaleString('en-US', {maximumFractionDigits:0}) + ' km';
    document.getElementById('stats-gb-vertices').innerText = stats.vertices.toLocaleString('en-US', {maximumFractionDigits:0});
    document.getElementById('stats-gb-avglinedens').innerText = stats.avgLineDensity.toFixed(1) + ' / km';
    document.getElementById('stats-gb-avglineres').innerText = stats.avgLineResolution.toFixed(1) + ' m';
    document.getElementById('stats-gb-admincount').innerText = stats.adminCount;
};

function updateComparisonStats(features) {
    // calc stats
    var stats = calcSpatialStats(features);
    //alert(JSON.stringify(stats));
    // show in display
    var name = document.getElementById('comparison-boundary-select').value;
    for (elem of document.querySelectorAll('.comp-source-title')) {
        elem.innerText = name;
    };
    var lvl = document.getElementById('comparison-admin-level-select').value;
    document.getElementById('stats-comp-level').innerText = lvl;
    document.getElementById('stats-comp-area').innerText = stats.area.toLocaleString('en-US', {maximumFractionDigits:0}) + ' km2';
    document.getElementById('stats-comp-circumf').innerText = stats.circumf.toLocaleString('en-US', {maximumFractionDigits:0}) + ' km';
    document.getElementById('stats-comp-vertices').innerText = stats.vertices.toLocaleString('en-US', {maximumFractionDigits:0});
    document.getElementById('stats-comp-avglinedens').innerText = stats.avgLineDensity.toFixed(1) + ' / km';
    document.getElementById('stats-comp-avglineres').innerText = stats.avgLineResolution.toFixed(1) + ' m';
    document.getElementById('stats-comp-admincount').innerText = stats.adminCount;
};

