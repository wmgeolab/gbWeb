
util = new Util();

defaultMapOpts = {
   center: { lat: -3.25, lng: 30.1 }
   ,minZoom: 1
   ,maxZoom: 19
   ,zoom: 5
   ,zoomControl: false
}



firesTpl = "\
   <strong>Name: </strong>{shapeName}\
";
groups = [
   {
      id: "basemaps"
      ,name: "Base Maps"
      ,opt: "radio"
      ,layers: [
         { 
            id: "satellite"
            ,name: "Satellite"
            ,selected: 1
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
                  url: "https://www.geoboundaries.org/gb5/VIZENGINE/data/geoBoundaries-IND-ADM5.geotiff"
                  ,id: "mint"
                  ,type: "COG"
                  ,loadingId: 'loading'
                  ,fn: util.rangePalette
                  ,colors: ['#0002aa','#0002ff','#0044ff','#0084ff','#00c4ff','#00ffd0','#00ff36','#65ff00','#fdff00','#ffdc00','#ffb400','#ff8c00','#ff6400','#ff3c00','#ff1400','#ff0020','#ff00ff']
                  ,values: [0.00,5.00,10.00,20.00,50.00,60.00,80.00,200.00,210.00,215.56,221.11,226.67,232.22,237.78,243.33,248.89,100000.00]
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
      ]
   }
];

