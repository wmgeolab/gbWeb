
function getVals(xs, key) {
    var vals = [];
    for (x of xs) {
        val = x[key];
        vals.push(val);
    };
    return vals;
};

function groupBy(xs, key) {
    return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};

function filterBy(xs, key, value) {
    var filtered = [];
    for (x of xs) {
        if (x[key] == value) {
            filtered.push(x);
        };
    };
    return filtered;
};

function filterByFunc(xs, func) {
    var filtered = [];
    for (x of xs) {
        if (func(x) == true) {
            filtered.push(x);
        };
    };
    return filtered;
};

function sortBy(xs, key, reversed=false) {
    if (reversed == true) {
        var isTrue = -1;
    } else {
        var isTrue = 1;
    };
    xs.sort(function( a,b ){
        if (a[key] == null) {
            return -isTrue;
        } else if (b[key] == null) {
            return isTrue;
        } else if (a[key] > b[key]) {
            return isTrue;
        } else if (a[key] < b[key]) {
            return -isTrue;
        } else {
            return 0;
        };
    });
};

function getCountryData (sortKey='name', sortReverse=false) {
    // aggregate country meta
    var adminLevel = document.getElementById('admin-level').value;
    var countryData = [];
    var isoGroups = groupBy(geoContrastMetadata, 'boundaryISO');
    for (iso in isoGroups) {
        var isoRows = isoGroups[iso];
        var adminRows = filterBy(isoRows, 'boundaryType', adminLevel);
        // aggregate row info
        var info = {'iso':iso,
                    'adminLevel':adminLevel,
                    'name':isoRows[0].boundaryName,
                    'sourceRows':adminRows,
                    'numSources':adminRows.length};
        var years = getVals(adminRows, 'boundaryYearRepresented');
        years = filterByFunc(years, function(yr){return yr!='Unknown'});
        if (years.length) {
            var maxYear = Math.max.apply(Math, years);
        } else {
            var maxYear = null;
        };
        info.maxYear = maxYear;
        countryData.push(info);
    };
    // determine sort order
    sortBy(countryData, sortKey, sortReverse);
    //alert(getVals(countryData, 'maxYear').join(','))
    return countryData;
};

function updateCountriesTable (sortKey=null, sortReverse=false) {
    // get country data
    if (sortKey == null) {
        sortKey = document.getElementById('map-compare').value;
        var revKeys = ['numSources','maxYear'];
        if (revKeys.includes(sortKey)) {
            sortReverse = true;
        };
    };
    var countryData = getCountryData(sortKey, sortReverse);
    // populate the table
    var tbody = document.querySelector('#countries-table tbody');
    tbody.innerHTML = '';
    for (info of countryData) {
        row = document.createElement('tr');
        // country name and link
        cell = document.createElement('td');
        link = document.createElement('a');
        link.innerText = info.name;
        link.style.cursor = 'pointer';
        let iso = info.iso;
        link.onclick = function(event){
            for (feat of countryLayer.getSource().getFeatures()) {
                if (feat.get('shapeISO') == iso) {
                    countryFeat = feat;
                    break;
                };
            };
            openCountryPopup(countryFeat);
        };
        cell.appendChild(link);
        row.appendChild(cell);
        // maxyear
        cell = document.createElement('td');
        cell.innerText = info.maxYear;
        row.appendChild(cell);
        // sources
        cell = document.createElement('td');
        cell.innerText = info.numSources;
        row.appendChild(cell);
        // 
        tbody.appendChild(row);
    };
};