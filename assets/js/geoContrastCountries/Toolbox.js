
// ------------------------------
// update boundary collection dropdown

function updateCollectionDropdown() {
    var collections = getUniqueVals(geoContrastMetadata, 'boundaryCollection');
    var select = document.getElementById('collection');
    // clear previous
    select.innerHTML = '';
    // add 'no collection' as default
    select.innerHTML = '<option value="" selected>Show all collections</option>';
    // add entries for each collection
    for (coll of collections) {
        if (coll === undefined | coll == '') {continue};
        var opt = document.createElement('option');
        opt.value = coll;
        opt.innerText = coll.replace('_', ' ');
        select.appendChild(opt);
    };
};



// ------------------------------
// this loads and stores the geocontrast metadata csv

var geoContrastMetadata = null;

function onSuccess (data) {
    geoContrastMetadata = data;
    //alert('csv loaded '+JSON.stringify(data));
    updateCollectionDropdown();
    updateCountryDataDropdown()
    updateCountriesTable();
    updateMapCountries();
};

loadGeoContrastMetadata(onSuccess);


