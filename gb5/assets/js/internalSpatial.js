
// create global reference to worker performing source matching
var matchingWorker = null; 

// spatial stats stuff
function calcSpatialStats(features) {
    var stats = {};
    var circumf = 0;
    var vertices = 0;
    var area = 0;
    var segLengths = [];
    for (feat of features) {
        var geom = feat.getGeometry();
        circumf += ol.sphere.getLength(geom);
        area += ol.sphere.getArea(geom);
        if (geom.getType() == 'Polygon') {
            // wrap so can treat at multipolygon
            var polys = [geom.getCoordinates()];
        } else {
            var polys = geom.getCoordinates();
        };
        for (poly of polys) {
            for (ring of poly) {
                vertices += ring.length;
            };
            /*
            // poly level aggregate stats
            var ext = poly[0]; // polygon exterior
            vertices += ext.length;
            var line = turf.lineString(ext);
            circumf += turf.length(line);
            var polygon = turf.polygon([ext]);
            area += turf.area(polygon);
            // calc detailed segment lengths
            //for (var i = 1; i < (ext.length-1); i++) {
            //	v1 = ext[i];
            //	v2 = ext[i+1];
            //	var len = turf.length(turf.lineString([v1,v2]));
            //	segLengths.push(len);
            //};
            */
        };
    };
    // store final stats
    stats.adminCount = features.length;
    stats.area = area / 1000000.0; // convert from m2 to km2
    circumf = circumf / 1000.0; // convert from m to km
    stats.circumf = circumf;
    stats.vertices = vertices;
    stats.avgLineResolution = circumf / vertices * 1000; // ie avg vertext-to-vertex segment length ie resolution in meters
    stats.avgLineDensity = vertices / circumf; // ie avg number of vertices per 1 km distance ie density (inverse of line resolution)
    //segLengths.sort(function(a, b) {return a - b});
    //stats.medLineResolution = segLengths[Math.round(segLengths.length/2)]  / 1000.0; // convert from m to km, even though supposed to be km
    return stats;
};

//-----------------------------------
// this chunk defines boundary comparisons

// helpers
function geoj2turf(geoj) {
    if (geoj.type == 'Polygon') {
        geom = turf.polygon(geoj.coordinates)
    } else if (geoj.type == 'MultiPolygon') {
        geom = turf.multiPolygon(geoj.coordinates)
    };
    return geom;
};

// feature to feature similarity
function robustTurfArea(geom) {
    // WARNING: turf calculates wildly incorrect area estimates, see instead 'olArea'
    // make sure isec rings are correctly sorted (otherwise will get negative area)
    // see https://github.com/Turfjs/turf/issues/1482
    // https://github.com/w8r/martinez/issues/91
    var geomType = turf.getType(geom);
    var coords = turf.getCoords(geom);
    alert('area calc for '+geomType+' '+coords.length+' '+JSON.stringify(coords));
    if (geomType == 'Polygon') {
        // treat as a multipolygon w one polygon
        coords = [coords];
    };
    // reorganize the polygon rings to make sure it's correct
    var allRings = [];
    for (poly of coords) {
        for (ring of poly) {
            /*if (ring[0] != ring[ring.length-1]) {
                ring.push(ring[ring.length-1]);
            };*/
            allRings.push(ring);
        };
    };
    var multiLines = turf.multiLineString(allRings);
    var featureColl = turf.polygonize(multiLines);
    // cumulate the area of each resulting polygon
    var area = 0;
    var pi = 0;
    turf.featureEach(featureColl, function (currentFeature, featureIndex) {
        area = area + turf.area(currentFeature);
        pi++;
    });
    alert('old '+turf.area(geom)+' new '+area);

    /*
    // calc area one ring at a time
    area = 0;
    let ip = 0;
    for (poly of coords) {
        let ir = 0;
        var ringAreas = [];
        for (ring of poly) {
            var ringArea = turf.area(turf.polygon([ring]));
            alert(ip+'-'+ir+', verts '+ring.length+', area '+ringArea);
            //ringArea = Math.abs(ringArea);
            //if (ir > 0) {
            //	ringArea = -ringArea;
            //};
            ringAreas.push(ringArea);
            //area = area + ringArea;
            ir++;
        };
        var extArea = Math.max.apply(Math, ringAreas);
        var sumArea = ringAreas.reduce((a, b) => a + b, 0);
        var holeArea = sumArea - extArea;
        area = area + extArea - holeArea;
        ip++;
    };
    */

    return area;
};

function olArea(geom) {
    var feat = {'type':'Feature', 'properties':{}, 'geometry':{'type':turf.getType(geom), 'coordinates':turf.getCoords(geom)}};
    var olFeat = new ol.format.GeoJSON().readFeature(feat);
    var area = ol.sphere.getArea(olFeat.getGeometry());
    //alert(turf.area(geom)+'-->'+area);
    return area;
};

function olPerimeter(geom) {
    fdsfs;
};

function similarity(feat1, feat2) {
    try {
        // create turf objects
        //alert('creating turf geoms');
        geom1 = geoj2turf(turf.simplify(feat1.geometry, {tolerance:0.01}));
        geom2 = geoj2turf(turf.simplify(feat2.geometry, {tolerance:0.01}));

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
        var geom1Area = turf.convertArea(olArea(geom1),'meters','kilometers');
        var geom2Area = turf.convertArea(olArea(geom2),'meters','kilometers');
        var unionArea = turf.convertArea(olArea(union), 'meters', 'kilometers');
        var isecArea = turf.convertArea(olArea(isec), 'meters', 'kilometers');
        var areas = {'geom1Area':geom1Area, 'geom2Area':geom2Area, 'unionArea':unionArea, 'isecArea':isecArea};
        //alert(JSON.stringify(areas));
        
        var results = {};
        results.equality = isecArea / unionArea;
        results.within = isecArea / geom1Area;
        results.contains = isecArea / geom2Area;
    } catch (error) {
        console.warn('similarity could not be calculated: ' + error);
        results = {equality:NaN, within:NaN, contains:NaN};
    };
    return results;
};

function calcSpatialRelations(feat, features) {
    //feat = feat.getGeometry().simplify(0.01);
    var geojWriter = new ol.format.GeoJSON();
    var geoj1 = geojWriter.writeFeatureObject(feat);
    var matches = [];
    for (feat2 of features) {
        if (!ol.extent.intersects(feat.getGeometry().getExtent(), feat2.getGeometry().getExtent())) {
            continue;
        };
        //feat2 = feat2.getGeometry().simplify(0.01);
        geoj2 = geojWriter.writeFeatureObject(feat2);
        simil = similarity(geoj1, geoj2);
        if (simil.equality > 0.0) {
            matches.push([feat2,simil]);
        };
        i++;
    };
    return matches;
};

function calcAllSpatialRelations(data1, data2, onSuccess, onProgress=null) {
    // calc relations from 1 to 2
    // calculate everything in background and receive results at end
    // to avoid locking up the entire gui

    // terminate any previous worker
    if (matchingWorker !== null) {
        matchingWorker.terminate();
    };

    // create worker
    matchingWorker = new Worker('assets/js/internalMatcherWorker.js');
    console.log(matchingWorker);
    
    // define how to process messages
    function processResults(results) {
        console.log('received results:');
        console.log(results);
        onSuccess(results);
    };
    function processMessage(event) {
        let [status,data] = event.data;
        if (status == 'processing') {
            let [i,total] = data;
            onProgress(i, total);
        } else if (status == 'finished') {
            let results = data;
            processResults(results);
        };
    };
    matchingWorker.onmessage = processMessage;

    // tell worker to start processing
    matchingWorker.postMessage([data1, data2]);
};

function sortSpatialRelations(matches, sort_by, thresh, reverse=true) {
    // sort
    function sortFunc(a, b) {
        if (reverse == false) {
            var trueVal = 1;
        } else {
            var trueVal = -1;
        };
        if (a[1][sort_by] < b[1][sort_by]) {
            // a is less than b by some ordering criterion
            return -trueVal;
        };
        if (a[1][sort_by] > b[1][sort_by]) {
            // a is greater than b by the ordering criterion
            return trueVal;
        };
        // a must be equal to b
        return 0;
    };
    matches.sort(sortFunc);

    // filter by threshold
    newMatches = [];
    for (m of matches) {
        if (m[1][sort_by] >= thresh) {
            newMatches.push(m);
        };
    };

    return newMatches;
};

function calcBestMatches(matches) {
    // this should output a simpler match list
    // with one row for every feat1
    // in the format feat,bestmatchfeat,stats
    // where multiple feats can't match to the same feat

    // helper to find features that match another
    function findFeaturesThatMatch(matchID) {
        result = [];
        for (x of matches) {
            var [feature,related] = x;
            related = sortSpatialRelations(related, 'equality', 0.01);
            if (related.length==0) {continue};
            for (y of related) {
                var [matchFeat,stats] = y;
                if (matchFeat.id == matchID) {
                    result.push([feature,stats]);
                };
            };
        };
        return result;
    };

    // create best match list
    var finalMatches = [];
    for (x of matches) {
        var [feature,related] = x;
        // match with highest equality
        related = sortSpatialRelations(related, 'equality', 0.01);
        if (related.length==0) {
            finalMatches.push([feature,null,null]);
            continue;
        };
        [bestMatchFeat,bestStats] = related[0];
        // make sure this match is the highest among all others
        // ie only the feature with the best match to another is allowed
        // ie multiple feats can't match another
        var othersThatMatch = findFeaturesThatMatch(bestMatchFeat.id);
        othersThatMatch = sortSpatialRelations(othersThatMatch, 'equality', 0.01);
        [bestOtherThatMatches,bestOtherThatMatchesStats] = othersThatMatch[0];
        if (feature.id == bestOtherThatMatches.id) {
            finalMatches.push([feature,bestMatchFeat,bestStats]);
        } else {
            finalMatches.push([feature,null,null]);
        };
    };

    // return
    return finalMatches;
};


