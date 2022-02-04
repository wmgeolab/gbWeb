
//-----------------------------------
// this chunk initiates the main map

// layer definitions

// five style categories
var outline = new ol.style.Stroke({
    color: 'white', //'rgb(49, 127, 211)',
    width: 0.5,
})
var missingStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(63,46,6,0.7)',
    })
    //stroke: outline,
});
var countryLabelStyle = new ol.style.Style({
    geometry: function(feature) {
        // create a geometry that defines where the label will be display
        var geom = feature.getGeometry();
        if (geom.getType() == 'Polygon') {
            // polygon
            // place label at the bbox/center of the polygon
            var extent = feature.getGeometry().getExtent();
            var newGeom = ol.geom.Polygon.fromExtent(extent);
        } else {
            // multi polygon
            // place label at the bbox/center of the largest polygon
            var largestGeom = null;
            var largestArea = null;
            for (poly of geom.getPolygons()) {
                var extent = poly.getExtent();
                var extentGeom = ol.geom.Polygon.fromExtent(extent);
                var extentArea = extentGeom.getArea();
                if (extentArea > largestArea) {
                    largestGeom = extentGeom;
                    largestArea = extentArea;
                };
            };
            var newGeom = largestGeom;
            
        };
        return newGeom;
    },
    text: new ol.style.Text({
        //font: '12px Calibri,sans-serif',
        fill: new ol.style.Fill({ color: '#000' }),
        stroke: new ol.style.Stroke({
            color: '#fff', width: 2
        }),
        overflow: true,
    }),
});
var styleCategories = [
    new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgb(151,111,14)',
        }),
        stroke: outline,
    }),
    new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgb(189,152,82)',
        }),
        stroke: outline,
    }),
    new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgb(7,124,96)',
        }),
        stroke: outline,
    }),
    new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgb(6,75,52)',
        }),
        stroke: outline,
    })
]

function calcEqualBreaks(values) {
    // calc breaks
    var minval = Math.min.apply(Math, values);
    var maxval = Math.max.apply(Math, values);
    var range = maxval-minval;
    var step = range / styleCategories.length;
    var breaks = [];
    for (i=0; i<=styleCategories.length; i++) {
        breaks.push(minval + i*step);
    };
    //alert(breaks.join(','));
    return breaks;
};

function calcValueBins(breaksFunc, values) {
    var breaks = breaksFunc(values);
    var bins = [];
    for (i=0; i<(breaks.length-1); i++) {
        var binstart = breaks[i];
        var binend = breaks[i+1];
        var bin = {min:binstart, max:binend};
        bins.push(bin);
    };
    return bins;
};

function getValueBin(value, bins) {
    if (value === null | value === 'Unknown' | value === '' | Number.isNaN(value)) {
        return null;
    };
    for (i=0; i<bins.length; i++) {
        var bin = bins[i];
        var binstart = bin.min;
        var binend = bin.max;
        if (value >= binstart & value <= binend) {
            return i;
        };
    };
};

function updateStyleLegend(bins) {
    //console.log("BINSSS");
    //console.log(bins);
    var legend = document.getElementById('map-legend');
    // clear legend
    legend.innerHTML = '';
    // define entries
    function createEntry(color, text) {
        var entry = document.createElement('div');
        entry.classList = ['row'];
        var fill = document.createElement('div');
        fill.style.width = '25px';
        fill.style.height = '25px';
        //fill.style.border = '1px solid black';
        fill.style.backgroundColor = color;
        entry.appendChild(fill);
        var label = document.createElement('span');
        label.innerText = text;
        entry.appendChild(label);
        return entry;
    };
    // add missing
    var color = missingStyle.getFill().getColor();
    var text = 'No Data';
    var entry = createEntry(color, text);
    legend.appendChild(entry);
    // add bins
    for (i=0; i<bins.length; i++) {
        var bin = bins[i];
        var binstart = bin.min;
        var binend = bin.max;
        var color = styleCategories[i].getFill().getColor();
	//console.log("style is from: "+i);
        var text = binstart.toFixed(1) + ' to ' + binend.toFixed(1);
	//console.log(text);
        var entry = createEntry(color, text);
        legend.appendChild(entry);
    };
};

function updateStyleBreaks(layer, key, reverse=false) {
    // get values
    //console.log("LAYER:");
    //console.log(layer);
    var values = [];
    for (feat of layer.getSource().getFeatures()) {
        var val = feat.get(key);
        if (val === 0 | (val != null & val != 'Unknown' & val != '' & !Number.isNaN(val))) {
            values.push(val);
        };
    };
    //console.log("VALUES:");
    //console.log(values);
    // calc bins
    var bins = calcValueBins(calcEqualBreaks, values);
    if (reverse == true) {
        bins = bins.reverse();
    };
    // define style dynamically
    var dynamicStyle = function(feature, resolution){
        var val = feature.get(key);
        var bin = getValueBin(val, bins);
	
        if (bin != null) {
            var binStyle = styleCategories[bin];
        } else {
            var binStyle = missingStyle;
        };
        //alert([val,bin,binStyle].join(' '))
	//console.log("style: ");
	//console.log([binStyle]);
        return [binStyle];
    };
    layer.getSource().forEachFeature(function(feature){
        feature.setStyle(dynamicStyle);
    });
    // update legend
    updateStyleLegend(bins);
    //console.log("BINS:");
    //console.log(bins);
};

function updateMapCountryStyle() {
    var key = document.getElementById('map-compare').value;
    var revKeys = ['avgYearLag','minLineRes'];
    if (revKeys.includes(key)) {
        reverse = true;
    } else {
        reverse = false;
    };
    updateStyleBreaks(countryLayer, key, reverse);
};

function updateMapCountryProperties() {
    // get countryData
    var countryData = getCountryData();
    // loop country features
    for (feat of countryLayer.getSource().getFeatures()) {
        var props = feat.getProperties();
        var iso = feat.get('shapeISO');
        // get the same entry in countryData
        for (info of countryData) {
            if (info.iso == iso) {
                break;
            };
        };
        // update feature properties
	//console.log("HERE4");
	//console.log(feat);
	//console.log(info);
        feat.setProperties(info);
    };
};

function updateMapDescription() {
    // update map description
    var key = document.getElementById('map-compare').value;
    var text = countryDataLookup[key]['descr'];
    var elem = document.getElementById('map-description');
    elem.innerText = text;
};

function updateMapCountries() {
    updateMapDescription();
    updateMapCountryProperties();
    updateMapCountryStyle();
};

var countryLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
        format: new ol.format.GeoJSON({dataProjection: 'EPSG:4326'}),
        overlaps: false
    })
});

// manually load geojson from url
//var countriesUrl = "/assets/data/gb-countries-simple.geojson"
/*
var countriesUrl = "https://openlayers.org/en/latest/examples/data/geojson/countries.geojson";
function prep(resp) {
    alert(resp.text());
    fsfds
    json = JSON.parse(data);
    alert(JSON.stringify(json));
    for (feat of json.features) {
        feat.properties.shapeISO = feat.id;
    };
};
fetch(countriesUrl)
.then(resp => resp.json )
.then(out => loadFromGeoJSON(countryLayer.getSource(), out))
*/

// load from 'countryBoundaries' defined/imported in script tag
loadFromGeoJSON(countryLayer.getSource(), countryBoundaries)

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
        countryLayer,
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([0,0]),
        zoom: 1
    })
});

map.on('pointermove', function(evt) {
    // get feat at pointer
    let cursorFeat = null;
    map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
        cursorFeat = feature;
    });
    // if any feat was found
    if (cursorFeat != null) {
        // clear any existing feature text
        countryLayer.getSource().forEachFeature(function (feature) {
            var styleFunc = feature.getStyle();
            var styles = styleFunc(feature, null); 
            function dynamicStyle(feature, resolution) {
                // main style is at pos 0, label style at pos 1
                // keep only main style, ignoring label style
                return [styles[0]]; 
            };
            feature.setStyle(dynamicStyle);
        });
        // update the text style for the found feature
        var label = cursorFeat.get('shapeName');
        var labelStyle = countryLabelStyle.clone();
        labelStyle.getText().setText(label);
        var geomStyleFunc = cursorFeat.getStyle();
        var geomStyle = geomStyleFunc(cursorFeat, true)[0];
        function dynamicStyle(feature, resolution) {
            return [geomStyle,labelStyle];
        };
        cursorFeat.setStyle(dynamicStyle);
    };
});

