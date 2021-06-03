#gbWeb/api/currentRelease/ISO/ALL
#gbWeb/api/currentRelease/all
#gbWeb/api/currentRelease/ISO/ADM0
#gbWeb/api/currentRelease/ISO/ADM1
#gbWeb/api/currentRelease/ISO/ADM2

#(etc).

import pandas as pd
import os
import sys

openDta = pd.read_csv("//__w/gbWeb/geoBoundaries/releaseData/geoBoundariesOpen-meta.csv")
humDta = pd.read_csv("//__w/gbWeb/geoBoundaries/releaseData/geoBoundariesHumanitarian-meta.csv")
authDta = pd.read_csv("//__w/gbWeb/geoBoundaries/releaseData/geoBoundariesAuthoritative-meta.csv")

print(openDta)
print(humDta)
print(authDta)

for c, r in openDta.iterrows():
    print(r)
    sys.exit()