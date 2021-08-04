
function clearGbInfo() {
    // clear old div contents if exists
    var div = document.getElementById('gb-info-div');
    div.innerHTML = '';
};

function clearComparisonInfo() {
    // clear old div contents if exists
    var div = document.getElementById('comparison-info-div');
    div.innerHTML = '';
};

function updateGbInfo(features) {
    //alert('update gb info');
    // info div
    var div = document.getElementById('gb-info-div');
    // clear previous contents
    div.innerHTML = '';
    // get geoContrast metadata
    var iso = document.getElementById('country-select').value;
    var level = document.getElementById('gb-admin-level-select').value;
    var sourceName = document.getElementById('gb-boundary-select').value;
    if (sourceName == 'upload') {
        // set unknown values
        var gbSource = 'Unknown';
        var gbSourceUrl = '';
        var gbLicense = 'Unknown';
        var gbLicenseUrl = '';
        var gbYear = 'Unknown';
        var gbUpdated = 'Unknown';
        var gbDownloadUrl = '';
    } else {
        // loop metadata table until reach row matching current iso and level
        var metadata = geoContrastMetadata;
        for (row of metadata) {
            var rowIso = row[2];
            var rowLevel = row[4];
            var rowSource = row[6];
            if (rowSource == sourceName & rowIso == iso & rowLevel == level) {
                var gbSource = row[6];
                if (row[7] != '') {
                    gbSource += ' / ' + row[7];
                };
                var gbSourceUrl = parseURL(row[11]);
                var gbLicense = row[8];
                var gbLicenseUrl = parseURL(row[10]);
                var gbYear = row[3];
                var gbUpdated = row[12];
                var gbDownloadUrl = parseURL(row[18]);
                break;
            };
        };
    };
    // populate info
    var info = document.createElement("div");
    info.style = "margin-left:20px; margin-top:10px; font-size:0.7em";
    info.innerHTML = '';
    // action buttons
    info.innerHTML += '<div>';
    info.innerHTML += '<b style="vertical-align:middle">Actions: </b>'
    if (sourceName == 'upload') {
        info.innerHTML += '<a id="open-gb-contribute-popup" style="cursor:pointer" onclick="openContributePopup()">Share This Data</a>';
    } else {
        info.innerHTML += '<a href="'+gbDownloadUrl+'" download><img src="https://icons-for-free.com/iconfiles/png/512/file+download+24px-131985219323992544.png" height="20px" style="vertical-align:middle"></a>';
    };
    info.innerHTML += '</div>';
    info.innerHTML += '</br>';
    // info
    if (gbSourceUrl != '') {
        var sourceEntry = '<a href="'+gbSourceUrl+'" target="_blank">'+gbSource+'</a>';
    } else {
        var sourceEntry = gbSource;
    };
    if (gbLicenseUrl != '') {
        var licenseEntry = '<a href="'+gbLicenseUrl+'" target="_blank">'+gbLicense+'</a>';
    } else {
        var licenseEntry = gbLicense;
    };
    info.innerHTML += '<b>Source: </b>';
    info.innerHTML += sourceEntry;
    info.innerHTML += '<br>';
    info.innerHTML += '<b>License: </b>';
    info.innerHTML += licenseEntry;
    info.innerHTML += '<br>';
    info.innerHTML += '<b>Year the Boundary Represents: </b>'+gbYear;
    info.innerHTML += '<br>';
    info.innerHTML += '<b>Last Update: </b>'+gbUpdated;
    info.innerHTML += '<br>';
    div.appendChild(info);
    // also update some redundant fields in the stats tables
    document.getElementById('stats-gb-source').innerHTML = sourceEntry;
    document.getElementById('stats-gb-license').innerHTML = licenseEntry;
    document.getElementById('stats-gb-year').innerHTML = gbYear;
    document.getElementById('stats-gb-updated').innerHTML = gbUpdated;
};

function updateComparisonInfo(features) {
    //alert('update comparison info');
    // info div
    var div = document.getElementById('comparison-info-div');
    // clear previous contents
    div.innerHTML = '';
    // get geoContrast metadata
    var iso = document.getElementById('country-select').value;
    var level = document.getElementById('comparison-admin-level-select').value;
    var sourceName = document.getElementById('comparison-boundary-select').value;
    if (sourceName == 'upload') {
        // set unknown values
        var comparisonSource = 'Unknown';
        var comparisonSourceUrl = '';
        var comparisonLicense = 'Unknown';
        var comparisonLicenseUrl = '';
        var comparisonYear = 'Unknown';
        var comparisonUpdated = 'Unknown';
        var comparisonDownloadUrl = '';
    } else {
        // loop metadata table until reach row matching current iso and level
        var metadata = geoContrastMetadata;
        for (row of metadata) {
            var rowIso = row[2];
            var rowLevel = row[4];
            var rowSource = row[6];
            if (rowSource == sourceName & rowIso == iso & rowLevel == level) {
                var comparisonSource = row[6];
                if (row[7] != '') {
                    comparisonSource += ' / ' + row[7];
                };
                var comparisonSourceUrl = parseURL(row[11]);
                var comparisonLicense = row[8];
                var comparisonLicenseUrl = parseURL(row[10]);
                var comparisonYear = row[3];
                var comparisonUpdated = row[12];
                var comparisonDownloadUrl = parseURL(row[18]);
                break;
            };
        };
    };
    // populate info
    var info = document.createElement("div");
    info.style = "margin-left:20px; margin-top:10px; font-size:0.7em";
    info.innerHTML = '';
    // action buttons
    info.innerHTML += '<div>';
    info.innerHTML += '<b style="vertical-align:middle">Actions: </b>'
    if (sourceName == 'upload') {
        info.innerHTML += '<a id="open-comparison-contribute-popup" style="cursor:pointer" onclick="openContributePopup()">Share This Data</a>';
    } else {
        info.innerHTML += '<a href="'+comparisonDownloadUrl+'" download><img src="https://icons-for-free.com/iconfiles/png/512/file+download+24px-131985219323992544.png" height="20px" style="vertical-align:middle"></a>';
    };
    info.innerHTML += '</div>';
    info.innerHTML += '</br>';
    // info
    if (comparisonSourceUrl != '') {
        var sourceEntry = '<a href="'+comparisonSourceUrl+'" target="_blank">'+comparisonSource+'</a>';
    } else {
        var sourceEntry = comparisonSource;
    };
    if (comparisonLicenseUrl != '') {
        var licenseEntry = '<a href="'+comparisonLicenseUrl+'" target="_blank">'+comparisonLicense+'</a>';
    } else {
        var licenseEntry = comparisonLicense;
    };
    info.innerHTML += '<b>Source: </b>';
    info.innerHTML += sourceEntry;
    info.innerHTML += '<br>';
    info.innerHTML += '<b>License: </b>';
    info.innerHTML += licenseEntry;
    info.innerHTML += '<br>';
    info.innerHTML += '<b>Year the Boundary Represents: </b>'+comparisonYear;
    info.innerHTML += '<br>';
    info.innerHTML += '<b>Last Update: </b>'+comparisonUpdated;
    info.innerHTML += '<br>';
    div.appendChild(info);
    // also update some redundant fields in the stats tables
    document.getElementById('stats-comp-source').innerHTML = sourceEntry;
    document.getElementById('stats-comp-license').innerHTML = licenseEntry;
    document.getElementById('stats-comp-year').innerHTML = comparisonYear;
    document.getElementById('stats-comp-updated').innerHTML = comparisonUpdated;
};

