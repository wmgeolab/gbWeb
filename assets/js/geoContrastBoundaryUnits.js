
function clearMatchTable() {
    // clear old table rows
    var tbody = document.querySelector('#match-table tbody');
    tbody.innerHTML = "";
    var tbody = document.querySelector('#nomatch-table tbody');
    tbody.innerHTML = "";
    // clear name fields dropdown
    /*
    var sel = document.getElementById('gb-names-table-select');
    sel.innerHTML = "";
    var sel = document.getElementById('comparison-names-table-select');
    sel.innerHTML = "";
    */
};

/*
function clearGbNames() {
    // clear old table rows
    var tbody = document.getElementById('gb-names-table-tbody');
    tbody.innerHTML = "";
    // clear name fields dropdown
    var sel = document.getElementById('gb-names-table-select');
    sel.innerHTML = "";
};

function clearComparisonNames() {
    // clear old table rows
    var tbody = document.getElementById('comparison-names-table-tbody');
    tbody.innerHTML = "";
    // clear name fields dropdown
    var sel = document.getElementById('comparison-names-table-select');
    sel.innerHTML = "";
};
*/

function updateGbNames(features) {
    ////////////////////
    // table div
    // clear old table rows if exists
    var tbody = document.querySelector('#match-table tbody');
    tbody.innerHTML = "";
    // get name from dropdown
    var nameField = document.getElementById('gb-names-table-select').value;
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
        var getFeatureJs = 'gbLayer.getSource().getFeatureById('+ID+')';
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

/*
function updateComparisonNames(features) {
    ////////////////////
    // table div
    // clear old table rows if exists
    var tbody = document.getElementById('comparison-names-table-tbody');
    tbody.innerHTML = "";
    // get name from dropdown
    var nameField = document.getElementById('comparison-names-table-select').value;
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
        var getFeatureJs = 'comparisonLayer.getSource().getFeatureById('+ID+')';
        var onclick = 'openFeatureComparePopup(null,'+getFeatureJs+')';
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
*/

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

function updateGbFieldsDropdown(features) {
    // clear existing fields dropdown
    var sel = document.getElementById('gb-names-table-select');
    sel.innerHTML = "";
    // get all unique text fieldnames
    var feature = features[0];
    var fields = [];
    var props = feature.getProperties();
    for (key in props) {
        if (key == 'geometry') {continue};
        val = props[key];
        if (typeof val === 'string') {
            if (percentUniqueField(features, key) > 0.9) {
                fields.push(key);
            };
        };
    };
    // update the dropdown
    var select = document.getElementById('gb-names-table-select');
    select.innerHTML = "";
    for (field of fields) {
        var opt = document.createElement('option');
        opt.value = field;
        opt.textContent = field;
        select.appendChild(opt);
    };
    // auto set name field
    fields.sort(function (a,b) {
        if (a.toLowerCase().includes('name') & b.toLowerCase().includes('name')) {
            if (a.length < b.length) {
                return -1;
            } else {
                return 1;
            }
        } else if (a.toLowerCase().includes('name')) {
            return -1;
        } else if (b.toLowerCase().includes('name')) {
            return 1;
        } else {
            return 0;
        };
    });
    autofield = fields[0];
    select.value = autofield;
};

function updateComparisonFieldsDropdown(features) {
    // clear existing fields dropdown
    var sel = document.getElementById('comparison-names-table-select');
    sel.innerHTML = "";
    // get all unique text fieldnames
    var feature = features[0];
    var fields = [];
    var props = feature.getProperties();
    for (key in props) {
        if (key == 'geometry') {continue};
        val = props[key];
        if (typeof val === 'string') {
            if (percentUniqueField(features, key) > 0.9) {
                fields.push(key);
            };
        };
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
    // auto set name field
    fields.sort(function (a,b) {
        if (a.toLowerCase().includes('name') & b.toLowerCase().includes('name')) {
            if (a.length < b.length) {
                return -1;
            } else {
                return 1;
            }
        } else if (a.toLowerCase().includes('name')) {
            return -1;
        } else if (b.toLowerCase().includes('name')) {
            return 1;
        } else {
            return 0;
        };
    });
    autofield = fields[0];
    select.value = autofield;
};

function gbFieldsDropdownChanged() {
    var features = gbLayer.getSource().getFeatures();
    //updateGbNames(features);
};

function comparisonFieldsDropdownChanged() {
    var features = comparisonLayer.getSource().getFeatures();
    //updateComparisonNames(features);
};







////////////////////////////////////////////////
// calc and update boundary unit relationships

function calcMatchTable() {
    // clear old table rows if exists
    var tbody = document.querySelector('#match-table tbody');
    tbody.innerHTML = "";
    
    // get features 
    var features = gbLayer.getSource().getFeatures();
    var comparisonFeatures = comparisonLayer.getSource().getFeatures();
    if (features.length == 0 | comparisonFeatures.length == 0) {
        return;
    };
    console.log('finding matches');

    // add in main names while calculating
    updateGbNames(features);

    // define on success
    function onSuccess(allMatches) {
        // determine only the best matches
        var bestMatches = calcBestMatches(allMatches);

        // calc total equality from the perspective of both sources
        console.log(allMatches)
        console.log(bestMatches)
        updateTotalEquality(allMatches, bestMatches, comparisonFeatures);

        // update tables
        updateMatchTable(bestMatches, comparisonFeatures);
    };

    // calculate relations
    calcAllSpatialRelations(features, comparisonFeatures, onSuccess=onSuccess);
};

/*
function calcBoundaryMakeupTables() {
    var features = gbLayer.getSource().getFeatures();
    var comparisonFeatures = comparisonLayer.getSource().getFeatures();
    if (features.length == 0 | comparisonFeatures.length == 0) {
        return;
    };
    console.log('finding matches');

    // define on success
    function onSuccess(matches1, matches2) {
        // calc total equality from the perspective of main source only (not for comparison source)
        updateTotalEquality(matches1);

        // update tables
        updateGbMakeupTable(matches1);
        updateComparisonMakeupTable(matches2);
    };

    // calculate relations
    calcAllSpatialRelations(features, comparisonFeatures, onSuccess=onSuccess);
};
*/

function clearTotalEquality() {
    // set div color
    var percDiv = document.querySelector('#total-similarity');
    percDiv.className = 'stats-percent';
    // set bar width
    var percSpan = percDiv.querySelector('span');
    percSpan.style = "--data-width:0%";
    // set bar text
    var percP = percDiv.querySelector('p');
    percP.innerText = "Finding matches...";
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
        var area = Math.abs(feature.getGeometry().getArea());
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
        var area = Math.abs(feat2.getGeometry().getArea());
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
    percP.innerText = "Source Overlap: " + percArea.toFixed(1) + "%";
};

/*
function updateTotalEquality(matches) {
    // calc total equality from the perspective of main source only (not for comparison source)
    var cumEquality = 0;
    var possibleEquality = 0;
    // for each feat add to total equality
    for (match of matches) {
        var [feature,related] = match;
        // sort
        related = sortSpatialRelations(related, 'equality', 0);
        // add best equality
        if (related.length > 0) {
            best = related[0];
            stats = best[1];
            cumEquality += stats.equality;
        };
        possibleEquality += 1;
    };
    // update the percent bar
    percEquality = cumEquality / possibleEquality * 100;
    // set div color
    var percDiv = document.querySelector('#total-similarity');
    if (percEquality > 90) {var colorcat = 'high'}
    else if (percEquality > 70) {var colorcat = 'mid'}
    else {var colorcat = 'low'};
    var colorcat = 'high';
    percDiv.className = 'stats-percent stats-percent-'+colorcat;
    // set bar width
    var percSpan = percDiv.querySelector('span');
    percSpan.style = "--data-width:"+percEquality+"%";
    // set bar text
    var percP = percDiv.querySelector('p');
    percP.innerText = "Source Similarity: " + percEquality.toFixed(1) + "%";
};
*/

function updateMatchTable(bestMatches, comparisonFeatures) {
    var mainNameField = document.getElementById('gb-names-table-select').value;
    var comparisonNameField = document.getElementById('comparison-names-table-select').value;

    // sort by name
    bestMatches.sort(function (a,b) {
                    if (a[0].getProperties()[mainNameField] < b[0].getProperties()[mainNameField]) {
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
            var name = feature.getProperties()[mainNameField];
            var ID = feature.getId();
            var getFeatureJs = 'gbLayer.getSource().getFeatureById('+ID+')';
            var onclick = 'openFeatureComparePopup('+getFeatureJs+',null)';
            cell.innerHTML = '<a style="cursor:pointer" onclick="'+onclick+'">'+name+'</a>';
            row.appendChild(cell);
            // add match name/link in table cell
            var cell = document.createElement("td");
            var cellContent = '';
            if (matchFeature !== null) {
                var ID2 = matchFeature.getId();
                matchIDs.push(ID2);
                var name2 = matchFeature.getProperties()[comparisonNameField];
                var getFeature1Js = 'gbLayer.getSource().getFeatureById('+ID+')';
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
    // populate nomatch table
    var table = document.getElementById('nomatch-table')
    var noMatchCount = 0;
    // clear old table rows if exists
    var tbody = table.querySelector('tbody');
    tbody.innerHTML = "";
    // loop features that didnt match
    for (feature of comparisonFeatures) {
        var ID = feature.getId();
        if (!matchIDs.includes(ID)) {
            noMatchCount += 1;
            var row = document.createElement("tr");
            row.style = "page-break-inside:avoid!important; page-break-after:auto!important";
            // empty first column
            var cell = document.createElement("td");
            row.appendChild(cell);
            // name
            var cell = document.createElement("td");
            var name = feature.getProperties()[comparisonNameField];
            var getFeatureJs = 'comparisonLayer.getSource().getFeatureById('+ID+')';
            var onclick = 'openFeatureComparePopup(null,'+getFeatureJs+')';
            var nameLink = '<a style="cursor:pointer" onclick="'+onclick+'">'+name+'</a>';
            var stats = {equality:0}
            var share = (stats.equality * 100).toFixed(1) + '%';
            var colorcat = 'low';
            var shareDiv = '<div class="stats-percent stats-percent-'+colorcat+'" style="height:20px; width:50px"><span style="--data-width:'+stats.equality*100+'%"></span><p>'+share+'</p></div>';
            cell.innerHTML = '<div style="display:flex; flex-direction:row"><div>' + shareDiv + '</div><div style="word-wrap:break-word">' + nameLink + '</div></div>';
            row.appendChild(cell);
            tbody.appendChild(row);
        };
    };
    // show nomatch table or none notification
    console.log(noMatchCount);
    if (noMatchCount > 0) {
        document.getElementById('nomatch-none-notification').style.display = 'none';
        document.getElementById('nomatch-div').style.display = 'block';
    } else {
        document.getElementById('nomatch-none-notification').style.display = 'block';
        document.getElementById('nomatch-div').style.display = 'none';  
    };
};

/*
function updateGbMakeupTable(matches) {
    var mainNameField = document.getElementById('gb-names-table-select').value;
    var comparisonNameField = document.getElementById('comparison-names-table-select').value;

    // sort by name
    matches.sort(function (a,b) {
                    if (a[0].getProperties()[mainNameField] < b[0].getProperties()[mainNameField]) {
                        return -1;
                    } else {
                        return 1;
                    };
                });

    // sort and filter matches above threshold
    var makeup = [];
    for (match of matches) {
        var [feature,related] = match;
        // sort
        related = sortSpatialRelations(related, 'equality', 0);
        // keep any that are significant from the perspective of either boundary (>1% of area)
        var significantRelated = [];
        for (x of related) {
            if ((x[1].within >= 0.01) | (x[1].contains >= 0.01)) { // x[1] is the stats dict
                significantRelated.push(x)
            };
        };
        if (significantRelated.length > 0) {
            makeup.push([feature,significantRelated]);
        };
    };
    
    // populate tables
    // populate makeup table
    var table = document.getElementById('gb-names-table')
    // clear old table rows if exists
    var tbody = document.getElementById('gb-names-table-tbody');
    tbody.innerHTML = "";
    // if any related
    if (makeup.length) {
        // add rows
        for (x of makeup) {
            var [feature,related] = x;
            var row = document.createElement("tr");
            row.style = "page-break-inside:avoid!important; page-break-after:auto!important";
            // name
            var cell = document.createElement("td");
            var name = feature.getProperties()[mainNameField];
            var ID = feature.getId();
            var getFeatureJs = 'gbLayer.getSource().getFeatureById('+ID+')';
            var onclick = 'openFeatureComparePopup('+getFeatureJs+',null)';
            cell.innerHTML = '<a style="cursor:pointer" onclick="'+onclick+'">'+name+'</a>';
            row.appendChild(cell);
            // find related boundaries
            var cell = document.createElement("td");
            var cellContent = '';
            for (x of related) {
                [matchFeature,stats] = x;
                var ID2 = matchFeature.getId();
                var name2 = matchFeature.getProperties()[comparisonNameField];
                var getFeature1Js = 'gbLayer.getSource().getFeatureById('+ID+')';
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
                // only show the first most similar match, exit early
                break;
            };
            cell.innerHTML = cellContent;
            row.appendChild(cell);
            // add row
            tbody.appendChild(row);
        };
    };
};

function updateComparisonMakeupTable(matches) {
    var mainNameField = document.getElementById('gb-names-table-select').value;
    var comparisonNameField = document.getElementById('comparison-names-table-select').value;

    // sort by name
    matches.sort(function (a,b) {
                    if (a[0].getProperties()[comparisonNameField] < b[0].getProperties()[comparisonNameField]) {
                        return -1;
                    } else {
                        return 1;
                    };
                });

    // sort and filter matches above threshold
    var makeup = [];
    for (match of matches) {
        var [feature,related] = match;
        // sort
        related = sortSpatialRelations(related, 'equality', 0);
        // keep any that are significant from the perspective of either boundary (>1% of area)
        var significantRelated = [];
        for (x of related) {
            if ((x[1].within >= 0.01) | (x[1].contains >= 0.01)) { // x[1] is the stats dict
                significantRelated.push(x)
            };
        };
        if (significantRelated.length > 0) {
            makeup.push([feature,significantRelated]);
        };
    };
    
    // populate tables
    // populate makeup table
    var table = document.getElementById('comparison-names-table')
    // clear old table rows if exists
    var tbody = document.getElementById('comparison-names-table-tbody');
    tbody.innerHTML = "";
    // if any related
    if (makeup.length) {
        // add rows
        for (x of makeup) {
            var [feature,related] = x;
            var row = document.createElement("tr");
            row.style = "page-break-inside:avoid!important; page-break-after:auto!important";
            // name
            var cell = document.createElement("td");
            var name2 = feature.getProperties()[comparisonNameField];
            var ID2 = feature.getId();
            var getFeatureJs = 'comparisonLayer.getSource().getFeatureById('+ID2+')';
            var onclick = 'openFeatureComparePopup(null,'+getFeatureJs+')';
            cell.innerHTML = '<a style="cursor:pointer" onclick="'+onclick+'">'+name2+'</a>';
            row.appendChild(cell);
            // find related boundaries
            var cell = document.createElement("td");
            var cellContent = '';
            for (x of related) {
                [matchFeature,stats] = x;
                var ID = matchFeature.getId();
                var name = matchFeature.getProperties()[mainNameField];
                var getFeature1Js = 'gbLayer.getSource().getFeatureById('+ID+')';
                var getFeature2Js = 'comparisonLayer.getSource().getFeatureById('+ID2+')';
                var onclick = 'openFeatureComparePopup('+getFeature1Js+','+getFeature2Js+')';
                var nameLink = '<a style="cursor:pointer" onclick="'+onclick+'">'+name+'</a>';
                var share = (stats.equality * 100).toFixed(1) + '%';
                if (stats.equality > 0.9) {var colorcat = 'high'}
                else if (stats.equality > 0.7) {var colorcat = 'mid'}
                else {var colorcat = 'low'}
                var colorcat = 'high';
                var shareDiv = '<div class="stats-percent stats-percent-'+colorcat+'" style="height:20px; width:50px"><span style="--data-width:'+stats.equality*100+'%"></span><p>'+share+'</p></div>';
                cellContent += '<div style="display:flex; flex-direction:row"><div>' + shareDiv + '</div><div style="word-wrap:break-word">' + nameLink + '</div></div>';
                // only show the first most similar match, exit early
                break;
            };
            cell.innerHTML = cellContent;
            row.appendChild(cell);
            // add row
            tbody.appendChild(row);
        };
    };
};
*/
