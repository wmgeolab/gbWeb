
function zipfileSelected() {
    var select = document.getElementById('file-input');
    const file = select.files[0];
    
    // get file contents as a base64 encoded url string
    fileExtension = file.name.split('.').pop();
    //alert('local file selected: '+file.name+' - '+fileExtension);
    
    if (fileExtension == 'zip') {
        // experiment with zipfile reading
        // https://stuk.github.io/jszip/documentation/examples/read-local-file-api.html
        reader = new FileReader();
        reader.onload = function(e) {
            // use reader results to create new source
            var raw = reader.result;
            var zip = new JSZip(raw);
            var paths = [];
            for (filename in zip.files) {
                if (filename.endsWith('.shp')) {
                    var path = file.name + '/' + filename;
                    var displayName = filename;
                    paths.push([path,displayName]);
                };
            };
            // make file input form visible
            document.getElementById('file-input-form').style.display = 'block';
            // populate zipfile contents selector
            updateZipfileFileDropdown(paths);
        };
        reader.readAsBinaryString(file);
    };
};

function updateZipfileFileDropdown(paths) {
    // activate and clear the dropdown
    var select = document.querySelector('select[name="path"]');
    select.innerHTML = '';
    // populate the dropdown
    for ([path,displayName] of paths) {
        var opt = document.createElement('option');
        opt.value = path;
        opt.innerText = displayName;
        select.appendChild(opt);
    };
    // force change
    zipfileFileDropdownChanged();
};

function zipfileFileDropdownChanged(select) {
    // get the path dropdown value
    var path = document.querySelector('select[name="path"]').value;
    var subPath = path.split('.zip/')[1]; // only the relative path inside the zipfile
    // read the uploaded file contents to jszip
    var select = document.getElementById('file-input');
    var file = select.files[0];
    reader = new FileReader();
    reader.onload = function(e) {
        // open zipfile
        var raw = reader.result;
        var zip = new JSZip(raw);
        // parse the dbf file
        var dbfString = subPath.replace('.shp', '.dbf');
        var encoding = 'utf8';
        var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
        DBFParser.load(URL.createObjectURL(new Blob([zip.file(dbfString).asArrayBuffer()])), encoding, fileLoaded, null);
    };
    reader.readAsBinaryString(file);
};

function fileLoaded(data, dummy=null) {
    var rows = data.records;
    // populate field dropdowns
    var fields = Object.keys(rows[0]);
    for (elem of document.querySelectorAll('.field-dropdown')) {
        // clear it
        elem.innerHTML = ''; 
        // add initial empty
        var opt = document.createElement('option');
        opt.value = '';
        opt.selected = true;
        elem.appendChild(opt);
        // add fields
        for (field of fields) {
            var opt = document.createElement('option');
            opt.value = field;
            opt.innerText = field;
            elem.appendChild(opt);
        };
    };
    // populate table
    populateFilePreviewTable(rows);
};

function populateFilePreviewTable(rows) {
    // populate headers
    var thead = document.querySelector('.file-preview-table thead');
    thead.innerHTML = '';
    var fields = Object.keys(rows[0]);
    for (field of fields) {
        var th = document.createElement('th');
        th.innerText = field;
        thead.appendChild(th);
    };
    // populate rows
    var tbody = document.querySelector('.file-preview-table tbody');
    tbody.innerHTML = '';
    for (row of rows) {
        var tr = document.createElement('tr');
        for (field of fields) {
            var td = document.createElement('td');
            td.innerText = row[field];
            tr.appendChild(td);
        };
        tbody.appendChild(tr);
    };
};

function submitBoundary() {
    var dict = {};
    // first collect named inputs
    for (elem of document.querySelectorAll('input[name]')) {
        dict[elem.name] = elem.value;
    };
    // then collect the input forms as a list
    var dataInputs = [];
    for (form of document.querySelectorAll('#file-input-form')) {
        var dataInput = {};
        for (elem of form.querySelectorAll('input[name],select[name]')) {
            dataInput[elem.name] = elem.value;
        };
        dataInputs.push(dataInput);
    };
    dict['input'] = dataInputs;
    // submit
    alert(JSON.stringify(dict)); // just print for now... 
};
