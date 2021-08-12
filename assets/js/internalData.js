
function loadFromTopoJSON(source, topoj) {
    //alert('reading features...');
    var format = new ol.format.TopoJSON({});
    var features = format.readFeatures(topoj, {
                                                dataProjection: 'EPSG:4326',
                                                featureProjection: 'EPSG:3857'
                                            }
                                        );
    //alert(features.length + ' features fetched');
    // set ids
    var i = 1;
    for (feat of features) {
        feat.setId(i);
        i++;
    };
    // add
    source.addFeatures(features);
    //alert('features added');
};

function loadFromGeoJSON(source, geoj) {
    //alert('reading features...');
    var format = new ol.format.GeoJSON({});
    var features = format.readFeatures(geoj, {
                                                dataProjection: 'EPSG:4326',
                                                featureProjection: 'EPSG:3857'
                                            }
                                        );
    //alert(features.length + ' features fetched');
    // set ids
    var i = 1;
    for (feat of features) {
        feat.setId(i);
        i++;
    };
    // add
    source.addFeatures(features);
    //alert('features added');
};

function loadGeoContrastSource(source, iso, level, sourceName) {
    // get geoContrast metadata
    var metadata = geoContrastMetadata;
    // find the data url from the corresponding entry in the meta table
    for (var i = 1; i < metadata.length; i++) {
        var row = metadata[i];
        if (row.length <= 1) {
            // ignore empty rows
            i++;
            continue;
        };
        var currentIso = row.boundaryISO;
        var currentLevel = row.boundaryType;
        var currentSource = row['boundarySource-1'];
        if ((sourceName == currentSource) & (iso == currentIso) & (level == currentLevel)) {
            // get the data url from the table entry
            var apiUrl = row.apiURL;
            break;
        };
    };
    // manually load topojson from url
    fetch(apiUrl)
        .then(resp => resp.json())
        .then(out => loadFromTopoJSON(source, out))
        //.catch(err => alert('Failed to load data from '+apiUrl+'. Please choose another source. Error: '+JSON.stringify(err)));
};

function loadGeoContrastMetadata(onSuccess) {
    // fetch metadata
    // determine url of metadata csv
    url = 'https://raw.githubusercontent.com/wmgeolab/geoContrast/main/releaseData/geoContrast-meta.csv';
    // define error and success
    function error (err, file, inputElem, reason) {
        alert('geoContrast metadata csv failed to load: '+url);
    };
    function success (result) {
        //alert('load success');
        // process csv data using custom function
        onSuccess(result['data']);
    };
    // parse
    Papa.parse(url,
                {'download':true,
                'header':true,
                'complete':success,
                'error':error,
                }
    );
};

