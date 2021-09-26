function read_geodata_data()
{
    console.log("HERE")
    var selection_menu = document.getElementById('csv_list');

    var selection_val = selection_menu.value;

    console.log(selection_val);

    //var filepath = "./assets/data/geodata/" + selection_val + ".csv"

    //console.log(filepath)

    var url = "https://raw.githubusercontent.com/wmgeolab/geoDataWeb/main/ancillaryData/gdOpen/sourceData/ADM0/" + selection_val + ".csv";

    var request = new XMLHttpRequest();

    request.open("GET", url, false);
    request.send(null);

    var return_object = request.responseText;

    var rows = return_object.split("\n");

    //console.log(rows[0]);

    var table = document.getElementById("countries-table");
    
    for (var i=0;i<rows.length;i++)
    {
	console.log(rows[i]);
	country = rows[i].split(",")[0];
	data = rows[i].split(",")[1];
	
	row_string = "<tr><td>" + country + "</td><td>" + data + "</td></tr>";
	table.innerHTML += row_string;
    }

    //console.log(return_object);
    
    
}
