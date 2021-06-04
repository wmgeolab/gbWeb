#gbWeb/api/currentRelease/ISO/ALL
#gbWeb/api/currentRelease/all
#gbWeb/api/currentRelease/ISO/ADM0
#gbWeb/api/currentRelease/ISO/ADM1
#gbWeb/api/currentRelease/ISO/ADM2

#(etc).

import pandas as pd
import os
import sys
import json
import pathlib

openDta = pd.read_csv("//__w/gbWeb/geoBoundaries/releaseData/geoBoundariesOpen-meta.csv")
humDta = pd.read_csv("//__w/gbWeb/geoBoundaries/releaseData/geoBoundariesHumanitarian-meta.csv")
authDta = pd.read_csv("//__w/gbWeb/geoBoundaries/releaseData/geoBoundariesAuthoritative-meta.csv")

for i, r in openDta.iterrows():
    gbIDPath = "//__w/gbWeb/gbWeb/api/gbID/" + str(openDta["boundaryID"]) + "/"
    currentPath = "//__w/gbWeb/gbWeb/api/current/" + str(openDta["boundaryISO"]) + "/" + str(openDta["boundaryType"]) + "/"

    #Create folder structures if they don't exist
    pathlib.Path(gbIDPath).mkdir(exist_ok=True)
    pathlib.Path(currentPath).mkdir(exist_ok=True)

    #Build library we'll translate into a json
    apiData = {}
    apiData["gbOpen"] = r.to_dict()

    print(apiData["gbOpen"])

    with open(currentPath + "index.json", "w") as f:
        json.dumps(apiData, f)

    sys.exit()