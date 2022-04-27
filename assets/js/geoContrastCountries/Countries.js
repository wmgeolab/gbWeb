var countryDataLookup = {
    // defines display name and long description for countryData entries
    numSources: {label: 'Num of Sources',
                descr: 'Number of available sources with data for this country and admin level.'},
    maxYear: {label: 'Latest Year',
                descr: 'Latest year for which boundary data is available.'},
    maxUpdated: {label: 'Latest Source Update',
                descr: 'Most recently updated source for this country and admin level.'},
    avgYearLag: {label: 'Source Year Lag',
                descr: 'Average number of years between the year which the boundary is representative of and the year in which the source was last updated.'},
    avgBoundaryCount: {label: 'Administrative Units',
                descr: 'Average number of administrative units for this country and admin level.'},
    minLineRes: {label: 'Finest Line Resolution',
                descr: 'The lowest level of line resolution (average distance spacing between border vertices, in meters) reported across all sources.'},
    maxVertDens: {label: 'Highest Vertex Density',
                descr: 'The highest level of vertex density (average number of vertices for every kilometer of border) reported across all sources.'},
};

function updateCountryDataDropdown() {
    var select = document.getElementById('map-compare');
    for (key in countryDataLookup) {
        var entry = countryDataLookup[key];
        var opt = document.createElement('option');
        opt.value = key;
        opt.innerText = entry['label'];
        select.appendChild(opt);
    };
    // set from get params if specified
    const urlParams = new URLSearchParams(window.location.search);
    var compareField = urlParams.get('compare');
    if ((compareField != null) & (compareField != select.value)) {
        select.value = compareField;
    } else {
        select.value = 'maxYear';
    };
};

function getCountryData(sortKey='name', sortReverse=false) {
    // aggregate country meta
    var collection = document.getElementById('collection').value;
    var adminLevel = document.getElementById('admin-level').value;
    var countryData = [];
    var isoGroups = groupBy(geoContrastMetadata, 'boundaryISO');
    for (iso in isoGroups) {
        if (iso == 'undefined') {continue};
        var isoRows = isoGroups[iso];
        var rows = isoRows;
        if (collection != '') {
            rows = filterBy(rows, 'boundaryCollection', collection);
        };
        var rows = filterBy(rows, 'boundaryType', adminLevel);
        // aggregate row info
        var info = {'iso':iso,
                    'adminLevel':adminLevel,
                    'name':isoRows[0].boundaryName,
                    'sourceRows':rows,
                    'numSources':rows.length};
        if (info['numSources'] == 0) {
            // in order to exclude 0-counts from map
            info['numSources'] = null;
        };
        // max year
        var years = getVals(rows, 'boundaryYearRepresented');
        years = filterByFunc(years, function(yr){return yr!='Unknown'});
        if (years.length) {
            var maxYear = Math.max.apply(Math, years);
        } else {
            var maxYear = null;
        };
        info['maxYear'] = maxYear;
        // max updated
        var pattern = /([0-9]{4})/;
        var updateds = getVals(rows, 'sourceDataUpdateDate');
        var updatedYears = [];
        for (updated of updateds) {
            var updatedYearMatch = updated.match(pattern);
            if (updatedYearMatch != null) {
                var updatedYear = parseInt(updatedYearMatch[0]);
                updatedYears.push(updatedYear);
            };
        };
        if (updatedYears.length) {
            var maxUpdated = Math.max.apply(Math, updatedYears);
        } else {
            var maxUpdated = null;
        };
        info['maxUpdated'] = maxUpdated;
        // avg year lag
        var pattern = /([0-9]{4})/;
        var yrLags = [];
        for (row of rows) {
            var yr = row['boundaryYearRepresented'];
            if (yr != 'Unknown') {
                var updated = row['sourceDataUpdateDate'];
                var updatedYearMatch = updated.match(pattern);
                if (updatedYearMatch != null) {
                    var updatedYear = updatedYearMatch[0];
                    var lag = parseInt(updatedYear) - parseInt(yr);
                    yrLags.push(lag);
                };
            };
        };
        if (yrLags.length > 0) {
            avgYearLag = calcMean(yrLags);
        } else {
            avgYearLag = null;
        };
        info['avgYearLag'] = avgYearLag
        // boundary count
        var counts = getVals(rows, 'boundaryCount');
        counts = counts.map(elem => parseInt(elem, 10)); // str to int
        var newCounts = [];
        for (count of counts) {
            if (count < 50000) { // hacky removing of crazy boundary count for ireland
                newCounts.push(count);
            };
        };
        counts = newCounts;
        if (counts.length > 0) {
            var avgCount = calcMean(counts);
        } else {
            var avgCount = null;
        };
        info['avgBoundaryCount'] = avgCount;
        // min line res
        var lineResVals = getVals(rows, 'statsLineResolution');
        lineResVals = lineResVals.map(elem => parseFloat(elem)); // str to float
        lineResVals = filterByFunc(lineResVals, function(v){return !Number.isNaN(v)})
        var minLineRes = Math.min.apply(Math, lineResVals);
        if (lineResVals.length > 0) {
            var minLineRes = Math.min.apply(Math, lineResVals);
        } else {
            var minLineRes = null;
        };
        info['minLineRes'] = minLineRes;
        // max vert dens
        var vertDensVals = getVals(rows, 'statsVertexDensity');
        vertDensVals = vertDensVals.map(elem => parseFloat(elem)); // str to float
        vertDensVals = filterByFunc(vertDensVals, function(v){return !Number.isNaN(v)})
        if (vertDensVals.length > 0) {
            var maxVertDens = Math.max.apply(Math, vertDensVals);
        } else {
            var maxVertDens = null;
        };
        info['maxVertDens'] = maxVertDens;
        //
        countryData.push(info);
    };
    // determine sort order
    sortBy(countryData, sortKey, sortReverse);
    return countryData;
};

function updateCountriesTable(sortKey=null, sortReverse=false) {
    // get country data
    if (sortKey == null) {
        sortKey = document.getElementById('map-compare').value;
        var revKeys = ['numSources','maxYear','maxUpdated','avgBoundaryCount','maxVertDens'];
        if (revKeys.includes(sortKey)) {
            sortReverse = true;
        };
    };
    var countryData = getCountryData(sortKey, sortReverse);
    // populate the table headers
    var thead = document.querySelector('#countries-table thead');
    thead.innerHTML = '';
    var th = document.createElement('th');
    th.innerText = 'Country';
    thead.appendChild(th);
    for (key in countryDataLookup) {
        var th = document.createElement('th');
        var entry = countryDataLookup[key];
        var span = document.createElement('span');
        span.className = 'tooltip';
        span.setAttribute('data-text', entry['descr']);
        span.innerText = entry['label'];
        if (key == sortKey) {
            span.innerHTML = span.innerText + ' &Darr;';
        };
        th.appendChild(span);
        thead.appendChild(th);
    };
    // calculate the bins
    var values = getVals(countryData, sortKey);
    var bins = calcValueBins(calcEqualBreaks, values);
    if (sortReverse == false) {
        bins.reverse();
    };
    // populate the table
    var tbody = document.querySelector('#countries-table tbody');
    tbody.innerHTML = '';
    for (info of countryData) {
        var row = document.createElement('tr');
        // country name and link
        var cell = document.createElement('td');
        var link = document.createElement('a');
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
            document.getElementById('map').scrollIntoView({
                behavior: "smooth", block: "start", inline: "nearest"
            });
            openCountryPopup(countryFeat);
        };
        cell.appendChild(link);
        row.appendChild(cell);
        // the remainder of the fields
        for (key in countryDataLookup) {
            var cell = document.createElement('td');
            var val = info[key];
            if (val == null) {
                var text = '';
            } else if (val.toString().includes('.')) {
                val = parseFloat(val); 
                var text = val.toFixed(1);
            } else {
                var text = val;
            };
            if (val != null & key == sortKey) {
                var i = getValueBin(parseFloat(val), bins);
                if (i != null) {
                    var color = styleCategories[i].getFill().getColor();
                    var span = document.createElement('span');
                    span.style.backgroundColor = color;
                    span.style.color = 'white';
                    span.style.padding = '3px 10px';
                    span.style.textAlign = 'center';
                    span.style.borderRadius = '3px';
                    span.style.minWidth = '40px';
                    span.innerText = text;
                    cell.appendChild(span);
                };
            } else {
                cell.innerText = text;
            };
            row.appendChild(cell);
        };
        // 
        tbody.appendChild(row);
    };
};
