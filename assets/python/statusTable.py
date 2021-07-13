import pandas as pd
import requests
import sys

allBounds = pd.read_csv("//__w/gbWeb/geoBoundaryBot/dta/iso_3166_1_alpha_3.csv", encoding='utf8').astype(str).dropna(axis=1,how='all')

allOpen = requests.get("https://www.geoboundaries.org/api/current/gbOpen/ALL/ALL/").json()

#Convert our list into a dict
allOpenDict = {}
for i in range(len(allOpen)):
    ISO = allOpen[i]['boundaryISO']
    ADM = allOpen[i]['boundaryType']
    if ISO not in allOpenDict:
        allOpenDict[ISO] = {}
    if ADM not in allOpenDict[ISO]:
        allOpenDict[ISO][ADM] = {}
    for j in range(len(allOpen[i])):
        print(allOpen[i])
        print(allOpen[i][j])
        sys.exit()
        

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
        print(adm)
        print(webJSON)
        print(allOpen[0])
        sys.exit()
        
        #loop
