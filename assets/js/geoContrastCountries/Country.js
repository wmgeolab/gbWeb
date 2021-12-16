
// popup behavior
function getLargestExtent(feat) {
    // get extent of the largest polygon for multipolygons
    // ie to focus only on the most relevant "main" area of a feature
    var geom = feat.getGeometry();
    var typ = geom.getType();
    if (typ.includes('Multi')) {
        var maxArea = 0;
        var maxGeom = null;
        for (poly of geom.getPolygons()) {
            area = Math.abs(poly.getArea());
            if (area > maxArea) {maxArea = area; maxGeom = poly};
        };
        return maxGeom.getExtent();
    } else {
        return geom.getExtent();
    };
};

function openCountryPopup (feat) {
    // first, zoom to the feature country
    var extent = getLargestExtent(feat); //feat.getGeometry().getExtent();
    map.getView().fit(extent,
                        {'duration':500, 'padding':[20,20,20,20]},
                        );
    // make popup visible at pointer position
    var [xmin,ymin,xmax,ymax] = extent;
    var x = (xmin+xmax)/2.0;
    var y = (ymin+ymax)/2.0;
    var coord = [x,y]; 
    popup.setPosition(coord);
    // populate contents
    content = document.getElementById('popup-content');
    // set title
    var title = feat.get('name') + ' - ' + feat.get('adminLevel');
    document.getElementById('country-details-title').innerText = title;
    // clear sources table
    var table = document.getElementById('country-details-source-table');
    table.innerHTML = '';
    // get selected comparison indicator
    var comparisonSelector = document.getElementById('map-compare');
    for (opt of comparisonSelector.options) {
        if (opt.selected==true) {
            break;
        };
    };
    // translate aggregate map comparison to source indicator
    var comparison2indic = {
        numSources: 'boundarySource-2',
        maxYear: 'boundaryYearRepresented',
        maxUpdated: 'sourceDataUpdateDate',
        avgYearLag: 'boundaryYearRepresented',
        avgBoundaryCount: 'boundaryCount', 
        minLineRes: 'statsLineResolution',
        maxVertDens: 'statsVertexDensity'
    };
    var indic = comparison2indic[opt.value];
    // add table header
    var header = document.createElement('thead');
    table.appendChild(header);
    // source col
    var col = document.createElement('th');
    col.innerText = "Source";
    header.appendChild(col)
    // indicator col
    var col = document.createElement('th');
    col.innerText = opt.innerText;
    header.appendChild(col)
    // add to sources table
    var body = document.createElement('tbody');
    table.appendChild(body);
    var props = feat.getProperties();
    for (sourceRow of props.sourceRows) {
        var tr = document.createElement('tr');
        // source name and link
        var td = document.createElement('td');
        var sourceNameLink = document.createElement('a');
        sourceNameLink.innerText = sourceRow['boundarySource-1'];
        sourceNameLink.href = "geoContrast.html?country="+sourceRow.boundaryISO+'&mainSource='+sourceRow['boundarySource-1']+'&mainLevel='+sourceRow.boundaryType[3];
        td.appendChild(sourceNameLink);
        tr.appendChild(td);
        // indicator value
        var td = document.createElement('td');
        var val = sourceRow[indic];
        if (indic == 'statsLineResolution') {
            val = parseFloat(val).toFixed(1) + ' m';
        } else if (indic == 'statsVertexDensity') {
            val = parseFloat(val).toFixed(1) + ' / km';
        };
        td.innerText = val;
        tr.appendChild(td);
        //
        body.appendChild(tr);
    };
};

function closeCountryPopup () {
    popup.setPosition(undefined); // hides the popup
    return false;
};

// attach country popup to map
var popup = new ol.Overlay({
    element: document.getElementById('country-popup'),
});
map.addOverlay(popup);

// bind popup on click event
map.on('singleclick', function(evt) {
    // get feats
    let clickedFeat = null;
    map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
        clickedFeat = feature;
    });
    // open popup for the found features
    if (clickedFeat != null) {
        openCountryPopup(clickedFeat);
    } else {
        closeCountryPopup();
    };
});

