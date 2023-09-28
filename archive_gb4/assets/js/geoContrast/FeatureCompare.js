
// --------------------------------
// Adds the feature comparison map

// define map background

var tileLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        attributions: 'Satellite Imagery <a href="https://www.google.com" target="_blank">&copy; Google</a> ',
        url:
        'https://www.google.com/maps/vt?lyrs=s&x={x}&y={y}&z={z}',
        maxZoom: 20,
        crossOrigin: 'anonymous' // necessary for converting map to img during pdf generation: https://stackoverflow.com/questions/66671183/how-to-export-map-image-in-openlayer-6-without-cors-problems-tainted-canvas-iss
    })});
var layers = [tileLayer];

// define main layer

var style = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.4)',
    }),
    stroke: new ol.style.Stroke({
        color: 'rgb(29,107,191)', //'rgb(49, 127, 211)',
        width: 2.5,
    }),
});
var featureCompareMainLayer = new ol.layer.Vector({
    style: style,
});
layers.push(featureCompareMainLayer);

// define comparison layer

var style = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0)', // fully transparent
    }),
    stroke: new ol.style.Stroke({
        color: 'rgba(255, 0, 0, 0.8)',
        width: 1.5,
        lineDash: [10,10]
    }),
});
var featureCompareComparisonLayer = new ol.layer.Vector({
    style: style,
});
layers.push(featureCompareComparisonLayer);

// create the map			

var featureCompareMap = new ol.Map({
    target: 'feature-compare-map',
    controls: ol.control.defaults().extend([new ol.control.FullScreen(),
                                        new ol.control.ScaleLine({units: 'metric'}),
                                        ]),
    layers: layers,
    view: new ol.View({
        center: ol.proj.fromLonLat([37.41, 8.82]),
        zoom: 4
    })
});

// populating the featureCompareMap

function updateFeatureComparisonMap(mainGeoj, comparisonGeoj) {
    // set main source
    if (mainGeoj != null) {
        var source = new ol.source.Vector({
            features: new ol.format.GeoJSON().readFeatures(mainGeoj,
                                                            {} // featureProjection: featureCompareMap.getView().getProjection() }
            ),
        });
        featureCompareMainLayer.setSource(source);
    };

    // set comparison source
    if (comparisonGeoj != null) {
        var source = new ol.source.Vector({
            features: new ol.format.GeoJSON().readFeatures(comparisonGeoj,
                                                            {} // featureProjection: featureCompareMap.getView().getProjection() }
            ),
        });
        featureCompareComparisonLayer.setSource(source);
    };

    // zoom to combined extents
    var extent = ol.extent.createEmpty();
    if (mainGeoj != null) {
        extent = ol.extent.extend(extent, featureCompareMainLayer.getSource().getExtent());
    };
    if (comparisonGeoj != null) {
        extent = ol.extent.extend(extent, featureCompareComparisonLayer.getSource().getExtent());
    };
    featureCompareMap.getView().fit(extent);

    // zoom out a little
    featureCompareMap.getView().setZoom(featureCompareMap.getView().getZoom()-1);
};

// opening the feature compare as a popup
function openFeatureComparePopup(feat1, feat2) {
    // reset feature similarity
    var shareDiv = document.getElementById('feature-compare-similarity'); 
    shareDiv.querySelector('span').style = '--data-width:0%';
    shareDiv.querySelector('p').innerText = 'Please select a comparison...';
    // reset any previous names and stats
    document.getElementById('feature-compare-left-name').innerText = '-';
    for (elem of document.querySelectorAll('#feature-compare-left-table .stats-value')) {
        elem.innerText = '-';
    };
    document.getElementById('feature-compare-right-name').innerText = '-';
    for (elem of document.querySelectorAll('#feature-compare-right-table .stats-value')) {
        elem.innerText = '-';
    };
    // get names
    let mainName = '-';
    var mainNameField = document.getElementById('main-names-table-select').value;
    let comparisonName = '-';
    var comparisonNameField = document.getElementById('comparison-names-table-select').value;
    if (feat1 != null) {
        mainName = feat1.getProperties()[mainNameField];
    };
    if (feat2 != null) {
        comparisonName = feat2.getProperties()[comparisonNameField];
    };
    // update the names
    document.getElementById('feature-compare-left-name').innerText = mainName;
    document.getElementById('feature-compare-right-name').innerText = comparisonName;
    // update drop buttons
    if (feat1 != null & feat2 != null) {
        // enable clear feat1
        var leftbut = document.getElementById('feature-compare-left-clear');
        leftbut.style.display = 'block';
        var onclick = function() {
            document.getElementById('close-compare-popup').click();
            openFeatureComparePopup(null,feat2);
        };
        leftbut.onclick = onclick;
        // enable clear feat2
        var rightbut = document.getElementById('feature-compare-right-clear');
        rightbut.style.display = 'block';
        var onclick = function() {
            document.getElementById('close-compare-popup').click();
            openFeatureComparePopup(feat1,null);
        };
        rightbut.onclick = onclick;
    } else {
        // hide both clear buttons
        var leftbut = document.getElementById('feature-compare-left-clear');
        leftbut.style.display = 'none';
        leftbut.onclick = null;
        var rightbut = document.getElementById('feature-compare-right-clear');
        rightbut.style.display = 'none';
        rightbut.onclick = null;
    };
    // hide or show related boundaries if only showing one feat
    if (feat1 == null) {
        document.getElementById('feature-compare-left-empty').style.display = 'block';
        document.getElementById('feature-compare-left-table').style.display = 'none';
    } else {
        document.getElementById('feature-compare-left-empty').style.display = 'none';
        document.getElementById('feature-compare-left-table').style.display = 'table';
    };
    if (feat2 == null) {
        document.getElementById('feature-compare-right-empty').style.display = 'block';
        document.getElementById('feature-compare-right-table').style.display = 'none';
    } else {
        document.getElementById('feature-compare-right-empty').style.display = 'none';
        document.getElementById('feature-compare-right-table').style.display = 'table';
    };
    // calc spatial stats
    if (feat1 != null) {
        stats1 = calcSpatialStats([feat1]);
    };
    if (feat2 != null) {
        stats2 = calcSpatialStats([feat2]);
    };
    // update the spatial stats
    if (feat1 != null) {
        var lvl = document.getElementById('main-admin-level-select').value;
        if (lvl == '9') {
            lvl = 'Unknown';
        };
        document.getElementById('feature-compare-stats-main-level').innerText = lvl;
        document.getElementById('feature-compare-stats-main-area').innerText = stats1.area.toLocaleString('en-US', {maximumFractionDigits:0}) + ' km2';
        document.getElementById('feature-compare-stats-main-circumf').innerText = stats1.circumf.toLocaleString('en-US', {maximumFractionDigits:0}) + ' km';
        document.getElementById('feature-compare-stats-main-vertices').innerText = stats1.vertices.toLocaleString('en-US');
        document.getElementById('feature-compare-stats-main-avglinedens').innerText = stats1.avgLineDensity.toFixed(1) + ' / km';
        document.getElementById('feature-compare-stats-main-avglineres').innerText = stats1.avgLineResolution.toFixed(1) + ' m';
    };
    if (feat2 != null) {
        var lvl = document.getElementById('comparison-admin-level-select').value;
        if (lvl == '9') {
            lvl = 'Unknown';
        };
        document.getElementById('feature-compare-stats-comp-level').innerText = lvl;
        document.getElementById('feature-compare-stats-comp-area').innerText = stats2.area.toLocaleString('en-US', {maximumFractionDigits:0}) + ' km2';
        document.getElementById('feature-compare-stats-comp-circumf').innerText = stats2.circumf.toLocaleString('en-US', {maximumFractionDigits:0}) + ' km';
        document.getElementById('feature-compare-stats-comp-vertices').innerText = stats2.vertices.toLocaleString('en-US', {maximumFractionDigits:0});
        document.getElementById('feature-compare-stats-comp-avglinedens').innerText = stats2.avgLineDensity.toFixed(1) + ' / km';
        document.getElementById('feature-compare-stats-comp-avglineres').innerText = stats2.avgLineResolution.toFixed(1) + ' m';
    };
    // calc relations stats
    if (feat2 == null) {
        var features2 = comparisonLayer.getSource().getFeatures();
        related = calcSpatialRelations(feat1, features2);
        // sort
        related = sortSpatialRelations(related, 'equality', 0);
        // keep any that are significant from the perspective of either boundary (>1% of area)
        var significantRelated1 = [];
        for (x of related) {
            if ((x[1].within >= 0.01) | (x[1].contains >= 0.01)) { // x[1] is the stats dict
                significantRelated1.push(x)
            };
        };
        // update the list of related boundaries
        var cellContent = '';
        var ID = feat1.getId();
        for (x of significantRelated1) {
            [matchFeature,stats] = x;
            var ID2 = matchFeature.getId();
            var name2 = matchFeature.getProperties()[comparisonNameField];
            var getFeature1Js = 'mainLayer.getSource().getFeatureById('+ID+')';
            var getFeature2Js = 'comparisonLayer.getSource().getFeatureById('+ID2+')';
            var onclick = "document.getElementById('close-compare-popup').click(); " + 'openFeatureComparePopup('+getFeature1Js+','+getFeature2Js+')';
            var nameLink = '<span class="link" onclick="'+onclick+'">'+name2+'</span>';
            var share = (stats.equality * 100).toFixed(1) + '%';
            var shareDiv = '<div class="stats-percent" style="height:20px; width:50px"><span style="--data-width:'+stats.equality*100+'%"></span><p>'+share+'</p></div>';
            cellContent += '<div style="display:flex; flex-direction:row"><div>' + shareDiv + '</div><div style="word-wrap:break-word">' + nameLink + '</div></div>';
        };
        document.getElementById('feature-compare-stats-comp-related').innerHTML = cellContent;
    };
    if (feat1 == null) {
        var features1 = mainLayer.getSource().getFeatures();
        related = calcSpatialRelations(feat2, features1);
        // sort
        related = sortSpatialRelations(related, 'equality', 0);
        // keep any that are significant from the perspective of either boundary (>1% of area)
        var significantRelated2 = [];
        for (x of related) {
            if ((x[1].within >= 0.01) | (x[1].contains >= 0.01)) { // x[1] is the stats dict
                significantRelated2.push(x)
            };
        };
        // update the list of related boundaries
        var cellContent = '';
        var ID2 = feat2.getId();
        for (x of significantRelated2) {
            [matchFeature,stats] = x;
            var ID = matchFeature.getId();
            var name1 = matchFeature.getProperties()[mainNameField];
            var getFeature1Js = 'mainLayer.getSource().getFeatureById('+ID+')';
            var getFeature2Js = 'comparisonLayer.getSource().getFeatureById('+ID2+')';
            var onclick = "document.getElementById('close-compare-popup').click(); " + 'openFeatureComparePopup('+getFeature1Js+','+getFeature2Js+')';
            var nameLink = '<span class="link" onclick="'+onclick+'">'+name1+'</span>';
            var share = (stats.equality * 100).toFixed(1) + '%';
            var shareDiv = '<div class="stats-percent" style="height:20px; width:50px"><span style="--data-width:'+stats.equality*100+'%"></span><p>'+share+'</p></div>';
            cellContent += '<div style="display:flex; flex-direction:row"><div>' + shareDiv + '</div><div style="word-wrap:break-word">' + nameLink + '</div></div>';
        };
        document.getElementById('feature-compare-stats-main-related').innerHTML = cellContent;
    };
    // prep for map
    var geojWriter = new ol.format.GeoJSON();
    if (feat1 != null) {
        var geoj1 = geojWriter.writeFeatureObject(feat1);
        var geojColl1 = {type:'FeatureCollection', features:[geoj1]};
    } else {
        var geojColl1 = {type:'FeatureCollection', features:[]};
        for (x of significantRelated2) {
            [matchFeature,stats] = x;
            var matchGeoj = geojWriter.writeFeatureObject(matchFeature);
            geojColl1.features.push(matchGeoj);
        };
    };
    if (feat2 != null) {
        var geoj2 = geojWriter.writeFeatureObject(feat2);
        var geojColl2 = {type:'FeatureCollection', features:[geoj2]};
    } else {
        var geojColl2 = {type:'FeatureCollection', features:[]};
        for (x of significantRelated1) {
            [matchFeature,stats] = x;
            var matchGeoj = geojWriter.writeFeatureObject(matchFeature);
            geojColl2.features.push(matchGeoj);
        };
    };
    // calc similarity stats
    var geojWriter = new ol.format.GeoJSON();
    var geoj1 = null;
    var geoj2 = null;
    if (feat1 != null) {
        geoj1 = geojWriter.writeFeatureObject(feat1);
    };
    if (feat2 != null) {
        geoj2 = geojWriter.writeFeatureObject(feat2);
    };
    if (feat1 != null & feat2 != null) {
        stats = similarity(geoj1, geoj2);
    };
    // update the stats entries
    if (feat1 != null & feat2 != null) {
        var share = (stats.equality * 100).toFixed(1) + '%';
        var shareDiv = document.getElementById('feature-compare-similarity'); 
        shareDiv.querySelector('span').style = '--data-width:'+stats.equality*100+'%';
        shareDiv.querySelector('p').innerText = 'Overlap: ' + share;
    };
    // show popup
    popup = document.getElementById('feature-compare-popup');
    popup.className = 'popup';
    content = popup.querySelector('.popup-content');
    content.scrollTop = 0;
    featureCompareMap.updateSize(); // otherwise will remain hidden until window resize
    // add feats to the popup comparison map
    updateFeatureComparisonMap(geojColl1, geojColl2);
};

