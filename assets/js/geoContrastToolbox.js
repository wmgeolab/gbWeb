
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






// ------------------------------
// this loads and stores the geocontrast metadata csv

var geoContrastMetadata = null;

function onSuccess (data) {
    geoContrastMetadata = data;
    // update countries
    updateCountryDropdown();
    // update main sources
    updateGbSourceDropdown();
    // update comparison sources
    updateComparisonSourceDropdown();
};
loadGeoContrastMetadata(onSuccess);





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
        // experiment with zipfile reading
        // https://stuk.github.io/jszip/documentation/examples/read-local-file-api.html
        reader = new FileReader();
        reader.onload = function(e) {
            // use reader results to create new source
            var raw = reader.result;
            var zip = new JSZip(raw);
            var paths = [];
            for (filename in zip.files) {
                if (filename.endsWith('.shp')) {
                    var path = file.name + '/' + filename;
                    var displayName = filename;
                    paths.push([path,displayName]);
                };
            };
            updateGbFileDropdown(paths);
        };
        reader.readAsBinaryString(file);
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
        // experiment with zipfile reading
        // https://stuk.github.io/jszip/documentation/examples/read-local-file-api.html
        reader = new FileReader();
        reader.onload = function(e) {
            // use reader results to create new source
            var raw = reader.result;
            var zip = new JSZip(raw);
            var paths = [];
            for (filename in zip.files) {
                if (filename.endsWith('.shp')) {
                    var path = file.name + '/' + filename;
                    var displayName = filename;
                    paths.push([path,displayName]);
                };
            };
            updateComparisonFileDropdown(paths);
        };
        reader.readAsBinaryString(file);
    };
};







////////////////////////
// update file dropdown stuff

function updateGbFileDropdown(paths) {
    // activate and clear the dropdown
    var select = document.getElementById('gb-file-select');
    select.disabled = false;
    select.innerHTML = '';
    // populate the dropdown
    for ([path,displayName] of paths) {
        var opt = document.createElement('option');
        opt.value = path;
        opt.innerText = displayName;
        select.appendChild(opt);
    };
    // force change
    gbFileDropdownChanged();
};

function updateComparisonFileDropdown(paths) {
    // activate and clear the dropdown
    var select = document.getElementById('comparison-file-select');
    select.disabled = false;
    select.innerHTML = '';
    // populate the dropdown
    for ([path,displayName] of paths) {
        var opt = document.createElement('option');
        opt.value = path;
        opt.innerText = displayName;
        select.appendChild(opt);
    };
    // force change
    comparisonFileDropdownChanged();
};







//////////////////////
// file dropdown changed
function gbFileDropdownChanged() {
    var file = document.getElementById('gb-file-input').files[0];
    var path = document.getElementById('gb-file-select').value;
    var subPath = path.split('.zip/')[1]; // only the relative path inside the zipfile
    /*
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
    */
    reader = new FileReader();
    reader.onload = function(e) {
        // open zipfile
        var raw = reader.result;
        var zip = new JSZip(raw);
        // prep args
        var shpString = subPath;
        var dbfString = subPath.replace('.shp', '.dbf');
        // note, below args are only relevant if using shp2geojson
        var encoding = 'utf8';
        var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
        // define projection (the EPSGUser var must be set here so it can be used internally by shp2geojson)
        EPSGUser = proj4('EPSG:4326'); // ignore prj for now
        
        function processData(geojson) {
            // geojson returned
            source = new ol.source.Vector({
                format: new ol.format.GeoJSON({}),
                overlaps: false,
            });
            // update the layer
            updateGbLayerFromGeoJSON(source, geojson, zoomToExtent=true);
        };

        // load dbf and shp, calling returnData once both are loaded
        // ALT1: shp2geojson
        //SHPParser.load(URL.createObjectURL(new Blob([zip.file(shpString).asArrayBuffer()])), shpLoader, processData);
        //DBFParser.load(URL.createObjectURL(new Blob([zip.file(dbfString).asArrayBuffer()])), encoding, dbfLoader, processData);        
        // ALT2: shapefile-js
        // https://github.com/calvinmetcalf/shapefile-js
        var waiting = Promise.all([shp.parseShp(zip.file(shpString).asArrayBuffer()), 
                                    shp.parseDbf(zip.file(dbfString).asArrayBuffer())
                                    ])
        waiting.then(function(result){
                        var geoj = shp.combine(result);
                        processData(geoj);
                    });
    };
    reader.readAsBinaryString(file);
};

function comparisonFileDropdownChanged() {
    var file = document.getElementById('comparison-file-input').files[0];
    var path = document.getElementById('comparison-file-select').value;
    var subPath = path.split('.zip/')[1]; // only the relative path inside the zipfile
    /*
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
    */
    reader = new FileReader();
    reader.onload = function(e) {
        // open zipfile
        var raw = reader.result;
        var zip = new JSZip(raw);
        // prep args
        var shpString = subPath;
        var dbfString = subPath.replace('.shp', '.dbf');
        // note, below args are only relevant if using shp2geojson
        var encoding = 'utf8';
        var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
        // define projection (the EPSGUser var must be set here so it can be used internally by shp2geojson)
        EPSGUser = proj4('EPSG:4326'); // ignore prj for now
        
        function processData(geojson) {
            // geojson returned
            source = new ol.source.Vector({
                format: new ol.format.GeoJSON({}),
                overlaps: false,
            });
            // update the layer
            updateComparisonLayerFromGeoJSON(source, geojson, zoomToExtent=true);
        };

        // load dbf and shp, calling returnData once both are loaded
        // ALT1: shp2geojson
        //SHPParser.load(URL.createObjectURL(new Blob([zip.file(shpString).asArrayBuffer()])), shpLoader, processData);
        //DBFParser.load(URL.createObjectURL(new Blob([zip.file(dbfString).asArrayBuffer()])), encoding, dbfLoader, processData);        
        // ALT2: shapefile-js
        // https://github.com/calvinmetcalf/shapefile-js
        var waiting = Promise.all([shp.parseShp(zip.file(shpString).asArrayBuffer()), 
            shp.parseDbf(zip.file(dbfString).asArrayBuffer())
            ])
        waiting.then(function(result){
            var geoj = shp.combine(result);
            processData(geoj);
        });
    };
    reader.readAsBinaryString(file);
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
        calcBoundaryMakeupTables();
        //calcBoundaryMakeupTables();
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
        calcBoundaryMakeupTables();
        //calcBoundaryMakeupTables();
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
        calcBoundaryMakeupTables();
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
        calcBoundaryMakeupTables();
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
    for (row of geoContrastMetadata) {
        if (row.length <= 1) {
            // ignore empty rows
            continue;
        };
        var name = row.boundaryName;
        var iso = row.boundaryISO;
        if (iso === undefined) {
            // must be other empty rows? 
            continue;
        };
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
        select.value = 'NIC';
    };
    // force dropdown change
    countryChanged();
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
        var iso = row.boundaryISO;
        var lvl = row.boundaryType;
        if (iso == currentIso) {
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
    if ((lvl != null) & (lvl != select.value[3])) {
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
        var iso = row.boundaryISO;
        var lvl = row.boundaryType;
        if (iso == currentIso) {
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
    if ((lvl != null) & (lvl != select.value[3])) {
        select.value = 'ADM'+lvl;
    } else {
        // default comparison level
        select.value = 'ADM1';
    };
    // force dropdown change
    comparisonAdminLevelChanged();
};

// sources

function openGbSourcePopup() {
    popup = document.getElementById('gb-source-popup');
    popup.className = "popup";
    content = popup.querySelector('.popup-content');
    content.scrollTop = 0;
};

function closeGbSourcePopup() {
    popup = document.getElementById('gb-source-popup');
    popup.className = "popup is-hidden is-visually-hidden";
};

function openComparisonSourcePopup() {
    popup = document.getElementById('comparison-source-popup');
    popup.className = "popup";
    content = popup.querySelector('.popup-content');
    content.scrollTop = 0;
};

function closeComparisonSourcePopup() {
    popup = document.getElementById('comparison-source-popup');
    popup.className = "popup is-hidden is-visually-hidden";
};

function updateGbSourceTable() {
    //console.log('update gb source table');
    var currentIso = document.getElementById('country-select').value;
    var currentLevel = document.getElementById('gb-admin-level-select').value;
    // clear sources table
    var table = document.querySelector('#gb-sources-table tbody');
    table.innerHTML = '';
    // get geoContrast metadata
    var metadata = geoContrastMetadata;
    // get list of sources that match the specified country
    var sourceRows = [];
    for (var i = 1; i < metadata.length; i++) {
        var sourceRow = metadata[i];
        if (sourceRow.length <= 1) {
            // ignore empty rows
            i++;
            continue;
        };
        // skip any rows that don't match the country and level
        if (!(sourceRow['boundaryISO']==currentIso & sourceRow['boundaryType']==currentLevel)) {
            continue;
        };
        sourceRows.push(sourceRow);
    };
    
    // sort alphabetically
    sortBy(sourceRows, 'boundarySource-1');
    var currentSource = document.getElementById("gb-boundary-select").value;
    /*
    for (sourceRow of sourceRows) {
        if (sourceRow['boundarySource-1']==currentSource) {
            break;
        };
    };
    console.log(sourceRows);
    sourceRows.splice(sourceRows.indexOf(sourceRow), 1); // remove old
    sourceRows.splice(0, 0, sourceRow); // add to start
    console.log(sourceRows);
    */

    // add row at bottom for local file upload
    uploadRow = {'boundarySource-1':'upload', // 'upload' is the value expected for the dropdown to work
            'boundaryLicense':'-',
            'boundaryYearRepresented':'-',
            'sourceDataUpdateDate':'-',
            'boundaryCount':'-',
            'statsLineResolution':'-',
            'statsVertexDensity':'-'
            };
    sourceRows.push(uploadRow);

    // begin adding data to sources table
    for (sourceRow of sourceRows) {
        var tr = document.createElement('tr');
        if (sourceRow['boundarySource-1']==currentSource) {
            tr.style.backgroundColor = '#F0B323'; //'rgba(255,213,128,0.4)';
            tr.style.color = 'white';
        };
        // select button
        var td = document.createElement('td');
        var but = document.createElement('button');
        but.innerHTML = '&#x2714';
        but.data = sourceRow['boundarySource-1'];
        if (sourceRow['boundarySource-1']==currentSource) {
            but.style.filter = 'brightness(1000)';
        };
        function onclick() {
            var sel = document.getElementById("gb-boundary-select");
            sel.value = this.data;
            // force dropdown change
            gbSourceChanged();
            // close
            closeGbSourcePopup();
        };
        but.onclick = onclick;
        //but.setAttribute('onclick', onclick);
        //but.style.padding = '5px'
        //but.style.margin = 0;
        td.appendChild(but);
        tr.appendChild(td);
        // source name
        var td = document.createElement('td');
        if (sourceRow['boundarySource-1']=='upload') {
            td.innerText = 'Custom: Your Own Boundary';
        } else {
            td.innerText = 'Dataset: '+sourceRow['boundarySource-1'];
        }
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
};

function updateGbSourceDropdown() {
    //alert('update gb boundary dropdown');
    // update source table
    updateGbSourceTable();
    // get current country and level
    var currentIso = document.getElementById('country-select').value;
    var currentLevel = document.getElementById('gb-admin-level-select').value;
    // get source dropdown
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
        var source = row['boundarySource-1'];
        var iso = row.boundaryISO;
        var level = row.boundaryType;
        if ((iso==currentIso) & (level==currentLevel)) {
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
    sources.push('upload');
    // set the source to get-param if specified
    const urlParams = new URLSearchParams(window.location.search);
    var source = urlParams.get('mainSource');
    var defaultSource = 'geoBoundaries (Open)';
    if (source != null & sources.includes(source)) {
        select.value = source;
    } else if (sources.includes(defaultSource)) {
        // default source
        select.value = defaultSource;
    } else {
        // default not available, use first available source
        select.value = sources[0];
    };
    // force dropdown change
    gbSourceChanged();
};

function updateComparisonSourceTable() {
    //console.log('update comparison source table');
    var currentIso = document.getElementById('country-select').value;
    var currentLevel = document.getElementById('comparison-admin-level-select').value;
    // clear sources table
    var table = document.querySelector('#comparison-sources-table tbody');
    table.innerHTML = '';
    // get geoContrast metadata
    var metadata = geoContrastMetadata;
    // get list of sources that match the specified country
    var sourceRows = [];
    for (var i = 1; i < metadata.length; i++) {
        var sourceRow = metadata[i];
        if (sourceRow.length <= 1) {
            // ignore empty rows
            i++;
            continue;
        };
        // skip any rows that don't match the country and level
        if (!(sourceRow['boundaryISO']==currentIso & sourceRow['boundaryType']==currentLevel)) {
            continue;
        };
        sourceRows.push(sourceRow);
    };
    
    // sort alphabetically
    sortBy(sourceRows, 'boundarySource-1');
    var currentSource = document.getElementById("comparison-boundary-select").value;
    /*
    for (sourceRow of sourceRows) {
        if (sourceRow['boundarySource-1']==currentSource) {
            break;
        };
    };
    console.log(sourceRows);
    sourceRows.splice(sourceRows.indexOf(sourceRow), 1); // remove old
    sourceRows.splice(0, 0, sourceRow); // add to start
    console.log(sourceRows);
    */

    // add row at bottom for local file upload
    uploadRow = {'boundarySource-1':'upload', // 'upload' is the value expected for the dropdown to work
            'boundaryLicense':'-',
            'boundaryYearRepresented':'-',
            'sourceDataUpdateDate':'-',
            'boundaryCount':'-',
            'statsLineResolution':'-',
            'statsVertexDensity':'-'
            };
    sourceRows.push(uploadRow);

    // begin adding data to sources table
    for (sourceRow of sourceRows) {
        var tr = document.createElement('tr');
        if (sourceRow['boundarySource-1']==currentSource) {
            tr.style.backgroundColor = '#F0B323'; //'rgba(255,213,128,0.4)';
            tr.style.color = 'white';
        };
        // select button
        var td = document.createElement('td');
        var but = document.createElement('button');
        but.innerHTML = '&#x2714';
        but.data = sourceRow['boundarySource-1'];
        if (sourceRow['boundarySource-1']==currentSource) {
            but.style.filter = 'brightness(1000)';
        };
        function onclick() {
            var sel = document.getElementById("comparison-boundary-select");
            sel.value = this.data;
            // force dropdown change
            comparisonSourceChanged();
            // close
            closeComparisonSourcePopup();
        };
        but.onclick = onclick;
        //but.setAttribute('onclick', onclick);
        //but.style.padding = '5px'
        //but.style.margin = 0;
        td.appendChild(but);
        tr.appendChild(td);
        // source name
        var td = document.createElement('td');
        if (sourceRow['boundarySource-1']=='upload') {
            td.innerText = 'Custom: Your Own Boundary';
        } else {
            td.innerText = 'Dataset: '+sourceRow['boundarySource-1'];
        }
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
};

function updateComparisonSourceDropdown() {
    //alert('update comparison boundary dropdown');
    // update source table
    updateComparisonSourceTable();
    // get current country and level
    var currentIso = document.getElementById('country-select').value;
    var currentLevel = document.getElementById('comparison-admin-level-select').value;
    // get source dropdown
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
        var source = row['boundarySource-1'];
        var iso = row.boundaryISO;
        var level = row.boundaryType;
        if ((iso==currentIso) & (level==currentLevel)) {
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
    sources.push('upload');
    // set the source to get-param if specified
    const urlParams = new URLSearchParams(window.location.search);
    var source = urlParams.get('comparisonSource');
    var defaultSource = 'GADM v3.6';
    if (source != null & sources.includes(source)) {
        select.value = source;
    } else if (sources.includes(defaultSource)) {
        // default source
        select.value = defaultSource;
    } else {
        // default not available, use first available source
        select.value = sources[0];
    };
    // force dropdown change
    comparisonSourceChanged();
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
    window.history.replaceState({path:newUrl}, '', newUrl);
};

// country

function countryChanged() {
    //alert('country changed');
    updateGbAdminLevelDropdown();
    updateComparisonAdminLevelDropdown();
    //updateGetParams();
};

// admin levels

function gbAdminLevelChanged() {
    //alert('comparison admin-level changed');
    updateGbSourceDropdown();
    //updateGetParams();
};

function comparisonAdminLevelChanged() {
    //alert('comparison admin-level changed');
    updateComparisonSourceDropdown();
    //updateGetParams();
};

// sources

function gbSourceChanged() {
    //alert('main source changed');
    // update source table
    updateGbSourceTable();
    // empty misc info
    clearGbInfo();
    clearGbStats();
    clearGbNames();
    clearTotalEquality();
    // clear comparison layer
    clearGbLayer();
    // check which comparison source was selected
    source = document.getElementById('gb-boundary-select').value;
    if (source == 'none' | source == '') {
        // activate admin level button
        document.getElementById('gb-admin-level-select').disabled = false;
        // hide file button div
        document.getElementById('gb-file-div').style.display = 'none';
    } else if (source == 'upload') {
        // disable admin level button
        document.getElementById('gb-admin-level-select').disabled = true;
        // reset
        document.getElementById('gb-file-input').value = null;
        document.getElementById('gb-file-select').innerHTML = '<option value="" disabled selected hidden>(Please select a boundary)</option>';
        document.getElementById('gb-file-select').disabled = true;
        // show file button div
        document.getElementById('gb-file-div').style.display = 'block';
    } else {
        // activate admin level button
        document.getElementById('gb-admin-level-select').disabled = false;
        // hide file button div
        document.getElementById('gb-file-div').style.display = 'none';
        // update main layer with external geoContrast topojson
        updateGbLayer(zoomToExtent=true);
    };
    updateGetParams();
};

function comparisonSourceChanged() {
    //alert('comparison source changed');
    // update source table
    updateComparisonSourceTable();
    // clear misc info
    clearComparisonInfo();
    clearComparisonStats();
    clearComparisonNames();
    clearTotalEquality();
    // clear comparison layer
    clearComparisonLayer();
    // check which comparison source was selected
    source = document.getElementById('comparison-boundary-select').value;
    if (source == 'none' | source == '') {
        // activate admin level button
        document.getElementById('comparison-admin-level-select').disabled = false;
        // hide file button div
        document.getElementById('comparison-file-div').style.display = 'none';
    } else if (source == 'upload') {
        // disable admin level button
        document.getElementById('comparison-admin-level-select').disabled = true;
        // reset
        document.getElementById('comparison-file-input').value = null;
        document.getElementById('comparison-file-select').innerHTML = '<option value="" disabled selected hidden>(Please select a boundary)</option>';
        document.getElementById('comparison-file-select').disabled = true;
        // show file button div
        document.getElementById('comparison-file-div').style.display = 'block';
    } else {
        // activate admin level button
        document.getElementById('comparison-admin-level-select').disabled = false;
        // hide file button div
        document.getElementById('comparison-file-div').style.display = 'none';
        // update main layer with external geoContrast topojson
        updateComparisonLayer(zoomToExtent=true);
    };
    updateGetParams();
};


