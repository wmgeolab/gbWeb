
importScripts('https://cdnjs.cloudflare.com/ajax/libs/Turf.js/6.5.0/turf.min.js');

function geoj2turf(geoj) {
    if (geoj.type == 'Polygon') {
        geom = turf.polygon(geoj.coordinates)
    } else if (geoj.type == 'MultiPolygon') {
        geom = turf.multiPolygon(geoj.coordinates)
    };
    return geom;
};

function similarity(geoj1, geoj2) {
    // create turf objects
    //alert('creating turf geoms');
    geom1 = geoj2turf(geoj1); //turf.simplify(feat1.geometry, {tolerance:0.01}));
    geom2 = geoj2turf(geoj2); //turf.simplify(feat2.geometry, {tolerance:0.01}));

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

self.onmessage = function(event) {
    var args = event.data;
    console.log('worker received args: '+args);
    if (args[0] == 'similarity') {
        var i1 = args[1];
        var i2 = args[2];
        results = similarity(args[3], args[4]);
        //console.log(i1+'-'+i2+' worker finished, sending back');
        self.postMessage([i1,i2,results]);
    };
};
