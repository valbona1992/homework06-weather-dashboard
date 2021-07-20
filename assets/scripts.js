var cities = [];
loadCityHistory() 

$("#search").on("click", function (event) {
    event.preventDefault();
    let inputCity = $("#input-city").val();

    searchAPI(inputCity);
})

var APIKey = "888355c4ec2188be23dc3abb76bac61a"

function searchAPI(city) {
    // Unhide result column
    $(".result-col").removeClass("d-none");

    // This function will call the API to search the input city
    let queryURL = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + APIKey + "&units=imperial";

    fetch(queryURL)
        .then(function (response) {
            if (response.status === 404) {
                // if the city is not real
                // alert("Please enter a real city");
            }

            return response.json();
        })
        .then(function (data) {
            // Check if the response is 200
            if (data["cod"] == 200) {
                console.log(data);
                let lat = data["coord"]["lat"];
                let lon = data["coord"]["lon"];
                let cityName = data["name"];
                let iconURL = "http://openweathermap.org/img/w/" + data["weather"][0]["icon"] + ".png"

                $("#city-name").html(`
                    <p>${cityName} <img src="${iconURL}"></p>
                `);

                currentForecast(lon, lat, APIKey);
                addToCityHistory(cityName);

            }
        });
}


function currentForecast(lon, lat, APIKey) {
    let queryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=" + APIKey;


    fetch(queryURL)
        .then(function (response) {
            if (response.status === 404) {}
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            let temp = data["current"]["temp"];
            let humidity = data["current"]["humidity"];
            let uvi = data["current"]["uvi"];

            let uviClass = "";
            if (uvi <= 2) {
                uviClass = "bg-success";
            } else if (uvi <= 7) {
                uviClass = "bg-warning";
            } else {
                uviClass = "bg-danger";
            }

            let wind = data["current"]["wind_speed"];
            let unixTime = data["current"]["dt"];
            let currentTime = moment.unix(unixTime).format('MM/DD/YYYY');

            $("#current-time").html(currentTime);
            $("#temp").html("Temp: " + temp + "°F");
            $("#humidity").html("Humidity: " + humidity + "%");
            $("#wind").html("Wind: " + wind + "MPH");
            $("#uvi").html(`UV index: <span class="badge ${uviClass}">${uvi}</span>`);

            for (let i = 1; i < 6; i++) {
                let dailyTemp = data["daily"][i]["temp"]["day"];
                let dailyWind = data["daily"][i]["wind_speed"];
                let dailyHumidity = data["daily"][i]["humidity"];
                let dailyIcon = data["daily"][i]["weather"][0]["icon"];
                let dailyIconURL = "http://openweathermap.org/img/w/" + dailyIcon + ".png"

                $($(".daily-icon")[i - 1]).attr("src", dailyIconURL)
                $($(".daily-temp")[i - 1]).html(dailyTemp + "°F");
                $($(".daily-wind")[i - 1]).html(dailyWind + "MPH");
                $($(".daily-humidity")[i - 1]).html(dailyHumidity + "%");

            }
        });
}


function addToCityHistory(cityName) {
    
    for (let i = 0; i < cities.length; i++){
        if (cityName === cities[i]){
            cities.splice(i, 1);
            break;
        }
    }
    cities.unshift(cityName);
    if (cities.length === 6 ) {
        cities.pop();
    }
    localStorage.setItem("pastCities", JSON.stringify (cities));

    $("#searchHistory").html("");
    for (let i = 0; i < cities.length; i++){
        $("#searchHistory").append(`<button class='btn btn-block bg-gray historyButton' onclick="searchAPI('${cities[i]}')"> ${cities[i]} </button>`);
    }
}

function loadCityHistory() {
   cities = JSON.parse(localStorage.getItem("pastCities"));
   
   if (!cities) {
       cities = [];
       return false;
    }
    for (let i = 0; i <cities.length; i++){
        $("#searchHistory").append(`<button class='btn btn-block bg-gray historyButton' onclick="searchAPI('${cities[i]}')"> ${cities[i]} </button>`);
    }
}