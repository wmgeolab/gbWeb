
importScripts('https://cdnjs.cloudflare.com/ajax/libs/Turf.js/6.5.0/turf.min.js');

function loadFeatures(data) {
    // load geojson objects from geojson string
    allFeatures = JSON.parse(data)['features'];
    // reproject and simplify geometries, plus precalc areas
    features = [];
    for (let i=0; i<allFeatures.length; i++) {
        feat = allFeatures[i];
        try {
            feat = turf.toWgs84(feat); // ol geom web mercator -> turf wgs84
            feat = turf.simplify(feat, {tolerance:0.01, mutate:true})
            feat.properties.area = turf.convertArea(Math.abs(turf.area(feat)),'meters','kilometers');
            features.push(feat);
        } catch(error) {
            console.warn('feature '+i+' could not be loaded: ' + error);
            console.warn(feat.properties);
        };
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
    var geom1Area = geom1.properties.area;
    var geom2Area = geom2.properties.area;
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
    };
    return matches;
};

function calcAllSpatialRelations(features1, features2) {
    results = [];
    let total = features1.length;
    for (let i=0; i<total; i++) {
        // report progress
        let status = 'processing';
        let msg = [i+1,total];
        self.postMessage([status,msg]);
        // process
        feat1 = features1[i];
        matches = calcSpatialRelations(feat1, features2);
        results.push([feat1, matches]);
    };
    return results;
};

self.onmessage = function(event) {
    var args = event.data;
    console.log('worker received args');
    // load into feature geojsons
    data1 = args[0];
    data2 = args[1];
    features1 = loadFeatures(data1);
    features2 = loadFeatures(data2);
    console.log('worker: data loaded')
    // calc relations
    matches = calcAllSpatialRelations(features1, features2);
    console.log('worker: matching done')
    // strip off geometry to avoid returning too much data
    for (feat1 of features1) {delete feat1['geometry']};
    for (feat2 of features2) {delete feat2['geometry']};
    let status = 'finished';
    let msg = [features1,features2,matches];
    self.postMessage([status,msg]);
};
