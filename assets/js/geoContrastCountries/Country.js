
function openCountryPopup (feat) {
    // show popup
    document.getElementById('country-popup').className = 'popup';

    // set title
    var title = feat.get('name') + ' - ' + feat.get('adminLevel');
    document.getElementById('country-info-title').innerText = title;

    // clear sources table
    var table = document.querySelector('#country-sources-table tbody');
    table.innerHTML = '';
    // add to sources table
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
        // license
        var td = document.createElement('td');
        td.innerText = sourceRow.boundaryLicense;
        tr.appendChild(td);
        // year
        var td = document.createElement('td');
        td.innerText = sourceRow.boundaryYearRepresented;
        tr.appendChild(td);
        // updated
        var td = document.createElement('td');
        td.innerText = sourceRow.sourceDataUpdateDate;
        tr.appendChild(td);
        // unit count
        var td = document.createElement('td');
        td.innerText = sourceRow.boundaryCount;
        tr.appendChild(td);
        // min line res
        var td = document.createElement('td');
        td.innerText = parseFloat(sourceRow.statsLineResolution).toFixed(1) + ' m';
        tr.appendChild(td);
        // max vert dens
        var td = document.createElement('td');
        td.innerText = parseFloat(sourceRow.statsVertexDensity).toFixed(1) + ' / km';
        tr.appendChild(td);
        //
        table.appendChild(tr);
    };

    // scroll to the top
    document.getElementById('close-country-popup').scrollIntoView(true);
    // add feats to the popup comparison map
    countryPopupMap.updateSize(); // otherwise will remain hidden until window resize
    var geojWriter = new ol.format.GeoJSON();
    var geoj = geojWriter.writeFeatureObject(feat);
    var geojColl = {type:'FeatureCollection', features:[geoj]};
    updateCountryPopupMap(geojColl);
};

function updateCountryPopupMap(geojColl) {
    // set source
    var source = new ol.source.Vector({
        features: new ol.format.GeoJSON().readFeatures(geojColl,
                                                        {} // featureProjection: featureCompareMap.getView().getProjection() }
        ),
    });
    countryPopupLayer.setSource(source);

    // zoom to combined extents
    var extent = ol.extent.createEmpty();
    extent = ol.extent.extend(extent, source.getExtent());
    countryPopupMap.getView().fit(extent);

    // zoom out a little
    countryPopupMap.getView().setZoom(countryPopupMap.getView().getZoom()-0.5);
};
