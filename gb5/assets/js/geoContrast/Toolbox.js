
//-----------------------------------
// this chunk initiates the main map

// layer definitions

var mainStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(220, 220, 255, 0.3)',
    }),
    stroke: new ol.style.Stroke({
        color: 'rgb(29,107,191)', //'rgb(49, 127, 211)',
        width: 2.5,
    }),
});
var mainLayer = new ol.layer.Vector({
    title: "Main boundary",
    style: mainStyle,
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
    title: "Comparison boundary",
    style: comparisonStyle,
});

// map

var baseMaps = {
    'google': new ol.source.XYZ({
        attributions: 'Satellite Imagery <a href="https://www.google.com" target="_blank">&copy; Google</a> ',
        url:
        'https://www.google.com/maps/vt?lyrs=s&x={x}&y={y}&z={z}',
        maxZoom: 20,
        crossOrigin: 'anonymous' // necessary for converting map to img during pdf generation: https://stackoverflow.com/questions/66671183/how-to-export-map-image-in-openlayer-6-without-cors-problems-tainted-canvas-iss
    }),
    'esri': new ol.source.XYZ({
        attributions: 'ESRI World Street Map',
        url:
        'http://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        maxZoom: 20,
        crossOrigin: 'anonymous' // necessary for converting map to img during pdf generation: https://stackoverflow.com/questions/66671183/how-to-export-map-image-in-openlayer-6-without-cors-problems-tainted-canvas-iss
    }),
    'osm': new ol.source.OSM({crossOrigin: 'anonymous'}),
};
var baseMapLayer = new ol.layer.Tile({source: baseMaps.google});

function setBaseMap(name) {
    baseMapLayer.setSource(baseMaps[name]);
};

var map = new ol.Map({
    target: 'map',
    controls: ol.control.defaults({attribution:false}).extend([new ol.control.FullScreen(),
                                            new ol.control.ScaleLine({units: 'metric'}),
                                            ]),
    layers: [
        baseMapLayer,
        mainLayer,
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
        if (layer === mainLayer) {
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

function toggleMainLayer() {
    var check = document.getElementById('toggle-layer-main');
    mainLayer.setVisible(check.checked);
};

function toggleComparisonLayer() {
    var check = document.getElementById('toggle-layer-comparison');
    comparisonLayer.setVisible(check.checked);
};

var switcher = document.getElementById('layer-switcher');
var control = new ol.control.Control({
    element: switcher
});
map.addControl(control);






// ------------------------------
// this loads and stores the geocontrast metadata csv

var geoContrastMetadata = null;

function onSuccess (data) {
    geoContrastMetadata = data;
    // update countries
    updateCountryDropdown();
    // update main sources
    updateMainSourceDropdown();
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

function handleMainFileUpload(evt) {
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
            updateMainLayerFromGeoJSON(source, geojson, zoomToExtent=true);
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
            updateMainFileDropdown(paths);
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

function updateMainFileDropdown(paths) {
    // activate and clear the dropdown
    var select = document.getElementById('main-file-select');
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
    mainFileDropdownChanged();
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
function mainFileDropdownChanged() {
    // first clear previous info
    clearMainInfo();
    clearMainStats();
    clearMatchTable(); //clearMainNames();
    clearTotalEquality();
    // get file info
    var file = document.getElementById('main-file-input').files[0];
    var path = document.getElementById('main-file-select').value;
    var subPath = path.split('.zip/')[1]; // only the relative path inside the zipfile
    // read
    reader = new FileReader();
    reader.onload = function(e) {
        // open zipfile
        var raw = reader.result;
        var zip = new JSZip(raw);
        // prep args
        var shpString = subPath;
        var dbfString = subPath.replace('.shp', '.dbf');
        var prjString = subPath.replace('.shp', '.prj');
        // try to read projection
        let prjData = null;
        try {
            prjRaw = zip.file(prjString).asText();
            //console.log(prjRaw);
            prjData = proj4(prjRaw);
        } catch (err) {
            console.log('could not read prj file, assuming WGS84');
            //console.log(err);
        };
        
        function processData(geojson) {
            // geojson returned
            source = new ol.source.Vector({
                format: new ol.format.GeoJSON({}),
                overlaps: false,
            });
            // update the layer
            updateMainLayerFromGeoJSON(source, geojson, zoomToExtent=true);
        };

        // load using shapefile-js
        // https://github.com/calvinmetcalf/shapefile-js
        var waiting = Promise.all([shp.parseShp(zip.file(shpString).asArrayBuffer(), prjData), 
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
    // first clear previous info
    clearComparisonInfo();
    clearComparisonStats();
    clearMatchTable(); //clearComparisonNames();
    clearTotalEquality();
    // get file info
    var file = document.getElementById('comparison-file-input').files[0];
    var path = document.getElementById('comparison-file-select').value;
    var subPath = path.split('.zip/')[1]; // only the relative path inside the zipfile
    // read
    reader = new FileReader();
    reader.onload = function(e) {
        // open zipfile
        var raw = reader.result;
        var zip = new JSZip(raw);
        // prep args
        var shpString = subPath;
        var dbfString = subPath.replace('.shp', '.dbf');
        var prjString = subPath.replace('.shp', '.prj');
        // try to read projection
        let prjData = null;
        try {
            prjRaw = zip.file(prjString).asText();
            //console.log(prjRaw);
            prjData = proj4(prjRaw);
        } catch (err) {
            console.log('could not read prj file, assuming WGS84');
            //console.log(err);
        };
        
        function processData(geojson) {
            // geojson returned
            source = new ol.source.Vector({
                format: new ol.format.GeoJSON({}),
                overlaps: false,
            });
            // update the layer
            updateComparisonLayerFromGeoJSON(source, geojson, zoomToExtent=true);
        };

        // read using shapefile-js
        // https://github.com/calvinmetcalf/shapefile-js
        var waiting = Promise.all([shp.parseShp(zip.file(shpString).asArrayBuffer(), prjData), 
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

function zoomMainFeature(ID) {
    var features = mainLayer.getSource().getFeatures();
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

function updateMainLayer(zoomToExtent=false) {
    // get main params
    iso = document.getElementById('country-select').value;
    // get comparison params
    level = document.getElementById('main-admin-level-select').value;
    sourceName = document.getElementById('main-boundary-select').value;
    if (sourceName == null) {
        return
    };
    // create and set new source
    var source = new ol.source.Vector({
        overlaps: false,
    });
    mainLayer.setSource(source);
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
        updateMainStats(features);
        updateMainFieldsDropdown(features);
        //updateMainNames(features);
        updateMainInfo(features);
        calcMatchTable();
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
    // get main params
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
        //updateComparisonNames(features);
        updateComparisonInfo(features);
        calcMatchTable();
        //calcBoundaryMakeupTables();
    });
    // notify if failed to load source
    source.on(['error','featuresloaderror'], function() {
        alert('Failed to load features for '+sourceName+' at '+level+'. Please choose another source or level.');
    });
    // load the source
    loadGeoContrastSource(source, iso, level, sourceName);
};

function clearMainLayer() {
    source = new ol.source.Vector({
        url: null,
        format: new ol.format.TopoJSON({}),
        overlaps: false,
    });
    mainLayer.setSource(source);
};

function clearComparisonLayer() {
    source = new ol.source.Vector({
        url: null,
        format: new ol.format.TopoJSON({}),
        overlaps: false,
    });
    comparisonLayer.setSource(source);
};

function updateMainLayerFromGeoJSON(source, geojson, zoomToExtent=false) {
    // set the new source
    mainLayer.setSource(source);
    // zoom to new source after source has finished loading
    if (zoomToExtent) {
        source.on('change', function() {
            //alert('new bbox: '+source.getExtent());
            // get combined extent of main and uploaded file
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
        updateMainStats(features);
        updateMainFieldsDropdown(features);
        //updateMainNames(features);
        updateMainInfo(features);
        calcMatchTable();
    });
    // notify if failed to load source
    source.on(['error','featuresloaderror'], function() {
        alert('Failed to load uploaded file.');
    });
    // load the geojson data
    loadFromGeoJSON(source, geojson);
};

function updateComparisonLayerFromGeoJSON(source, geojson, zoomToExtent=false) {
    // set the new source
    comparisonLayer.setSource(source);
    // zoom to new source after source has finished loading
    if (zoomToExtent) {
        source.on('change', function() {
            //alert('new bbox: '+source.getExtent());
            // get combined extent of main and uploaded file
            extent = ol.extent.createEmpty();
            ol.extent.extend(extent, source.getExtent());
            ol.extent.extend(extent, mainLayer.getSource().getExtent());
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
        //updateComparisonNames(features);
        updateComparisonInfo(features);
        calcMatchTable();
    });
    // notify if failed to load source
    source.on(['error','featuresloaderror'], function() {
        alert('Failed to load uploaded file.');
    });
    // load the geojson data
    loadFromGeoJSON(source, geojson);
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

function updateMainAdminLevelDropdown() {
    // NOTE: requires that geoContrastMetadata has already been populated
    // get admin-level dropdown
    var select = document.getElementById('main-admin-level-select');
    var selectVal = select.value;
    // clear all existing dropdown options
    select.innerHTML = '';
    // get geoContrast metadata
    var metadata = geoContrastMetadata;
    // get current country and comparison source
    var currentIso = document.getElementById('country-select').value;
    var currentSource = document.getElementById('main-boundary-select').value;
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
    mainAdminLevelChanged();
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

function openMainSourcePopup() {
    popup = document.getElementById('main-source-popup');
    popup.className = "popup";
    tableDiv = popup.querySelector('#main-sources-table').parentNode;
    tableDiv.scrollTop = 0;
};

function closeMainSourcePopup() {
    popup = document.getElementById('main-source-popup');
    popup.className = "popup is-hidden is-visually-hidden";
};

function openComparisonSourcePopup() {
    popup = document.getElementById('comparison-source-popup');
    popup.className = "popup";
    tableDiv = popup.querySelector('#comparison-sources-table').parentNode;
    tableDiv.scrollTop = 0;
};

function closeComparisonSourcePopup() {
    popup = document.getElementById('comparison-source-popup');
    popup.className = "popup is-hidden is-visually-hidden";
};

function updateMainSourceTable() {
    //console.log('update main source table');
    var currentIso = document.getElementById('country-select').value;
    var currentLevel = document.getElementById('main-admin-level-select').value;
    // clear sources table
    var table = document.querySelector('#main-sources-table tbody');
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
    var currentSource = document.getElementById("main-boundary-select").value;

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
            var sel = document.getElementById("main-boundary-select");
            sel.value = this.data;
            // force dropdown change
            mainSourceChanged();
            // close
            closeMainSourcePopup();
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
            td.innerText = 'Upload Your Own Boundary';
        } else {
            td.innerText = sourceRow['boundarySource-1'];
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

function updateMainSourceDropdown() {
    //alert('update main boundary dropdown');
    // update source table
    updateMainSourceTable();
    // get current country and level
    var currentIso = document.getElementById('country-select').value;
    var currentLevel = document.getElementById('main-admin-level-select').value;
    // get source dropdown
    var select = document.getElementById('main-boundary-select');
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
        opt.textContent = source;
        select.appendChild(opt);
    };
    // finally add custom upload boundary choice
    opt = document.createElement('option');
    opt.value = 'upload';
    opt.textContent = 'Upload Your Own Boundary';
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
    mainSourceChanged();
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
            td.innerText = 'Upload Your Own Boundary';
        } else {
            td.innerText = sourceRow['boundarySource-1'];
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
        opt.textContent = source;
        select.appendChild(opt);
    };
    // finally add custom upload boundary choice
    opt = document.createElement('option');
    opt.value = 'upload';
    opt.textContent = 'Upload Your Own Boundary';
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
    var select = document.getElementById('main-boundary-select');
    if (select.value == '') {return}; // to avoid errors at startup when not all selects have been populated
    urlParams.set('mainSource', select.value);
    // set comparison source
    var select = document.getElementById('comparison-boundary-select');
    if (select.value == '') {return}; // to avoid errors at startup when not all selects have been populated
    urlParams.set('comparisonSource', select.value);
    // set main adm level
    var select = document.getElementById('main-admin-level-select');
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
    updateMainAdminLevelDropdown();
    updateComparisonAdminLevelDropdown();
    //updateGetParams();
};

// admin levels

function mainAdminLevelChanged() {
    //alert('comparison admin-level changed');
    updateMainSourceDropdown();
    //updateGetParams();
};

function comparisonAdminLevelChanged() {
    //alert('comparison admin-level changed');
    updateComparisonSourceDropdown();
    //updateGetParams();
};

// sources

function mainUploadButtonPushed() {
    val = document.getElementById('main-boundary-select').value;
    if (val == 'upload') {
        // already in upload mode
        // get available sources
        select = document.getElementById('main-boundary-select');
        sourceVals = [];
        for (opt of select.options) {
            sourceVals.push(opt.value);
        };
        // set dropdown value to first available source
        newVal = 'none';
        if (sourceVals.length) {
            newVal = sourceVals[0];
        };
        document.getElementById('main-boundary-select').value = newVal;
    } else {
        // switch to upload mode
        // set dropdown value to upload
        document.getElementById('main-boundary-select').value = 'upload';
    };
    // trigger source changed
    mainSourceChanged();
};

function comparisonUploadButtonPushed() {
    val = document.getElementById('comparison-boundary-select').value;
    if (val == 'upload') {
        // already in upload mode
        // get available sources
        select = document.getElementById('comparison-boundary-select');
        sourceVals = [];
        for (opt of select.options) {
            sourceVals.push(opt.value);
        };
        // set dropdown value to first available source
        newVal = 'none';
        if (sourceVals.length) {
            newVal = sourceVals[0];
        };
        document.getElementById('comparison-boundary-select').value = newVal;
    } else {
        // switch to upload mode
        // set dropdown value to upload
        document.getElementById('comparison-boundary-select').value = 'upload';
    };
    // trigger source changed
    comparisonSourceChanged();
};

function mainSourceChanged() {
    //alert('main source changed');
    // update source table
    updateMainSourceTable();
    // empty misc info
    clearMainInfo();
    clearMainStats();
    clearMatchTable(); //clearMainNames();
    clearTotalEquality();
    // clear comparison layer
    clearMainLayer();
    // check which comparison source was selected
    source = document.getElementById('main-boundary-select').value;
    uploadOnSymbol = '&#x00d7;';
    uploadOffSymbol = '<i class="fa fa-upload" aria-hidden="true"></i>';
    if (source == 'none' | source == '') {
        // activate admin level button
        document.getElementById('main-admin-level-select').style.display = '';
        document.getElementById('main-boundary-select').style.display = '';
        // reset upload button style
        document.getElementById('main-boundary-upload-button').className = "upload-button";
        document.getElementById('main-boundary-upload-button').innerHTML = uploadOffSymbol;
        // hide file button elements
        document.getElementById('main-boundary-upload-title').style.display = 'none';
        document.getElementById('main-file-div').style.display = 'none';
    } else if (source == 'upload') {
        // disable admin level button
        document.getElementById('main-admin-level-select').style.display = 'none';
        document.getElementById('main-boundary-select').style.display = 'none';
        // reset
        document.getElementById('main-file-input').value = null;
        document.getElementById('main-file-select').innerHTML = '<option value="" disabled selected hidden>(Please select a boundary)</option>';
        document.getElementById('main-file-select').disabled = true;
        // change upload button style to active
        document.getElementById('main-boundary-upload-button').className = "upload-button upload-button-active";
        document.getElementById('main-boundary-upload-button').innerHTML = uploadOnSymbol;
        // show file button elements
        document.getElementById('main-boundary-upload-title').style.display = '';
        document.getElementById('main-file-div').style.display = 'block';
    } else {
        // activate admin level button
        document.getElementById('main-admin-level-select').style.display = '';
        document.getElementById('main-boundary-select').style.display = '';
        // reset upload button style
        document.getElementById('main-boundary-upload-button').className = "upload-button";
        document.getElementById('main-boundary-upload-button').innerHTML = uploadOffSymbol;
        // hide file button elements
        document.getElementById('main-boundary-upload-title').style.display = 'none';
        document.getElementById('main-file-div').style.display = 'none';
        // update main layer with external geoContrast topojson
        updateMainLayer(zoomToExtent=true);
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
    clearMatchTable(); //clearComparisonNames();
    clearTotalEquality();
    // clear comparison layer
    clearComparisonLayer();
    // check which comparison source was selected
    source = document.getElementById('comparison-boundary-select').value;
    uploadOnSymbol = '&#x00d7;';
    uploadOffSymbol = '<i class="fa fa-upload" aria-hidden="true"></i>';
    if (source == 'none' | source == '') {
        // activate admin level button
        document.getElementById('comparison-admin-level-select').style.display = '';
        document.getElementById('comparison-boundary-select').style.display = '';
        // reset upload button style
        document.getElementById('comparison-boundary-upload-button').className = "upload-button";
        document.getElementById('comparison-boundary-upload-button').innerHTML = uploadOffSymbol;
        // hide file button elements
        document.getElementById('comparison-boundary-upload-title').style.display = 'none';
        document.getElementById('comparison-file-div').style.display = 'none';
    } else if (source == 'upload') {
        // disable admin level button
        document.getElementById('comparison-admin-level-select').style.display = 'none';
        document.getElementById('comparison-boundary-select').style.display = 'none';
        // reset
        document.getElementById('comparison-file-input').value = null;
        document.getElementById('comparison-file-select').innerHTML = '<option value="" disabled selected hidden>(Please select a boundary)</option>';
        document.getElementById('comparison-file-select').disabled = true;
        // change upload button style to active
        document.getElementById('comparison-boundary-upload-button').className = "upload-button upload-button-active";
        document.getElementById('comparison-boundary-upload-button').innerHTML = uploadOnSymbol;
        // show file button elements
        document.getElementById('comparison-boundary-upload-title').style.display = '';
        document.getElementById('comparison-file-div').style.display = 'block';
    } else {
        // activate admin level button
        document.getElementById('comparison-admin-level-select').style.display = '';
        document.getElementById('comparison-boundary-select').style.display = '';
        // reset upload button style
        document.getElementById('comparison-boundary-upload-button').className = "upload-button";
        document.getElementById('comparison-boundary-upload-button').innerHTML = uploadOffSymbol;
        // hide file button elements
        document.getElementById('comparison-boundary-upload-title').style.display = 'none';
        document.getElementById('comparison-file-div').style.display = 'none';
        // update main layer with external geoContrast topojson
        updateComparisonLayer(zoomToExtent=true);
    };
    updateGetParams();
};


// pdf report

function getPageWrapper() {
    // create page wrapper with padding
    var wrapper = document.createElement('div');
    wrapper.style.padding = '50px';
    // add top header
    var header = document.createElement('header'); //document.getElementById('header').cloneNode(true);
    header.className = "logo";
    header.style = "width:100%; margin-bottom:40px";
    header.innerHTML = `
        <span style="float:left">
            <strong>Boundary comparison report: <span class="countryName"></span></strong>
        </span>
        <span style="float:right">
            William &amp; Mary geoLab
        </span>
    `
    // set country name
    var countrySelect = document.getElementById('country-select');
    var country = countrySelect.options[countrySelect.selectedIndex].text;
    header.querySelector('.countryName').innerText = country;
    wrapper.appendChild(header);
    // add header line
    var hr = document.createElement('hr');
    hr.style = "border-color:#F0B323; background-color:#F0B323; margin:3px; height:6px; margin-bottom:30px"
    wrapper.appendChild(hr);
    // custom css to display links without color
    var style = document.createElement('style');
    style.innerHTML = `
        a {
            color: inherit;
        }
    `;
    wrapper.appendChild(style);
    return wrapper;
}

async function renderFrontPage(mapImgData) {
    // get page wrapper
    var wrapper = getPageWrapper();
    // add top title incl country
    var titleDiv = document.createElement('div');
    titleDiv.innerHTML = `
        <h1 style="margin:10px 0px">Boundary comparison report</h1>
        <h2 id="country-header-for-printing" style="margin:10px 0px"></h2>
        <br>
    `
    var countrySelect = document.getElementById('country-select');
    var country = countrySelect.options[countrySelect.selectedIndex].text;
    titleDiv.querySelector('#country-header-for-printing').innerText = country + ', administrative boundaries';
    wrapper.appendChild(titleDiv);
    // add map
    var mapDiv = document.createElement('div');
    mapDiv.innerHTML = `
        <style>
            #map-image-legend {
                position:absolute;
                top:10px;
                left:10px;
                background-color:white; 
                border-radius:5px; 
                opacity:0.8;
                color:black;
            }

            #map-image-legend #layer-list {
                list-style-type: none;
                margin: 0;
            }
            
            #map-image-legend #layer-list li {
                display: flex;
                flex-direction: row;
                align-items: center;
                margin:5px;
            }
            
            #legend-symbol-main {
                width: 20px;
                border-top: 4px solid #319FD3;
                border-bottom: unset;
                margin: 5px;
            }
            
            #legend-symbol-comparison {
                width: 20px;
                border-top: 4px dashed rgb(255,0,0);
                border-bottom: unset;
                margin: 5px;
            }
        </style>
        <div style="position:relative; width:100%; height:75%; margin:0; padding:0; text-align:center">
            <img id="map-image-for-printing" style="width:100%; height:100%; object-fit:cover" crossorigin="anonymous"/>
            <div id="map-image-legend">
                <ul id="layer-list">
                    <li>
                        <hr id="legend-symbol-main">
                        <span class="main-source-title">Main boundary</span>
                    </li>
                    <li>
                        <hr id="legend-symbol-comparison">
                        <span class="comp-source-title">Comparison boundary</span>
                    </li>
                </ul>
            </div>
        </div>
    `
    wrapper.appendChild(mapDiv);
    // populate legend
    var mainSource = document.querySelector('.main-source-title').innerText;
    var comparisonSource = document.querySelector('.comp-source-title').innerText;
    mapDiv.querySelector('.main-source-title').innerText = mainSource;
    mapDiv.querySelector('.comp-source-title').innerText = comparisonSource;
    // set map img src
    var mapImg = wrapper.querySelector('#map-image-for-printing');
    mapImg.src = mapImgData;
    // render to image
    var config = {};
    document.body.appendChild(wrapper);
    var canvas = await html2canvas(wrapper, config);
    wrapper.remove();
    return canvas;
}

async function renderMetaStatsPage() {
    // get page wrapper
    var wrapper = getPageWrapper();
    // add meta
    var banner = document.getElementById('source-overview-banner').cloneNode(true);
    wrapper.appendChild(banner);
    metaBox = document.getElementById('source-overview').cloneNode(true);
    wrapper.appendChild(metaBox);
    var br = document.createElement('br');
    wrapper.appendChild(br);
    var br = document.createElement('br');
    wrapper.appendChild(br);
    // add stats
    var banner = document.getElementById('source-stats-banner').cloneNode(true);
    wrapper.appendChild(banner);
    statsBox = document.getElementById('source-stats').cloneNode(true);
    wrapper.appendChild(statsBox);
    var br = document.createElement('br');
    wrapper.appendChild(br);
    // render to image
    var config = {};
    document.body.appendChild(wrapper);
    var canvas = await html2canvas(wrapper, config);
    wrapper.remove();
    return canvas;
}

async function renderAgreementPage() {
    // get table row info
    var matchTable = document.getElementById('match-table-div');
    var rows = matchTable.querySelectorAll('tr');
    var rowCount = rows.length;
    var rowNum = 0;
    // add new page for every 20 rows
    var canvases = [];
    while (rowNum <= (rowCount-1)) {
        // get page wrapper
        var wrapper = getPageWrapper();
        // banner
        var banner = document.getElementById('source-contents-banner').cloneNode(true);
        wrapper.appendChild(banner);
        // box
        var box = document.createElement('div');
        box.className = 'box row';
        box.style = "width:100%; margin:0";
        wrapper.appendChild(box);
        // top title and match percent
        if (rowNum == 0) {
            var banner = document.getElementById('source-overlap-total').cloneNode(true);
            box.appendChild(banner);
            var br = document.createElement('br');
            box.appendChild(br);
        } else {
            var banner = document.createElement('div');
            banner.innerHTML = '<br>';
            box.appendChild(banner);
        };
        // table of rows
        var table = document.createElement('table');
        table.style = "margin-left:10px; width:100%";
        var rowEnd = Math.min(rowNum + 20, rowCount-1);
        // add top header row
        if (rowNum != 0) {
            var row = rows[0];
            row.querySelector('#main-names-table-select').value = document.getElementById('#main-names-table-select').value;
            row.querySelector('#comparison-names-table-select').value = document.getElementById('#comparison-names-table-select').value;
            table.appendChild(row.cloneNode(true));
        };
        // add data rows
        var tbody = document.createElement('tbody');
        while (rowNum <= rowEnd) {
            var row = rows[rowNum];
            tbody.appendChild(row.cloneNode(true));
            rowNum += 1;
        };
        table.appendChild(tbody);
        box.appendChild(table);
        // add nomatch info at end of table
        if (rowNum == rowCount) {
            var noMatchDiv = document.getElementById('nomatch-div').cloneNode(true);
            box.appendChild(noMatchDiv);
        };
        // render to image
        var config = {};
        document.body.appendChild(wrapper);
        var canvas = await html2canvas(wrapper, config);
        wrapper.remove();
        canvases.push(canvas);
    };
    return canvases;
}

async function makePDF(mapImgData) {
    // define doc
    var pageWidth = 210;
    var pageHeight = 295; 
    var doc = new jsPDF('portrait', 'mm');

    // loop parts of the image and crop to each page
    var canvas = await renderFrontPage(mapImgData);
    var imgHeight = canvas.height * (pageWidth / canvas.width);
    doc.addImage(canvas.toDataURL("image/jpeg"), 'JPEG', 0, 0, pageWidth, imgHeight);

    var canvas = await renderMetaStatsPage();
    var imgHeight = canvas.height * (pageWidth / canvas.width);
    doc.addPage();
    doc.addImage(canvas.toDataURL("image/jpeg"), 'JPEG', 0, 0, pageWidth, imgHeight);

    var canvases = await renderAgreementPage();
    for (canvas of canvases) {
        var imgHeight = canvas.height * (pageWidth / canvas.width);
        doc.addPage();
        doc.addImage(canvas.toDataURL("image/jpeg"), 'JPEG', 0, 0, pageWidth, imgHeight);
    };

    // show or save pdf
    //doc.output('datauri');
    doc.save('geoBoundaries-comparison.pdf');
    //window.open(doc.output('bloburl'));
    //doc.output('bloburi');

    // reactivate pdf button
    but = document.getElementById('pdf-button');
    but.disabled = false;
    but.innerHTML = 'Generate PDF Report';
}

function renderMapToImgData(processdata) {
    map.once('rendercomplete', function () {
        //alert('rendercomplete');
        const mapCanvas = document.createElement('canvas');
        const size = map.getSize();
        mapCanvas.width = size[0];
        mapCanvas.height = size[1];
        const mapContext = mapCanvas.getContext('2d');
        Array.prototype.forEach.call(
            document.querySelectorAll('#map .ol-layer canvas'),
            function (canvas) {
                if (canvas.width > 0) {
                    const opacity = canvas.parentNode.style.opacity;
                    mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
                    const transform = canvas.style.transform;
                    // Get the transform parameters from the style's transform matrix
                    const matrix = transform
                        .match(/^matrix\(([^\(]*)\)$/)[1]
                        .split(',')
                        .map(Number);
                    // Apply the transform to the export map context
                    CanvasRenderingContext2D.prototype.setTransform.apply(
                        mapContext,
                        matrix
                    );
                    mapContext.drawImage(canvas, 0, 0);
                };
            }
        );
        imgData = mapCanvas.toDataURL();
        //alert('imgdata '+imgData);
        processdata(imgData);
    });
    map.renderSync();
};

function printPageToPDF() {
    // update pdf button
    but = document.getElementById('pdf-button');
    but.innerHTML = '<div style="display:flex; flex-direction:row; align-items:center; gap:3px"><span>Generating</span><img src="images/Spinner-1s-200px.gif" style="max-width:30px; margin-right:-15px"/></div>';
    but.disabled = true;
    // render the map to image data
    // on success, set image data to img src and print the pdf
    var onsuccess = makePDF; 
    renderMapToImgData(onsuccess);
};


