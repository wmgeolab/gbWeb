function getLargestExtent(feat) {
    // get extent of the largest polygon for multipolygons
    // ie to focus only on the most relevant "main" area of a feature
    var geom = feat.getGeometry();
    var typ = geom.getType();
    if (typ.includes('Multi')) {
        var maxArea = 0;
        var maxGeom = null;
        for (poly of geom.getPolygons()) {
            area = Math.abs(poly.getArea());
            if (area > maxArea) {maxArea = area; maxGeom = poly};
        };
        return maxGeom.getExtent();
    } else {
        return geom.getExtent();
    };
};

function openCountryPopup (feat) {
    // first, zoom to the feature country
    var extent = getLargestExtent(feat); //feat.getGeometry().getExtent();
    map.getView().fit(extent,
                        {'duration':500, 'padding':[20,20,20,20]},
                        );
    // make popup visible at pointer position
    var [xmin,ymin,xmax,ymax] = extent;
    var x = (xmin+xmax)/2.0;
    var y = (ymin+ymax)/2.0;
    var coord = [x,y]; 
    popup.setPosition(coord);
    // populate contents
    content = document.getElementById('popup-content');
    // set title
    var title = feat.get('name') + ' - ' + feat.get('adminLevel');
    document.getElementById('country-details-title').innerText = title;
    // clear sources table
    var table = document.getElementById('country-details-source-table');
    table.innerHTML = '';
	
    // get selected comparison indicator
    var comparisonSelector = document.getElementById('map-compare');
    for (opt of comparisonSelector.options) {
        if (opt.selected==true) {
            break;
        };
    };
    // translate aggregate map comparison to source indicator
    var comparison2indic = {
        numSources: 'boundarySource-2',
        maxYear: 'boundaryYearRepresented',
        maxUpdated: 'sourceDataUpdateDate',
        avgYearLag: 'boundaryYearRepresented',
        avgBoundaryCount: 'boundaryCount', 
        minLineRes: 'statsLineResolution',
        maxVertDens: 'statsVertexDensity'
    };
    var indic = comparison2indic[opt.value];
    // add table header
    var header = document.createElement('thead');
    table.appendChild(header);
    // source col
    var col = document.createElement('th');
    col.innerText = "Source";
    header.appendChild(col)
    // indicator col
    var col = document.createElement('th');
    col.innerText = opt.innerText;
    header.appendChild(col)
    // add to sources table
    var body = document.createElement('tbody');
    table.appendChild(body);
    var props = feat.getProperties();
    for (sourceRow of props.sourceRows) {
        var tr = document.createElement('tr');
        // source name and link
        var td = document.createElement('td');
        var sourceNameLink = document.createElement('a');
        sourceNameLink.innerText = sourceRow['boundarySource-1'];
        sourceNameLink.href = "geoContrast.html?country="+sourceRow.boundaryISO+'&mainSource='+sourceRow['boundarySource-1']+'&mainLevel='+sourceRow.boundaryType[3]+'&comparisonLevel='+sourceRow.boundaryType[3];
        td.appendChild(sourceNameLink);
        tr.appendChild(td);
        // indicator value
        var td = document.createElement('td');
        var val = sourceRow[indic];
        if (indic == 'statsLineResolution') {
            val = parseFloat(val).toFixed(1) + ' m';
        } else if (indic == 'statsVertexDensity') {
            val = parseFloat(val).toFixed(1) + ' / km';
        };
        td.innerText = val;
        tr.appendChild(td);
        //
        body.appendChild(tr);
    };
};

/*
    // Country Data page
    else
    {
	//console.log("we are hereeee");
    // set title
	var title = props.shapeName;
	//console.log(title);
	document.getElementById('country-info-title').innerText = title;


    var dict = {
"ABW":"Aruba",
"AFG":"Afghanistan",
"AGO":"Angola",
"AIA":"Anguilla",
"ALA":"Aland Islands",
"ALB":"Albania",
"AND":"Andorra",
"ANT":"Netherlands Antilles",
"ARE":"United Arab Emirates",
"ARG":"Argentina",
"ARM":"Armenia",
"ASM":"American Samoa",
"ATA":"Antarctica",
"ATF":"French Southern Territories",
"ATG":"Antigua and Barbuda",
"AUS":"Australia",
"AUT":"Austria",
"AZE":"Azerbaijan",
"BDI":"Burundi",
"BEL":"Belgium",
"BEN":"Benin",
"BFA":"Burkina Faso",
"BGD":"Bangladesh",
"BGR":"Bulgaria",
"BHR":"Bahrain",
"BHS":"Bahamas",
"BIH":"Bosnia and Herzegovina",
"BLM":"Saint Barthelemy",
"BLR":"Belarus",
"BLZ":"Belize",
"BMU":"Bermuda",
"BOL":"Bolivia, Plurinational State of",
"BRA":"Brazil",
"BRB":"Barbados",
"BRN":"Brunei Darussalam",
"BTN":"Bhutan",
"BVT":"Bouvet Island",
"BWA":"Botswana",
"CAF":"Central African Republic",
"CAN":"Canada",
"CCK":"Cocos (Keeling) Islands",
"CHE":"Switzerland",
"CHL":"Chile",
"CHN":"China",
"CIV":"Cote d'Ivoire",
"CMR":"Cameroon",
"COD":"Congo, the Democratic Republic of the",
"COG":"Congo",
"COK":"Cook Islands",
"COL":"Colombia",
"COM":"Comoros",
"CPV":"Cape Verde",
"CRI":"Costa Rica",
"CUB":"Cuba",
"CXR":"Christmas Island",
"CYM":"Cayman Islands",
"CYP":"Cyprus",
"CZE":"Czech Republic",
"DEU":"Germany",
"DJI":"Djibouti",
"DMA":"Dominica",
"DNK":"Denmark",
"DOM":"Dominican Republic",
"DZA":"Algeria",
"ECU":"Ecuador",
"EGY":"Egypt",
"ERI":"Eritrea",
"ESH":"Western Sahara",
"ESP":"Spain",
"EST":"Estonia",
"ETH":"Ethiopia",
"FIN":"Finland",
"FJI":"Fiji",
"FLK":"Falkland Islands (Malvinas)",
"FRA":"France",
"FRO":"Faroe Islands",
"FSM":"Micronesia, Federated States of",
"GAB":"Gabon",
"GBR":"United Kingdom",
"GEO":"Georgia",
"GGY":"Guernsey",
"GHA":"Ghana",
"GIB":"Gibraltar",
"GIN":"Guinea",
"GLP":"Guadeloupe",
"GMB":"Gambia",
"GNB":"Guinea-Bissau",
"GNQ":"Equatorial Guinea",
"GRC":"Greece",
"GRD":"Grenada",
"GRL":"Greenland",
"GTM":"Guatemala",
"GUF":"French Guiana",
"GUM":"Guam",
"GUY":"Guyana",
"HKG":"Hong Kong",
"HMD":"Heard Island and McDonald Islands",
"HND":"Honduras",
"HRV":"Croatia",
"HTI":"Haiti",
"HUN":"Hungary",
"IDN":"Indonesia",
"IMN":"Isle of Man",
"IND":"India",
"IOT":"British Indian Ocean Territory",
"IRL":"Ireland",
"IRN":"Iran, Islamic Republic of",
"IRQ":"Iraq",
"ISL":"Iceland",
"ISR":"Israel",
"ITA":"Italy",
"JAM":"Jamaica",
"JEY":"Jersey",
"JOR":"Jordan",
"JPN":"Japan",
"KAZ":"Kazakhstan",
"KEN":"Kenya",
"KGZ":"Kyrgyzstan",
"KHM":"Cambodia",
"KIR":"Kiribati",
"KNA":"Saint Kitts and Nevis",
"KOR":"Korea, Republic of",
"KWT":"Kuwait",
"LAO":"Lao People's Democratic Republic",
"LBN":"Lebanon",
"LBR":"Liberia",
"LBY":"Libyan Arab Jamahiriya",
"LCA":"Saint Lucia",
"LIE":"Liechtenstein",
"LKA":"Sri Lanka",
"LSO":"Lesotho",
"LTU":"Lithuania",
"LUX":"Luxembourg",
"LVA":"Latvia",
"MAC":"Macao",
"MAF":"Saint Martin (French part)",
"MAR":"Morocco",
"MCO":"Monaco",
"MDA":"Moldova, Republic of",
"MDG":"Madagascar",
"MDV":"Maldives",
"MEX":"Mexico",
"MHL":"Marshall Islands",
"MKD":"Macedonia, the former Yugoslav Republic of",
"MLI":"Mali",
"MLT":"Malta",
"MMR":"Myanmar",
"MNE":"Montenegro",
"MNG":"Mongolia",
"MNP":"Northern Mariana Islands",
"MOZ":"Mozambique",
"MRT":"Mauritania",
"MSR":"Montserrat",
"MTQ":"Martinique",
"MUS":"Mauritius",
"MWI":"Malawi",
"MYS":"Malaysia",
"MYT":"Mayotte",
"NAM":"Namibia",
"NCL":"New Caledonia",
"NER":"Niger",
"NFK":"Norfolk Island",
"NGA":"Nigeria",
"NIC":"Nicaragua",
"NIU":"Niue",
"NLD":"Netherlands",
"NOR":"Norway",
"NPL":"Nepal",
"NRU":"Nauru",
"NZL":"New Zealand",
"OMN":"Oman",
"PAK":"Pakistan",
"PAN":"Panama",
"PCN":"Pitcairn",
"PER":"Peru",
"PHL":"Philippines",
"PLW":"Palau",
"PNG":"Papua New Guinea",
"POL":"Poland",
"PRI":"Puerto Rico",
"PRK":"Korea, Democratic People's Republic of",
"PRT":"Portugal",
"PRY":"Paraguay",
"PSE":"Palestinian Territory, Occupied",
"PYF":"French Polynesia",
"QAT":"Qatar",
"REU":"Reunion",
"ROU":"Romania",
"RUS":"Russian Federation",
"RWA":"Rwanda",
"SAU":"Saudi Arabia",
"SDN":"Sudan",
"SEN":"Senegal",
"SGP":"Singapore",
"SGS":"South Georgia and the South Sandwich Islands",
"SHN":"Saint Helena, Ascension and Tristan da Cunha",
"SJM":"Svalbard and Jan Mayen",
"SLB":"Solomon Islands",
"SLE":"Sierra Leone",
"SLV":"El Salvador",
"SMR":"San Marino",
"SOM":"Somalia",
"SPM":"Saint Pierre and Miquelon",
"SRB":"Serbia",
"STP":"Sao Tome and Principe",
"SUR":"Suriname",
"SVK":"Slovakia",
"SVN":"Slovenia",
"SWE":"Sweden",
"SWZ":"Swaziland",
"SYC":"Seychelles",
"SYR":"Syrian Arab Republic",
"TCA":"Turks and Caicos Islands",
"TCD":"Chad",
"TGO":"Togo",
"THA":"Thailand",
"TJK":"Tajikistan",
"TKL":"Tokelau",
"TKM":"Turkmenistan",
"TLS":"Timor-Leste",
"TON":"Tonga",
"TTO":"Trinidad and Tobago",
"TUN":"Tunisia",
"TUR":"Turkey",
"TUV":"Tuvalu",
"TWN":"Taiwan, Province of China",
"TZA":"Tanzania, United Republic of",
"UGA":"Uganda",
"UKR":"Ukraine",
"UMI":"United States Minor Outlying Islands",
"URY":"Uruguay",
"USA":"United States",
"UZB":"Uzbekistan",
"VAT":"Holy See (Vatican City State)",
"VCT":"Saint Vincent and the Grenadines",
"VEN":"Venezuela, Bolivarian Republic of",
"VGB":"Virgin Islands, British",
"VIR":"Virgin Islands, U.S.",
"VNM":"Viet Nam",
"VUT":"Vanuatu",
"WLF":"Wallis and Futuna",
"WSM":"Samoa",
"YEM":"Yemen",
"ZAF":"South Africa",
"ZMB":"Zambia",
"ZWE":"Zimbabwe",
	"ID":"ID",
	"SSD":"South Sudan",
	"XKX":"Kosovo",
    };



	var value_spot = document.getElementById('value-entry');
	value_spot.innerHTML = "";

	
	var data_table = document.getElementById('countries-table');

	//var iso = props.shapeISO;
	var iso = props.shapeGroup;
	var country_name = dict[iso];
	//console.log("name is: ");
	//console.log(country_name);
	var value = "Country name not found";

	
	
	for (let row of data_table.rows)
	{
	    if (row.cells[0].innerText == country_name)
	    {
		value = row.cells[1].innerText;
		//value_spot.innerHTML = value;
		if (value == "")
		{
		    value = "Country data not within dataset"
		}
		
	    }
	}

	value_spot.innerHTML = value;

	
    }

    // scroll to the top
    document.getElementById('close-country-popup').scrollIntoView(true);
    // add feats to the popup comparison map
    countryPopupMap.updateSize(); // otherwise will remain hidden until window resize
    var geojWriter = new ol.format.GeoJSON();
    var geoj = geojWriter.writeFeatureObject(feat);
    var geojColl = {type:'FeatureCollection', features:[geoj]};
    updateCountryPopupMap(geojColl);
*/

function closeCountryPopup () {
    popup.setPosition(undefined); // hides the popup
    return false;
};

// attach country popup to map
var popup = new ol.Overlay({
    element: document.getElementById('country-popup'),
});
map.addOverlay(popup);

// bind popup on click event
map.on('singleclick', function(evt) {
    // get feats
    let clickedFeat = null;
    map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
        clickedFeat = feature;
    });
    // open popup for the found features
    if (clickedFeat != null) {
        openCountryPopup(clickedFeat);
    } else {
        closeCountryPopup();
    };
});

