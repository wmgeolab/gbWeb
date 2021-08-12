
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
        // year
        var td = document.createElement('td');
        td.innerText = sourceRow.boundaryYearRepresented;
        tr.appendChild(td);
        // unit count
        var td = document.createElement('td');
        tr.appendChild(td);
        // license
        var td = document.createElement('td');
        td.innerText = sourceRow.boundaryLicense;
        tr.appendChild(td);
        //
        table.appendChild(tr);
    };

    // clear feature properties table
    var table = document.getElementById('country-info-table');
    table.innerHTML = '';
    // add feature properties as table rows
    var props = feat.getProperties();
    for (key in props) {
        if (key == 'geometry' | key == 'sourceRows' | key.includes('shape')) {
            continue;
        };
        var tr = document.createElement('tr');
        // key
        var td = document.createElement('td');
        td.innerText = key;
        tr.appendChild(td);
        // value
        var td = document.createElement('td');
        td.innerText = props[key];
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
