// TODO: make script lag less

// populate csv list with variable name options


function add_options()
{
    
    list = ['Account Ownership at a Financial Institution or with a Mobile-money-service Provider', 'Has the country adopted and implemented investment promotion regimes for least developed countries', 'Agriculture orientation index for government expenditures)', 'Deaths due to air pollution', 'Number of ATMS per 100,000 adults', 'Number of banks per 100,000 adults', 'Compliance with the Basel Convention on hazardous waste and other chemicals', 'Material footprint of biomass (tonnes)', 'Has the country achieved birth registration data that are at least 90 percent complete', 'Proportion of individuals who own a mobile telephone', 'Has the country conducted at least one population and housing census in the last 10 years', ' International financial flows to developing countries in support of clean energy research and development and renewable energy production, including in hybrid systems', 'Indicator of food price anomalies for corn', 'Domestic material consumption of crops per capita', 'Has the country achieved death registration data that are at least 75 percent complete', 'The proportion of land that is degraded over total land area', 'Direct Economic Loss Attributed to Disasters Relative to GDP (%)', 'Proportion of local governments that adopt and implement local disaster risk reduction strategies in line with national disaster risk reduction strategies', 'Number of disruptions to basic services attributed to disasters', 'CO2 emissions per unit of value added', 'Energy Intensity measured in terms of primary energy and GDP', 'Material footprint of fossil fuels (tonnes)', 'The material footprint, the attribution of global material extraction to domestic final demand of a country, for fossil fuel per capita', 'Does the country have a national statistics plan that is fully funded and under implementation', 'Level of water stress: freshwater withdrawal as a proportion of available freshwater resources', 'Does the country have national statistical legislation that compiles with the Fundamental Principle of Official Statistics', 'Total freight volume transported by aviation measured in tonne kilometers', 'Total freight volume transported by rail measured in tonne kilometers', 'Primary government expenditures as a proportion of original approved budget', 'Total government revenue as a proportion of GDP', 'Growth rates of household expenditure or income per capita among the total population', 'Annual Growth Rate of GDP per employed person', 'The annual growth rate of GDP per capita measured in constant US dollars', 'Proportion of the population with household expenditures on health representing greater than 25% of total household expenditure or income ', 'Proportion of medium and high-tech industry value added in total value added', 'The proportion of medium-high and high-tech industry value added in total value added of manufacturing', 'Progress by countries in the degree of implementation of international instruments aiming to combat illegal, unreported and unregulated fishing', 'Forest area under an independently verified forest management certification scheme', 'Victims of intentional homicide', 'Fixed Internet broadband subscriptions per 100 inhabitants', 'Proportion of local breeds that are classifed as not being at risk of extinction', 'Proportion of local breeds with an unknown risk of extinction classification', 'Proportion of local breeds that are classified as being at risk of extinction ', 'Number of local plant species with sufficient genetic information secured in either medium- or long-term conservation facilities to reconstitute the breed in the case of an extinction', 'Proportion of forest area under a long-term forest management plan', 'Coverage of protected marine areas', 'Proportion of women ages 20-24 who were married before age 18', 'Proportion of women ages 20-24 who were married before age 15', 'Proportion of total research budget allocated to research in the field of marine technology', 'Material footprint per capita', 'Maternal Mortality Rate', 'Proportion of children and young people (a) in grades 2/3; (b) at the end of primary; and (c) at the end of lower secondary achieving at least a minimum proficiency level in mathematics', 'The material footprint, the attribution of global material extraction to domestic final demand of a country, for biomass per capita', 'The material footprint, the attribution of global material extraction to domestic final demand of a country, for biomass, fossil fuels, metal ores, and non-metal ores per capita', 'Indicator of food price anomalies in millet', 'Compliance with the Montreal Convention on hazardous waste and other chemicals', 'Mortality Rate due to Unsafe Water', 'Mountain Green Cover Index', 'Neonatal Mortality Rate', 'Number of countries with a national statistical plan that is fully funded and under implementation, by source of funding', 'Domestic material consumption of non-metallic minerals per capita', 'The material footprint, the attribution of global material extraction to domestic final demand of a country, per capita for non-metal ore ', 'Material footprint of non-metallic materials (tonnes)', 'Countries with National Human Rights Institutions and no status with the Paris Principles', 'Gross disbursements of total ODA and other official flows from all donors to the agriculture sector', 'The gross disbursements and commitments of total Official Development Assistance (ODA) from all donors for aid for trade', 'Total official development assistance for biodiversity, by donor countries (millions of constant 2016 United States dollars)', 'Gross disbursements of total official development assistance and other official flows from all donors in support of infrastructure', 'Volume of official development assistance flows for scholarships', 'Domestic material consumption of metal ores per capita', 'The material footprint, the attribution of global material extraction to domestic final demand of a country, per capita for metal ore ', 'Material footprint of metal ores (tonnes)', 'Does the country have indepdendent national human rights institutions in compliance with the Paris Principles ', 'Proportion of children aged 1\xe2\x80\x9317 years who experienced any physical punishment and/or psychological aggression by caregivers in the past month', 'Proportion of Population with Access to Electricity', 'Mortality rate attributed to unintentional poisoning', 'Proportion of population with primary reliance on clean fuels and technology', 'Number of directly affected persons attributed to disasters per 100,000 population', 'Proportion of population that has undergone female genital mutilitation', 'Population Using Safely Managed Drinking Services', 'Proportion of births attended by skilled health care personnel', 'Prevalence of malnutrition', 'Prevalence of Stunting among children under 5 years of age', 'Prevalence of Undernourishment', 'Research and development expenditure as a proportion of GDP', 'The mean percentage of each important site for biodiversity that is covered by protected area designations', 'Proportion of Individuals Using the Internet', ' Proportion of population using safely managed drinking water', 'The proportion of small-scale industries with a loan or line of credit', 'The proportion of small-scale industries in total industry value added', 'Proportion of forest area located within legally established protected areas', 'Proportion of domestic budget funded by domestic taxes', 'Passenger volume transported through aviation measured in passenger kilometers', 'Passenger volume transported using rail measured in passenger kilometers', 'Material footprint of raw material (tonnes)', 'National recycling rate, tons of material recycled', ' National recycling rate', ' Proportion of children under 5 years of age whose births have been registered with a civil authority', ' Renewable energy share in the total final energy consumption', 'Researchers (in full-time equivalent) per million inhabitants', 'Indicator of food price anomalies in rice', 'Male participation rate in organized learning (one year before the official primary entry age)', ' Participation rate in organized learning (one year before the official primary entry age)', ' Female participation rate in organized learning (one year before the official primary entry age)', 'Compliance with the Rotterdam Convention on hazardous waste and other chemicals', 'Homicide rate (per 100,000 people)', ' Proportion of wastewater safely treated', 'Does country have sustainable consumption and production (SCP) national action plan?', 'Proportion of young women and men aged 18\xe2\x80\x9329 years who experienced sexual violence by age 18', 'Proportion of young women aged 18-29 years who experienced sexual violence by age 18', 'Proportion of young men aged 18-29 years who experienced sexual violence by age 18', ' Developing countries\xe2\x80\x99 and least developed countries\xe2\x80\x99 share of global exports', 'Indicator of food price anomalies in sorghum', 'Progress in multi-stakeholder development effectiveness monitoring frameworks that support the achievement of the sustainable development goals', 'Has the country reported progress in multi-stakeholder development effectiveness monitoring frameworks that support the achievement of the sustainable development goals', 'Number of plant and animal genetic resources for food and agriculture secured in either medium- or long-term conservation facilities', 'Countries with national statistics plans with funding from others', 'Progress towards sustainable forest management', 'Proportion of transboundary aquifers with an operational arrangement for water cooperation (%)', 'Total net official development assistance to medical research and basic health sectors', 'The proportion of female students in grades 2/3 achieving at least a minimum proficiency level in mathematics', 'The proportion of males in grades 2/3 achieving at least a minimum proficiency level in mathematics', 'The proportion of students in grades 2/3 achieving at least a minimum proficiency level in reading', 'Proportion of youth not employed or in formal education training', 'Unsentenced Detainees as a Proportion of Total Prison Population', 'Proportion of urban population living in slums, informal settlements or inadequate housing', 'Dollar value of all resources made available to strengthen statistical capacity in developing countries (current United States dollars', 'Indicator of food price anomalies in wheat', 'Change in water-use efficiency over time', 'Worldwide weighted tariff-average'];
    list_vals = [
	"ACCNTOWNER","ADPTINVLDC","AGORGINDEX","AIRPOLDTHS","ATMSPERPOP","BANKPERPOP","BASELCONVN","BIOMASSTON","BIRTHREGIS","CELLOWNERS","CENSUSDONE","CLNENGYFIN","CORNPRANOM","CROPCONSPC","DEATHREGIS","DEGRADLAND","DISLOSSGDP","DISRISKPLN","DISTDISRUP","EMISSVALADD","ENGYINTGDP","FFUELFPTON","FFUELMFPPC","FFUNSTPLAN","FRWTRWDRAW","FUNPOSTATS","FVOLAIRTKM","FVOLRTKM","GOVEXPBDGT","GOVTREVGDP","GRHHEXPDPC","GRTGDPEMPL","GWRREALGDP","HLTHEXPTFP","HTECHVALUE","HTECHVAMAN","ILLFISHLAW","INDPMGMTFR","INTHOMVCTM","INTNETSUBS","LBRDNORISK","LBRDUKRISK","LBREEDRISK","LRPLTRECON","LTMGMTFORP","MARINEPROT","MARPREEGTN","MARPREFITN","MARTECHBGT","MATFPPERCAP","MATHMORRATE","MATHPROFIC","MFPBMASSPC","MFPTOTALPC","MILLPRANOM","MONTREALC","MORTBADWTR","MTGREENIDX","NEONATMORT","NFUNSTPLAN","NMETALCPRC","NMETALFPPC","NONMETALTON","NOPARISPRI","ODAAGRICUL","ODAAIDTRAD","ODABIODIVR","ODAGROSSDSP","ODASCHOLAR","ORECONPERC","OREMFPPERC","OREMTFPTON","PARISHRINT","PCHLDABUSE","PERPOPELEC","POISONMORT","POPCLNENGY","POPDISTDAP","POPEXPRFGM","POPSAFEWTR","PRBRTSKHEL","PREMALNUTR","PREVSTUNFV","PREVUNDNOR","PRNDEXPGDP","PROBIODIVR","PROINTUSER","PROSAFEWTR","PROSSCRDIT","PROSSINDVA","PROTECTFOR","PRPBDGTTAX","PVOLAIRPKM","PVOLRPKM","RAWMTFPTON","RECYCLETON","RECYCLRATE","REGISBIRTH","RENEWENGCON","RESEARCHER","RICEPRANOM","RORGPREDUM","RORGPREEDU","RORGPREEDUF","ROTTERDAMC","RTHOMOCIDE","SAFEWSTWTR","SCPNACTPLN","SEXVIOLENC","SEXVIOLENF","SEXVIOLENM","SHREXPORTS","SORGPRANOM","STKHLDPROG","STKHOLDPLN","STORGENELR","STPLNEXFUN","SUSFORMGMT","TBAQUFMNGD","TODAHEALTH","TWOMINMTHF","TWOMINMTHM","TWOMINREAD","UNEMPYOUTH","UNSENDETAIN","URBPOPSLUM","VALSTATCAP","WHTPRIANOM","WTREFFCHNG","WWTARIFAVG"


	];

    
    var url = "https://api.github.com/repos/wmgeolab/geoDataWeb/git/trees/33011ba?recursive=1";

    var request = new XMLHttpRequest();

    var skip_loop = 1;


    request.open("GET", url, false);
    request.send(null);

    var return_object = request.responseText;
    var json_string = JSON.parse(return_object);
    //console.log("42 HERE!");
    //console.log(sessionStorage.getItem("list"));
   // console.log(return_object);
    //console.log(json_string.tree);

    /*

    if (sessionStorage.getItem("list") == null)
    {
	console.log("no session storage");
    var list = [];
    var list_vals = [];
    for(var i=0;i<json_string.tree.length;i++)
    {
	var path_str = json_string.tree[i].path;
	if (path_str.includes("ancillaryData/gdOpen/sourceData/ADM0/") && !path_str.includes("meta"))
	{
	    var push_str = path_str.split("ancillaryData/gdOpen/sourceData/ADM0/")[1];
	    push_str = push_str.split(".csv")[0];
	    list_vals.push(push_str);

	    var request_2 = new XMLHttpRequest();
	    var url_2 = "https://raw.githubusercontent.com/wmgeolab/geoDataWeb/main/ancillaryData/gdOpen/sourceData/ADM0/meta" + push_str + ".txt";
	    request_2.open("GET", url_2, false);
	    request_2.send(null);

	    var text_val = request_2.responseText;
	    text_val = text_val.split("Full Variable Name: ")[1];
	    text_val = text_val.split("\n")[0];
	    list.push(text_val);
	    }
    }
    console.log("43 HERE!");
	console.log(list);
	sessionStorage.setItem("list",JSON.stringify(list));
	sessionStorage.setItem("list_vals",JSON.stringify(list_vals));

    }
    else
    {
	var list = JSON.parse(sessionStorage.getItem("list"));
	var list_vals = JSON.parse(sessionStorage.getItem("list_vals"));
	skip_loop = 0;
	console.log("here 44");
	console.log(list);
	console.log(list_vals);
    }

    */

    //console.log("middle");

    var selection_menu = document.getElementById('csv_list');

    //console.log("middle2")
    //console.log(list);
    //console.log(list.length);

    //if (skip_loop != 0)
    //{

    for (var i=0;i<list.length;i++)
    {
	option = '<option value = "' + list_vals[i] + '">' + list[i] + '</option>';
	selection_menu.innerHTML += option;
    }
    //}
    //console.log(selection_menu.innerHTML);

    //console.log("end");

    //console.log(new_list);

/*
    var url = "https://raw.githubusercontent.com/wmgeolab/geoDataWeb/main/ancillaryData/gdOpen/sourceData/ADM0/" + selection_val + ".csv";

    var meta_url = "https://raw.githubusercontent.com/wmgeolab/geoDataWeb/main/ancillaryData/gdOpen/sourceData/ADM0/meta" + selection_val + ".txt";

    var request = new XMLHttpRequest();


    request.open("GET", url, false);
    request.send(null);

    var return_object = request.responseText;

    var metadata_request = new XMLHttpRequest();
    request.open("GET", meta_url, false);
    request.send(null);
    var metadata_text = request.responseText;

    var desc = document.getElementById("metadata-text");
*/
}

function new_update_map_countries(country_values_dict, min, max)
{
    //console.log("new update start");
    //console.log(country_values_dict);

    var styleCategories = [
    new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgb(151,111,14)',
        }),
        stroke: outline,
    }),
    new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgb(189,152,82)',
        }),
        stroke: outline,
    }),
    new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgb(7,124,96)',
        }),
        stroke: outline,
    }),
    new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgb(6,75,52)',
        }),
        stroke: outline,
    }),

]
/*
var missingStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(63,46,6,0.7)',
    })
    stroke: outline,
});
*/
    //console.log(countryLayer);
    
    countryLayer.getSource().forEachFeature(function(feature){
	//console.log(feature);
	//dynamicStyle = styleCategories[2]

	var range = max - min;
	max = parseInt(max,10);
	var bin_size = range / 4;
	var bin_1_end = min + bin_size;
	var bin_2_end = min + bin_size * 2;
	var bin_3_end = min + bin_size * 3;

	var bin_1 = {min:min, max:bin_1_end};

	var bin_2= {min:bin_1_end, max:bin_2_end};

	var bin_3= {min:bin_2_end, max:bin_3_end};

	var bin_4= {min:bin_3_end, max:max};

	var bins = [bin_1,bin_2,bin_3,bin_4];

	updateStyleLegend(bins);
	
//	console.log("style");
//	console.log(dynamicStyle);
	//console.log("feature");
	//console.log(feature);

	var country_name = feature.values_.shapeISO;
	//console.log("ISO:");
	//console.log(country_name);

	var country_data = country_values_dict[country_name];

	//console.log("data:"+country_data+country_name);
/*
	if (country_data == "" || isNaN(country_data))
	{
	    //dynamicStyle = styleCategories[4];
	    dynamicStyle = missingStyle;
	    console.log("what "+country_name);
	}
*/
	if (country_data <= bin_1_end)
	{
	    //console.log("style 0!"+country_name);
	    dynamicStyle = styleCategories[0];
	}
	else if (country_data <= bin_2_end)
	{
	    //console.log("style 1");
	    dynamicStyle = styleCategories[1];
	}
	else if (country_data <= bin_3_end)
	{
	    dynamicStyle = styleCategories[2];
	}
	else if (country_data <= max)
	{
	    dynamicStyle = styleCategories[3];
	}
	else
	{
	    //console.log(country_data);
	    dynamicStyle = missingStyle;
	}
	//console.log("style");
	//console.log(dynamicStyle);
	
	feature.setStyle(dynamicStyle);
    });


}

// this function read in the data from the github geodata page and displays it as a table when the "show data" button is pressed
function read_geodata_data()
{

    //console.log("start");

    
    
    var selection_menu = document.getElementById('csv_list');

    var selection_val = selection_menu.value;

    var url = "https://raw.githubusercontent.com/wmgeolab/geoDataWeb/main/ancillaryData/gdOpen/sourceData/ADM0/" + selection_val + ".csv";

    var meta_url = "https://raw.githubusercontent.com/wmgeolab/geoDataWeb/main/ancillaryData/gdOpen/sourceData/ADM0/meta" + selection_val + ".txt";

    var request = new XMLHttpRequest();

    request.open("GET", url, false);
    request.send(null);

    var return_object = request.responseText;

    var metadata_request = new XMLHttpRequest();
    request.open("GET", meta_url, false);
    request.send(null);
    var metadata_text = request.responseText;
    metadata_text = metadata_text.split("==============================================================\n\n")[1]

    var desc = document.getElementById("metadata-text");

    desc.innerText = metadata_text;
    
    var rows = return_object.split("\n");

    var table = document.getElementById("countries-table");
    table.innerHTML = "";

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

    var country_values_dict = dict;
    var max = 0;
    var min = 0;

    for (var i=0;i<rows.length;i++)
    {
	if (rows[i] == "")
	{
	    continue
	}
	
	country = rows[i].split(",")[0];
	data = rows[i].split(",")[1];


	
	
	// change from alpha 3 to name
	var country_name = dict[country]
	
	row_string = "<tr><td>" + country_name + "</td><td>" + data + "</td></tr>";
	table.innerHTML += row_string;
	data = parseInt(data, 10);
	if (data > max)
	{
	    max = data;
	}
	if (data < min)
	{
	    min = data;
	}

	country_values_dict[country] = data
	
	
    }

    new_update_map_countries(country_values_dict, min, max);
    
    
}

// this function sends the user to a page with the raw json data when the "view raw data" button is pressed
function goto_raw_csv_file()
{
    var selection_menu = document.getElementById('csv_list');

    var selection_val = selection_menu.value;

    var url = "https://raw.githubusercontent.com/wmgeolab/geoDataWeb/main/ancillaryData/gdOpen/sourceData/ADM0/" + selection_val + ".csv";

    window.open(url)
}
