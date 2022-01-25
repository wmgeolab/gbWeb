
importScripts('https://cdnjs.cloudflare.com/ajax/libs/Turf.js/6.5.0/turf.min.js');

var DEV = 0; // when set to 1, metadata and source data is read from the 'dev' branch

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

function getDataFromCache(url) {
    // manually load topojson from url
    if (url.endsWith('.topojson')) {
        fetch(url)
            .then(resp => resp.json())
            .then(out => Topoj2Geoj(out))
            //.catch(err => alert('Failed to load data from '+apiUrl+'. Please choose another source. Error: '+JSON.stringify(err)));
    } else if (url.endsWith('.zip')) {
        if (DEV == 1) {
            url = url.replace('/geoContrast/stable/', '/geoContrast/main/');
        };
        var splitUrl = url.split('/');
        var extractName = splitUrl[splitUrl.length-1].replace('.zip','');
        if (extractName.endsWith('.topojson')) {
            fetch(url)
                .then(resp => resp.arrayBuffer() )
                .then(out => Topoj2Geoj( JSON.parse(getZipFileContent(out, extractName))) )
                //.catch(err => alert('Failed to load data from '+apiUrl+'. Please choose another source. Error: '+JSON.stringify(err)));
        };
    };
};

///////////////////////////////////////////////////

function loadFeatures(data) {
    // load geojson objects from geojson string
    features = JSON.parse(data)['features']
    // replace feature geometries with turf objects
    for (i=0; i<features.length; i++) {
        feat = features[i];
        feat = turf.toWgs84(feat); // ol geom web mercator -> turf wgs84
        feat = turf.simplify(feat, {tolerance:0.01, mutate:true})
        features[i].geometry = feat.geometry;
        features[i].properties.area = Math.abs(turf.area(feat));
    };
    return features;
};

function similarity(geom1, geom2) {

    // exit early if no overlap
    /*
    var [xmin1,ymin1,xmax1,ymax1] = turf.bbox(geom1);
    var [xmin2,ymin2,xmax2,ymax2] = turf.bbox(geom2);
    var boxoverlap = (xmin1 <= xmax2 & xmax1 >= xmin2 & ymin1 <= ymax2 & ymax1 >= ymin2)
    if (!boxoverlap) {
        return {'equality':0, 'within':0, 'contains':0}
    };
    */

    // calc intersection
    //alert('calc intersection');
    var isec = turf.intersect(geom1, geom2);
    if (isec == null) {
        // exit early if no intersection
        return {'equality':0, 'within':0, 'contains':0}
    };

    // calc union
    //alert('calc union');
    var union = turf.union(geom1, geom2);

    // calc metrics
    //alert('calc areas');
    var geom1Area = turf.convertArea(Math.abs(turf.area(geom1)),'meters','kilometers');
    var geom2Area = turf.convertArea(Math.abs(turf.area(geom2)),'meters','kilometers');
    var unionArea = turf.convertArea(Math.abs(turf.area(union)), 'meters', 'kilometers');
    var isecArea = turf.convertArea(Math.abs(turf.area(isec)), 'meters', 'kilometers');
    var areas = {'geom1Area':geom1Area, 'geom2Area':geom2Area, 'unionArea':unionArea, 'isecArea':isecArea};
    //alert(JSON.stringify(areas));
    
    var results = {};
    results.equality = isecArea / unionArea;
    results.within = isecArea / geom1Area;
    results.contains = isecArea / geom2Area;
    return results;
};

function calcSpatialRelations(feat, features) {
    var matches = [];
    bbox1 = turf.bboxPolygon(turf.bbox(feat));
    for (feat2 of features) {
        bbox2 = turf.bboxPolygon(turf.bbox(feat2));
        if (!turf.booleanIntersects(bbox1, bbox2)) {
            continue;
        };
        simil = similarity(feat, feat2);
        if (simil.equality > 0.0) {
            matches.push([feat2,simil]);
        };
        i++;
    };
    return matches;
};

function calcAllSpatialRelations(features1, features2) {
    results = [];
    for (let i=0; i<features1.length; i++) {
        console.log(i+1+' of '+features1.length)
        feat1 = features1[i];
        matches = calcSpatialRelations(feat1, features2);
        results.push([feat1, matches]);
    };
    return results;
};

self.onmessage = function(event) {
    var args = event.data;
    console.log('worker received args');
    data1 = args[0];
    data2 = args[1];
    features1 = loadFeatures(data1);
    features2 = loadFeatures(data2);
    console.log('worker: data loaded')
    results = calcAllSpatialRelations(features1, features2);
    console.log('worker: matching done')
    self.postMessage(results);
};
