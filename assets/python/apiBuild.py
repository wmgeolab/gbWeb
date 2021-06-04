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

for i, r in openDta.iterrows():
       gbIDPath = "//__w/gbWeb/api/gbID/" + str(openDta["boundaryID"]) + "/"
       currentpath = "//__w/gbWeb/api/current/" + str(openDta["boundaryISO"]) + "/" + str(openDta["boundaryType"]) + "/"

       #Build library we'll translate into a json
       apiData = {}
       apiData["gbOpen"] = r.to_dict()

       print(apiData["gbOpen"])

       sys.exit()