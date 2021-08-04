
//-----------------------------------
// this chunk initiates the main map

// layer definitions

var gbStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.4)',
    }),
    stroke: new ol.style.Stroke({
        color: 'rgb(29,107,191)', //'rgb(49, 127, 211)',
        width: 2.5,
    }),
});
var gbLayer = new ol.layer.Vector({
    style: gbStyle,
});

var comparisonStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0)', // fully transparent
    }),
    stroke: new ol.style.Stroke({
        color: 'rgba(255, 0, 0, 0.8)',
        width: 1.5,
        lineDash: [10,10]
    }),
});
var comparisonLayer = new ol.layer.Vector({
    style: comparisonStyle,
});

// map

var map = new ol.Map({
    target: 'map',
    controls: ol.control.defaults().extend([new ol.control.FullScreen(),
                                            new ol.control.ScaleLine({units: 'metric'}),
                                            ]),
    layers: [
    new ol.layer.Tile({
        source: new ol.source.XYZ({
            attributions: 'Satellite Imagery <a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ',
            url:
            'https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=' + 'aknzJQRnZg32XVVPrcYH',
            maxZoom: 20,
            crossOrigin: 'anonymous' // necessary for converting map to img during pdf generation: https://stackoverflow.com/questions/66671183/how-to-export-map-image-in-openlayer-6-without-cors-problems-tainted-canvas-iss
        })}),
        gbLayer,
        comparisonLayer
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([37.41, 8.82]),
        zoom: 4
    })
});

map.on('singleclick', function(evt) {
    // get feats
    let mainFeat = null;
    let comparisonFeat = null;
    map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
        if (layer === gbLayer) {
            mainFeat = feature
        } else if (layer === comparisonLayer) {
            comparisonFeat = feature
        };
    });
    // init and open popup for the found features
    if (mainFeat != null | comparisonFeat != null) {
        openFeatureComparePopup(mainFeat, comparisonFeat);
    };
});

loadGeoContrastMetadata();





///////////////////////
// file upload stuff

/*
<!--for details on local file reading, see https://www.html5rocks.com/en/tutorials/file/dndfiles/ -->
<!--https://web.dev/read-files/ -->
<!--https://gis.stackexchange.com/questions/138155/allow-client-to-upload-layers-to-openlayers-3 -->
<!--https://gis.stackexchange.com/questions/368033/how-to-display-shapefiles-on-an-openlayers-web-mapping-application-that-are-prov
-->
*/

function handleGbFileUpload(evt) {
    var files = evt.target.files;
    
    // get file contents as a base64 encoded url string
    const file = files[0];
    fileExtension = file.name.split('.').pop();
    //alert('local file selected: '+file.name+' - '+fileExtension);
    
    if (fileExtension == 'geojson' | fileExtension == 'json') {
        reader = new FileReader();
        reader.onload = function(e) {
            // use reader results to create new source
            var geojson = reader.result;
            source = new ol.source.Vector({
                format: new ol.format.GeoJSON({}),
                overlaps: false,
            });
            // update the layer
            updateGbLayerFromGeoJSON(source, geojson, zoomToExtent=true);
        };
        // read as data url
        reader.readAsText(file);
    } else if (fileExtension == 'zip') {
        loadshp({
                url: file, // path or your upload file
                encoding: 'utf-8', // default utf-8
                EPSG: 4326, // default 4326
                },
                function(geojson) {
                    // geojson returned
                    source = new ol.source.Vector({
                        format: new ol.format.GeoJSON({}),
                        overlaps: false,
                    });
                    // update the layer
                    updateGbLayerFromGeoJSON(source, geojson, zoomToExtent=true);
                }
        );
    };
};

function handleComparisonFileUpload(evt) {
    var files = evt.target.files;
    
    // get file contents as a base64 encoded url string
    const file = files[0];
    fileExtension = file.name.split('.').pop();
    //alert('local file selected: '+file.name+' - '+fileExtension);
    
    if (fileExtension == 'geojson' | fileExtension == 'json') {
        reader = new FileReader();
        reader.onload = function(e) {
            // use reader results to create new source
            var geojson = reader.result;
            source = new ol.source.Vector({
                format: new ol.format.GeoJSON({}),
                overlaps: false,
            });
            // update the layer
            updateComparisonLayerFromGeoJSON(source, geojson, zoomToExtent=true);
        };
        // read as data url
        reader.readAsText(file);
    } else if (fileExtension == 'zip') {
        loadshp({
                url: file, // path or your upload file
                encoding: 'utf-8', // default utf-8
                EPSG: 4326, // default 4326
                },
                function(geojson) {
                    // geojson returned
                    source = new ol.source.Vector({
                        format: new ol.format.GeoJSON({}),
                        overlaps: false,
                    });
                    // update the layer
                    updateComparisonLayerFromGeoJSON(source, geojson, zoomToExtent=true);
                }
        );
    };
};







////////////////////////
// update map layer stuff

function zoomGbFeature(ID) {
    var features = gbLayer.getSource().getFeatures();
    // find feature
    for (feature of features) {
        if (feature.getId() == ID) {
            break;
        };
    };
    // zoom to extent
    map.getView().fit(feature.getGeometry().getExtent());
    // zoom out a little
    //map.getView().setZoom(map.getView().getZoom()-1);
};

function zoomComparisonFeature(ID) {
    var features = comparisonLayer.getSource().getFeatures();
    // find feature
    for (feature of features) {
        if (feature.getId() == ID) {
            break;
        };
    };
    // zoom to extent
    map.getView().fit(feature.getGeometry().getExtent());
    // zoom out a little
    //map.getView().setZoom(map.getView().getZoom()-1);
};

function updateGbLayer(zoomToExtent=false) {
    // get gb params
    iso = document.getElementById('country-select').value;
    // get comparison params
    level = document.getElementById('gb-admin-level-select').value;
    sourceName = document.getElementById('gb-boundary-select').value;
    if (sourceName == null) {
        return
    };
    // create and set new source
    var source = new ol.source.Vector({
        overlaps: false,
    });
    gbLayer.setSource(source);
    // zoom after source has finished loading
    if (zoomToExtent) {
        source.on('change', function() {
            //alert('main loaded, zoom to bbox: '+source.getExtent());
            // zoom to extent
            map.getView().fit(source.getExtent());
            // zoom out a little
            map.getView().setZoom(map.getView().getZoom()-1);
        });
    };
    // update various divs after source has finished loading
    source.on('change', function() {
        //alert('main loaded, update info');
        features = source.getFeatures();
        updateGbStats(features);
        updateGbFieldsDropdown(features);
        updateGbNames(features);
        updateGbInfo(features);
    });
    // notify if failed to load source
    source.on(['error','featuresloaderror'], function() {
        alert('Failed to load features for '+sourceName+' at '+level+'. Please choose another sourceor level.');
    });
    // load the source
    loadGeoContrastSource(source, iso, level, sourceName);
};

function updateComparisonLayer(zoomToExtent=false) {
    // get gb params
    iso = document.getElementById('country-select').value;
    // get comparison params
    level = document.getElementById('comparison-admin-level-select').value;
    sourceName = document.getElementById('comparison-boundary-select').value;
    if (sourceName == null) {
        return
    };
    // create and set new source
    var source = new ol.source.Vector({
        overlaps: false,
    });
    comparisonLayer.setSource(source);
    // zoom after source has finished loading
    if (zoomToExtent) {
        source.on('change', function() {
            //alert('comparison loaded, zoom to bbox: '+source.getExtent());
            // zoom to extent
            map.getView().fit(source.getExtent());
            // zoom out a little
            map.getView().setZoom(map.getView().getZoom()-1);
        });
    };
    // update various divs after source has finished loading
    source.on('change', function() {
        //alert('comparison loaded, update info');
        features = source.getFeatures();
        updateComparisonStats(features);
        updateComparisonFieldsDropdown(features);
        updateComparisonNames(features);
        updateComparisonInfo(features);
    });
    // notify if failed to load source
    source.on(['error','featuresloaderror'], function() {
        alert('Failed to load features for '+sourceName+' at '+level+'. Please choose another source or level.');
    });
    // load the source
    loadGeoContrastSource(source, iso, level, sourceName);
};

function clearGbLayer() {
    source = new ol.source.Vector({
        url: null,
        format: new ol.format.TopoJSON({}),
        overlaps: false,
    });
    gbLayer.setSource(source);
};

function clearComparisonLayer() {
    source = new ol.source.Vector({
        url: null,
        format: new ol.format.TopoJSON({}),
        overlaps: false,
    });
    comparisonLayer.setSource(source);
};

function updateGbLayerFromGeoJSON(source, geojson, zoomToExtent=false) {
    // set the new source
    gbLayer.setSource(source);
    // zoom to new source after source has finished loading
    if (zoomToExtent) {
        source.on('change', function() {
            //alert('new bbox: '+source.getExtent());
            // get combined extent of gb and uploaded file
            extent = ol.extent.createEmpty();
            ol.extent.extend(extent, source.getExtent());
            ol.extent.extend(extent, comparisonLayer.getSource().getExtent());
            // zoom to extent
            map.getView().fit(extent);
            // zoom out a little
            map.getView().setZoom(map.getView().getZoom()-1);
        });
    };
    // update various divs after source has finished loading
    source.on('change', function() {
        //alert('main loaded, update info');
        features = source.getFeatures();
        updateGbStats(features);
        updateGbFieldsDropdown(features);
        updateGbNames(features);
        updateGbInfo(features);
    });
    // notify if failed to load source
    source.on(['error','featuresloaderror'], function() {
        alert('Failed to load uploaded file.');
    });
    // load the geojson data
    var features = new ol.format.GeoJSON().readFeatures(geojson,
        { featureProjection: map.getView().getProjection() }
    );
    source.addFeatures(features);
};

function updateComparisonLayerFromGeoJSON(source, geojson, zoomToExtent=false) {
    // set the new source
    comparisonLayer.setSource(source);
    // zoom to new source after source has finished loading
    if (zoomToExtent) {
        source.on('change', function() {
            //alert('new bbox: '+source.getExtent());
            // get combined extent of gb and uploaded file
            extent = ol.extent.createEmpty();
            ol.extent.extend(extent, source.getExtent());
            ol.extent.extend(extent, gbLayer.getSource().getExtent());
            // zoom to extent
            map.getView().fit(extent);
            // zoom out a little
            map.getView().setZoom(map.getView().getZoom()-1);
        });
    };
    // update various divs after source has finished loading
    source.on('change', function() {
        //alert('main loaded, update info');
        features = source.getFeatures();
        updateComparisonStats(features);
        updateComparisonFieldsDropdown(features);
        updateComparisonNames(features);
        updateComparisonInfo(features);
    });
    // notify if failed to load source
    source.on(['error','featuresloaderror'], function() {
        alert('Failed to load uploaded file.');
    });
    // load the geojson data
    var features = new ol.format.GeoJSON().readFeatures(geojson,
        { featureProjection: map.getView().getProjection() }
    );
    source.addFeatures(features);
};








//////////////////////////////
// populating the dropdowns

function updateCountryDropdown() {
    // NOTE: requires that geoContrastMetadata has already been populated
    // get country dropdown
    var select = document.getElementById('country-select');
    // clear all existing dropdown options
    select.innerHTML = '';
    // get list of unique countries
    var countriesSeen = [];
    var countries = [];
    for (var i = 1; i < geoContrastMetadata.length; i++) {
        var row = geoContrastMetadata[i];
        if (row.length <= 1) {
            // ignore empty rows
            i++;
            continue;
        };
        var name = row[1];
        var iso = row[2];
        var country = {'name':name, 'iso':iso};
        if (!(countriesSeen.includes(country.iso))) {
            // only add if hasn't already been added
            countries.push(country);
            countriesSeen.push(country.iso);
        };
    };
    // sort
    countries.sort(function( a,b ){ if (a.name > b.name) {return 1} else {return -1} })
    // add new options from geoContrastMetadata
    for (country of countries) {
        var opt = document.createElement("option");
        opt.value = country.iso;
        opt.textContent = country.name;
        select.appendChild(opt);
    };
    // set the country to get-param if specified
    const urlParams = new URLSearchParams(window.location.search);
    var iso = urlParams.get('country');
    if ((iso != null) & (iso != select.value)) {
        select.value = iso;
    } else {
        // default country
        select.value = 'AFG';
    };
};

// sources

function updateGbSourceDropdown() {
    //alert('update gb boundary dropdown');
    // get current country
    var currentIso = document.getElementById('country-select').value;
    // get admin-level dropdown
    var select = document.getElementById('gb-boundary-select');
    var selectVal = select.value;
    // clear all existing dropdown options
    select.innerHTML = '';
    // get geoContrast metadata
    var metadata = geoContrastMetadata;
    // get list of sources that match the specified country
    var sources = [];
    var sourcesSeen = [];
    for (var i = 1; i < metadata.length; i++) {
        var row = metadata[i];
        if (row.length <= 1) {
            // ignore empty rows
            i++;
            continue;
        };
        var source = row[6];
        var iso = row[2];
        var level = row[4];
        if (iso==currentIso) {
            if (!(sourcesSeen.includes(source))) {
                // only add if hasn't already been added
                sourcesSeen.push(source);
                sources.push(source);
            };
        };
    };
    // sort
    sources.sort()
    // add new options from geoContrastMetadata
    for (source of sources) {
        var opt = document.createElement("option");
        opt.value = source;
        opt.textContent = 'Dataset: ' + source;
        select.appendChild(opt);
    };
    // finally add custom upload boundary choice
    opt = document.createElement('option');
    opt.value = 'upload';
    opt.textContent = 'Custom: Your Own Boundary';
    select.appendChild(opt);
    // set the source to get-param if specified
    const urlParams = new URLSearchParams(window.location.search);
    var source = urlParams.get('mainSource');
    if ((source != null) & (source != select.value)) {
        select.value = source;
    } else {
        // default main source
        select.value = 'geoBoundaries (Open)';
    };
    // force dropdown change
    gbSourceChanged();
};

function updateComparisonSourceDropdown() {
    //alert('update comparison boundary dropdown');
    // get current country
    var currentIso = document.getElementById('country-select').value;
    // get admin-level dropdown
    var select = document.getElementById('comparison-boundary-select');
    var selectVal = select.value;
    // clear all existing dropdown options
    select.innerHTML = '';
    // get geoContrast metadata
    var metadata = geoContrastMetadata;
    // get list of sources that match the specified country
    var sources = [];
    var sourcesSeen = [];
    for (var i = 1; i < metadata.length; i++) {
        var row = metadata[i];
        if (row.length <= 1) {
            // ignore empty rows
            i++;
            continue;
        };
        var source = row[6];
        var iso = row[2];
        var level = row[4];
        if (iso==currentIso) {
            if (!(sourcesSeen.includes(source))) {
                // only add if hasn't already been added
                sourcesSeen.push(source);
                sources.push(source);
            };
        };
    };
    // sort
    sources.sort()
    // add new options from geoContrastMetadata
    for (source of sources) {
        var opt = document.createElement("option");
        opt.value = source;
        opt.textContent = 'Dataset: ' + source;
        select.appendChild(opt);
    };
    // finally add custom upload boundary choice
    opt = document.createElement('option');
    opt.value = 'upload';
    opt.textContent = 'Custom: Your Own Boundary';
    select.appendChild(opt);
    // set the source to get-param if specified
    const urlParams = new URLSearchParams(window.location.search);
    var source = urlParams.get('comparisonSource');
    if ((source != null) & (source != select.value)) {
        select.value = source;
    } else {
        // default comparison source
        select.value = 'GADM v3.4';
    };
    // force dropdown change
    comparisonSourceChanged();
};

// admin level

function updateGbAdminLevelDropdown() {
    // NOTE: requires that geoContrastMetadata has already been populated
    // get admin-level dropdown
    var select = document.getElementById('gb-admin-level-select');
    var selectVal = select.value;
    // clear all existing dropdown options
    select.innerHTML = '';
    // get geoContrast metadata
    var metadata = geoContrastMetadata;
    // get current country and comparison source
    var currentIso = document.getElementById('country-select').value;
    var currentSource = document.getElementById('gb-boundary-select').value;
    // if upload, exit early
    if (currentSource == 'upload') {
        // add and set ? option
        var opt = document.createElement("option");
        opt.value = '9';
        opt.textContent = 'Unknown';
        select.appendChild(opt);
        // force dropdown change
        gbAdminLevelChanged();
        return;
    };
    // find available admin-levels for country
    var adminLevelsSeen = [];
    var adminLevels = [];
    for (var i = 1; i < metadata.length; i++) {
        var row = metadata[i];
        if (row.length <= 1) {
            // ignore empty rows
            i++;
            continue;
        };
        var iso = row[2];
        var lvl = row[4];
        var source = row[6];
        if ((iso == currentIso) & (source == currentSource)) {
            if (!(adminLevelsSeen.includes(lvl))) {
                // only add if hasn't already been added
                adminLevels.push(lvl);
                adminLevelsSeen.push(lvl);
            };
        };
    };
    // sort
    adminLevels.sort();
    // add new options from geoContrastMetadata
    for (lvl of adminLevels) {
        var opt = document.createElement("option");
        opt.value = lvl;
        opt.textContent = lvl;
        select.appendChild(opt);
    };
    // set the adm level to get-param if specified
    const urlParams = new URLSearchParams(window.location.search);
    var lvl = urlParams.get('mainLevel');
    if ((lvl != null) & (lvl != '9') & (lvl != select.value[3])) {
        select.value = 'ADM'+lvl;
    } else {
        // default main level
        select.value = 'ADM1';
    };
    // force dropdown change
    gbAdminLevelChanged();
};

function updateComparisonAdminLevelDropdown() {
    // NOTE: requires that geoContrastMetadata has already been populated
    // get admin-level dropdown
    var select = document.getElementById('comparison-admin-level-select');
    var selectVal = select.value;
    // clear all existing dropdown options
    select.innerHTML = '';
    // get geoContrast metadata
    var metadata = geoContrastMetadata;
    // get current country and comparison source
    var currentIso = document.getElementById('country-select').value;
    var currentSource = document.getElementById('comparison-boundary-select').value;
    // if upload, exit early
    if (currentSource == 'upload') {
        // add and set ? option
        var opt = document.createElement("option");
        opt.value = '9';
        opt.textContent = 'Unknown';
        select.appendChild(opt);
        // force dropdown change
        comparisonAdminLevelChanged();
        return;
    };
    // find available admin-levels for country
    var adminLevelsSeen = [];
    var adminLevels = [];
    for (var i = 1; i < metadata.length; i++) {
        var row = metadata[i];
        if (row.length <= 1) {
            // ignore empty rows
            i++;
            continue;
        };
        var iso = row[2];
        var lvl = row[4];
        var source = row[6];
        if ((iso == currentIso) & (source == currentSource)) {
            if (!(adminLevelsSeen.includes(lvl))) {
                // only add if hasn't already been added
                adminLevels.push(lvl);
                adminLevelsSeen.push(lvl);
            };
        };
    };
    // sort
    adminLevels.sort();
    // add new options from geoContrastMetadata
    for (lvl of adminLevels) {
        var opt = document.createElement("option");
        opt.value = lvl;
        opt.textContent = lvl;
        select.appendChild(opt);
    };
    // set the adm level to get-param if specified
    const urlParams = new URLSearchParams(window.location.search);
    var lvl = urlParams.get('comparisonLevel');
    if ((lvl != null) & (lvl != '9') & (lvl != select.value[3])) {
        select.value = 'ADM'+lvl;
    } else {
        // default comparison level
        select.value = 'ADM1';
    };
    // force dropdown change
    comparisonAdminLevelChanged();
};








/////////////////////////////
// dropdown change behavior

function updateGetParams() {
    const urlParams = new URLSearchParams(window.location.search);
    // set country
    var select = document.getElementById('country-select');
    if (select.value == '') {return}; // to avoid errors at startup when not all selects have been populated
    urlParams.set('country', select.value);
    // set main source
    var select = document.getElementById('gb-boundary-select');
    if (select.value == '') {return}; // to avoid errors at startup when not all selects have been populated
    urlParams.set('mainSource', select.value);
    // set comparison source
    var select = document.getElementById('comparison-boundary-select');
    if (select.value == '') {return}; // to avoid errors at startup when not all selects have been populated
    urlParams.set('comparisonSource', select.value);
    // set main adm level
    var select = document.getElementById('gb-admin-level-select');
    if (select.value == '') {return}; // to avoid errors at startup when not all selects have been populated
    urlParams.set('mainLevel', select.value[select.value.length-1]); // only the adm number
    // set comparison adm level
    var select = document.getElementById('comparison-admin-level-select');
    if (select.value == '') {return}; // to avoid errors at startup when not all selects have been populated
    urlParams.set('comparisonLevel', select.value[select.value.length-1]); // only the adm number
    // update url
    //window.location.search = urlParams;
    var newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + urlParams.toString();
    //alert(newUrl);
    window.history.pushState({path:newUrl}, '', newUrl);
};

// country

function countryChanged() {
    //alert('country changed');
    updateGbSourceDropdown();
    updateComparisonSourceDropdown();
    updateGetParams();
};

// sources

function gbSourceChanged() {
    //alert('comparison source changed');
    // check which comparison source was selected
    source = document.getElementById('gb-boundary-select').value;
    if (source == 'none') {
        // update admin dropdown
        updateGbAdminLevelDropdown();
        // hide and reset file button
        document.getElementById('gb-file-input').value = null;
        document.getElementById('gb-file-div').style.display = 'none';
    } else if (source == 'upload') {
        // update admin dropdown (clears all)
        updateGbAdminLevelDropdown();
        // show file button div
        document.getElementById('gb-file-div').style.display = 'block';
    } else {
        // update admin dropdown
        updateGbAdminLevelDropdown();
        // hide and reset file button
        document.getElementById('gb-file-input').value = null;
        document.getElementById('gb-file-div').style.display = 'none';
    };
    updateGetParams();
};

function comparisonSourceChanged() {
    //alert('comparison source changed');
    // check which comparison source was selected
    source = document.getElementById('comparison-boundary-select').value;
    if (source == 'none') {
        // update admin dropdown
        updateComparisonAdminLevelDropdown();
        // hide and reset file button
        document.getElementById('comparison-file-input').value = null;
        document.getElementById('comparison-file-div').style.display = 'none';
    } else if (source == 'upload') {
        // update admin dropdown (clears all)
        updateComparisonAdminLevelDropdown();
        // show file button div
        document.getElementById('comparison-file-div').style.display = 'block';
    } else {
        // update admin dropdown
        updateComparisonAdminLevelDropdown();
        // hide and reset file button
        document.getElementById('comparison-file-input').value = null;
        document.getElementById('comparison-file-div').style.display = 'none';
    };
    updateGetParams();
};

// admin levels

function gbAdminLevelChanged() {
    //alert('main admin-level changed');
    // empty misc info
    clearGbInfo();
    clearGbStats();
    clearGbNames();
    // clear comparison layer
    clearGbLayer();
    // if a geoContrast source is selected
    source = document.getElementById('gb-boundary-select').value;
    if ((source != 'none') & (source != 'upload')) {
        // update main layer with external geoContrast topojson
        updateGbLayer(zoomToExtent=true);
    };
    updateGetParams();
};

function comparisonAdminLevelChanged() {
    //alert('comparison admin-level changed');
    // clear misc info
    clearComparisonInfo();
    clearComparisonStats();
    clearComparisonNames();
    // clear comparison layer
    clearComparisonLayer();
    // if a geoContrast source is selected
    source = document.getElementById('comparison-boundary-select').value;
    if ((source != 'none') & (source != 'upload')) {
        // update comparison layer with external geoContrast topojson
        updateComparisonLayer(zoomToExtent=true);
    };
    updateGetParams();
};


