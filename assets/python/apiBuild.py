import pandas as pd
import os
import sys
import json
import numpy as np
import copy
import requests
import time

token = sys.argv[0]

h = {'Authorization':'token %s' % token}

openDta = pd.read_csv("//__w/gbWeb/geoBoundaries/releaseData/geoBoundariesOpen-meta.csv", encoding='utf8').astype(str).dropna(axis=1,how='all')
humDta = pd.read_csv("//__w/gbWeb/geoBoundaries/releaseData/geoBoundariesHumanitarian-meta.csv", encoding='utf8').astype(str).dropna(axis=1,how='all')
authDta = pd.read_csv("//__w/gbWeb/geoBoundaries/releaseData/geoBoundariesAuthoritative-meta.csv", encoding='utf8').astype(str).dropna(axis=1,how='all')

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
    apiData["simplifiedGeometryGeoJSON"] = "https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbOpen/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"_simplified.geojson"
    #Match on authoritative 
    authMatch = authDta[(authDta["boundaryISO"]==r["boundaryISO"]) & (authDta["boundaryType"]==r["boundaryType"])]
    
    if(authMatch.shape[0] == 1):
        apiData["gbAuthoritative"] = authMatch.to_dict('r')[0]
        apiData["gbAuthoritative"]["downloadURL"] = "https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbAuthoritative/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-all.zip"
        apiData["gbAuthoritative"]["gjDownloadURL"] = "https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbAuthoritative/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+".geojson"
        apiData["gbAuthoritative"]["imagePreview"] = "https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbAuthoritative/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-PREVIEW.png"
        apiData["gbAuthoritative"]["simplifiedGeometryGeoJSON"] = "https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbAuthoritative/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"_simplified.geojson"
    else:
        apiData["gbAuthoritative"] = "No authoritative boundary exists for this ISO/ADM."

    
    humMatch = humDta[(humDta["boundaryISO"]==r["boundaryISO"]) & (humDta["boundaryType"]==r["boundaryType"])]
    if(humMatch.shape[0]==1):
        apiData["gbHumanitarian"] = humMatch.to_dict('r')[0]
        apiData["gbHumanitarian"]["downloadURL"] = "https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbHumanitarian/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-all.zip"
        apiData["gbHumanitarian"]["gjDownloadURL"] = "https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbHumanitarian/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+".geojson"
        apiData["gbHumanitarian"]["imagePreview"] = "https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbHumanitarian/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-PREVIEW.png"
        apiData["gbHumanitarian"]["simplifiedGeometryGeoJSON"] = "https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbHumanitarian/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"_simplified.geojson"

    else:
        #If no humanitarian exists, we just duplicate the open product links.
        t = copy.deepcopy(apiData)
        apiData["gbHumanitarian"] = t

    with open(currentPath + "index.json", "w") as f:
        json.dump(apiData, f)

    #Get sha for Open
    print(h)
    print("https://api.github.com/repos/wmgeolab/geoBoundaries/commits?path=releaseData/gbOpen/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-all.zip")
    d = requests.get("https://api.github.com/repos/wmgeolab/geoBoundaries/commits?path=releaseData/gbOpen/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-all.zip", headers=h)

    try:
        openSha = d.json()[0]["sha"]
    except:
        print(d.json())
        sys.exit()

    #Update the URLs with the sha links for open:
    apiData["downloadURL"] = "https://github.com/wmgeolab/geoBoundaries/raw/"+openSha+"/releaseData/gbOpen/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-all.zip"
    apiData["gjDownloadURL"] = "https://github.com/wmgeolab/geoBoundaries/raw/"+openSha+"/releaseData/gbOpen/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+".geojson"
    apiData["imagePreview"] = "https://github.com/wmgeolab/geoBoundaries/raw/"+openSha+"/releaseData/gbOpen/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-PREVIEW.png"
    apiData["simplifiedGeometryGeoJSON"] = "https://github.com/wmgeolab/geoBoundaries/raw/"+openSha+"/releaseData/gbOpen/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"_simplified.geojson"

    #If there is no humanitarian,
    #we need to re-copy the Open over.
    if(humMatch.shape[0]!=1):
        t = copy.deepcopy(apiData)
        del t["gbHumanitarian"]
        del t["gbAuthoritative"]
        apiData["gbHumanitarian"] = t


    with open(gbIDPath + "index.json", "w") as f:
        json.dump(apiData, f)

    if(authMatch.shape[0] > 0):
        #Modify authoritative links to point to the sha
        d = requests.get("https://api.github.com/repos/wmgeolab/geoBoundaries/commits?path=releaseData/gbAuthoritative/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-all.zip", headers=h)
        authSha = d.json()[0]["sha"]
        apiData["gbAuthoritative"]["downloadURL"] = "https://github.com/wmgeolab/geoBoundaries/raw/"+authSha+"/releaseData/gbAuthoritative/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-all.zip"
        apiData["gbAuthoritative"]["gjDownloadURL"] = "https://github.com/wmgeolab/geoBoundaries/raw/"+authSha+"/releaseData/gbAuthoritative/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+".geojson"
        apiData["gbAuthoritative"]["imagePreview"] = "https://github.com/wmgeolab/geoBoundaries/raw/"+authSha+"/releaseData/gbAuthoritative/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-PREVIEW.png"
        apiData["gbAuthoritative"]["simplifiedGeometryGeoJSON"] = "https://github.com/wmgeolab/geoBoundaries/raw/"+authSha+"/releaseData/gbAuthoritative/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"_simplified.geojson"
        tApiData = apiData["gbAuthoritative"]
        del tApiData["gbHumanitarian"]
        authPath = "//__w/gbWeb/gbWeb/api/gbID/" + str(tApiData["boundaryID"]) + "/"
        os.makedirs(authPath, exist_ok=True)
        with open(authPath + "index.json", "w") as f:
            json.dump(tApiData, f)

    if(humMatch.shape[0] > 0):
        #Modify humanitarian links to point to the sha
        d = requests.get("https://api.github.com/repos/wmgeolab/geoBoundaries/commits?path=releaseData/gbHumanitarian/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-all.zip", headers=h)
        humSha = d.json()[0]["sha"]
        apiData["gbHumanitarian"]["downloadURL"] = "https://github.com/wmgeolab/geoBoundaries/raw/"+humSha+"/releaseData/gbHumanitarian/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-all.zip"
        apiData["gbHumanitarian"]["gjDownloadURL"] = "https://github.com/wmgeolab/geoBoundaries/raw/"+humSha+"/releaseData/gbHumanitarian/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+".geojson"
        apiData["gbHumanitarian"]["imagePreview"] = "https://github.com/wmgeolab/geoBoundaries/raw/"+humSha+"/releaseData/gbHumanitarian/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-PREVIEW.png"
        apiData["gbHumanitarian"]["simplifiedGeometryGeoJSON"] = "https://github.com/wmgeolab/geoBoundaries/raw/"+humSha+"/releaseData/gbHumanitarian/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"_simplified.geojson"
        hApiData = apiData["gbHumanitarian"]
        try:
            del hApiData["gbAuthoritative"]
        except:
            print("No authoritative key to remove. Moving on.")
        humPath = "//__w/gbWeb/gbWeb/api/gbID/" + str(hApiData["boundaryID"]) + "/"
        os.makedirs(humPath, exist_ok=True)
        with open(humPath + "index.json", "w") as f:
            json.dump(hApiData, f)    
    
   