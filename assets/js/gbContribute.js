
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
    // get file info
    var select = document.getElementById('file-input');
    var file = select.files[0];
    var path = document.querySelector('select[name="path"]').value;
    var subPath = path.split('.zip/')[1]; // only the relative path inside the zipfile
    // read the uploaded file contents
    reader = new FileReader();
    reader.onload = function(e) {
        // open zipfile
        var raw = reader.result;
        var zip = new JSZip(raw);
        // prep args
        var dbfString = subPath.replace('.shp', '.dbf');
        // load using shapefile-js
        // https://github.com/calvinmetcalf/shapefile-js
        var result = shp.parseDbf(zip.file(dbfString).asArrayBuffer());
        fileLoaded(result);
    };
    reader.readAsBinaryString(file);
};

function fileLoaded(data, dummy=null) {
    var rows = data;
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

// Author: Jared Goodwin
// showLoading() - Display loading wheel.
// removeLoading() - Remove loading wheel.
// Requires ECMAScript 6 (any modern browser).
function showLoading() {
    if (document.getElementById("divLoadingFrame") != null) {
      return;
    }
    var style = document.createElement("style");
    style.id = "styleLoadingWindow";
    style.innerHTML = `
          .loading-frame {
              position: fixed;
              background-color: rgba(0, 0, 0, 0.8);
              left: 0;
              top: 0;
              right: 0;
              bottom: 0;
              z-index: 4;
          }
  
          .loading-track {
              height: 50px;
              display: inline-block;
              position: absolute;
              top: calc(50% - 50px);
              left: 50%;
          }
  
          .loading-dot {
              height: 5px;
              width: 5px;
              background-color: white;
              border-radius: 100%;
              opacity: 0;
          }
  
          .loading-dot-animated {
              animation-name: loading-dot-animated;
              animation-direction: alternate;
              animation-duration: .75s;
              animation-iteration-count: infinite;
              animation-timing-function: ease-in-out;
          }
  
          @keyframes loading-dot-animated {
              from {
                  opacity: 0;
              }
  
              to {
                  opacity: 1;
              }
          }
      `
    document.body.appendChild(style);
    var frame = document.createElement("div");
    frame.id = "divLoadingFrame";
    frame.classList.add("loading-frame");
    for (var i = 0; i < 10; i++) {
      var track = document.createElement("div");
      track.classList.add("loading-track");
      var dot = document.createElement("div");
      dot.classList.add("loading-dot");
      track.style.transform = "rotate(" + String(i * 36) + "deg)";
      track.appendChild(dot);
      frame.appendChild(track);
    }
    document.body.appendChild(frame);
    var wait = 0;
    var dots = document.getElementsByClassName("loading-dot");
    for (var i = 0; i < dots.length; i++) {
      window.setTimeout(function(dot) {
        dot.classList.add("loading-dot-animated");
      }, wait, dots[i]);
      wait += 150;
    }
  };


let text = "";
let userInput = document.getElementById("user-input");

function submitBoundary() {
    var form = document.getElementById('contribute-form');
    // collect all inputs into tab groupings
    var invalidElements = {};
    // 1 tab group = contribute-data
    var tabId = 'contribute-data';
    var tabContainer = document.getElementById(tabId);
    invalidElements[tabId] = [];
    for (elem of tabContainer.querySelectorAll('input[name], select[name]')) {
        // if input fires an invalid event, add to element list
        elem.addEventListener('invalid', function (event) {
            invalidElements['contribute-data'].push(elem);
        });
    };
    // 2 tab group = contribute-metadata
    var tabId = 'contribute-metadata';
    var tabContainer = document.getElementById(tabId);
    invalidElements[tabId] = [];
    for (elem of tabContainer.querySelectorAll('input[name], select[name]')) {
        // if input fires an invalid event, add to element list
        elem.addEventListener('invalid', function (event) {
            invalidElements['contribute-metadata'].push(elem);
        });
    };
    // 3 tab group = contribute-contact
    var tabId = 'contribute-contact';
    var tabContainer = document.getElementById(tabId);
    invalidElements[tabId] = [];
    for (elem of tabContainer.querySelectorAll('input[name], select[name]')) {
        // if input fires an invalid event, add to element list
        elem.addEventListener('invalid', function (event) {
            invalidElements['contribute-contact'].push(elem);
        });
    };

    if (userInput.value === text) {
        // alert("Success");
    } else {
        invalidElements['contribute-contact'].push(userInput);
    }

    // fire invalid event for each invalid input
    form.checkValidity();
    // switch to tab of first invalid input
    console.log(invalidElements)
    for (tabId in invalidElements) {
        if (invalidElements[tabId].length > 0) {
            try{
            $('#contribute-tab-container').easytabs('select', tabId);
            } catch (error){
                console.log(error)
            }
            break;
        };
    };
    
    if(invalidElements[tabId].length==0){
        showLoading()
    }
    console.log("Out of loop")
    // after this, the default form submit code will execute, ie redirect to post target
    // finished
};

//Initial References
let submitButton = document.getElementById("submit-button");
let canvas = document.getElementById("canvas");
let reloadButton = document.getElementById("reload-button");

//Generate Text
const textGenerator = () => {
  let generatedText = "";
  /* String.fromCharCode gives ASCII value from a given number */
  // total 9 letters hence loop of 3
  for (let i = 0; i < 3; i++) {
    //65-90 numbers are capital letters
    generatedText += String.fromCharCode(randomNumber(65, 90));
    //97-122 are small letters
    generatedText += String.fromCharCode(randomNumber(97, 122));
    //48-57 are numbers from 0-9
    generatedText += String.fromCharCode(randomNumber(48, 57));
  }
  return generatedText;
};

//Generate random numbers between a given range
const randomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

//Canvas part
function drawStringOnCanvas(string) {
  //The getContext() function returns the drawing context that has all the drawing properties and functions needed to draw on canvas
  let ctx = canvas.getContext("2d");
  //clear canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  //array of text color
  const textColors = ["rgb(0,0,0)", "rgb(130,130,130)"];
  //space between letters
  const letterSpace = 150 / string.length;
  //loop through string
  for (let i = 0; i < string.length; i++) {
    //Define initial space on X axis
    const xInitialSpace = 25;
    //Set font for canvas element
    ctx.font = "20px Roboto Mono";
    //set text color
    ctx.fillStyle = textColors[randomNumber(0, 1)];
    ctx.fillText(
      string[i],
      xInitialSpace + i * letterSpace,
      randomNumber(25, 40),
      100
    );
  }
}

//Initial Function
function triggerFunction() {
  //clear Input
  userInput.value = "";
  text = textGenerator();
  console.log(text);
  //Randomize the text so that everytime the position of numbers and small letters is random
  text = [...text].sort(() => Math.random() - 0.5).join("");
  drawStringOnCanvas(text);
}

//call triggerFunction for reload button
reloadButton.addEventListener("click", triggerFunction);

//call triggerFunction when page loads
window.onload = () => triggerFunction();

//When user clicks on submit
submitButton.addEventListener("click", () => {
    //check if user input  == generated text
    if (userInput.value === text) {
        // alert("Success");
    } else {
        // alert("Incorrect");
        triggerFunction();

        // // Switch to the tab containing the captcha input
        // try {
        //     $('#contribute-tab-container').easytabs('select', 'Captcha');
        // } catch (error) {
        //     console.log(error);
        // }

        // Create a new element for displaying the error message
        var errorMessage = document.createElement("p");
        errorMessage.style.color = "red"; // Set the color to red or customize as needed
        errorMessage.textContent = "Captcha is invalid. Please try again.";

        // Append the error message to a specific element in your HTML (e.g., a div with id "error-container")
        var errorContainer = document.getElementById("error-container");
        errorContainer.innerHTML = ""; // Clear existing error messages
        errorContainer.appendChild(errorMessage);
        
        return;
    }
});

function loadLicenses(onSuccess) {
    // fetch metadata
    // determine url of metadata csv
    url = 'https://raw.githubusercontent.com/wmgeolab/geoBoundaryBot/main/dta/gbLicenses.csv';
    // define error and success
    function error (err, file, inputElem, reason) {
        alert('License data failed to load: '+url);
    };
    function success (result) {
        //alert('load success');
        // process csv data using custom function
        onSuccess(result['data']);
    };
    // parse
    Papa.parse(url,
                {'download':true,
                'header':true,
                'complete':success,
                'error':error,
                }
    );
};

function updateLicenseDropdown(data) {
    var select = document.querySelector('select[name="license"]');
    // add default empty option
    var opt = document.createElement('option');
    opt.value = '';
    opt.innerText = '';
    opt.selected = true;
    select.appendChild(opt);
    // add license options
    for (row of data) {
        var val = row['license_name'];
        if (val == '') {continue};
        var opt = document.createElement('option');
        opt.value = val;
        opt.innerText = val;
        select.appendChild(opt);
    };
};

function loadCountries(onSuccess) {
    // fetch metadata
    // determine url of metadata csv
    url = 'https://raw.githubusercontent.com/wmgeolab/geoBoundaryBot/main/dta/iso_3166_1_alpha_3.csv';
    // define error and success
    function error (err, file, inputElem, reason) {
        alert('Country data failed to load: '+url);
    };
    function success (result) {
        //alert('load success');
        // process csv data using custom function
        onSuccess(result['data']);
    };
    // parse
    Papa.parse(url,
                {'download':true,
                'header':true,
                'complete':success,
                'error':error,
                }
    );
};

function updateCountryDropdown(data) {
    var select = document.querySelector('select[name="iso"]');
    // add default empty option
    var opt = document.createElement('option');
    opt.value = '';
    opt.innerText = '';
    opt.selected = true;
    select.appendChild(opt);
    // sort alphabetically
    sortBy(data, 'Name');
    // add country options
    for (row of data) {
        if (row['Name'] == '') {continue};
        var opt = document.createElement('option');
        opt.value = row['Alpha-3code'];
        opt.innerText = row['Name'];
        select.appendChild(opt);
    };
};

// load data on startup
loadLicenses(updateLicenseDropdown);
loadCountries(updateCountryDropdown);

// poke the heroku server to wake it up from its slumber
//fetch('https://geoboundaries.geolab.wm.edu/api_contribute/',{mode:'no-cors'})
