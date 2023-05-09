const c_key = "be4579d6980e15a48b4fbebc24b9d91fad397960";
const w_key = "9c317dc0e4c669fd4f67c86c53779ce1";
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function getSubdivision(countryCode) {
    fetch("http://api.geonames.org/search?maxRows=100&country="+ countryCode + "&featureCode=ADM1&type=json&username=kakaq")
    .then((response) => response.json())
    .then((data) => {
            var listOfsubdivisions = data["geonames"];
            var subdivisionSelect = document.getElementById("subdivision");

            if (listOfsubdivisions.length > 0) {
                subdivisionSelect.innerHTML = "<option value=''></option>";
                
                for (var i=0;i<listOfsubdivisions.length;i++) {
                    var subdivisionName = listOfsubdivisions[i]["toponymName"];
                    var option = document.createElement("option");
                    option.setAttribute("value", subdivisionName);
                    option.innerHTML = subdivisionName;
                    if (i == 0) {
                        option.setAttribute("selected", true);
                    }
                    subdivisionSelect.appendChild(option);
                }
            } else {
                subdivisionSelect.innerHTML = "<option value=''></option>";
            }
        });
}

function setWeatherInfo(lat, long, name) {
    fetch("https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + long + "&appid=" + w_key)
        .then((response) => response.json())
        .then((data) => {
            var weatherArea = document.getElementById("weatherArea");
            weatherArea.innerHTML = "Current weather in " + name;
            document.getElementById("weatherMain").innerHTML = data["weather"][0]["main"] + " (" + data["weather"][0]["description"] + ")"; 
            document.getElementById("weatherHumidity").innerHTML = "Humidity: " + data["main"]["humidity"] + "%";
            document.getElementById("weatherTemperature").innerHTML = "Temperature: " + (parseFloat(data["main"]["temp"])-273.15).toFixed(2).toString() + "°C";
            document.getElementById("weatherWindspeed").innerHTML = "Windspeed: " + data["wind"]["speed"] + " (" + data["wind"]["deg"] + " deg)"; 

        })
    
}

function getDayInfo(country, countryFullName ,subdivision, date) {
    var dayInfo = document.getElementById("dayInfo").style.display = "block";
    if (subdivision.length == 0) {
        var fixed = countryFullName + ", " + country;
    } else {
        var fixed = subdivision.replace("Prefecture", "").replace("-", " ").replace("Sheng", "").replace("Shi", "") + "," + country;
    }
    fetch("http://api.openweathermap.org/geo/1.0/direct?q=" + fixed + "&limit=1&appid=" + w_key)
        .then((response) => response.json())
        .then((data) => {
            try {
                var lat = data[0]["lat"];
                var long = data[0]["lon"];
                setWeatherInfo(lat, long, subdivision + ", " + countryFullName);
            } catch(e) {
                fetch("http://api.openweathermap.org/geo/1.0/direct?q=" + countryFullName + "&limit=1&appid=" + w_key)
                    .then((response) => response.json())
                    .then((data) => {
                        var lat = data[0]["lat"];
                        var long = data[0]["lon"];
                        setWeatherInfo(lat, long, countryFullName);
                    });
            }
        })

}

function getHolidays() {
    var country = document.getElementById("country").value;
    var countryFullName = document.getElementById("country").options[document.getElementById("country").selectedIndex].text;
    var subdivision = document.getElementById("subdivision").value;
    var year = document.getElementById("year").value;
    document.getElementById("dayInfo").style.display = "none";
    document.getElementById("holidays").style.visibility = "hidden";
    fetch("https://calendarific.com/api/v2/holidays?&api_key="+c_key+"&country="+country+"&year="+year+"&location="+subdivision)
        .then((response) => response.json())
        .then((data) => {
            var listOfHolidays = data.response.holidays;
            var holidaysTable = document.getElementById("holidays");
            document.getElementById("holidays").style.visibility = "visible";
            holidaysTable.innerHTML = "";
            for (var i=0;i<listOfHolidays.length;i++) {
                var tableRow = document.createElement("tr");

                var dateCol = document.createElement("td");
                var date = data.response.holidays[i]["date"]["datetime"]["year"] + "-" + data.response.holidays[i]["date"]["datetime"]["month"] + "-" + data.response.holidays[i]["date"]["datetime"]["day"];
                dateCol.innerHTML = date;
                tableRow.appendChild(dateCol);
                
                var dayCol = document.createElement("td");
                var dateObj = new Date(date);
                dayCol.innerHTML = days[dateObj.getDay()];
                tableRow.appendChild(dayCol);

                var nameCol = document.createElement("td");
                nameCol.innerHTML = data.response.holidays[i]["name"];
                tableRow.appendChild(nameCol);

                tableRow.addEventListener("click", function() {
                    getDayInfo(country, countryFullName, subdivision, date);
                })
                
                holidaysTable.appendChild(tableRow);
            }
        })

}

function start() {
    fetch("https://calendarific.com/api/v2/countries?&api_key="+c_key)
        .then((response) => response.json())
        .then((data) => {
            var countrySelect = document.getElementById("country");
            var listOfCountries = data.response.countries;
            for (var i=0;i<listOfCountries.length;i++) {
                var option = document.createElement("option");
                var countryCode = listOfCountries[i]["iso-3166"];
                option.setAttribute("value", countryCode);
                option.innerHTML = listOfCountries[i]["country_name"]; 
                if (i == 0) {
                    option.setAttribute("selected", true);
                    getSubdivision(countryCode);
                }
                countrySelect.appendChild(option);
            }
        });
    var countrySelect = document.getElementById("country");

    countrySelect.addEventListener("change", async function() {
        var countryCode = this.value;
        getSubdivision(countryCode);
        
    });

    var currentYear = new Date().getFullYear();
    var yearSelect = document.getElementById("year");
    for (let i = currentYear; i <= currentYear + 10; i++) {
        const option = document.createElement('option');
        if (i == currentYear) {
            option.setAttribute("selected", true);
        }
        option.innerHTML = i;
        option.value = i;
        yearSelect.appendChild(option);
      }
}


window.addEventListener("load", (event) => {
    start();
})


