
class FGB {
    constructor(map = null, vopts = {}) {
       this.opts = Object.assign({
          url: null
          ,id: null
          ,minZoom: 1
          ,maxZoom: 20
          ,style: { color: '#000000', weight: 3 }
          ,featureFn: null
          ,template: null
          ,loadingId: null
          ,pad: 0
          ,update: 0
          ,active: false
       }, vopts);
 
       this.map = map;
       this.layer = null;
       this.opts.curZoom = this.map.getZoom();
       this.globalBBox = { minX: -180, maxX: 180, minY: -90, maxY: 90 };
 
       this.update = _.throttle(this.update, 1000);
 
       this.map.on('moveend', (e) => this.moveEnd(e));
    }
 
    setActive(v = false) { 
       this.opts.active = v; 
       if(!v) this.removeLayer();
       if(v) this.update();
    }
 
    moveEnd(e) {
       this.opts.curZoom = this.map.getZoom();
 
       if(!this.opts.active) return;
       if(this.opts.update > 0) this.update();
    }
    
    layerLoaded() {
       return this.layer !== null ? 1 : 0;
    }
 
    addLayer() {
       if(this.layer !== null) this.map.addLayer(this.layer);
    }
 
    removeLayer() {
       if(this.layer !== null && this.map.hasLayer(this.layer)) this.map.removeLayer(this.layer);
    }
 
    async update() {
       if(this.opts.url === null) return;
 
       if((this.opts.curZoom < this.opts.minZoom || this.opts.curZoom > this.opts.maxZoom) && this.layer !== null) {
          this.map.removeLayer(this.layer);
       } else if(this.opts.curZoom >= this.opts.minZoom && this.opts.curZoom <= this.opts.maxZoom) {
          if(this.layer === null || this.opts.update === 2) this.loadFGB();
          this.map.addLayer(this.layer);
       } else {
          if(this.layer !== null) this.map.addLayer(this.layer);
       }
    }
 
    toggleDiv(how = null) {
       var o = null;
       if((o = document.getElementById(this.opts.loadingId)) === null) return null;
       let chg = how === null && o.style.display === 'block' ? 'none' : 'block';
       o.style.display = how !== null ? how : chg;
    }
 
    async loadFGB() {
       this.toggleDiv('block');
       var old = this.layer !== null ? this.layer : null;
       var b = this.map.getBounds();
       var bbox = { 
          minX: b.getWest() - this.opts.pad
          ,maxX: b.getEast() + this.opts.pad
          ,minY: b.getSouth() - this.opts.pad
          ,maxY: b.getNorth() + this.opts.pad
       };
 
       var z = this.map.getZoom();
       if(z > 12) this.opts.div = 1;
       else if(z > 10) this.opts.div = 5;
       else if(z > 9) this.opts.div = 10;
       else if(z > 8) this.opts.div = 25;
       else if(z > 7) this.opts.div = 50;
       else if(z > 6) this.opts.div = 100;
       else if(z > 5) this.opts.div = 250;
       else if(z > 4) this.opts.div = 500;
       else if(z > 0) this.opts.div = 1000;
 
       this.layer = L.layerGroup();
       var iter = flatgeobuf.deserialize(this.opts.url, this.opts.update === 2 ? bbox : this.globalBBox);
 
       for await (const feature of iter) {
          var f = L.geoJSON(feature, {
             style: this.opts.style,
          });
          if(this.opts.featureFn === null) f.addTo(this.layer);
          else this.opts.featureFn(this.layer, feature, this.opts); 
       }
       if(old !== null) this.map.removeLayer(old);
       this.toggleDiv('none');
    }
 }
 
 class COG {
    constructor(vmap = null, vopts = {}) {
       this.map = vmap;
       this.opts = Object.assign({
          id: null
          ,url: null
          ,colorFn: null
          ,minValue: 0
          ,maxValue: 255
          ,opacity: 1
          ,zIndex: 2000
          ,loadingId: null
          ,mapId: null
       }, vopts);
 
       this.layer = null;
 
       this.loadCOG = _.throttle(this.loadCOG, 1000);
       this.loadCOG();
    }
 
    setActive(v = false) { 
       v ? this.addLayer() : this.removeLayer();
    }
 
    layerLoaded() {
       return this.layer !== null ? 1 : 0;
    }
 
    addLayer() {
       if(this.layer !== null) {
          this.map.addLayer(this.layer);
       }
    }
 
    removeLayer() {
       if(this.layer !== null && this.map.hasLayer(this.layer)) {
          this.map.removeLayer(this.layer);
       }
    }
 
    toggleDiv(how = null) {
       var o = null;
       if((o = document.getElementById(this.opts.loadingId)) === null) return null;
       var chg = how === null && o.style.display === 'block' ? 'none' : 'block';
       o.style.display = how !== null ? how : chg;
    }
 
    async loadCOG() {
       if(this.opts.url == null || this.map == null) return null;
 
       this.toggleDiv('block');
       if('colors' in this.opts) {
          this.opts._colors = this.parseColors(this.opts.colors);
          this.opts._range = this.opts.maxValue - this.opts.minValue;
          if(this.opts._range < this.opts._colors.length - 1 && !('minDataValue' in this.opts))
             console.log('loadCOG: Too many colors for range (maxValue - minValue): ',this.opts._range, this.opts._colors.length - 1);
          this.opts._div = this.opts._range / (this.opts._colors.length - 1);
          if(this.opts._div < 1 && !('minDataValue' in this.opts)) console.log('loadCOG: div is zero');
       }
 
       parseGeoraster(this.opts.url).then(georaster => {
       if(!('noDataValue' in this.opts)) this.opts.noDataValue = georaster.noDataValue;
          var gopts = {
             georaster: georaster
             ,resampleMethod: 'nearest'
             ,resolution: 256
             ,pixelValuesToColorFn: values => this.opts.fn(values, this.opts, georaster.palette)
          };
          Object.assign(gopts, this.opts);
    
          this.layer = new GeoRasterLayer(gopts);
          this.addLayer();
          this.toggleDiv('none');
       }).catch(e => {
          this.toggleDiv('none');
          console.log('e: ', e);
       });
    }
    
    parseColors(colors = []) {
       var res = [];
       for(var i = 0; i < colors.length; i++) {
          res[i] = [];
          for(var j = 0; j < 6; j+=2) {
             res[i].push(parseInt(colors[i].replace('#','').substr(j, 2), 16));
          }
       }
       return res;
    }
 }
    
 class Util {
    constructor() {
    }
 
    toggleDiv(id = null, how = null) {
       var o = null;
       if((o = document.getElementById(id)) === null) return null;
       let chg = how === null && o.style.display === 'block' ? 'none' : 'block';
       o.style.display = how !== null ? how : chg;
    }
 
    isChecked(id = null) {
       var res = -1;
       return (res = document.getElementById(id)) === null ? false : res;
    }
 
    oldaddMarker(layer = null, feature = null) {
       var m = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]]).bindPopup(feature.properties.name);
       m.addTo(layer);
    }
 
    addMileMarker(layer = null, feature = null, opts = null) {
       if(!('mile' in feature.properties) || parseInt(feature.properties.mile) % opts.div) return;
      
       var mess = 'Mile: ' + feature.properties.mile
                  + '<br>Elev: ' + feature.properties.elev; 
       L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {icon: L.divIcon({className: opts.className, html: feature.properties.mile})}).bindTooltip(mess).addTo(layer);
    }
 
    addMarker(layer = null, feature = null, opts = null) {
       var pat = null;
       var tpl = opts.template;
       for(var key in feature.properties) {
          pat = new RegExp("{" + key + "}","g");
          tpl = tpl.replace(pat, !(feature.properties[key] + '').length ? '-' : feature.properties[key]);
       }
 
       var crd = null;
       if(feature.geometry.coordinates.length === 2) crd = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
       else if('lat' in feature.properties) crd = [feature.properties.lat, feature.properties.lon];
       else if('latitude' in feature.properties) crd = [feature.properties.latitude, feature.properties.longitude];
 
    //   if(crd === null) return;
 
       pat = new RegExp("{.*?}","g");
       tpl = tpl.replace(pat, '-');
       var mycon = 'className' in opts ? L.divIcon({className: opts.className}) : null;
 
       var m = null;
       if(mycon !== null) m = L.marker(crd, {icon: mycon}).bindPopup(tpl);
       else if('style' in opts) m = L.geoJSON(feature, { style: opts.style }).bindPopup(tpl)
 
       if('name' in feature.properties) m.bindTooltip(feature.properties.name);
       m.addTo(layer);
    }
 
    // raster with lookup table, ie, nlcd
    rasterPalette(values = null, opts = {minValue: 0, maxValue: 1}, p = null) {
       return p !== null && values[0] >= opts.minValue && values[0] <= opts.maxValue
          ? 'rgba(' + p[values[0]][0] + ',' + p[values[0]][1] + ',' + p[values[0]][2] + ',' + (p[values[0]][3] / 255) + ')'
          : null;
    }
    
    // gradient for pixel values of type byte
    byteRGBPalette(values = null, opts = {minValue: 0, maxValue: 1, opacity: 1}, p = null) {
       return values[0] == opts.noDataValue || values[0] < opts.minValue || values[0] > opts.maxValue
          ? null
          : 'rgb('
             + parseInt(opts.r * (values[0] / opts.maxValue))
             + ',' + parseInt(opts.g * (values[0] / opts.maxValue))
             + ',' + parseInt(opts.b * (values[0] / opts.maxValue))
             + ')';
    }
    
    // non-gradient for pixel values of type byte
    rgbPalette(values = null, opts = {minValue: 0, maxValue: 1, opacity: 1}, p = null) {
       return values[0][0] == opts.noDataValue
          ? null
          : 'rgb('
             + values[0][0]
             + ',' + values[0][1]
             + ',' + values[0][2]
             + ')';
    }
    
    // gradient, min max mapped to each color, ie, max-min = number of hex colors
    gradientPalette(values = null, opts = {minValue: 0, maxValue: 1, opacity: 1}, p = null) {
       if(values[0] == opts.noDataValue || values[0] < opts.minValue || values[0] > opts.maxValue) return null;
       var idx = Math.floor(values[0] / opts._div) - 1;
       if(idx >= opts._colors.length - 1) idx--;
       if(idx < 0) return null;
       var pct = values[0] / opts._range;
       return 'rgba('
             + parseInt(opts._colors[idx][0] + parseInt((opts._colors[idx + 1][0] - opts._colors[idx][0]) * pct))
             + ',' + parseInt(opts._colors[idx][1] + parseInt((opts._colors[idx + 1][1] - opts._colors[idx][1]) * pct))
             + ',' + parseInt(opts._colors[idx][2] + parseInt((opts._colors[idx + 1][2] - opts._colors[idx][2]) * pct))
             + ')';
    }
 
    // use a single color for non noData pixels
    singlePalette(values = null, opts = {noDataValue: 0, opacity: 1, color: '#c00000'}, p = null) {
       return values[0] === opts.noDataValue || values[0] < opts.minValue || values[0] > opts.maxValue
          ? null
          : opts.color;
    }
 
    // gradient when values are not evenly spaced, ie, 1,2,4,8... # of values = # of colors
    rangePalette(values = null, opts = {minValue: 0, maxValue: 1, opacity: 1}, p = null) {
       var v = values[0];
       if(v === opts.noDataValue || v < opts.minDataValue || v > opts.maxDataValue) {
          return null;
       } else if(v >= opts.minDataValue && v <= opts.minValue) {
          return 'rgba(' + opts._colors[0][0] + ',' + opts._colors[0][1] + ',' + opts._colors[0][2] + ')';
       } else if(v >= opts.maxValue && v <= opts.maxDataValue) {
          var len = opts._colors.length - 1;
          return 'rgba(' + opts._colors[len][0] + ',' + opts._colors[len][1] + ',' + opts._colors[len][2] + ')';
       }
 
       var pct = 1;
       for(var i = 0; i < opts.values.length - 2; i++) {
          if(v >= opts.values[i] && v < opts.values[i + 1]) {
             pct = (v - opts.values[i]) / (opts.values[i + 1] - opts.values[i]);
             break;
          }
       }
 
       return 'rgba('
             + parseInt(opts._colors[i][0] + ((opts._colors[i + 1][0] - opts._colors[i][0]) * pct))
             + ',' + parseInt(opts._colors[i][1] + ((opts._colors[i + 1][1] - opts._colors[i][1]) * pct))
             + ',' + parseInt(opts._colors[i][2] + ((opts._colors[i + 1][2] - opts._colors[i][2]) * pct))
             + ')';
    }
 
    fillTpl(tpl = "", obj = null) {
       var pat = null;
    
       for(var key in obj) {
          pat = new RegExp("{" + key + "}","g");
          tpl = tpl.replace(pat, obj[key]);
       }
       pat = new RegExp("{.*?}","g");
       tpl = tpl.replace(pat, '-');
       return tpl;
    }
 };