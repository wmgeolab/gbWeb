
util = new Util();

defaultMapOpts = {
   center: { lat: 41.1, lng: -107 }
   ,minZoom: 1
   ,maxZoom: 19
   ,zoom: 5
   ,zoomControl: false
}

gnisTpl = "\
   <strong>Name: </strong>{name}\
   <br><strong>Trail Mile: </strong>{trail_mile}\
   <br><strong>Feet/meters from trail: </strong>{feet_from_trail}<strong>/</strong>{meters_from_trail}\
   <br><strong>Trail/Feature Elev: </strong>{trail_elevation}<strong>/</strong>{feature_elevation}\
   <br><strong>Class: </strong>{class}\
   <br><strong>To feature: </strong>{direction_to_feature}&deg;\
   <br><strong>Land Owner: </strong>{land_owner}\
   <br><strong>Latitude: </strong>{latitude}\
   <br><strong>Longitude: </strong>{longitude}\
";

firesTpl = "\
   <strong>Fire Name: </strong>{name}\
   <br><strong>Year: </strong>{year}\
   <br><strong>Last Update: </strong>{date}\
   <br><strong>Acres: </strong>{acres}\
   <br><strong>Nearest Trail Mile: </strong>{trailmile}\
   <br><strong>Miles from trail: </strong>{milesfromtrail}\
   <br><strong>Start Mile: </strong>{startmile}\
   <br><strong>End Mile: </strong>{endmile}\
";

padTpl = "\
   <strong>Category: </strong>{category}\
   <br><strong>Name: </strong>{name}\
   <br><strong>Manager: </strong>{manager}\
   <br><strong>Access: </strong>{access}\
   <br><strong>Status: </strong>{status}\
   <br><strong>Start Mile: </strong>{startmile}\
   <br><strong>End Mile: </strong>{endmile}\
   <br><strong>Distance: </strong>{distance}\
   <br><strong>Min Elev(ft): </strong>{minelev}\
   <br><strong>Max Elev(ft): </strong>{maxelev}\
   <br><strong>Description: </strong>{dom}\
   <br><strong>Comments: </strong>{comments}\
";


const trail = [
   {
      id: 'lowRes'
      ,url: 'https://gisph.s3.amazonaws.com/public/2_trail_low.fgb'
      ,minZoom: 1
      ,maxZoom: 12
      ,loadingId: 'loading'
      ,name: 'Continental Divide Trail'
      ,style: { color: '#cc0000', weight: 3, zIndex: 3000 }
      ,update: 1
   }
   ,{
      id: 'highRes'
      ,url: 'https://gisph.s3.amazonaws.com/public/2_trail_high.fgb'
      ,minZoom: 13
      ,maxZoom: 20
      ,loadingId: 'loading'
      ,update: 2
      ,bbox: 'viewport'
      ,pad: .1
      ,name: 'Continental Divide Trail'
      ,style: { color: '#cc0000', weight: 3 }
   }
];

groups = [
   {
      id: "basemaps"
      ,name: "Base Maps"
      ,opt: "radio"
      ,layers: [
/*
         {
            id: "bmnone"
            ,name: "None"
            ,selected: 0
            ,layers: [
               {
                  url: ""
               }
            ]
         }
*/
         { 
            id: "osm"
            ,name: "Open Street Map"
            ,selected: 1
            ,layers: [
               {
                  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  ,type: "WMTS"
                  ,minZoom: 1
                  ,maxZoom: 19
                  ,attribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank">OSM</a> '
               }
            ]
         }
         ,{ 
            id: "topo"
            ,name: "U.S Topo"
            ,layers: [
               {
                  url: 'https://services.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer/tile/{z}/{y}/{x}.png'
                  ,type: "WMTS"
                  ,minZoom: 1
                  ,maxZoom: 15
                  ,attribution: '<a href="https://www.esri.com/" target="_blank">ESRI</a>'
               }
            ]
         }
         ,{ 
            id: "satellite"
            ,name: "Satellite"
            ,layers: [
               {
                  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                  ,type: "WMTS"
                  ,minZoom: 1
                  ,maxZoom: 19
                  ,attribution: '<a href="https://www.esri.com/" target="_blank">ESRI</a>'
               }
            ]
         }
      ]
   }
   ,{
      id: "markers"
      ,name: "Points of Interest"
      ,opt: "checkbox"
      ,layers: [
         {
            id: "milemarkers"
            ,name: 'Mile Markers'
            ,color: "#964B00"
            ,layers: [
               {
                  url: 'https://gisph.s3.amazonaws.com/public/2_milemarkers_lowres.fgb'
                  ,type: "FGB"
                  ,featureFn: util.addMileMarker
                  ,update: 2
                  ,pad: .5
                  ,minZoom: 1
                  ,maxZoom: 9
                  ,className: 'milemarker'
                  ,color: "#964B00"
               }
               ,{
                  url: 'https://gisph.s3.amazonaws.com/public/2_milemarkers_hires.fgb'
                  ,type: "FGB"
                  ,featureFn: util.addMileMarker
                  ,update: 2
                  ,pad: .2
                  ,minZoom: 10
                  ,maxZoom: 20
                  ,className: 'milemarker'
                  ,color: "#964B00"
               }
            ]
         }
         ,{
            id: "resupply"
            ,name: 'Resupply'
            ,color: "#c00"
            ,layers: [
               {
                  url: 'https://gisph.s3.amazonaws.com/public/2_resupply_poi.fgb'
                  ,type: "FGB"
                  ,loadingId: 'loading'
                  ,featureFn: util.addMarker
                  ,className: 'cus-con resupply-con'
                  ,color: "#c00"
                  ,template: gnisTpl
               }
            ]
         }
         ,{
            id: "spring"
            ,name: 'Springs'
            ,color: "#008080"
            ,layers: [
               {
                  url: 'https://gisph.s3.amazonaws.com/public/2_spring_poi.fgb'
                  ,type: "FGB"
                  ,loadingId: 'loading'
                  ,featureFn: util.addMarker
                  ,className: 'cus-con spring-con'
                  ,template: gnisTpl
                  ,color: "#008080"
                  ,attribution: '<a href="https://www.usgs.gov/" target="_blank">GNIS</a>'
               }
            ]
         }
         ,{
            id: "gap"
            ,name: 'Passes'
            ,color: "#707070"
            ,layers: [
               {
                  url: 'https://gisph.s3.amazonaws.com/public/2_gap_poi.fgb'
                  ,type: "FGB"
                  ,loadingId: 'loading'
                  ,featureFn: util.addMarker
                  ,template: gnisTpl
                  ,className: 'cus-con gap-con'
                  ,color: "#707070"
                  ,attribution: '<a href="https://www.usgs.gov/" target="_blank">GNIS</a>'
               }
            ]
         }
         ,{
            id: "roads"
            ,name: 'Roads'
            ,color: "#303030"
            ,layers: [
               {
                  url: 'https://gisph.s3.amazonaws.com/public/2_roads_poi.fgb'
                  ,type: "FGB"
                  ,loadingId: 'loading'
                  ,featureFn: util.addMarker
                  ,template: gnisTpl
                  ,className: 'cus-con roads-con'
                  ,color: "#303030"
                  ,attribution: '<a href="https://www.usgs.gov/" target="_blank">GNIS</a>'
               }
            ]
         }
         ,{
            id: "lake"
            ,name: 'Lakes'
            ,color: "#0000ff"
            ,layers: [
               {
                  url: 'https://gisph.s3.amazonaws.com/public/2_lake_poi.fgb'
                  ,type: "FGB"
                  ,loadingId: 'loading'
                  ,featureFn: util.addMarker
                  ,template: gnisTpl
                  ,className: 'cus-con lake-con'
                  ,color: "#0000ff"
                  ,attribution: '<a href="https://www.usgs.gov/" target="_blank">GNIS</a>'
               }
            ]
         }
         ,{
            id: "drainage"
            ,name: 'Creeks/Rivers'
            ,color: "#000080"
            ,layers: [
               {
                  url: 'https://gisph.s3.amazonaws.com/public/2_drainage_poi.fgb'
                  ,type: "FGB"
                  ,loadingId: 'loading'
                  ,featureFn: util.addMarker
                  ,template: gnisTpl
                  ,className: 'cus-con drainage-con'
                  ,color: "#000080"
                  ,attribution: '<a href="https://www.usgs.gov/" target="_blank">GNIS</a>'
               }
            ]
         }
         ,{
            id: "valley"
            ,name: 'Valley'
            ,color: "#808000"
            ,layers: [
               {
                  url: 'https://gisph.s3.amazonaws.com/public/2_valley_poi.fgb'
                  ,type: "FGB"
                  ,loadingId: 'loading'
                  ,featureFn: util.addMarker
                  ,template: gnisTpl
                  ,className: 'cus-con valley-con'
                  ,color: "#808000"
                  ,attribution: '<a href="https://www.usgs.gov/" target="_blank">GNIS</a>'
               }
            ]
         }
         ,{
            id: "summit"
            ,name: 'Summit'
            ,color: "#800000"
            ,layers: [
               {
                  url: 'https://gisph.s3.amazonaws.com/public/2_summit_poi.fgb'
                  ,type: "FGB"
                  ,loadingId: 'loading'
                  ,featureFn: util.addMarker
                  ,template: gnisTpl
                  ,className: 'cus-con summit-con'
                  ,color: "#800000"
                  ,attribution: '<a href="https://www.usgs.gov/" target="_blank">GNIS</a>'
               }
            ]
         }
         ,{
            id: "ridge"
            ,name: 'Ridge'
            ,color: "#800080"
            ,layers: [
               {
                  url: 'https://gisph.s3.amazonaws.com/public/2_ridge_poi.fgb'
                  ,type: "FGB"
                  ,loadingId: 'loading'
                  ,featureFn: util.addMarker
                  ,template: gnisTpl
                  ,className: 'cus-con ridge-con'
                  ,color: "#800080"
                  ,attribution: '<a href="https://www.usgs.gov/" target="_blank">GNIS</a>'
               }
            ]
         }
         ,{
            id: "place"
            ,name: 'Places'
            ,color: "#000000"
            ,layers: [
               {
                  url: 'https://gisph.s3.amazonaws.com/public/2_place_poi.fgb'
                  ,type: "FGB"
                  ,loadingId: 'loading'
                  ,featureFn: util.addMarker
                  ,template: gnisTpl
                  ,className: 'cus-con place-con'
                  ,color: "#000000"
                  ,attribution: '<a href="https://www.usgs.gov/" target="_blank">GNIS</a>'
               }
            ]
         }
         ,{
            id: "other"
            ,name: 'Other'
            ,color: "#ff00ff"
            ,layers: [
               {
                  url: 'https://gisph.s3.amazonaws.com/public/2_other_poi.fgb'
                  ,type: "FGB"
                  ,loadingId: 'loading'
                  ,featureFn: util.addMarker
                  ,template: gnisTpl
                  ,className: 'cus-con other-con'
                  ,color: "#ff00ff"
                  ,attribution: '<a href="https://www.usgs.gov/" target="_blank">GNIS</a>'
               }
            ]
         }
      ]
   }
   ,{
      id: "wxlayers"
      ,name: "Weather Layers"
      ,opt: "checkbox"
      ,layers: [
         {
            id: "mint"
            ,name: 'Daily Min Temp'
            ,color: "#000000"
            ,legendClass: 'legendClass'
            ,legend: {
               id: "mintLegend"
               ,title: "<strong>&deg;F&nbsp;(&deg;C)</strong>"
               ,colors: '#0002aa,#0002ff,#0044ff,#0084ff,#00c4ff,#00ffd0,#00ff36,#65ff00,#fdff00,#ffdc00,#ffb400,#ff8c00,#ff6400,#ff3c00,#ff1400,#ff0020'
               ,values: '-34.44,-28.89,-23.33,-17.78,-12.22,-6.67,-1.11,4.44,10.00,15.56,21.11,26.67,32.22,37.78,43.33,48.89,54.44'
               ,thickness: "15px"
               ,opacity: .4
               ,style: "height: 325px; padding: 5px; margin: 0px; background-color: white; border: 1px solid black;"
               ,labelStyleFn:  function (index = null, self = null) {
                  var f = (self.values[index] * 9/5.0) + 32;
                  var c = self.values[index];
                  return self.format("{0}&nbsp;({1})", f.toFixed(0), c.toFixed(0));
               }
            }
            ,layers: [
               {
                  url: "https://gisph.s3.amazonaws.com/raster/mint-1-3_cog.tif"
                  ,id: "mint"
                  ,type: "COG"
                  ,loadingId: 'loading'
                  ,fn: util.rangePalette
                  ,colors: ['#0002aa','#0002ff','#0044ff','#0084ff','#00c4ff','#00ffd0','#00ff36','#65ff00','#fdff00','#ffdc00','#ffb400','#ff8c00','#ff6400','#ff3c00','#ff1400','#ff0020','#ff00ff']
                  ,values: [-34.44,-28.89,-23.33,-17.78,-12.22,-6.67,-1.11,4.44,10.00,15.56,21.11,26.67,32.22,37.78,43.33,48.89,54.44]
                  ,minDataValue: -35
                  ,minValue: -35
                  ,maxValue: 55
                  ,maxDataValue: 55
                  ,noDataValue: 9999
                  ,opacity: .4
                  ,mapId: 'map'
                  ,title: 'Temp &deg;F'
                  ,valueScaleFn: function (v = null) { return Math.round(((v * 9/5.0) + 32) / 10) * 10; }
                  ,legendClass: 'legend'
                  ,attribution: '<a href="https://www.noaa.gov/" target="_blank">NOAA</a>'
               }
            ]
         }
         ,{
            id: "maxt"
            ,name: 'Daily Max Temp'
            ,color: "#000000"
            ,legendClass: 'legendClass'
            ,legend: {
               id: "maxtLegend"
               ,title: "<strong>&deg;F&nbsp;(&deg;C)</strong>"
               ,colors: '#0002aa,#0002ff,#0044ff,#0084ff,#00c4ff,#00ffd0,#00ff36,#65ff00,#fdff00,#ffdc00,#ffb400,#ff8c00,#ff6400,#ff3c00,#ff1400,#ff0020'
               ,values: '-34.44,-28.89,-23.33,-17.78,-12.22,-6.67,-1.11,4.44,10.00,15.56,21.11,26.67,32.22,37.78,43.33,48.89,54.44'
               ,thickness: "15px"
               ,opacity: .4
               ,style: "height: 325px; padding: 5px; margin: 0px; background-color: white; border: 1px solid black;"
               ,labelStyleFn:  function (index = null, self = null) {
                  var f = (self.values[index] * 9/5.0) + 32;
                  var c = self.values[index];
                  return self.format("{0}&nbsp;({1})", f.toFixed(0), c.toFixed(0));
               }
            }
            ,layers: [
               {
                  url: "https://gisph.s3.amazonaws.com/raster/maxt-1-3_cog.tif"
                  ,id: "mint"
                  ,type: "COG"
                  ,loadingId: 'loading'
                  ,fn: util.rangePalette
                  ,colors: ['#0002aa','#0002ff','#0044ff','#0084ff','#00c4ff','#00ffd0','#00ff36','#65ff00','#fdff00','#ffdc00','#ffb400','#ff8c00','#ff6400','#ff3c00','#ff1400','#ff0020','#ff00ff']
                  ,values: [-34.44,-28.89,-23.33,-17.78,-12.22,-6.67,-1.11,4.44,10.00,15.56,21.11,26.67,32.22,37.78,43.33,48.89,54.44]
                  ,minDataValue: -35
                  ,minValue: -35
                  ,maxValue: 55
                  ,maxDataValue: 55
                  ,noDataValue: 9999
                  ,opacity: .4
                  ,mapId: 'map'
                  ,title: 'Temp &deg;F'
                  ,valueScaleFn: function (v = null) { return Math.round(((v * 9/5.0) + 32) / 10) * 10; }
                  ,legendClass: 'legend'
                  ,attribution: '<a href="https://www.noaa.gov/" target="_blank">NOAA</a>'
               }
            ]
         }
         ,{
            id: "qpfagg"
            ,name: '3 Day Rain Totals Forecast'
            ,color: "#000000"
            ,legendClass: 'legendClass'
            ,legend: {
               id: "qpfaggLegend"
               ,title: "<strong>QPF&nbsp;in&nbsp;(mm)</strong>"
               ,colors: '#00b4ff,#00fff4,#00ff5c,#3eff00,#d7ff00,#fff000,#ffc800,#ffa000,#ff7800,#ff5000,#ff3200,#ff0a00,#ff0030,#ff0070'
               ,values: '0.00,2.5400,6.3500,12.7000,19.0500,25.4001,31.7501,38.1001,50.8001,76.2002,127.0003,177.8004,254.0005,381.0008,508.001016'
               ,thickness: "15px"
               ,opacity: .4
               ,style: "height: 325px; padding: 5px; margin: 0px; background-color: white; border: 1px solid black;"
               ,labelStyleFn:  function (index = null, self = null) {
                  var mm = self.values[index];
                  var inch = (self.values[index] * 0.0393701);
                  return self.format("{0}&nbsp;({1})", inch < 2 ? inch.toFixed(2) : parseInt(inch), mm.toFixed(2));
               }
            }
            ,layers: [
               {
                  url: "https://gisph.s3.amazonaws.com/raster/qpf-1-3-agg_cog.tif"
                  ,id: "qpfagg13"
                  ,type: "COG"
                  ,loadingId: 'loading'
                  ,fn: util.rangePalette
                  ,colors: ['#ffffff00','#00b4ff','#00fff4','#00ff5c','#3eff00','#d7ff00','#fff000','#ffc800','#ffa000','#ff7800','#ff5000','#ff3200','#ff0a00','#ff0030','#ff0070']
                  ,values: [0.00,2.5400,6.3500,12.7000,19.0500,25.4001,31.7501,38.1001,50.8001,76.2002,127.0003,177.8004,254.0005,381.0008,508.001016]

                  ,minDataValue: .01
                  ,minValue: .01
                  ,maxValue: 508.001016
                  ,maxDataValue: 1000
                  ,noDataValue: 9999
                  ,opacity: .4
                  ,mapId: 'map'
                  ,legendClass: 'legend'
                  ,title: 'Rain (in)'
                  ,valueScaleFn: function (v = null) { return (v * 0.0393701).toFixed(2); }
                  ,attribution: '<a href="https://www.noaa.gov/" target="_blank">NOAA</a>'
               }
            ]
         }
         ,{
            id: "snowagg"
            ,name: '3 Day Snow Totals Forecast'
            ,color: "#000000"
            ,legendClass: 'legendClass'
            ,legend: {
               id: "snowaggLegend"
               ,title: "<strong>SWE cm(in)</strong>"
               ,colors: "#f1fafe,#add6f4,#8b98e4,#6b42cf,#6400b8,#7c209d,#9e00b9,#d300c9,#e657c0,#f48ebe,#fdbac6,#ffe9e9,#ffffff"
               ,values: ".1,.5,1,2.5,5,10,15,25,50,75,100,200,500,1000"
               ,thickness: "15px"
               ,style: "height: 325px; padding: 5px; margin: 0px; background-color: white; border: 1px solid black;"
               ,labelStyleFn:  function (index = null, self = null) {
                  var cm = self.values[index];
                  var inch = (self.values[index] * 0.393701);
                  return self.format("{0}&nbsp;({1})", cm, cm < 10 ? inch.toFixed(2) : inch.toFixed(1));
               }
            }
            ,layers: [
               {
                  url: "https://gisph.s3.amazonaws.com/raster/snow-1-3-agg_cog.tif"
                  ,id: "snowagg13"
                  ,type: "COG"
                  ,loadingId: 'loading'
                  ,fn: util.rangePalette
                  ,colors: ['#add6f400','#8b98e4','#6b42cf','#6400b8','#66009d','#9e00b9','#d300c9','#e657c0','#f48ebe','#fdbac6','#fdbac6','#ffffff']
                  ,values: [0.00,0.0254,0.0762,0.1524,0.3048,0.4572,0.6096,0.9144,1.2192,1.5240,2.4384,3.28084]
                  ,minDataValue: .0001
                  ,minValue: 0.001
                  ,maxValue: 3.048
                  ,maxDataValue: 100
                  ,noDataValue: 9999
                  ,opacity: .8
                  ,mapId: 'map'
                  ,title: 'Snow (in)'
                  ,valueScaleFn: function (v = null) { return (v * 39.3701).toFixed(2); }
                  ,legendClass: 'legend'
                  //,legendImg: 'https://gisph.s3.amazonaws.com/public/snodasModisLegend-100x.jpg'
                  ,attribution: '<a href="https://www.noaa.gov/" target="_blank">NOAA</a>'
               }
            ]
         }
         ,{
            id: "sweLatest"
            ,name: 'Current SWE'
            ,color: "#000000"
            ,legendClass: 'legendClass'
            ,legend: {
               id: "sweLegend"
               ,title: "<strong>SWE cm(in)</strong>"
               ,colors: "#f1fafe,#add6f4,#8b98e4,#6b42cf,#6400b8,#7c209d,#9e00b9,#d300c9,#e657c0,#f48ebe,#fdbac6,#ffe9e9,#ffffff"
               ,values: ".1,.5,1,2.5,5,10,15,25,50,75,100,200,500,1000"
               ,thickness: "15px"
               ,style: "height: 325px; padding: 5px; margin: 0px; background-color: white; border: 1px solid black;"
               ,labelStyleFn:  function (index = null, self = null) {
                  var cm = self.values[index];
                  var inch = (self.values[index] * 0.393701);
                  return self.format("{0}&nbsp;({1})", cm, cm < 10 ? inch.toFixed(2) : inch.toFixed(1));
               }
            }
            ,layers: [
               {
                  url: "https://gisph.s3.amazonaws.com/raster/sweLatestCog.tif"
                  ,id: "swelatest"
                  ,type: "COG"
                  ,loadingId: 'loading'
                  ,fn: util.rangePalette
                  ,colors: ['#f1fafe00','#f1fafe','#add6f4','#8b98e4','#6b42cf','#6400b8','#7c209d','#9e00b9','#d300c9','#e657c0','#f48ebe','#fdbac6','#ffe9e9','#ffffff']
                  ,values: [0,1,5,10,25,50,100,150,250,500,750,1000,2000,5000]
                  ,minDataValue: 1
                  ,minValue: 1
                  ,maxValue: 5000
                  ,maxDataValue: 32767
                  ,noDataValue: -9999
                  //,opacity: .4
                  ,mapId: 'map'
                  ,attribution: '<a href="https://www.noaa.gov/" target="_blank">NOAA</a>'
               }
            ]
         }
      ]
   }
   ,{
      id: "firelayers"
      ,name: "Fire Layers"
      ,opt: "checkbox"
      ,layers: [
         {
            id: "curyearfires"
            ,name: 'Current Year CDT Fires'
            ,color: "#000000"
            ,layers: [
               {
                  url: 'https://gisph.s3.amazonaws.com/public/2_fires_lowres.fgb'
                  ,type: "FGB"
                  ,update: 1
                  ,pad: .5
                  ,minZoom: 1
                  ,maxZoom: 11
                  ,style: { color: '#af8400', weight: 3 }
                  ,color: "#000000"
                  ,template: firesTpl
                  ,featureFn: util.addMarker
               }
               ,{
                  url: 'https://gisph.s3.amazonaws.com/public/2_fires_hires.fgb'
                  ,type: "FGB"
                  ,update: 2
                  ,pad: .2
                  ,minZoom: 12
                  ,maxZoom: 20
                  ,style: { color: '#af8400', weight: 3 }
                  ,color: "#000000"
                  ,template: firesTpl
                  ,featureFn: util.addMarker
               }
            ]
         }
         ,{
            id: "lastyearfires"
            ,name: 'Previous Year CDT Fires'
            ,color: "#000000"
            ,layers: [
               {
                  url: 'https://gisph.s3.amazonaws.com/public/2_fires_lowres_lastyear.fgb'
                  ,type: "FGB"
                  ,update: 1
                  ,pad: .5
                  ,minZoom: 1
                  ,maxZoom: 11
                  ,style: { color: '#af8400', weight: 3 }
                  ,color: "#000000"
                  ,template: firesTpl
                  ,featureFn: util.addMarker
               }
               ,{
                  url: 'https://gisph.s3.amazonaws.com/public/2_fires_hires_lastyear.fgb'
                  ,type: "FGB"
                  ,update: 2
                  ,pad: .2
                  ,minZoom: 12
                  ,maxZoom: 20
                  ,style: { color: '#af8400', weight: 3 }
                  ,color: "#000000"
                  ,template: firesTpl
                  ,featureFn: util.addMarker
               }
            ]
         }
         ,{
            id: "fires1970"
            ,name: "Fires Since 1970"
            ,layers: [
               {
                  url: "https://www.postholer.com/demo/cdt/fires1970_current.tif"
                  ,id: "firerisk"
                  ,type: "COG"
                  ,loadingId: 'loading'
                  ,fn: util.singlePalette
                  ,minValue: 1970
                  ,maxValue: 2022
                  ,noDataValue: 0
                  ,opacity: .4
                  ,color: '#af8400'
                  ,attribution: '<a href="https://www.nifc.gov/" target="_blank">NIFC</a>'
               }
            ]
         }
         ,{
            id: "srfsmoke"
            ,name: "Surface Smoke"
            ,legendClass: 'legendClass'
            ,legend: {
               id: "srfsmokeLegend"
               ,title: '<strong>&micro;g/&#13221;</strong>'
               ,colors: '#d0e1f3,#95c4e0,#4b98cb,#1664ad,#1a8444,#58b45c,#a4d765,#fff6ad,#fbaa5a,#f68549,#eb6036,#c01f22,#a40423,#9604fd'
               ,values: '1,2,4,6,8,12,16,20,25,30,40,60,100,200,255'
               ,thickness: "15px"
               ,opacity: .8
               ,style: "height: 325px; padding: 5px; margin: 0px; background-color: white; border: 1px solid black;"
            }
            ,layers: [
               {
                  url: "https://www.postholer.com/demo/cdt/hrrrLatest.tif"
                  ,id: "srfsmoke"
                  ,type: "COG"
                  ,loadingId: 'loading'
                  ,fn: util.rangePalette
                  ,colors: ['#d0e1f3','#95c4e0','#4b98cb','#1664ad','#1a8444','#58b45c','#a4d765','#fff6ad','#fbaa5a','#f68549','#eb6036','#c01f22','#a40423','#9604fd']
                  ,values: [1,2,4,6,8,12,16,20,25,30,40,60,100,200,255]
                  ,title: '&micro;g/&#13221;'
                  ,minDataValue: 1
                  ,minValue: 1
                  ,maxValue: 255
                  ,maxDataValue: 255
                  ,noDataValue: 0
                  ,opacity: .8
                  ,mapId: 'map'
                  ,legendClass: 'legend'
                  //,legendImg: 'https://gisph.s3.amazonaws.com/public/srfsmokeLegend-80x330.png'
                  ,attribution: '<a href="https://www.nifc.gov/" target="_blank">NIFC</a>'
               }
            ]
         }
      ]
   }
   ,{
      id: "pad3"
      ,name: "Protected Areas v3.0"
      ,opt: "checkbox"
      ,layers: [
         {
            id: "proclamation"
            ,name: 'Proclamation'
            ,color: "#000000"
            ,layers: [
               {
                  url: 'https://gisph.s3.amazonaws.com/public/2_pad_proc_lowres.fgb'
                  ,type: "FGB"
                  ,update: 1
                  ,pad: 0
                  ,minZoom: 1
                  ,maxZoom: 10
                  ,style: { color: '#0080ff', weight: 3, zIndex: 2500 }
                  ,color: "#000000"
                  ,template: padTpl
                  ,loadingId: 'loading'
                  ,featureFn: util.addMarker
               }
               ,{
                  url: 'https://gisph.s3.amazonaws.com/public/2_pad_proc_hires.fgb'
                  ,type: "FGB"
                  ,update: 2
                  ,pad: .02
                  ,minZoom: 11
                  ,maxZoom: 20
                  ,style: { color: '#0080ff', weight: 3, zIndex: 2500 }
                  ,color: "#000000"
                  ,template: padTpl
                  ,loadingId: 'loading'
                  ,featureFn: util.addMarker
               }
            ]
         }
         ,{
            id: "designation"
            ,name: 'Designation'
            ,color: "#000000"
            ,layers: [
               {
                  url: 'https://gisph.s3.amazonaws.com/public/2_pad_des_lowres.fgb'
                  ,type: "FGB"
                  ,update: 1
                  ,pad: 0
                  ,minZoom: 1
                  ,maxZoom: 11
                  ,style: { color: '#005500', weight: 3, zIndex: 2500 }
                  ,color: "#000000"
                  ,template: padTpl
                  ,loadingId: 'loading'
                  ,featureFn: util.addMarker
               }
               ,{
                  url: 'https://gisph.s3.amazonaws.com/public/2_pad_des_hires.fgb'
                  ,type: "FGB"
                  ,update: 2
                  ,pad: .001
                  ,minZoom: 12
                  ,maxZoom: 20
                  ,style: { color: '#005500', weight: 3, zIndex: 2500 }
                  ,color: "#000000"
                  ,template: padTpl
                  ,loadingId: 'loading'
                  ,featureFn: util.addMarker
               }
            ]
         }
         ,{
            id: "fee"
            ,name: 'Fee'
            ,color: "#000000"
            ,layers: [
               {
                  url: 'https://gisph.s3.amazonaws.com/public/2_pad_fee_lowres.fgb'
                  ,type: "FGB"
                  ,update: 1
                  ,pad: 0
                  ,minZoom: 1
                  ,maxZoom: 12
                  ,style: { color: '#cccc00', weight: 3, zIndex: 2500 }
                  ,color: "#000000"
                  ,template: padTpl
                  ,loadingId: 'loading'
                  ,featureFn: util.addMarker
               }
               ,{
                  url: 'https://gisph.s3.amazonaws.com/public/2_pad_fee_hires.fgb'
                  ,type: "FGB"
                  ,update: 2
                  ,pad: .001
                  ,minZoom: 13
                  ,maxZoom: 20
                  ,style: { color: '#cccc00', weight: 3, zIndex: 2500 }
                  ,color: "#000000"
                  ,template: padTpl
                  ,loadingId: 'loading'
                  ,featureFn: util.addMarker
               }
            ]
         }
         ,{
            id: "padeasement"
            ,name: 'Easement'
            ,color: "#000000"
            ,layers: [
               {
                  url: 'https://gisph.s3.amazonaws.com/public/2_pad_ease_lowres.fgb'
                  ,type: "FGB"
                  ,update: 1
                  ,pad: 0
                  ,minZoom: 1
                  ,maxZoom: 10
                  ,style: { color: '#591000', weight: 3, zIndex: 2500 }
                  ,color: "#000000"
                  ,template: padTpl
                  ,loadingId: 'loading'
                  ,featureFn: util.addMarker
               }
               ,{
                  url: 'https://gisph.s3.amazonaws.com/public/2_pad_ease_hires.fgb'
                  ,type: "FGB"
                  ,update: 2
                  ,pad: .02
                  ,minZoom: 11
                  ,maxZoom: 20
                  ,style: { color: '#591000', weight: 3, zIndex: 2500 }
                  ,color: "#000000"
                  ,template: padTpl
                  ,loadingId: 'loading'
                  ,featureFn: util.addMarker
               }
            ]
         }
         ,{
            id: "padother"
            ,name: 'Other'
            ,color: "#000000"
            ,layers: [
               {
                  url: 'https://gisph.s3.amazonaws.com/public/2_pad_other_lowres.fgb'
                  ,type: "FGB"
                  ,update: 1
                  ,pad: 0
                  ,minZoom: 1
                  ,maxZoom: 10
                  ,style: { color: '#ad1000', weight: 3, zIndex: 2500 }
                  ,color: "#000000"
                  ,template: padTpl
                  ,loadingId: 'loading'
                  ,featureFn: util.addMarker
               }
               ,{
                  url: 'https://gisph.s3.amazonaws.com/public/2_pad_other_hires.fgb'
                  ,type: "FGB"
                  ,update: 2
                  ,pad: .02
                  ,minZoom: 11
                  ,maxZoom: 20
                  ,style: { color: '#ad1000', weight: 3, zIndex: 2500 }
                  ,color: "#000000"
                  ,template: padTpl
                  ,loadingId: 'loading'
                  ,featureFn: util.addMarker
               }
            ]
         }
      ]
   }
   ,{
      id: "misclayers"
      ,name: "Misc Layers"
      ,opt: "radio"
      ,layers: [
         {
            id: "miscnone"
            ,name: "None"
            ,selected: 1
            ,layers: [
               {
                  url: ""
               }
            ]
         }
         ,{
            id: "firerisk"
            ,name: "Fire Risk"
            ,legendClass: 'legendClass'
            ,legend: {
               id: "fireriskLegend"
               ,title: '<strong>Risk</strong>'
               ,type: "colorstop"
               ,colors: '#6a8cb9,#8da5bb,#b4c2bd,#d9e0be,#ffffbd,#fcd397,#f6ac76,#ef8255,#e45b39,#d43121'
               ,values: '0,1,2,3,4,5,6,7,8,9,10'
               ,thickness: "15px"
               ,opacity: .4
               ,style: "height: 325px; padding: 5px; margin: 0px; background-color: white; border: 1px solid black;"
            }
            ,layers: [
               {
                  url: "https://gisph.s3.amazonaws.com/raster/fireriskByte.tif"
                  ,id: "firerisk"
                  ,type: "COG"
                  ,loadingId: 'loading'
                  ,fn: util.gradientPalette
                  ,colors: ['#ffffff00','#6a8cb9','#8da5bb','#b4c2bd','#d9e0be','#ffffbd','#fcd397','#f6ac76','#ef8255','#e45b39','#d43121']
                  ,values: [0,1,2,3,4,5,6,7,8,9,10]
                  ,title: 'Risk'
                  ,minValue: 0
                  ,maxValue: 10
                  ,opacity: .40
                  ,mapId: 'map'
                  ,attribution: '<a href="https://www.usfs.gov/" target="_blank">USFS</a>'
               }
            ]
         }
         ,{
            id: "landcover"
            ,name: "Land Cover"
            ,layers: [
               {
                  //url: "https://gisph.s3.amazonaws.com/raster/nlcdgm.tif"
                  url: "https://www.postholer.com/demo/cdt/nlcdgm.tif"
                  ,id: "landcover"
                  ,type: "COG"
                  ,loadingId: 'loading'
                  ,fn: util.rasterPalette
                  ,minValue: 1
                  ,maxValue: 95
                  ,opacity: .4
                  ,attribution: '<a href="https://www.mrlc.gov/" target="_blank">MRLC</a>'
               }
            ]
         }
         ,{
            id: "quakerisk"
            ,name: "Quake Risk"
            ,legendClass: 'legendClass'
            ,legend: {
               id: "quakeriskLegend"
               ,title: '<strong>Risk</strong>'
               ,type: "cell"
               ,colors: '#1a8444,#58b45c,#a4d765,#fff6ad,#fbaa5a,#f68549,#eb6036,#c01f22,#a40423,#9604fd'
               ,values: '1,2,3,4,5,6,7,8,9,10'
               ,thickness: "15px"
               ,opacity: .4
               ,style: "font-size: 1.2em; padding: 5px; margin: 0px; background-color: white; border: 1px solid black;"
               ,labelStyleFn:  function (index = null, self = null) {
                  return self.format('<span style="font-weight: bold;">{0}</span>', self.values[index]);
               }
               ,cellStyleFn:  function (index = null, self = null) {
                  return self.format(
                     "width: 30px; height: 20px; border: 1px solid black; background-color: {0}{1};", self.colors[index], parseInt(self.opts.opacity * 255).toString(16)
                  );
         }
            }
            ,layers: [
               {
                  url: "https://www.postholer.com/demo/cdt/eqhazardMasked3857.tif"
                  ,id: "quakerisk"
                  ,type: "COG"
                  ,loadingId: 'loading'
                  ,fn: util.gradientPalette
                  ,colors: ['#1a8444','#58b45c','#a4d765','#fff6ad','#fbaa5a','#f68549','#eb6036','#c01f22','#a40423','#9604fd']
                  ,values: [1,2,3,4,5,6,7,8,9,10]
                  ,minValue: 1
                  ,maxValue: 10
                  ,opacity: .40
                  ,mapId: 'map'
                  ,title: 'Risk'
                  ,legendClass: 'legend'
                 // ,legendImg: 'https://gisph.s3.amazonaws.com/public/eqhazardLegend.png'
                  ,attribution: '<a href="https://www.USGS.gov/" target="_blank">USGS</a>'
               }
            ]
         }
/*
         ,{
// https://basemap.nationalmap.gov/arcgis/rest/services/USGSShadedReliefOnly/MapServer/WMTS/1.0.0/WMTSCapabilities.xml
            id: "shade"
            ,name: "Hill Shade"
            ,selected: 0
            ,layers: [
               {
                  url: 'https://server.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}'
                  ,type: "WMTS"
                  ,minZoom: 1
                  ,maxZoom: 19
                  ,attribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank">OSM</a> '
               }
            ]
         }
*/
      ]
   }
];

