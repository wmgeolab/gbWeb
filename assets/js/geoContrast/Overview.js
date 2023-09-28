
function clearMainInfo() {
    // clear old div contents if exists
    var div = document.getElementById('main-info-div');
    div.innerHTML = '';
};

function clearComparisonInfo() {
    // clear old div contents if exists
    var div = document.getElementById('comparison-info-div');
    div.innerHTML = '';
};

function updateMainInfo(features) {
    //alert('update main info');
    // info div
    var div = document.getElementById('main-info-div');
    // clear previous contents
    div.innerHTML = '';
    // get geoContrast metadata
    var iso = document.getElementById('country-select').value;
    var level = document.getElementById('main-admin-level-select').value;
    var sourceName = document.getElementById('main-boundary-select').value;
    if (sourceName == 'upload') {
        // set unknown values
        var mainSource = 'Unknown';
        var mainSourceUrl = '';
        var mainLicense = 'Unknown';
        var mainLicenseUrl = '';
        var mainYear = 'Unknown';
        var mainUpdated = 'Unknown';
        var mainDownloadUrl = '';
    } else {
        // loop metadata table until reach row matching current iso and level
        var metadata = geoContrastMetadata;
        for (row of metadata) {
            var rowIso = row.boundaryISO;
            var rowLevel = row.boundaryType;
            var rowSource = row['boundarySource-1'];
            if (rowSource == sourceName & rowIso == iso & rowLevel == level) {
                var mainSource = row['boundarySource-1'];
                if (row['boundarySource-2'] != '') {
                    mainSource += ' / ' + row['boundarySource-2'];
                };
                var mainSourceUrl = parseURL(row.boundarySourceURL);
                var mainLicense = row.boundaryLicense;
                var mainLicenseUrl = parseURL(row.licenseSource);
                var mainYear = row.boundaryYearRepresented;
                var mainUpdated = row.sourceDataUpdateDate;
                var mainDownloadUrl = parseURL(row.apiURL);
                break;
            };
        };
    };
    // populate info
    var info = document.createElement("div");
    info.style = "margin-left:2px; margin-top:1px; font-size:0.75em; line-height:1.5;";
    info.innerHTML = '';
    // action buttons
    if (sourceName == 'upload') {
        var html = '';
        html += '<div>';
        html += '<a href="gbContribute.html" target="_blank" style="cursor:pointer">Submit this file to geoBoundaries?</a>';
        html += '</div>';
        info.innerHTML += html;
    } else {
        // info
        if (mainSourceUrl != '') {
            var sourceEntry = '<a href="'+mainSourceUrl+'" target="_blank">'+mainSource+'</a>';
        } else {
            var sourceEntry = mainSource;
        };
        if (mainLicenseUrl != '') {
            var licenseEntry = '<a href="'+mainLicenseUrl+'" target="_blank">'+mainLicense+'</a>';
        } else {
            var licenseEntry = mainLicense;
        };
        if (sourceName != 'upload') {
            info.innerHTML += '<b>Source: </b><br/>';
            info.innerHTML += sourceEntry;
            info.innerHTML += '<br>';
            info.innerHTML += '<b>License: </b>';
            info.innerHTML += licenseEntry;
            info.innerHTML += '<br>';
            info.innerHTML += '<b>Year the Boundary Represents: </b>'+mainYear;
            info.innerHTML += '<br>';
            info.innerHTML += '<b>Last Update: </b>'+mainUpdated;
            info.innerHTML += '<br>';
        };
    };
    div.appendChild(info);
    // also update some redundant fields in the stats tables
    document.getElementById('stats-main-source').innerHTML = sourceEntry;
    document.getElementById('stats-main-license').innerHTML = licenseEntry;
    document.getElementById('stats-main-year').innerHTML = mainYear;
    document.getElementById('stats-main-updated').innerHTML = mainUpdated;
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
            var rowIso = row.boundaryISO;
            var rowLevel = row.boundaryType;
            var rowSource = row['boundarySource-1'];
            if (rowSource == sourceName & rowIso == iso & rowLevel == level) {
                var comparisonSource = row['boundarySource-1'];
                if (row['boundarySource-2'] != '') {
                    comparisonSource += ' / ' + row['boundarySource-2'];
                };
                var comparisonSourceUrl = parseURL(row.boundarySourceURL);
                var comparisonLicense = row.boundaryLicense;
                var comparisonLicenseUrl = parseURL(row.licenseSource);
                var comparisonYear = row.boundaryYearRepresented;
                var comparisonUpdated = row.sourceDataUpdateDate;
                var comparisonDownloadUrl = parseURL(row.apiURL);
                break;
            };
        };
    };
    // populate info
    var info = document.createElement("div");
    info.style = "margin-left:2px; margin-top:1px; font-size:0.75em; line-height:1.5;";
    info.innerHTML = '';
    // action buttons
    if (sourceName == 'upload') {
        var html = '';
        html += '<div>';
        html += '<a href="gbContribute.html" target="_blank" style="cursor:pointer">Submit this file to geoBoundaries?</a>';
        html += '</div>';
        info.innerHTML += html;
    } else {
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
        info.innerHTML += '<b>Source: </b><br />';
        info.innerHTML += sourceEntry;
        info.innerHTML += '<br>';
        info.innerHTML += '<b>License: </b>';
        info.innerHTML += licenseEntry;
        info.innerHTML += '<br>';
        info.innerHTML += '<b>Year the Boundary Represents: </b>'+comparisonYear;
        info.innerHTML += '<br>';
        info.innerHTML += '<b>Last Update: </b>'+comparisonUpdated;
        info.innerHTML += '<br>';
    };
    div.appendChild(info);
    // also update some redundant fields in the stats tables
    document.getElementById('stats-comp-source').innerHTML = sourceEntry;
    document.getElementById('stats-comp-license').innerHTML = licenseEntry;
    document.getElementById('stats-comp-year').innerHTML = comparisonYear;
    document.getElementById('stats-comp-updated').innerHTML = comparisonUpdated;
};

