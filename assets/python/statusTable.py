import pandas as pd
import requests
import sys

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
ADMs = ["ADM0", "ADM1", "ADM2", "ADM3", "ADM4", "ADM5", "ADM6"]

for _, bound in allBounds.iterrows():
    ISO = bound["Alpha-3code"]
    webJSON[ISO] = {}
    webJSON[ISO]["ISO"] = ISO
    webJSON[ISO]["Name"] = bound["Name"]
    webJSON[ISO]["Claimant(s)"] = bound["Claimant(s)"].replace("nan","")
    webJSON[ISO]["Disputed"] = bound["Disputed"].replace("nan","")
    webJSON[ISO]["Continent"] = bound["Continent"]

    for adm in ADMs:
        if(adm in allOpenDict[ISO]):
            webJSON[ISO][adm] = {}
            webJSON[ISO][adm]["openAvailable"] = "Yes"
            webJSON[ISO][adm]["ISO"] = ISO
            webJSON[ISO][adm]["ADM"] = adm
            webJSON[ISO][adm]["boundaryName"] = allOpenDict[ISO][adm]["boundaryName"]
            webJSON[ISO][adm]["openBoundaryYearRepresented"] = allOpenDict[ISO][adm]["boundaryYearRepresented"]
            webJSON[ISO][adm]["openBoundaryLicense"] = allOpenDict[ISO][adm]["boundaryLicense"]
            webJSON[ISO][adm]["openSourceDataUpdateDate"] = allOpenDict[ISO][adm]["sourceDataUpdateDate"]
            webJSON[ISO][adm]["openBoundarySource-1"] = allOpenDict[ISO][adm]["boundarySource-1"]
        elif((adm == "ADM0") or (adm == "ADM1") or (adm == "ADM2")):
            webJSON[ISO][adm]["openAvailable"] = "No"
        else:
            pass

        if(adm in allHumDict[ISO]):
            if(adm not in webJSON[ISO]):
                webJSON[ISO][adm] = {}
            webJSON[ISO][adm]["humAvailable"] = "Yes"
            webJSON[ISO][adm]["ISO"] = ISO
            webJSON[ISO][adm]["ADM"] = adm
            webJSON[ISO][adm]["boundaryName"] = allHumDict[ISO][adm]["boundaryName"]
            webJSON[ISO][adm]["humBoundaryYearRepresented"] = allHumDict[ISO][adm]["boundaryYearRepresented"]
            webJSON[ISO][adm]["humBoundaryLicense"] = allHumDict[ISO][adm]["boundaryLicense"]
            webJSON[ISO][adm]["humSourceDataUpdateDate"] = allHumDict[ISO][adm]["sourceDataUpdateDate"]
            webJSON[ISO][adm]["humBoundarySource-1"] = allHumDict[ISO][adm]["boundarySource-1"]
        elif((adm == "ADM0") or (adm == "ADM1") or (adm == "ADM2")):
            webJSON[ISO][adm]["humAvailable"] = "No"
        else:
            pass

        if(adm in allAuthDict[ISO]):
            if(adm not in webJSON[ISO]):
                webJSON[ISO][adm] = {}
            webJSON[ISO][adm]["authAvailable"] = "Yes"
            webJSON[ISO][adm]["ISO"] = ISO
            webJSON[ISO][adm]["ADM"] = adm
            webJSON[ISO][adm]["boundaryName"] = allAuthDict[ISO][adm]["boundaryName"]
            webJSON[ISO][adm]["authBoundaryYearRepresented"] = allAuthDict[ISO][adm]["boundaryYearRepresented"]
            webJSON[ISO][adm]["authBoundaryLicense"] = allAuthDict[ISO][adm]["boundaryLicense"]
            webJSON[ISO][adm]["authSourceDataUpdateDate"] = allAuthDict[ISO][adm]["sourceDataUpdateDate"]
            webJSON[ISO][adm]["authBoundarySource-1"] = allAuthDict[ISO][adm]["boundarySource-1"]
        elif((adm == "ADM0") or (adm == "ADM1") or (adm == "ADM2")):
            webJSON[ISO][adm]["authAvailable"] = "No"
        else:
            pass
            
        
        print(webJSON)
