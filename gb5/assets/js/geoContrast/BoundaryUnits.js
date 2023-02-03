
function clearMatchTable() {
    // clear old table rows
    var tbody = document.querySelector('#match-table tbody');
    tbody.innerHTML = "";
    // clear name fields dropdown
    /*
    var sel = document.getElementById('main-names-table-select');
    sel.innerHTML = "";
    var sel = document.getElementById('comparison-names-table-select');
    sel.innerHTML = "";
    */
    // clear other match things
    document.getElementById('nomatch-div').innerHTML = '';
};

function updateMainNames(features) {
    ////////////////////
    // table div
    // clear old table rows if exists
    var tbody = document.querySelector('#match-table tbody');
    tbody.innerHTML = "";
    // get name from dropdown
    var nameField = document.getElementById('main-names-table-select').value;
    // sort by name
    features.sort(function (a,b) {
                    if (a.getProperties()[nameField] < b.getProperties()[nameField]) {
                        return -1;
                    } else {
                        return 1;
                    };
                });
    // add rows
    i = 1;
    for (feature of features) {
        var row = document.createElement("tr");
        // name
        var cell = document.createElement("td");
        var name = feature.getProperties()[nameField];
        var ID = feature.getId();
        var getFeatureJs = 'mainLayer.getSource().getFeatureById('+ID+')';
        var onclick = 'openFeatureComparePopup('+getFeatureJs+',null)';
        cell.innerHTML = '<a style="cursor:pointer" onclick="'+onclick+'">'+name+'</a>';
        row.appendChild(cell);
        // empty relation
        var cell = document.createElement("td");
        cell.innerText = '-';
        row.appendChild(cell);
        // add row
        tbody.appendChild(row);
    };
};

function percentUniqueField(features, field) {
    var total = features.length;
    var seen = [];
    for (feature of features) {
        var val = feature.getProperties()[field];
        if (!seen.includes(val)) {
            seen.push(val);
        };
    };
    return seen.length / total;
};

function updateMainFieldsDropdown(features) {
    // clear existing fields dropdown
    var sel = document.getElementById('main-names-table-select');
    sel.innerHTML = "";
    // get all fieldnames
    var feature = features[0];
    var fields = [];
    var props = feature.getProperties();
    for (key in props) {
        if (key == 'geometry') {continue};
        fields.push(key);
    };
    // update the dropdown
    var select = document.getElementById('main-names-table-select');
    select.innerHTML = "";
    for (field of fields) {
        var opt = document.createElement('option');
        opt.value = field;
        opt.textContent = field;
        select.appendChild(opt);
    };
    // get geoContrast metadata
    var iso = document.getElementById('country-select').value;
    var level = document.getElementById('main-admin-level-select').value;
    var sourceName = document.getElementById('main-boundary-select').value;
    // get nameField from metadata
    let nameField = '';
    if (sourceName != 'upload') {
        // loop metadata table until reach row matching current iso and level
        var metadata = geoContrastMetadata;
        for (row of metadata) {
            var rowIso = row.boundaryISO;
            var rowLevel = row.boundaryType;
            var rowSource = row['boundarySource-1'];
            if (rowSource == sourceName & rowIso == iso & rowLevel == level) {
                nameField = row.nameField;
                break;
            };
        };
    };
    // auto guess name field if missing or if it doesnt exist
    if (!nameField | !fields.includes(nameField)) {
        fieldUniqueness = {};
        for (field of fields) {
            fieldUniqueness[field] = percentUniqueField(features, field);
        };
        fields.sort(function (a,b) {
            aPriority = a.toLowerCase().includes('name') | a.toLowerCase().includes('adm');
            bPriority = b.toLowerCase().includes('name') | b.toLowerCase().includes('adm');
            if (aPriority & bPriority) {
                // both have 'name' in field, return most unique field
                if (fieldUniqueness[a] > fieldUniqueness[b]) {
                    return -1;
                } else {
                    return 1;
                }
            } else if (aPriority) {
                // field with 'name' in field takes precedence
                return -1;
            } else if (bPriority) {
                // field with 'name' in field takes precedence
                return 1;
            } else {
                // none have 'name' in field, return most unique field
                if (fieldUniqueness[a] > fieldUniqueness[b]) {
                    return -1;
                } else {
                    return 1;
                };
            };
        });
        nameField = fields[0];
    };
    // set name field selector
    select.value = nameField;
};

function updateComparisonFieldsDropdown(features) {
    // clear existing fields dropdown
    var sel = document.getElementById('comparison-names-table-select');
    sel.innerHTML = "";
    // get all fieldnames
    var feature = features[0];
    var fields = [];
    var props = feature.getProperties();
    for (key in props) {
        if (key == 'geometry') {continue};
        fields.push(key);
    };
    // update the dropdown
    var select = document.getElementById('comparison-names-table-select');
    select.innerHTML = "";
    for (field of fields) {
        var opt = document.createElement('option');
        opt.value = field;
        opt.textContent = field;
        select.appendChild(opt);
    };
    // get geoContrast metadata
    var iso = document.getElementById('country-select').value;
    var level = document.getElementById('comparison-admin-level-select').value;
    var sourceName = document.getElementById('comparison-boundary-select').value;
    // get nameField from metadata
    let nameField = '';
    if (sourceName != 'upload') {
        // loop metadata table until reach row matching current iso and level
        var metadata = geoContrastMetadata;
        for (row of metadata) {
            var rowIso = row.boundaryISO;
            var rowLevel = row.boundaryType;
            var rowSource = row['boundarySource-1'];
            if (rowSource == sourceName & rowIso == iso & rowLevel == level) {
                nameField = row.nameField;
                break;
            };
        };
    };
    // auto guess name field if missing or if it doesn't exist
    if (!nameField | !fields.includes(nameField)) {
        fieldUniqueness = {};
        for (field of fields) {
            fieldUniqueness[field] = percentUniqueField(features, field);
        };
        fields.sort(function (a,b) {
            aPriority = a.toLowerCase().includes('name') | a.toLowerCase().includes('adm');
            bPriority = b.toLowerCase().includes('name') | b.toLowerCase().includes('adm');
            if (aPriority & bPriority) {
                // both have 'name' in field, return most unique field
                if (fieldUniqueness[a] > fieldUniqueness[b]) {
                    return -1;
                } else {
                    return 1;
                }
            } else if (aPriority) {
                // field with 'name' in field takes precedence
                return -1;
            } else if (bPriority) {
                // field with 'name' in field takes precedence
                return 1;
            } else {
                // none have 'name' in field, return most unique field
                if (fieldUniqueness[a] > fieldUniqueness[b]) {
                    return -1;
                } else {
                    return 1;
                };
            };
        });
        nameField = fields[0];
    };
    // set name field selector
    select.value = nameField;
};

function mainFieldsDropdownChanged() {
    var comparisonFeatures = comparisonLayer.getSource().getFeatures();
    updateMatchTable(window.bestMatches, comparisonFeatures);
};

function comparisonFieldsDropdownChanged() {
    var comparisonFeatures = comparisonLayer.getSource().getFeatures();
    updateMatchTable(window.bestMatches, comparisonFeatures);
};







////////////////////////////////////////////////
// calc and update boundary unit relationships

function lookupSourceUrl(iso, level, sourceName) {
    // get geoContrast metadata
    var metadata = geoContrastMetadata;
    // find the data url from the corresponding entry in the meta table
    let apiUrl = null;
    for (var i = 1; i < metadata.length; i++) {
        var row = metadata[i];
        if (row.length <= 1) {
            // ignore empty rows
            i++;
            continue;
        };
        var currentIso = row.boundaryISO;
        var currentLevel = row.boundaryType;
        var currentSource = row['boundarySource-1'];
        if ((sourceName == currentSource) & (iso == currentIso) & (level == currentLevel)) {
            // get the data url from the table entry
            apiUrl = row.apiURL;
            break;
        };
    };
    return apiUrl;
};

function calcMatchTable() {
    // clear old table rows if exists
    var tbody = document.querySelector('#match-table tbody');
    tbody.innerHTML = "";

    // update status
    let status = 'Waiting for all data to load...';
    console.log(status.toLowerCase());
    document.querySelector('#total-similarity p').innerText = status;
    
    // get features 
    var features = mainLayer.getSource().getFeatures();
    var comparisonFeatures = comparisonLayer.getSource().getFeatures();
    if (features.length == 0 | comparisonFeatures.length == 0) {
        return;
    };

    // add in main names while calculating
    updateMainNames(features);

    // define on success
    function onSuccess(results) {
        // determine only the best matches
        [features1,features2,allMatches] = results;
        var bestMatches = calcBestMatches(allMatches);
        window.allMatches = allMatches;
        window.bestMatches = bestMatches;

        // calc total equality from the perspective of both sources
        //console.log(allMatches)
        //console.log(bestMatches)
        updateTotalEquality(allMatches, bestMatches, features2);

        // update tables
        updateMatchTable(bestMatches, features2);
    };

    // update status
    status = 'Preparing match data...';
    console.log(status.toLowerCase());
    document.querySelector('#total-similarity p').innerText = status;

    // prep featuredata by serializing to geojson
    var geojWriter = new ol.format.GeoJSON();
    var data1 = geojWriter.writeFeatures(features);
    var data2 = geojWriter.writeFeatures(comparisonFeatures);

    // calculate relations
    function onProgress(i, total) {
        //console.log('worker: matching '+i+' of '+total);
        document.querySelector('#total-similarity p').innerText = 'Matching '+i+' of '+total;
    };
    calcAllSpatialRelations(data1, data2, onSuccess=onSuccess, onProgress=onProgress);
};

function clearTotalEquality() {
    // set div color
    var percDiv = document.querySelector('#total-similarity');
    percDiv.className = 'stats-percent';
    // set bar width
    var percSpan = percDiv.querySelector('span');
    percSpan.style = "--data-width:0%";
    // set bar text
    var percP = percDiv.querySelector('p');
    percP.innerText = "Initiating...";
};

function updateTotalEquality(allMatches, bestMatches, comparisonFeatures) {
    // calc total equality as the intersection of matching features / union of both sources
    var mainArea = 0;
    var comparisonArea = 0;
    var isecArea = 0;
    var matchArea = 0;
    // for each feat add various area measurements
    for (var i=0; i<allMatches.length; i++) {
        [feature,bestMatchFeature,bestStats] = bestMatches[i];
        // calc and add to total main area
        var area = Math.abs(feature.properties.area);
        mainArea += area;
        // add best match/equality area if a match exists
        if (bestStats !== null) {
            matchArea += area * bestStats.within;
        };
        // add to the cumulative sum of all intersecting areas
        var related = allMatches[i][1]; // [feat,related]
        for (x of related) {
            var stats = x[1];
            isecArea += area * stats.within;
        };
    };
    // calc total comparison area
    for (feat2 of comparisonFeatures) {
        var area = Math.abs(feat2.properties.area);
        comparisonArea += area;
    };
    // calc union of isecArea, mainArea, and comparisonArea
    console.log('main area '+mainArea+',comparison area '+comparisonArea);
    var mainDiffArea = (1 - (isecArea / mainArea)) * mainArea;
    var comparisonDiffArea = (1 - (isecArea / comparisonArea)) * comparisonArea;
    var unionArea = mainDiffArea + comparisonDiffArea + isecArea;
    console.log('Adiff,Bdiff,isec: '+[mainDiffArea, comparisonDiffArea, isecArea]);
    console.log('union:'+unionArea);
    console.log('matchArea:'+matchArea);
    // update the percent bar
    percArea = matchArea / unionArea * 100;
    percArea = Math.min(percArea, 100.0); // cap at 100% in case of minor rounding errors
    // set div color
    var percDiv = document.querySelector('#total-similarity');
    if (percArea > 90) {var colorcat = 'high'}
    else if (percArea > 70) {var colorcat = 'mid'}
    else {var colorcat = 'low'};
    var colorcat = 'high';
    percDiv.className = 'stats-percent stats-percent-'+colorcat;
    // set bar width
    var percSpan = percDiv.querySelector('span');
    percSpan.style = "--data-width:"+percArea+"%";
    // set bar text
    var percP = percDiv.querySelector('p');
    percP.innerText = "Share of Total Possible Overlap: " + percArea.toFixed(1) + "%";
};

function updateMatchTable(bestMatches, comparisonFeatures) {
    var mainNameField = document.getElementById('main-names-table-select').value;
    var comparisonNameField = document.getElementById('comparison-names-table-select').value;

    // sort by name
    bestMatches.sort(function (a,b) {
                    if (a[0].properties[mainNameField] < b[0].properties[mainNameField]) {
                        return -1;
                    } else {
                        return 1;
                    };
                });
    
    // populate tables
    // populate match table
    var table = document.getElementById('match-table');
    // clear old table rows if exists
    var tbody = table.querySelector('tbody');
    tbody.innerHTML = "";
    // if any related
    var matchIDs = [];
    if (bestMatches.length) {
        // add rows
        for (x of bestMatches) {
            var [feature,matchFeature,stats] = x;
            var row = document.createElement("tr");
            row.style = "page-break-inside:avoid!important; page-break-after:auto!important";
            // name
            var cell = document.createElement("td");
            var name = feature.properties[mainNameField];
            var ID = feature.id;
            var getFeatureJs = 'mainLayer.getSource().getFeatureById('+ID+')';
            var onclick = 'openFeatureComparePopup('+getFeatureJs+',null)';
            cell.innerHTML = '<a style="cursor:pointer" onclick="'+onclick+'">'+name+'</a>';
            row.appendChild(cell);
            // add match name/link in table cell
            var cell = document.createElement("td");
            var cellContent = '';
            if (matchFeature !== null) {
                var ID2 = matchFeature.id;
                matchIDs.push(ID2);
                var name2 = matchFeature.properties[comparisonNameField];
                var getFeature1Js = 'mainLayer.getSource().getFeatureById('+ID+')';
                var getFeature2Js = 'comparisonLayer.getSource().getFeatureById('+ID2+')';
                var onclick = 'openFeatureComparePopup('+getFeature1Js+','+getFeature2Js+')';
                var nameLink = '<a style="cursor:pointer" onclick="'+onclick+'">'+name2+'</a>';
                var share = (stats.equality * 100).toFixed(1) + '%';
                if (stats.equality > 0.9) {var colorcat = 'high'}
                else if (stats.equality > 0.7) {var colorcat = 'mid'}
                else {var colorcat = 'low'}
                var colorcat = 'high';
                var shareDiv = '<div class="stats-percent stats-percent-'+colorcat+'" style="height:20px; width:50px"><span style="--data-width:'+stats.equality*100+'%"></span><p>'+share+'</p></div>';
                cellContent += '<div style="display:flex; flex-direction:row"><div>' + shareDiv + '</div><div style="word-wrap:break-word">' + nameLink + '</div></div>';
            };
            cell.innerHTML = cellContent;
            row.appendChild(cell);
            // add row
            tbody.appendChild(row);
        };
    };
    // populate nomatch description
    var noMatchDiv = document.getElementById('nomatch-div');
    var noMatchLinks = [];
    // clear old description
    noMatchDiv.innerHTML = "";
    // loop features that didnt match
    for (feature of comparisonFeatures) {
        var ID = feature.id;
        if (!matchIDs.includes(ID)) {
            var name = feature.properties[comparisonNameField];
            var getFeatureJs = 'comparisonLayer.getSource().getFeatureById('+ID+')';
            var onclick = 'openFeatureComparePopup(null,'+getFeatureJs+')';
            var nameLink = '<a style="cursor:pointer" onclick="'+onclick+'">'+name+'</a>';
            link = '<span style="word-wrap:break-word">' + nameLink + '</span>';
            noMatchLinks.push(link);
        };
    };
    // show list of nomatches or none notification
    if (noMatchLinks.length > 0) {
        var comparisonCount = document.getElementById('stats-comp-admincount').innerText;
        noMatchDiv.innerHTML = '<b>' + noMatchLinks.length + ' of ' + comparisonCount + ' boundary units</b> in the comparison source <b>could not be matched</b> to a boundary unit in the main source: '
        noMatchDiv.innerHTML += '<br>' + noMatchLinks.join(', ');
    } else {
        noMatchDiv.innerHTML = '<b>All boundary units</b> in the comparison source were <b>successfully matched</b> to a boundary unit in the main source.'
    };
};
