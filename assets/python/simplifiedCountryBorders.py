from urllib.request import urlopen
import json
from shapely.geometry import asShape, LineString, MultiLineString

# params
thresh = 0.1 # simplification threshold in decimal degrees

# GEOJSON VERSION
# fetch geojjson from geoboundaries
url = 'https://www.geoboundaries.org/data/geoBoundariesCGAZ-3_0_0/ADM0/simplifyRatio_10/geoBoundariesCGAZ_ADM0.geojson'
raw = urlopen(url).read()
geoj = json.loads(raw)

# ignore countries without iso
features = geoj['features']
print('original features', len(features))
new_features = []
for feat in features:
    if feat['properties']['shapeISO'] == 'None':
        print('fixing',feat['properties'])
        # fixes bug with philippines
        feat['properties']['shapeISO'] = feat['properties']['shapeGroup']
        if feat['properties']['shapeISO'] == 'CHE':
            feat['properties']['shapeName'] = 'Switzerland'
        elif feat['properties']['shapeISO'] == 'PHL':
            feat['properties']['shapeName'] = 'Philippines'
    print(feat['properties']['shapeISO'], feat['properties']['shapeName'])
    # simplify geometry
    geom = asShape(feat['geometry'])
    simpler = geom.simplify(thresh)
    feat['geometry'] = simpler.__geo_interface__
    new_features.append(feat)
geoj['features'] = new_features
print('output features', len(new_features))

# write to geojson file
print('writing to output')
output = '../data/gb-countries-simple.js'
with open(output, 'w', encoding='utf8') as fobj:
    raw = json.dumps(geoj)
    raw = 'var countryBoundaries = ' + raw
    fobj.write(raw)

### TOPOJSON VERSION
### fetch topojson from geoboundaries
##url = 'https://www.geoboundaries.org/data/geoBoundariesCGAZ-3_0_0/ADM0/simplifyRatio_10/geoBoundariesCGAZ_ADM0.topojson'
##raw = urlopen(url).read()
##topo = json.loads(raw)
##
### ignore countries without iso
##lyrs = list(topo['objects'].keys())
##lyr = lyrs[0]
##geometries = topo['objects'][lyr]['geometries']
##print('original features', len(geometries))
##new_geometries = []
##for obj in geometries:
##    if obj['properties']['shapeISO'] == 'None':
##        continue
##    new_geometries.append(obj)
##topo['objects'][lyr]['geometries'] = new_geometries
##print('output features', len(new_geometries))
##
### simplify each of the topojson arcs
##print('simplifying')
##arcs = topo['arcs']
##new_arcs = []
##for i,arc in enumerate(arcs):
##    print(i,'of',len(arcs))
##    line = LineString(arc)
##    simpler = line.simplify(thresh)
##    new_arcs.append(list(simpler.coords))
####lines = MultiLineString(arcs)
####simpler = lines.simplify(thresh)
####new_arcs = simpler.coords
##topo['arcs'] = new_arcs
##
### write to topojson file
##print('writing to output')
##output = '../data/countries-simple.topojson'
##with open(output, 'w', encoding='utf8') as fobj:
##    raw = json.dumps(topo)
##    fobj.write(raw)
