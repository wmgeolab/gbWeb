
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
    //alert('update comparison info');
    // info div
    var div = document.getElementById('gb-info-div');
    // clear
    div.innerHTML = '';
    // get geoContrast metadata
    var iso = document.getElementById('country-select').value;
    var level = document.getElementById('gb-admin-level-select').value;
    var sourceName = document.getElementById('gb-boundary-select').value;
    var metadata = geoContrastMetadata;
    // loop metadata table until reach row matching current iso and level
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
    // populate info
    var info = document.createElement("div");
    info.style = "margin-left:20px; margin-top:15px; font-size:0.7em";
    info.innerHTML = '';
    info.innerHTML += '<div><b style="vertical-align:middle">Actions: </b><a href="'+gbDownloadUrl+'" download><img src="https://icons-for-free.com/iconfiles/png/512/file+download+24px-131985219323992544.png" height="20px" style="vertical-align:middle"></a></div>';
    info.innerHTML += '<b>Source: </b><a href="'+gbSourceUrl+'" target="_blank">'+gbSource+'</a><br>';
    info.innerHTML += '<b>License: </b><a href="'+gbLicenseUrl+'" target="_blank">'+gbLicense+'</a><br>';
    info.innerHTML += '<b>Year the Boundary Represents: </b>'+gbYear+'<br>';
    info.innerHTML += '<b>Last Update: </b>'+gbUpdated;
    div.appendChild(info);

    // also update some redundant fields in the stats tables
    document.getElementById('stats-gb-source').innerHTML = '<a href="'+gbSourceUrl+'" target="_blank">'+gbSource+'</a>';
    document.getElementById('stats-gb-license').innerHTML = '<a href="'+gbLicenseUrl+'" target="_blank">'+gbLicense+'</a>';
    document.getElementById('stats-gb-year').innerHTML = gbYear;
    document.getElementById('stats-gb-updated').innerHTML = gbUpdated;
};

function updateComparisonInfo(features) {
    //alert('update comparison info');
    // info div
    var div = document.getElementById('comparison-info-div');
    // clear
    div.innerHTML = '';
    // get geoContrast metadata
    var iso = document.getElementById('country-select').value;
    var level = document.getElementById('comparison-admin-level-select').value;
    var sourceName = document.getElementById('comparison-boundary-select').value;
    var metadata = geoContrastMetadata;
    // loop metadata table until reach row matching current iso and level
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
            var comparisonDownloadUrl =  parseURL(row[18]);
            break;
        };
    };
    // populate info
    var info = document.createElement("div");
    info.style = "margin-left:20px; margin-top:15px; font-size:0.7em";
    info.innerHTML = '';
    info.innerHTML += '<div><b style="vertical-align:middle">Actions: </b><a href="'+comparisonDownloadUrl+'" download><img src="https://icons-for-free.com/iconfiles/png/512/file+download+24px-131985219323992544.png" height="20px" style="vertical-align:middle"></a></div>';
    info.innerHTML += '<b>Source: </b><a href="'+comparisonSourceUrl+'" target="_blank">'+comparisonSource+'</a><br>';
    info.innerHTML += '<b>License: </b><a href="'+comparisonLicenseUrl+'" target="_blank">'+comparisonLicense+'</a><br>';
    info.innerHTML += '<b>Year the Boundary Represents: </b>'+comparisonYear+'<br>';
    info.innerHTML += '<b>Last Update: </b>'+comparisonUpdated;
    div.appendChild(info);

    // also update some redundant fields in the stats tables
    document.getElementById('stats-comp-source').innerHTML = '<a href="'+comparisonSourceUrl+'" target="_blank">'+comparisonSource+'</a>';
    document.getElementById('stats-comp-license').innerHTML = '<a href="'+comparisonLicenseUrl+'" target="_blank">'+comparisonLicense+'</a>';
    document.getElementById('stats-comp-year').innerHTML = comparisonYear;
    document.getElementById('stats-comp-updated').innerHTML = comparisonUpdated;
};

