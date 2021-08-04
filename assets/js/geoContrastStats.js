
function clearGbStats() {
    // clear source name titles
    for (elem of document.querySelectorAll('.gb-source-title')) {
        elem.innerText = '-';
    };
    // clear stats values
    for (elem of document.querySelectorAll('#stats-gb-container .stats-value')) {
        elem.innerText = '-';
    };
};

function clearComparisonStats() {
    // clear source name titles
    for (elem of document.querySelectorAll('.comp-source-title')) {
        elem.innerText = '-';
    };
    // clear stats values
    for (elem of document.querySelectorAll('#stats-comp-container .stats-value')) {
        elem.innerText = '-';
    };
};

function updateGbStats(features) {
    // calc stats
    var stats = calcSpatialStats(features);
    //alert(JSON.stringify(stats));
    // show in display
    var name = document.getElementById('gb-boundary-select').value;
    if (name == 'upload') {
        var filePath = document.getElementById('gb-file-input').value;
        var fileName = filePath.split('\\').pop().split('/').pop();
        name = 'File: '+fileName;
    };
    for (elem of document.querySelectorAll('.gb-source-title')) {
        elem.innerText = name;
    };
    var lvl = document.getElementById('gb-admin-level-select').value;
    if (lvl == '9') {
        lvl = 'Unknown';
    };
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
    if (name == 'upload') {
        var filePath = document.getElementById('comparison-file-input').value;
        var fileName = filePath.split('\\').pop().split('/').pop();
        name = 'File: '+fileName;
    };
    for (elem of document.querySelectorAll('.comp-source-title')) {
        elem.innerText = name;
    };
    var lvl = document.getElementById('comparison-admin-level-select').value;
    if (lvl == '9') {
        lvl = 'Unknown';
    };
    document.getElementById('stats-comp-level').innerText = lvl;
    document.getElementById('stats-comp-area').innerText = stats.area.toLocaleString('en-US', {maximumFractionDigits:0}) + ' km2';
    document.getElementById('stats-comp-circumf').innerText = stats.circumf.toLocaleString('en-US', {maximumFractionDigits:0}) + ' km';
    document.getElementById('stats-comp-vertices').innerText = stats.vertices.toLocaleString('en-US', {maximumFractionDigits:0});
    document.getElementById('stats-comp-avglinedens').innerText = stats.avgLineDensity.toFixed(1) + ' / km';
    document.getElementById('stats-comp-avglineres').innerText = stats.avgLineResolution.toFixed(1) + ' m';
    document.getElementById('stats-comp-admincount').innerText = stats.adminCount;
};

