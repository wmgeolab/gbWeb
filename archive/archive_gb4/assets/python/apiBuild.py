import pandas as pd
import os
import sys
import json
import numpy as np
import copy
import requests
import time

token = sys.argv[1]

h = {'Authorization':'token %s' % token}

openDta = pd.read_csv("//__w/gbWeb/geoBoundaries/releaseData/geoBoundariesOpen-meta.csv", encoding='utf8').astype(str).dropna(axis=1,how='all')
humDta = pd.read_csv("//__w/gbWeb/geoBoundaries/releaseData/geoBoundariesHumanitarian-meta.csv", encoding='utf8').astype(str).dropna(axis=1,how='all')
authDta = pd.read_csv("//__w/gbWeb/geoBoundaries/releaseData/geoBoundariesAuthoritative-meta.csv", encoding='utf8').astype(str).dropna(axis=1,how='all')

#Check for LFS cases
gitatt = pd.read_csv("//__w/gbWeb/geoBoundaries/.gitattributes", delim_whitespace=True, header=None)

lfsFiles = []
for i, r in gitatt.iterrows():
    splAtt = r[0].split("/")
    if(splAtt[0] == "releaseData"):
        if(splAtt[1] != "CGAZ"):
            lfsFiles.append(splAtt[4])

allADM = {}
allADM["gbOpen"] = {}
allADM["gbHumanitarian"] = {}
allADM["gbAuthoritative"] = {}

#These dicts all hold all boundaries for a given level.
#This is to support user queries of ISO=ALL for each level.
allADM["gbOpen"]["ADM0"] = []
allADM["gbOpen"]["ADM1"] = []
allADM["gbOpen"]["ADM2"] = []
allADM["gbOpen"]["ADM3"] = []
allADM["gbOpen"]["ADM4"] = []
allADM["gbOpen"]["ADM5"] = []

allADM["gbHumanitarian"]["ADM0"] = []
allADM["gbHumanitarian"]["ADM1"] = []
allADM["gbHumanitarian"]["ADM2"] = []
allADM["gbHumanitarian"]["ADM3"] = []
allADM["gbHumanitarian"]["ADM4"] = []
allADM["gbHumanitarian"]["ADM5"] = []

allADM["gbAuthoritative"]["ADM0"] = []
allADM["gbAuthoritative"]["ADM1"] = []
allADM["gbAuthoritative"]["ADM2"] = []
allADM["gbAuthoritative"]["ADM3"] = []
allADM["gbAuthoritative"]["ADM4"] = []
allADM["gbAuthoritative"]["ADM5"] = []

#Additionally, for each country we'll add another dictionary.
#This is to support user queries of ADM=ALL for any ISO.
allISO = {}
allISO["gbOpen"] = {}
allISO["gbHumanitarian"] = {}
allISO["gbAuthoritative"] = {}

#Finally, we'll just copy everything into all:
all = {}
all["gbOpen"] = []
all["gbHumanitarian"] = []
all["gbAuthoritative"] = []

def LFSconversion(fPath):
    if(fPath.split("/")[10] in lfsFiles):
        newA = fPath.replace("raw.githubusercontent.com/", "media.githubusercontent.com/media/")
        print(newA)
        return(newA)
    else:
        return(fPath)
    

for i, r in openDta.iterrows():
    gbIDPath = "//__w/gbWeb/gbWeb/api/gbID/" + str(r["boundaryID"]) + "/"
    currentPath = "//__w/gbWeb/gbWeb/api/current/gbOpen/" + str(r["boundaryISO"]) + "/" + str(r["boundaryType"]) + "/"
    currentHumPath = "//__w/gbWeb/gbWeb/api/current/gbHumanitarian/" + str(r["boundaryISO"]) + "/" + str(r["boundaryType"]) + "/"
    currentAuthPath = "//__w/gbWeb/gbWeb/api/current/gbAuthoritative/" + str(r["boundaryISO"]) + "/" + str(r["boundaryType"]) + "/"

    #Create folder structures if they don't exist
    os.makedirs(gbIDPath, exist_ok=True)
    os.makedirs(currentPath, exist_ok=True)
    os.makedirs(currentHumPath, exist_ok=True)
    os.makedirs(currentAuthPath, exist_ok=True)

    #Build library we'll translate into a json
    apiData = {}
    apiData = r.to_dict()
    #apiData["downloadURL"] = LFSconversion("https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbOpen/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-all.zip")
    #apiData["gjDownloadURL"] = LFSconversion("https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbOpen/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+".geojson")
    #apiData["imagePreview"] = LFSconversion("https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbOpen/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-PREVIEW.png")
    #apiData["simplifiedGeometryGeoJSON"] = LFSconversion("https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbOpen/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"_simplified.geojson")
    
    
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
    apiData["tjDownloadURL"] = "https://github.com/wmgeolab/geoBoundaries/raw/"+openSha+"/releaseData/gbOpen/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+".topojson"
    apiData["imagePreview"] = "https://github.com/wmgeolab/geoBoundaries/raw/"+openSha+"/releaseData/gbOpen/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-PREVIEW.png"
    apiData["simplifiedGeometryGeoJSON"] = "https://github.com/wmgeolab/geoBoundaries/raw/"+openSha+"/releaseData/gbOpen/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"_simplified.geojson"


    #Match on authoritative 
    authMatch = authDta[(authDta["boundaryISO"]==r["boundaryISO"]) & (authDta["boundaryType"]==r["boundaryType"])]
    
    if(authMatch.shape[0] == 1):
        apiData["gbAuthoritative"] = authMatch.to_dict('r')[0]
        
        d = requests.get("https://api.github.com/repos/wmgeolab/geoBoundaries/commits?path=releaseData/gbAuthoritative/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-all.zip", headers=h)
        authSha = d.json()[0]["sha"]
        apiData["gbAuthoritative"]["downloadURL"] = "https://github.com/wmgeolab/geoBoundaries/raw/"+authSha+"/releaseData/gbAuthoritative/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-all.zip"
        apiData["gbAuthoritative"]["gjDownloadURL"] = "https://github.com/wmgeolab/geoBoundaries/raw/"+authSha+"/releaseData/gbAuthoritative/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+".geojson"
        apiData["gbAuthoritative"]["tjDownloadURL"] = "https://github.com/wmgeolab/geoBoundaries/raw/"+authSha+"/releaseData/gbAuthoritative/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+".topojson"
        apiData["gbAuthoritative"]["imagePreview"] = "https://github.com/wmgeolab/geoBoundaries/raw/"+authSha+"/releaseData/gbAuthoritative/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-PREVIEW.png"
        apiData["gbAuthoritative"]["simplifiedGeometryGeoJSON"] = "https://github.com/wmgeolab/geoBoundaries/raw/"+authSha+"/releaseData/gbAuthoritative/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"_simplified.geojson"

    else:
        apiData["gbAuthoritative"] = "No authoritative boundary exists for this ISO/ADM."

    
    humMatch = humDta[(humDta["boundaryISO"]==r["boundaryISO"]) & (humDta["boundaryType"]==r["boundaryType"])]
    if(humMatch.shape[0]==1):
        apiData["gbHumanitarian"] = humMatch.to_dict('r')[0]

        d = requests.get("https://api.github.com/repos/wmgeolab/geoBoundaries/commits?path=releaseData/gbHumanitarian/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-all.zip", headers=h)
        humSha = d.json()[0]["sha"]
        apiData["gbHumanitarian"]["downloadURL"] = "https://github.com/wmgeolab/geoBoundaries/raw/"+humSha+"/releaseData/gbHumanitarian/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-all.zip"
        apiData["gbHumanitarian"]["gjDownloadURL"] = "https://github.com/wmgeolab/geoBoundaries/raw/"+humSha+"/releaseData/gbHumanitarian/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+".geojson"
        apiData["gbHumanitarian"]["tjDownloadURL"] = "https://github.com/wmgeolab/geoBoundaries/raw/"+humSha+"/releaseData/gbHumanitarian/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+".topojson"
        apiData["gbHumanitarian"]["imagePreview"] = "https://github.com/wmgeolab/geoBoundaries/raw/"+humSha+"/releaseData/gbHumanitarian/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"-PREVIEW.png"
        apiData["gbHumanitarian"]["simplifiedGeometryGeoJSON"] = "https://github.com/wmgeolab/geoBoundaries/raw/"+humSha+"/releaseData/gbHumanitarian/"+r["boundaryISO"]+"/"+r["boundaryType"]+"/geoBoundaries-"+r["boundaryISO"]+"-"+r["boundaryType"]+"_simplified.geojson"

    #Append to master ADM and ISO lists
    curOpen = copy.deepcopy(apiData)
    try:
        del curOpen["gbHumanitarian"]
    except:
        pass
    try:
        del curOpen["gbAuthoritative"]
    except:
        pass
    allADM["gbOpen"][r["boundaryType"]].append(curOpen)
    

    if(r["boundaryISO"] in allISO["gbOpen"]):
        allISO["gbOpen"][r["boundaryISO"]].append(curOpen)
    else:
        allISO["gbOpen"][r["boundaryISO"]] = []
        allISO["gbOpen"][r["boundaryISO"]].append(curOpen)

    all["gbOpen"].append(curOpen)
    

    with open(currentPath + "index.json", "w") as f:
        json.dump(apiData, f)
    

    
    if(humMatch.shape[0]==1):
        allADM["gbHumanitarian"][r["boundaryType"]].append(apiData["gbHumanitarian"])
        if(r["boundaryISO"] in allISO["gbHumanitarian"]):
            allISO["gbHumanitarian"][r["boundaryISO"]].append(apiData["gbHumanitarian"])
        else:
            allISO["gbHumanitarian"][r["boundaryISO"]] = []
            allISO["gbHumanitarian"][r["boundaryISO"]].append(apiData["gbHumanitarian"])

        all["gbHumanitarian"].append(apiData["gbHumanitarian"])

        with open(currentHumPath + "index.json", "w") as f:
            json.dump(apiData["gbHumanitarian"], f)
        

    if(authMatch.shape[0] == 1):
        allADM["gbAuthoritative"][r["boundaryType"]].append(apiData["gbAuthoritative"])
        all["gbAuthoritative"].append(apiData["gbAuthoritative"])
        if(r["boundaryISO"] in allISO["gbAuthoritative"]):
            allISO["gbAuthoritative"][r["boundaryISO"]].append(apiData["gbAuthoritative"])
        else:
            allISO["gbAuthoritative"][r["boundaryISO"]] = []
            allISO["gbAuthoritative"][r["boundaryISO"]].append(apiData["gbAuthoritative"])

        with open(currentAuthPath + "index.json", "w") as f:
            json.dump(apiData["gbAuthoritative"], f)


    with open(gbIDPath + "index.json", "w") as f:
        json.dump(apiData, f)

    if(authMatch.shape[0] > 0):
        tApiData = apiData["gbAuthoritative"]
        try:
            del tApiData["gbHumanitarian"]
        except:
            print("No humanitarian key to remove. Moving on.")
        authPath = "//__w/gbWeb/gbWeb/api/gbID/" + str(tApiData["boundaryID"]) + "/"
        os.makedirs(authPath, exist_ok=True)
        with open(authPath + "index.json", "w") as f:
            json.dump(tApiData, f)

    if(humMatch.shape[0] > 0):
        hApiData = apiData["gbHumanitarian"]
        try:
            del hApiData["gbAuthoritative"]
        except:
            print("No authoritative key to remove. Moving on.")
        humPath = "//__w/gbWeb/gbWeb/api/gbID/" + str(hApiData["boundaryID"]) + "/"
        os.makedirs(humPath, exist_ok=True)
        with open(humPath + "index.json", "w") as f:
            json.dump(hApiData, f)       
            
#Add the "ALL" folders for ADMs and save the relevant jsons
for releaseType in allADM:
    for level in allADM[releaseType]:
        allPath = "//__w/gbWeb/gbWeb/api/current/"+str(releaseType)+"/ALL/" + str(level) + "/"
        os.makedirs(allPath, exist_ok=True)
        outFile = allPath + "index.json"
        with open(outFile, "w") as f:
            json.dump(allADM[releaseType][level], f)  

#Add the "ALL" to each ISO folder, as well as the ALL/ALL
for releaseType in allISO:
    allALLPath = "//__w/gbWeb/gbWeb/api/current/"+str(releaseType)+"/ALL/ALL/"
    os.makedirs(allALLPath, exist_ok=True)
    outALL = allALLPath + "index.json"
    with open(outALL, "w") as f:
        json.dump(all[releaseType], f)

    for iso in allISO[releaseType]:
        allPath = "//__w/gbWeb/gbWeb/api/current/"+str(releaseType)+"/"+str(iso)+"/ALL/" 
        os.makedirs(allPath, exist_ok=True)
        outFile = allPath + "index.json"
        with open(outFile, "w") as f:
            json.dump(allISO[releaseType][iso], f)
