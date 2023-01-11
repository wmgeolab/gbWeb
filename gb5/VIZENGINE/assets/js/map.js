
function initMap(vopts = {}) {
    var opts = Object.assign(
       defaultMapOpts
       ,vopts
    );
 
    loadLayerGroups('groups');
 
    map = L.map('map', opts).setView([opts.center.lat, opts.center.lng], opts.zoom);
    map.attributionControl.addAttribution('<a href="https://continentaldividetrail.org/" target="_blank">CDTC</a>');
    L.control.scale().addTo(map);
    L.control.zoom({position: 'topright'}).addTo(map);
 
    var latlon = document.getElementById('latlon');
    var fixed = document.getElementById('fixed');
    var bounds = document.getElementById('bounds');
 
    bounds.innerHTML = getBounds();
 
   
 
    layerHandler(0, 0);
 
    map.on('mousemove', (e) => {
       let ctr = map.getCenter();
       let ctt = L.Browser.mobileWebkit || L.Browser.mobile 
          ? ctr.lng.toFixed(6) + ' ' + ctr.lat.toFixed(6) 
          : e.latlng.lat.toFixed(6) + ' ' + e.latlng.lng.toFixed(6);
       latlon.innerHTML = ctt;
    });
 
    map.on("moveend", function(e) {
       bounds.innerHTML = getBounds();
    });
 
    map.on('click', (e) => {
       fixed.innerHTML = latlon.innerHTML;
    });
 }
 
 function getBounds() {
    let b = map.getBounds();
    return  b.getWest().toFixed(3) + ' ' + b.getSouth().toFixed(3) + ' ' + b.getEast().toFixed(3) + ' ' + b.getNorth().toFixed(3);
 }
 
 function loadLayerGroups(div = '') {
    var ob = null
    if((ob = document.getElementById(div)) === null) return;
    var str = '';
 
    for(let i = 0; i < groups.length; i++) {
       str += '<strong>' + groups[i].name + ':</strong><br>';
       for(let j = 0; j < groups[i].layers.length; j++) {
          let checked = ('selected' in groups[i].layers[j] && groups[i].layers[j].selected === 1) ? "checked" : "";
          let event = 'onclick="layerHandler(' + i + ", " + j + ')"';
          str += '<input type="' + groups[i].opt + '" id="' + groups[i].layers[j].id 
                       + '" name="' + groups[i].id + '" value="' + groups[i].layers[j].name + '" ' + checked + ' ' + event + '>'
          str += '<label for="' + groups[i].layers[j].id + '"><span style="color: ' + groups[i].layers[j].color + ';">' + groups[i].layers[j].name + '</span></label><br>'
       }
    }
    ob.innerHTML = '<p style="margin-top: 0px; margin-bottom: 0px;">' + str + '</p>';
 }
 
 
 function layerHandler(gidx = -1, lidx = -1) {
    if(gidx < 0 || lidx < 0 || map === null) return;
 
    for(let i = 0; i < groups[gidx].layers.length; i++) {
       for(let j = 0; j < groups[gidx].layers[i].layers.length; j++) {
          if(!('_layer' in groups[gidx].layers[i].layers[j])) groups[gidx].layers[i].layers[j]._layer = null;
          var checked = document.getElementById(groups[gidx].layers[i].id).checked;
 
          updateLegend(checked, groups[gidx].layers[i]);
 
          if(!checked && groups[gidx].layers[i].layers[j]._layer !== null)
             groups[gidx].layers[i].layers[j].type === 'WMTS' 
                ? map.removeLayer(groups[gidx].layers[i].layers[j]._layer) 
                : groups[gidx].layers[i].layers[j]._layer.setActive(checked);
    
          if(groups[gidx].opt === 'radio' && groups[gidx].layers[lidx].layers[j].url.length) {
             if(checked && groups[gidx].layers[i].layers[j].type === 'COG') {
                if(groups[gidx].layers[lidx].layers[j]._layer !== null) groups[gidx].layers[lidx].layers[j]._layer.setActive(checked);
                else groups[gidx].layers[lidx].layers[j]._layer = new COG(map, groups[gidx].layers[lidx].layers[j]);
             } else if(checked && groups[gidx].layers[i].layers[j].type === 'WMTS') {
                if('minZoom' in groups[gidx].layers[lidx].layers[j]) {
                   map.options.minZoom = groups[gidx].layers[lidx].layers[j].minZoom;
                   map.options.maxZoom = groups[gidx].layers[lidx].layers[j].maxZoom;
                   if(map.getZoom() > groups[gidx].layers[lidx].layers[j].maxZoom) map.setZoom(groups[gidx].layers[lidx].layers[j].maxZoom); 
                }
                groups[gidx].layers[lidx].layers[j]._layer = L.tileLayer(groups[gidx].layers[lidx].layers[j].url, groups[gidx].layers[lidx].layers[j]);
                map.addLayer(groups[gidx].layers[lidx].layers[j]._layer);
             } else if(checked && groups[gidx].layers[i].layers[j].type === 'FGB') {
                if(groups[gidx].layers[i].layers[j]._layer === null) groups[gidx].layers[i].layers[j]._layer = new FGB(map, groups[gidx].layers[i].layers[j]);
                else groups[gidx].layers[i].layers[j]._layer.addLayer();
                groups[gidx].layers[i].layers[j]._layer.setActive(checked);
             }
          } else if(groups[gidx].opt === 'checkbox' && groups[gidx].layers[i].layers[j].url.length) {
             if(checked && groups[gidx].layers[i].layers[j].type === 'FGB' && i == lidx) {
                if(groups[gidx].layers[i].layers[j]._layer === null) groups[gidx].layers[i].layers[j]._layer = new FGB(map, groups[gidx].layers[i].layers[j]);
                else groups[gidx].layers[i].layers[j]._layer.addLayer();
                groups[gidx].layers[i].layers[j]._layer.setActive(checked);
                //groups[gidx].layers[i].layers[j]._layer.update();
             } else if(checked && groups[gidx].layers[i].layers[j].type === 'COG' && i == lidx) {
                if(groups[gidx].layers[i].layers[j]._layer === null) groups[gidx].layers[i].layers[j]._layer = new COG(map, groups[gidx].layers[i].layers[j]);
                else groups[gidx].layers[i].layers[j]._layer.setActive(checked);
             }
          }
       }
    }
    console.log('layerHandler: ', groups[gidx].layers[lidx].name, groups[gidx].id);
 }
 
 function updateLegend(checked = false, layer = null) {
    if(layer === null || !('legend' in layer)) {
        return;
    } else if(('_legendDiv' in layer) && layer._legendDiv !== null) {
       layer._legendDiv.style.display = checked ? 'block' : 'none';
       return;
    } else if(!checked) {
       return;
    }
 
    layer._legendDiv = document.createElement("div");
    layer._legendDiv.id = layer.legend.id;
    if(('legendClass' in layer)) layer._legendDiv.className = layer.legendClass;
    if(('style' in layer.legend)) layer._legendDiv.style = layer.legend.style;
    if(!('legendClass' in layer) && !('style' in layer.legend)) layer._legendDiv.style = 'height: 300px; background-color: white; border: 1px solid black; padding: 5px;';
    var m = document.getElementById('map');
    m.appendChild(layer._legendDiv);
    
    layer._legend = new JSLegend(layer.legend);
    layer._legend.showLegend();
    m.style.display = "block";
 
 }