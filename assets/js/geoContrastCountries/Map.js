
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
        color: 'rgba(5,37,26,0.7)',
    })
    //stroke: outline,
});
var styleCategories = [
    new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgb(6,75,52)',
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
            color: 'rgb(189,152,82)',
        }),
        stroke: outline,
    }),
    new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgb(151,111,14)',
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

function getValueBin(value, breaks) {
    for (i=0; i<breaks.length; i++) {
        var binstart = breaks[i];
        var binend = breaks[i+1];
        if (value >= binstart & value <= binend) {
            return i;
        };
    };
};

function updateStyleLegend(breaks) {
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
    var text = 'None';
    var entry = createEntry(color, text);
    legend.appendChild(entry);
    // add breaks
    for (i=0; i<(breaks.length-1); i++) {
        var binstart = breaks[i];
        var binend = breaks[i+1];
        var color = styleCategories[i].getFill().getColor();
        var text = binstart + ' to ' + binend;
        var entry = createEntry(color, text);
        legend.appendChild(entry);
    };
};

function updateStyleBreaks(layer, key) {
    // get values
    var values = [];
    for (feat of layer.getSource().getFeatures()) {
        var val = feat.get(key);
        if (val != null & val != 0 & val != 'Unknown' & val != '') {
            values.push(val);
        };
    };
    // calc breaks
    var breaks = calcEqualBreaks(values);
    // define style dynamically
    var dynamicStyle = function(feature, resolution){
        var val = feature.get(key);
        var bin = getValueBin(val, breaks);
        if (bin != null) {
            var binStyle = styleCategories[bin];
        } else {
            var binStyle = missingStyle;
        };
        //alert([val,bin,binStyle].join(' '))
        return [binStyle];
    };
    layer.getSource().forEachFeature(function(feature){
        feature.setStyle(dynamicStyle);
    });
    // update legend
    updateStyleLegend(breaks);
};

function updateMapCountryStyle() {
    var key = document.getElementById('map-compare').value;
    updateStyleBreaks(countryLayer, key);
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
        feat.setProperties(info);
    };
};

function updateMapCountries() {
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

map.on('singleclick', function(evt) {
    // get feats
    let clickedFeat = null;
    map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
        clickedFeat = feature;
    });
    // init and open popup for the found features
    if (clickedFeat != null) {
        openCountryPopup(clickedFeat);
    };
});

// country popup map

var countryPopupLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
        format: new ol.format.GeoJSON({dataProjection: 'EPSG:4326'}),
        overlaps: false
    })
});

var countryPopupMap = new ol.Map({
    target: 'country-info-map',
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
        countryPopupLayer
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([0,0]),
        zoom: 1
    })
});
