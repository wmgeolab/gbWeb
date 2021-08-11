

// ------------------------------
// this loads and stores the geocontrast metadata csv

var geoContrastMetadata = null;

function onSuccess (data) {
    geoContrastMetadata = data;
    //alert('csv loaded '+JSON.stringify(data));
    // populate the countries table
    updateCountriesTable();
    updateMapCountries();
};

loadGeoContrastMetadata(onSuccess);


