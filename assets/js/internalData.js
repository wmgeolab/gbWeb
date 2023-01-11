
var GITBRANCH = 'stable'; // metadata and source data is read from this branch

function getZipFileContent(zipdata, name) {
    console.log('unzipping...');
    var zip = new JSZip(zipdata);
    var topodata = zip.file(name).asText();
    console.log('unzipped '+name); //+' '+topodata.substring(0,1000));
    return topodata;
};

function Topoj2Geoj(topoj) {
    function transformArcs(arcs, scale, translate) {
        for (let i = 0, ii = arcs.length; i < ii; ++i) {
            transformArc(arcs[i], scale, translate);
        }
    };
    function transformArc(arc, scale, translate) {
        let x = 0;
        let y = 0;
        for (let i = 0, ii = arc.length; i < ii; ++i) {
            const vertex = arc[i];
            x += vertex[0];
            y += vertex[1];
            vertex[0] = x;
            vertex[1] = y;
            transformVertex(vertex, scale, translate);
        }
    };
    function transformVertex(vertex, scale, translate) {
        vertex[0] = vertex[0] * scale[0] + translate[0];
        vertex[1] = vertex[1] * scale[1] + translate[1];
    };
    function concatenateArcs(indices, arcs) {
        const coordinates = [];
        let index, arc;
        for (let i = 0, ii = indices.length; i < ii; ++i) {
          index = indices[i];
          if (i > 0) {
            // splicing together arcs, discard last point
            coordinates.pop();
          }
          if (index >= 0) {
            // forward arc
            arc = arcs[index];
          } else {
            // reverse arc
            arc = arcs[~index].slice().reverse();
          }
          // THIS IS THE FIX
          //coordinates.push.apply(coordinates, arc);
          for (p of arc) {
            coordinates.push(p);
          };
        }
        // provide fresh copies of coordinate arrays
        /*
        for (let j = 0, jj = coordinates.length; j < jj; ++j) {
          coordinates[j] = coordinates[j].slice();
        }
        */
        return coordinates;
    };
    function readPolygonGeometry(object, arcs) {
        const coordinates = [];
        for (let i = 0, ii = object['arcs'].length; i < ii; ++i) {
          coordinates[i] = concatenateArcs(object['arcs'][i], arcs);
        }
        return coordinates; //new Polygon(coordinates);
    };
    function readMultiPolygonGeometry(object, arcs) {
        const coordinates = [];
        for (let i = 0, ii = object['arcs'].length; i < ii; ++i) {
          // for each polygon
          const polyArray = object['arcs'][i];
          const ringCoords = [];
          for (let j = 0, jj = polyArray.length; j < jj; ++j) {
            // for each ring
            ringCoords[j] = concatenateArcs(polyArray[j], arcs);
          }
          coordinates[i] = ringCoords;
        }
        return coordinates; //new MultiPolygon(coordinates);
    };
    const GEOMETRY_READERS = {
        //'Point': readPointGeometry,
        //'LineString': readLineStringGeometry,
        'Polygon': readPolygonGeometry,
        //'MultiPoint': readMultiPointGeometry,
        //'MultiLineString': readMultiLineStringGeometry,
        'MultiPolygon': readMultiPolygonGeometry,
    };
    // transform quantized coordinates
    var transform = topoj['transform']
    if (transform) {
        scale = transform['scale'];
        translate = transform['translate'];
        transformArcs(topoj['arcs'], scale, translate);
    };
    // make geojson
    var layers = Object.keys(topoj.objects);
    var lyr = layers[0];
    var features = [];
    for (obj of topoj.objects[lyr].geometries) {
        var reader = GEOMETRY_READERS[obj.type];
        var coords = reader(obj, topoj.arcs);
        var geom = {'type':obj.type, 'coordinates':coords};
        var feat = {'type':'Feature',
                    'geometry':geom,
                    'properties':obj.properties};
        //console.log(feat);
        features.push(feat);
    };
    var geoj = {'type':'FeatureCollection',
                'features':features};
    return geoj;
};

/*
function fixTopoJSON(topoj) {
    console.log('truncating...');
    for (i=0; i<topoj.arcs.length; i++) {
        // truncate to first 100,000 points
        arc = topoj.arcs[i];
        if (arc.length > 100*1000) {
            var newArc = arc.slice(0, 100*1000);
            // add the last point
            var lastpoint = arc[arc.length-1];
            newArc.push(lastpoint);
            topoj.arcs[i] = newArc;
        };
        //console.log(topoj.arcs[i].length);
    };
    console.log('done truncating');
};
*/

function loadFromTopoJSON(source, topoj) {
    //alert('reading features...');
    
    // TEMPORARY: 
    // manually convert to geojson and redirect to geojson loading
    // fixes call stack error inherent in ol.format.TopoJSON reader
    console.log('topoj 2 geoj...')
    var geoj = Topoj2Geoj(topoj);
    console.log('geoj loaded');
    // redirect to geojson loader
    loadFromGeoJSON(source, geoj);
    // exit early
    return

    // standard openlayers approach
    var format = new ol.format.TopoJSON({});

    // debug explore arc lengths as a cause of maximum call stack error
    //console.log('topo objects '+topoj.objects.data.geometries.length)
    //console.log('topo arcs '+topoj.arcs.length)
    /*
    var layers = Object.keys(topoj.objects);
    var lyr = layers[0];
    for (geom of topoj.objects[lyr].geometries) {
        var polys = geom.arcs;
        if (geom.type == 'Polygon') {
            polys = [geom.arcs]
        };
        //console.log(polys)
        var coords = [];
        var count = 0;
        for (poly of polys) {
            for (ring of poly) {
                for (i of ring) {
                    i = Math.abs(i);
                    arc = topoj.arcs[i];
                    //console.log('arc '+i+' of '+topoj.arcs.length)
                    console.log(coords.length+' + '+arc.length)
                    coords.push.apply(coords, arc);
                    count += arc.length;
                };
            };
        };
        console.log('obj point count '+count)
    };
    */
    //console.log('topo arc1 '+topoj.arcs[0].length)
    //console.log('topo obj1 '+JSON.stringify(topoj.objects.data.geometries[0]))
    //console.log('topo obj1 arcs '+topoj.objects.data.geometries[0].arcs.length)
    //console.log('topo obj1 total points '+count)

    // read the features
    //console.log('loading features...')
    var features = format.readFeatures(topoj, {
                                                dataProjection: 'EPSG:4326',
                                                featureProjection: 'EPSG:3857'
                                            }
                                        );
    //console.log('features loaded');
    // set ids
    var i = 1;
    for (feat of features) {
        feat.setId(i);
        i++;
    };
    // add
    //console.log('adding features...');
    source.addFeatures(features);
    //console.log('features added');
};

function loadFromGeoJSON(source, geoj) {
    //alert('reading features...');
    var format = new ol.format.GeoJSON({});
    var allFeatures = format.readFeatures(geoj, {
                                                dataProjection: 'EPSG:4326',
                                                featureProjection: 'EPSG:3857'
                                            }
                                        );
    //alert(features.length + ' features fetched');
    // set ids
    var i = 1;
    var features = [];
    for (feat of allFeatures) {
        if (feat.getGeometry() == null) {
            // ignore null geoms
            continue;
        };
        features.push(feat);
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
    if (apiUrl.endsWith('.topojson')) {
        fetch(apiUrl)
            .then(resp => resp.json())
            .then(out => loadFromTopoJSON(source, out))
            //.catch(err => alert('Failed to load data from '+apiUrl+'. Please choose another source. Error: '+JSON.stringify(err)));
    } else if (apiUrl.endsWith('.zip')) {
        if (GITBRANCH != 'stable') {
            // HACKY FIX:
            // all metadata api urls are set to stable
            // until this is changed, hacky replace with branch name for now
            apiUrl = apiUrl.replace('/geoContrast/stable/', '/geoContrast/'+GITBRANCH+'/');
        };
        var splitUrl = apiUrl.split('/');
        var extractName = splitUrl[splitUrl.length-1].replace('.zip','');
        if (extractName.endsWith('.topojson')) {
            /*
            JSZipUtils.getBinaryContent(apiUrl, function(err, data) {
                console.log(err);
                console.log(data);
                topoj = JSON.parse(getZipFileContent(data, extractName));
                loadFromTopoJSON(source, topoj);
            })
            */
            fetch(apiUrl)
                .then(resp => resp.arrayBuffer() )
                .then(out => loadFromTopoJSON( source, JSON.parse(getZipFileContent(out, extractName))) )
                //.catch(err => alert('Failed to load data from '+apiUrl+'. Please choose another source. Error: '+JSON.stringify(err)));
        };
    };
};

function loadGeoContrastMetadata(onSuccess) {
    // fetch metadata
    // determine url of metadata csv
    url = 'https://raw.githubusercontent.com/wmgeolab/geoContrast/18c5aff53ae64b38803b01786da78b63344c5809/releaseData/geoContrast-meta.csv';
    if (GITBRANCH != 'stable') {
        // HACKY FIX:
        // all metadata api urls are set to stable
        // until this is changed, hacky replace with branch name for now
        url = url.replace('/geoContrast/stable/', '/geoContrast/'+GITBRANCH+'/');
    };
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

