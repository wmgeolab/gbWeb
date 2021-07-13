import pandas as pd
import requests
import json

allBounds = pd.read_csv("//__w/gbWeb/geoBoundaryBot/dta/iso_3166_1_alpha_3.csv", encoding='utf8').astype(str).dropna(axis=1,how='all')

allOpen = requests.get("https://www.geoboundaries.org/api/current/gbOpen/ALL/ALL/").json()
allHum = requests.get("https://www.geoboundaries.org/api/current/gbHumanitarian/ALL/ALL/").json()
allAuth = requests.get("https://www.geoboundaries.org/api/current/gbAuthoritative/ALL/ALL/").json()

#Convert our list into a dict
allOpenDict = {}
for i in range(len(allOpen)):
    ISO = allOpen[i]['boundaryISO']
    ADM = allOpen[i]['boundaryType']
    if ISO not in allOpenDict:
        allOpenDict[ISO] = {}
    if ADM not in allOpenDict[ISO]:
        allOpenDict[ISO][ADM] = {}
    
    for key, value in allOpen[i].items():
        allOpenDict[ISO][ADM][key] = value

allHumDict = {}
for i in range(len(allHum)):
    ISO = allHum[i]['boundaryISO']
    ADM = allHum[i]['boundaryType']
    if ISO not in allHumDict:
        allHumDict[ISO] = {}
    if ADM not in allHumDict[ISO]:
        allHumDict[ISO][ADM] = {}
    
    for key, value in allHum[i].items():
        allHumDict[ISO][ADM][key] = value

allAuthDict = {}
for i in range(len(allAuth)):
    ISO = allAuth[i]['boundaryISO']
    ADM = allAuth[i]['boundaryType']
    if ISO not in allAuthDict:
        allAuthDict[ISO] = {}
    if ADM not in allAuthDict[ISO]:
        allAuthDict[ISO][ADM] = {}
    
    for key, value in allAuth[i].items():
        allAuthDict[ISO][ADM][key] = value

webJSON = {}
webJSONlist = []
ADMs = ["ADM0", "ADM1", "ADM2", "ADM3", "ADM4", "ADM5", "ADM6"]

for _, bound in allBounds.iterrows():
    ISO = bound["Alpha-3code"]
    webJSON[ISO] = {}


    for adm in ADMs:
        if ISO in allOpenDict:
            if(adm in allOpenDict[ISO]):
                webJSON[ISO][adm] = {}
                webJSON[ISO][adm]["openAvailable"] = "True"
                webJSON[ISO][adm]["ISO"] = ISO
                webJSON[ISO][adm]["ADM"] = adm
                webJSON[ISO][adm]["boundaryName"] = allOpenDict[ISO][adm]["boundaryName"]
                webJSON[ISO][adm]["Continent"] = allOpenDict[ISO][adm]["Continent"]
                webJSON[ISO][adm]["openBoundaryYearRepresented"] = allOpenDict[ISO][adm]["boundaryYearRepresented"].replace(".0","")
                webJSON[ISO][adm]["openBoundaryLicense"] = allOpenDict[ISO][adm]["boundaryLicense"]
                webJSON[ISO][adm]["openSourceDataUpdateDate"] = allOpenDict[ISO][adm]["sourceDataUpdateDate"]
                webJSON[ISO][adm]["openBoundarySource-1"] = allOpenDict[ISO][adm]["boundarySource-1"]
                webJSON[ISO][adm]["openDownloadURL"] = allOpenDict[ISO][adm]["downloadURL"]
                webJSON[ISO][adm]["openPreview"] = allOpenDict[ISO][adm]["imagePreview"]
                webJSON[ISO][adm]["simplified"] = allOpenDict[ISO][adm]["simplifiedGeometryGeoJSON"]
            elif((adm == "ADM0") or (adm == "ADM1") or (adm == "ADM2")):
                webJSON[ISO][adm] = {}
                webJSON[ISO][adm]["openAvailable"] = "False"
                webJSON[ISO][adm]["Continent"] = bound["Continent"]
                webJSON[ISO][adm]["ISO"] = ISO
                webJSON[ISO][adm]["ADM"] = adm
            else:
                pass
        else:
            if((adm == "ADM0") or (adm == "ADM1") or (adm == "ADM2")):
                if(ISO not in webJSON):
                    webJSON[ISO] = {}
                if(adm not in webJSON[ISO]):
                    webJSON[ISO][adm] = {}
                webJSON[ISO][adm]["openAvailable"] = "False"
                webJSON[ISO][adm]["Continent"] = bound["Continent"]
                webJSON[ISO][adm]["ISO"] = ISO
                webJSON[ISO][adm]["ADM"] = adm
            else:
                pass
        
        
        

        if ISO in allHumDict:
            if(adm in allHumDict[ISO]):
                if(adm not in webJSON[ISO]):
                    webJSON[ISO][adm] = {}
                webJSON[ISO][adm]["humAvailable"] = "True"
                webJSON[ISO][adm]["ISO"] = ISO
                webJSON[ISO][adm]["ADM"] = adm
                webJSON[ISO][adm]["boundaryName"] = allHumDict[ISO][adm]["boundaryName"]
                webJSON[ISO][adm]["humBoundaryYearRepresented"] = allHumDict[ISO][adm]["boundaryYearRepresented"].replace(".0","")
                webJSON[ISO][adm]["humBoundaryLicense"] = allHumDict[ISO][adm]["boundaryLicense"]
                webJSON[ISO][adm]["humSourceDataUpdateDate"] = allHumDict[ISO][adm]["sourceDataUpdateDate"]
                webJSON[ISO][adm]["humBoundarySource-1"] = allHumDict[ISO][adm]["boundarySource-1"]
                webJSON[ISO][adm]["humDownloadURL"] = allHumDict[ISO][adm]["downloadURL"]
                webJSON[ISO][adm]["humPreview"] = allHumDict[ISO][adm]["imagePreview"]
                webJSON[ISO][adm]["simplified"] = allHumDict[ISO][adm]["simplifiedGeometryGeoJSON"]
            elif((adm == "ADM0") or (adm == "ADM1") or (adm == "ADM2")):
                webJSON[ISO][adm]["humAvailable"] = "False"
                webJSON[ISO][adm]["ISO"] = ISO
                webJSON[ISO][adm]["ADM"] = adm
                webJSON[ISO][adm]["boundaryName"] = bound["Name"]
                webJSON[ISO][adm]["Continent"] = bound["Continent"]
            else:
                pass
        else:
            if((adm == "ADM0") or (adm == "ADM1") or (adm == "ADM2")):
                if(ISO not in webJSON):
                    webJSON[ISO] = {}
                if(adm not in webJSON[ISO]):
                    webJSON[ISO][adm] = {}
                webJSON[ISO][adm]["humAvailable"] = "False"
                webJSON[ISO][adm]["ISO"] = ISO
                webJSON[ISO][adm]["ADM"] = adm
                webJSON[ISO][adm]["boundaryName"] = bound["Name"]
                webJSON[ISO][adm]["Continent"] = bound["Continent"]
        

        if ISO in allAuthDict:
            if(adm in allAuthDict[ISO]):
                if(adm not in webJSON[ISO]):
                    webJSON[ISO][adm] = {}
                webJSON[ISO][adm]["authAvailable"] = "True"
                webJSON[ISO][adm]["ISO"] = ISO
                webJSON[ISO][adm]["ADM"] = adm
                webJSON[ISO][adm]["boundaryName"] = allAuthDict[ISO][adm]["boundaryName"]
                webJSON[ISO][adm]["authBoundaryYearRepresented"] = allAuthDict[ISO][adm]["boundaryYearRepresented"].replace(".0","")
                webJSON[ISO][adm]["authBoundaryLicense"] = allAuthDict[ISO][adm]["boundaryLicense"]
                webJSON[ISO][adm]["authSourceDataUpdateDate"] = allAuthDict[ISO][adm]["sourceDataUpdateDate"]
                webJSON[ISO][adm]["authBoundarySource-1"] = allAuthDict[ISO][adm]["boundarySource-1"]
                webJSON[ISO][adm]["authDownloadURL"] = allAuthDict[ISO][adm]["downloadURL"]
                webJSON[ISO][adm]["authPreview"] = allAuthDict[ISO][adm]["imagePreview"]
                webJSON[ISO][adm]["simplified"] = allAuthDict[ISO][adm]["simplifiedGeometryGeoJSON"]
            elif((adm == "ADM0") or (adm == "ADM1") or (adm == "ADM2")):
                webJSON[ISO][adm]["authAvailable"] = "False"
                webJSON[ISO][adm]["ISO"] = ISO
                webJSON[ISO][adm]["ADM"] = adm
                webJSON[ISO][adm]["boundaryName"] = bound["Name"]
                webJSON[ISO][adm]["Continent"] = bound["Continent"]
            else:
                pass
        else:
            if((adm == "ADM0") or (adm == "ADM1") or (adm == "ADM2")):
                if(ISO not in webJSON):
                    webJSON[ISO] = {}
                if(adm not in webJSON[ISO]):
                    webJSON[ISO][adm] = {}
                webJSON[ISO][adm]["authAvailable"] = "False"
                webJSON[ISO][adm]["ISO"] = ISO
                webJSON[ISO][adm]["ADM"] = adm
                webJSON[ISO][adm]["boundaryName"] = bound["Name"]
                webJSON[ISO][adm]["Continent"] = bound["Continent"]
        
        if(ISO in webJSON):
            if(adm in webJSON[ISO]):
                webJSONlist.append(webJSON[ISO][adm])
        
with open("//__w/gbWeb/gbWeb/api/index.json", 'w') as f:
    json.dump(webJSONlist, f)