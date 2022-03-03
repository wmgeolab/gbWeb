
function clearGbStats() {
    // clear source name titles
    for (elem of document.querySelectorAll('.gb-source-title')) {
        elem.innerText = '-';
    };
    // clear stats values
    for (elem of document.querySelectorAll('#source-stats .stats-value')) {
        if (elem.id.startsWith('stats-gb')) {
            elem.innerText = '-';
        };
    };
};

function clearComparisonStats() {
    // clear source name titles
    for (elem of document.querySelectorAll('.comp-source-title')) {
        elem.innerText = '-';
    };
    // clear stats values
    for (elem of document.querySelectorAll('#source-stats .stats-value')) {
        if (elem.id.startsWith('stats-comp')) {
            elem.innerText = '-';
        };
    };
};

function updateGbStats(features) {
    var source = document.getElementById('gb-boundary-select').value;
    if (source == 'upload') {
        // calc stats
        var stats = calcSpatialStats(features);
    } else {
        // fetch stats from metadata csv
        var iso = document.getElementById('country-select').value;
        var level = document.getElementById('gb-admin-level-select').value;
        for (row of geoContrastMetadata) {
            if (row.length <= 1) {
                // ignore empty rows
                continue;
            };
            var rowSource = row['boundarySource-1'];
            var rowIso = row.boundaryISO;
            var rowLevel = row.boundaryType;
            if (rowSource == source & rowIso == iso & rowLevel == level) {
                var stats = {
                    adminCount: features.length,
                    area: parseFloat(row.statsArea),
                    circumf: parseFloat(row.statsPerimeter),
                    vertices: parseFloat(row.statsVertices),
                    avgLineResolution: parseFloat(row.statsLineResolution),
                    avgLineDensity: parseFloat(row.statsVertexDensity),
                    year: row.boundaryYearRepresented,
                };
                break;
            };
        };
    };
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
    document.getElementById('summary-level').innerText = lvl;
    document.getElementById('summary-year').innerText = stats.year;
    document.getElementById('summary-boundarycount').innerText = stats.adminCount;
    document.getElementById('summary-lineres').innerText = stats.avgLineResolution.toFixed(1) + ' m';
};

function updateComparisonStats(features) {
    var source = document.getElementById('comparison-boundary-select').value;
    if (source == 'upload') {
        // calc stats
        var stats = calcSpatialStats(features);
    } else {
        // fetch stats from metadata csv
        var iso = document.getElementById('country-select').value;
        var level = document.getElementById('comparison-admin-level-select').value;
        for (row of geoContrastMetadata) {
            if (row.length <= 1) {
                // ignore empty rows
                continue;
            };
            var rowSource = row['boundarySource-1'];
            var rowIso = row.boundaryISO;
            var rowLevel = row.boundaryType;
            if (rowSource == source & rowIso == iso & rowLevel == level) {
                var stats = {
                    adminCount: features.length,
                    area: parseFloat(row.statsArea),
                    circumf: parseFloat(row.statsPerimeter),
                    vertices: parseFloat(row.statsVertices),
                    avgLineResolution: parseFloat(row.statsLineResolution),
                    avgLineDensity: parseFloat(row.statsVertexDensity),
                };
                break;
            };
        };
    };
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

