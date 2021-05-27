#gbWeb/api/currentRelease/ISO/ALL
#gbWeb/api/currentRelease/all
#gbWeb/api/currentRelease/ISO/ADM0
#gbWeb/api/currentRelease/ISO/ADM1
#gbWeb/api/currentRelease/ISO/ADM2

#(etc).

import pandas as pd
dta = pd.read_csv("geoBoundaries/releaseData/geoBoundariesOpen-meta.csv")
print(dta)