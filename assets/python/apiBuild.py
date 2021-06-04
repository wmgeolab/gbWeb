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
import numpy as np

openDta = pd.read_csv("//__w/gbWeb/geoBoundaries/releaseData/geoBoundariesOpen-meta.csv")
humDta = pd.read_csv("//__w/gbWeb/geoBoundaries/releaseData/geoBoundariesHumanitarian-meta.csv")
authDta = pd.read_csv("//__w/gbWeb/geoBoundaries/releaseData/geoBoundariesAuthoritative-meta.csv")

for i, r in openDta.iterrows():
    gbIDPath = "//__w/gbWeb/gbWeb/api/gbID/" + str(r["boundaryID"]) + "/"
    currentPath = "//__w/gbWeb/gbWeb/api/current/" + str(r["boundaryISO"]) + "/" + str(r["boundaryType"]) + "/"

    #Create folder structures if they don't exist
    os.makedirs(gbIDPath, exist_ok=True)
    os.makedirs(currentPath, exist_ok=True)

    #Build library we'll translate into a json
    apiData = {}
    apiData["gbOpen"] = r.to_dict()
    apiData["gbOpen"]["downloadURL"] = "https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbOpen/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-all.zip"
    apiData["gbOpen"]["gjDownloadURL"] = "https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbOpen/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+".geojson"
    apiData["gbOpen"]["imagePreview"] = "https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbOpen/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-PREVIEW.png"

    #Match on authoritative 
    authMatch = authDta[(authDta["boundaryISO"]==r["boundaryISO"]) & (authDta["boundaryType"]==r["boundaryType"])]
    apiData["gbAuthoritative"] = authMatch.to_dict()

    humMatch = humDta[(humDta["boundaryISO"]==r["boundaryISO"]) & (humDta["boundaryType"]==r["boundaryType"])]
    apiData["gbHumanitarian"] = humMatch.to_dict()


    with open(currentPath + "index.json", "w") as f:
        json.dump(apiData, f)

    sys.exit()