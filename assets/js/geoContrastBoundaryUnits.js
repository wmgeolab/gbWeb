
function updateGbNames(features) {
    ////////////////////
    // table div
    // clear old table rows if exists
    var tbody = document.getElementById('gb-names-table-tbody');
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
    updateGbNames(features);
};

function comparisonFieldsDropdownChanged() {
    var features = comparisonLayer.getSource().getFeatures();
    updateComparisonNames(features);
};







////////////////////////////////////////////////
// calc and update boundary unit relationships

function calcBoundaryMakeupTables() {
    var features = gbLayer.getSource().getFeatures();
    var comparisonFeatures = comparisonLayer.getSource().getFeatures();

    // calculate relations
    var [matches1,matches2] = calcAllSpatialRelations(features, comparisonFeatures);

    // update tables
    updateGbMakeupTable(matches1);
    updateComparisonMakeupTable(matches2);
};

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
        related = sortSpatialRelations(related, 'within', 0);
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
                var share = (stats.within * 100).toFixed(1) + '%';
                cellContent += share + ' ' + nameLink + '<br>';
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
        related = sortSpatialRelations(related, 'within', 0);
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
                var share = (stats.within * 100).toFixed(1) + '%';
                cellContent += share + ' ' + nameLink + '<br>';
            };
            cell.innerHTML = cellContent;
            row.appendChild(cell);
            // add row
            tbody.appendChild(row);
        };
    };
};
