import pandas as pd
import os
import sys
import json
import numpy as np
import copy

openDta = pd.read_csv("//__w/gbWeb/geoBoundaries/releaseData/geoBoundariesOpen-meta.csv", encoding='utf8')
humDta = pd.read_csv("//__w/gbWeb/geoBoundaries/releaseData/geoBoundariesHumanitarian-meta.csv", encoding='utf8')
authDta = pd.read_csv("//__w/gbWeb/geoBoundaries/releaseData/geoBoundariesAuthoritative-meta.csv", encoding='utf8')

for i, r in openDta.iterrows():
    gbIDPath = "//__w/gbWeb/gbWeb/api/gbID/" + str(r["boundaryID"]) + "/"
    currentPath = "//__w/gbWeb/gbWeb/api/current/" + str(r["boundaryISO"]) + "/" + str(r["boundaryType"]) + "/"

    #Create folder structures if they don't exist
    os.makedirs(gbIDPath, exist_ok=True)
    os.makedirs(currentPath, exist_ok=True)

    #Build library we'll translate into a json
    apiData = {}
    apiData = r.to_dict()
    apiData["downloadURL"] = "https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbOpen/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-all.zip"
    apiData["gjDownloadURL"] = "https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbOpen/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+".geojson"
    apiData["imagePreview"] = "https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbOpen/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-PREVIEW.png"

    #Match on authoritative 
    authMatch = authDta[(authDta["boundaryISO"]==r["boundaryISO"]) & (authDta["boundaryType"]==r["boundaryType"])]
    
    if(authMatch.shape[0] == 1):
        apiData["gbAuthoritative"] = authMatch.to_dict('r')[0]
        apiData["gbAuthoritative"]["downloadURL"] = "https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbAuthoritative/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-all.zip"
        apiData["gbAuthoritative"]["gjDownloadURL"] = "https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbAuthoritative/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+".geojson"
        apiData["gbAuthoritative"]["imagePreview"] = "https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbAuthoritative/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-PREVIEW.png"
    else:
        apiData["gbAuthoritative"] = "No authoritative boundary exists for this ISO/ADM."

    
    humMatch = humDta[(humDta["boundaryISO"]==r["boundaryISO"]) & (humDta["boundaryType"]==r["boundaryType"])]
    if(humMatch.shape[0]==1):
        apiData["gbHumanitarian"] = humMatch.to_dict('r')[0]
        apiData["gbHumanitarian"]["downloadURL"] = "https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbHumanitarian/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-all.zip"
        apiData["gbHumanitarian"]["gjDownloadURL"] = "https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbHumanitarian/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+".geojson"
        apiData["gbHumanitarian"]["imagePreview"] = "https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbHumanitarian/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-PREVIEW.png"

    else:
        #If no humanitarian exists, we just duplicate the open product links.
        t = copy.deepcopy(apiData)
        apiData["gbHumanitarian"] = t
        
    #Double check we're UTF8
    apiData = apiData.encode('utf8')

    with open(currentPath + "index.json", "w") as f:
        json.dump(apiData, f)

    with open(gbIDPath + "index.json", "w") as f:
        json.dump(apiData, f)

    if(authMatch.shape[0] > 0):
        tApiData = apiData["gbAuthoritative"]
        authPath = "//__w/gbWeb/gbWeb/api/gbID/" + str(tApiData["boundaryID"]) + "/"
        os.makedirs(authPath, exist_ok=True)
        with open(authPath + "index.json", "w") as f:
            json.dump(tApiData, f)

    if(humMatch.shape[0] > 0):
        hApiData = apiData["gbHumanitarian"]
        humPath = "//__w/gbWeb/gbWeb/api/gbID/" + str(hApiData["boundaryID"]) + "/"
        os.makedirs(humPath, exist_ok=True)
        with open(humPath + "index.json", "w") as f:
            json.dump(hApiData, f)    