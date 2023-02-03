
// ------------------------------
// update boundary collection dropdown

function updateCollectionDropdown() {
    var collections = getUniqueVals(geoContrastMetadata, 'boundaryCollection');
    var select = document.getElementById('collection');
    // clear previous
    select.innerHTML = '';
    // add 'no collection' as default
    select.innerHTML = '<option value="">Show all collections</option>\
                        <option value="geoBoundaries (Open)" selected>geoBoundaries (Open)</option>\
                        <option value="geoBoundaries (Humanitarian)">UN OCHA COD</option>\
                        <option value="geoBoundaries (Authoritative)">UN SALB</option>\
                        ';
    // add entries for each collection
    for (coll of collections) {
        if (coll === undefined | coll == '') {continue};
        if (coll.includes('geoBoundaries') | coll=='Other') {continue};
        var opt = document.createElement('option');
        opt.value = coll;
        opt.innerText = coll.replace('_', ' ');
        select.appendChild(opt);
    };
    // finally add Other collection last
    var opt = document.createElement('option');
    opt.value = "Other";
    opt.innerText = "Other";
    select.appendChild(opt);
    // set from get params if specified
    const urlParams = new URLSearchParams(window.location.search);
    var coll = urlParams.get('collection');
    if ((coll != null) & (coll != select.value)) {
        select.value = coll;
    };
};




// ------------------------------
// update admin level dropdown

function updateAdminLevelDropdown() {
    // the admin levels always remain the same, only set based on url GET param
    var select = document.getElementById('admin-level');
    // set from get params if specified
    const urlParams = new URLSearchParams(window.location.search);
    var lvl = urlParams.get('level');
    if ((lvl != null) & (lvl != select.value)) {
        select.value = lvl;
    };
};




// ------------------------------
// updates get params from dropdowns

function updateGetParams() {
    const urlParams = new URLSearchParams(window.location.search);
    // set collection
    var select = document.getElementById('collection');
    //if (select.value == '') {return}; // to avoid errors at startup when not all selects have been populated
    urlParams.set('collection', select.value);
    // set admin level
    var select = document.getElementById('admin-level');
    if (select.value == '') {return}; // to avoid errors at startup when not all selects have been populated
    urlParams.set('level', select.value);
    // set comparison source
    var select = document.getElementById('map-compare');
    if (select.value == '') {return}; // to avoid errors at startup when not all selects have been populated
    urlParams.set('compare', select.value);
    // update url
    var newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + urlParams.toString();
    window.history.replaceState({path:newUrl}, '', newUrl);
};



// ------------------------------
// this loads and stores the geocontrast metadata csv

var geoContrastMetadata = null;

function onSuccess (data) {
    geoContrastMetadata = data;
    //alert('csv loaded '+JSON.stringify(data));
    updateCollectionDropdown();
    updateAdminLevelDropdown();
    updateCountryDataDropdown();
    updateCountriesTable();
    updateMapCountries();
};

loadGeoContrastMetadata(onSuccess);


