
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
            var rowIso = row.boundaryISO;
            var rowLevel = row.boundaryType;
            var rowSource = row['boundarySource-1'];
            if (rowSource == sourceName & rowIso == iso & rowLevel == level) {
                var gbSource = row['boundarySource-1'];
                if (row['boundarySource-2'] != '') {
                    gbSource += ' / ' + row['boundarySource-2'];
                };
                var gbSourceUrl = parseURL(row.boundarySourceURL);
                var gbLicense = row.boundaryLicense;
                var gbLicenseUrl = parseURL(row.licenseSource);
                var gbYear = row.boundaryYearRepresented;
                var gbUpdated = row.sourceDataUpdateDate;
                var gbDownloadUrl = parseURL(row.apiURL);
                break;
            };
        };
    };
    // populate info
    var info = document.createElement("div");
    info.style = "margin-left:20px; margin-top:10px; font-size:0.7em";
    info.innerHTML = '';
    // action buttons
    if (sourceName == 'upload') {
        info.innerHTML += '<div>';
        info.innerHTML += '<a href="gbContribute.html" target="blank" style="cursor:pointer" onclick="openContributePopup()">Submit to Boundary Repository?</a>';
        info.innerHTML += '</div>';
    } else {
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
        if (sourceName != 'upload') {
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
        };
    };
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
    info.style = "margin-left:20px; margin-top:10px; font-size:0.7em";
    info.innerHTML = '';
    // action buttons
    if (sourceName == 'upload') {
        info.innerHTML += '<div>';
        info.innerHTML += '<a href="gbContribute.html" target="blank" style="cursor:pointer" onclick="openContributePopup()">Submit to Boundary Repository?</a>';
        info.innerHTML += '</div>';
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
    };
    div.appendChild(info);
    // also update some redundant fields in the stats tables
    document.getElementById('stats-comp-source').innerHTML = sourceEntry;
    document.getElementById('stats-comp-license').innerHTML = licenseEntry;
    document.getElementById('stats-comp-year').innerHTML = comparisonYear;
    document.getElementById('stats-comp-updated').innerHTML = comparisonUpdated;
};

