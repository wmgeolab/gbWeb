
// contribute form popup actions

function openContributePopup() {
    // show popup
    var popup = document.getElementById('contribute-popup');
    popup.className = "popup"; // is-visually-hidden";
    // clear all named inputs
    for (elem of popup.querySelectorAll('input[name]')) {
        elem.value = '';
    };
    for (elem of popup.querySelectorAll('.field-dropdown')) {
        elem.innerHTML = '';
    };
    // remove any previous input forms
    var inputForms = document.getElementById('input-forms');
    for (form of inputForms.querySelectorAll('.input-form')) {
        form.remove();
    };
    // auto set the iso field
    var iso = document.getElementById('country-select').value;
    popup.querySelector('input[name="iso"]').value = iso;
    // add inital input form
    var inputForm = document.getElementById('empty-input-form').cloneNode(true);
    inputForm.id = '';
    inputForm.className = 'input-form';
    inputForm.style.display = 'block';
    inputForms.appendChild(inputForm);
    // populate the file dropdown in the new input form
    var options = document.getElementById('gb-file-select').innerHTML;
    var fileSelect = inputForm.querySelector('select[name="path"]');
    fileSelect.innerHTML = options;
    // force dropdown change
    contributeFileDropdownChanged(fileSelect);
};

function contributeFileDropdownChanged(select) {
    // get the dropdown value
    var path = select.value;
    var subPath = path.split('.zip/')[1]; // only the relative path inside the zipfile
    // read the uploaded file contents to jszip
    var file = document.getElementById('gb-file-input').files[0];
    reader = new FileReader();
    reader.onload = function(e) {
        // open zipfile
        var raw = reader.result;
        var zip = new JSZip(raw);
        // parse the dbf file
        var dbfString = subPath.replace('.shp', '.dbf');
        var encoding = 'utf8';
        var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
        DBFParser.load(URL.createObjectURL(new Blob([zip.file(dbfString).asArrayBuffer()])), encoding, contributeFileLoaded, null);
    };
    reader.readAsBinaryString(file);
};

function contributeFileLoaded(data, dummy=null) {
    var rows = data.records;
    // populate field dropdowns
    var fields = Object.keys(rows[0]);
    var popup = document.getElementById('contribute-popup');
    for (elem of popup.querySelectorAll('.field-dropdown')) {
        elem.innerHTML = ''; // clear it
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
    var thead = document.querySelector('.input-form .file-preview-table thead');
    thead.innerHTML = '';
    var fields = Object.keys(rows[0]);
    for (field of fields) {
        var th = document.createElement('th');
        th.innerText = field;
        thead.appendChild(th);
    };
    // populate rows
    var tbody = document.querySelector('.input-form .file-preview-table tbody');
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
    var popup = document.getElementById('contribute-popup');
    var dict = {};
    // first collect named inputs
    for (elem of popup.querySelectorAll('input[name]')) {
        dict[elem.name] = elem.value;
    };
    // then collect the input forms as a list
    var dataInputs = [];
    for (form of popup.querySelectorAll('.input-form')) {
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

function closeContributePopup() {
    var popup = document.getElementById('contribute-popup');
    popup.className = "popup is-hidden is-visually-hidden";
    //body.className = "";
    //container.className = "MainContainer";
    //container.parentElement.className = "";
};

