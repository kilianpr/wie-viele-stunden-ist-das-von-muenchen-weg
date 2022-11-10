function main() {
    var searchButton = document.getElementById("search");
    searchButton.addEventListener("click", onSearchClick);
    var reloadButton = document.getElementById("reload");
    reloadButton.addEventListener("click", onReloadClick);
    var input = document.getElementById("place");
    input.addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
          // Cancel the default action, if needed
          event.preventDefault();
          // Trigger the button element with a click
          document.getElementById("search").click();
        }
      });
}

async function onSearchClick() {
    //console.log(0===null)
    const userInput = document.getElementById("place").value;
    const place = await getNominatimGeocode(userInput);
    //console.log(place);
    if (!place._apiOK){
        //console.log("Es gibt ein Problem mit der API!");
        document.getElementById("warningmessage").textContent = "Es gibt anscheinend ein Problem mit der Nominatim-Api!";
        document.getElementById("warning").style["display"]="block";
    }
    else if (!place._placeValid){
        //console.log("Diesen Ort gibt es nicht!")
        document.getElementById("warningmessage").textContent = "Diesen Ort gibt es anscheinend nicht!";
        document.getElementById("warning").style["display"]="block";

    }
    else {
        const route = await getDuration(place._long, place._lat);
        //console.log(route);
        if ((route._distanceInKm!==null) && (route._durMins!==null) && (route._durHours!==null)){
            document.getElementById("search-bar").style["display"]="none";
            document.getElementById("heading").style["display"]="none";
            document.getElementById("warning").style["display"]="none";
            document.getElementById("result").style["display"]="block";
            document.getElementById("reload").style["display"]="block";
            document.getElementById("time").style["display"]="block";
            document.getElementById("Stunden").textContent="Stunden"
            document.getElementById("term").textContent=place._term;
            document.getElementById("time").textContent=route._durHours+":"+route._durMins;
        }
        else{
            document.getElementById("search-bar").style["display"]="none";
            document.getElementById("heading").style["display"]="none";
            document.getElementById("warning").style["display"]="none";
            document.getElementById("result").style["display"]="block";
            document.getElementById("reload").style["display"]="block";
            document.getElementById("time").style["display"]="none";
            document.getElementById("Stunden").textContent="undefinierbar lange"
            document.getElementById("term").textContent=place._term;
        }
    }
    }
    

function onReloadClick(){
    document.getElementById("search-bar").style["display"]="block";
    document.getElementById("heading").style["display"]="block";
    document.getElementById("result").style["display"]="none";
    document.getElementById("reload").style["display"]="none";
}


async function getNominatimGeocode(userInput) {
    const obj = { _placeValid: true, _apiOK: true, _term: null, _long: null, _lat: null };
    try {
        const response = await fetch('https://nominatim.openstreetmap.org/search?q=' + userInput + '&format=json&accept-language=de');
        const data = await response.json();

        if (data.length > 0) {
            obj._term = data[0]['display_name'];
            obj._long = data[0]['lon'];
            obj._lat = data[0]['lat'];
        }
        else {
            obj._placeValid = false;
            //console.log("invalid place!");
        }
    }
    catch (err) {
        obj._apiOK = false;
    }

    return obj;
}

async function getDuration(long, lat){
    const longMun = "11.5753822";
    const latMun = "48.1371079";
    let duration, distance;
    const obj = {_distanceInKm:null, _durMins:null, _durHours:null};

    try{
        const response = await fetch('https://router.project-osrm.org/route/v1/driving/'+long+','+lat+";"+longMun+","+latMun);
        const data = await response.json();
        //console.log(data);
        duration = data["routes"][0]["duration"];
        distance = data["routes"][0]["distance"];

        obj._distanceInKm = Math.round((parseFloat(distance)/1000)*10)/10;

        obj._durHours = Math.floor(parseFloat(duration)/(60*60));
        obj._durMins = Math.round((parseFloat(duration)/60)%60);
   
    }
    catch(err){
        //console.log("Achtung Error: "+ err);
    }

    return obj;
}

main();
