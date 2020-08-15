"use strict";
const API_KEY = "546e9995ce8b4a04d00449aab5bc5222";
let prevCities = [];    // a list of the names of previously searched cities
let myResponse;

let currentTime = moment().format();
// let tomorrow = moment().add(1, 'd').format()
// let tomorrow = moment(moment().format() + "+24:00")
// console.log(tomorrow)

console.log(currentTime);

console.log("page loaded");
// api.openweathermap.org/data/2.5/forecast?q={city name},{state code}&appid={your api key}
// api.openweathermap.org/data/2.5/forecast?q={city name},{state code},{country code}&appid={your api key}

/** Main controller function. Gets items from storage, adds event listeners, and fills out the search bar. */
function main() {
    $(".currentDay").text(moment().format("dddd, MMMM Do"));
    getLocalStorage();
    weatherListener();
    populatePrevSearches();
}

$(document).ready(main);


/** Fills out previous form input, and gets previous city names array from local storage */
const getLocalStorage = () => {
    document.getElementById("city-name").value = localStorage.getItem("cityName");

    // get prev cities list so that main() will populate search bar
    prevCities = JSON.parse(localStorage.getItem("prevCities"));
    prevCities === null ? prevCities = [] : prevCities = prevCities;

    // get previous forecast for forecast cards and run display function
    let lastForecast = JSON.parse(localStorage.getItem("lastForecast"));
    if (lastForecast !== null) {
        displayForecastCards(lastForecast);
    }
    else {
        $(".currentCityTitle").text("Search for a city to start!");
    }

    // get current weather for jumbotron section and run display function
    let currentWeather = JSON.parse(localStorage.getItem("currentWeather"));
    if (currentWeather !== null) {
        displayCurrentWeather(currentWeather);
    }

    // get previously searched uv index and run display function
    let prevUVIndex = localStorage.getItem("uvIndex");
    if (prevUVIndex !== null) {
        displayUVIndex(prevUVIndex);
    }
}


/** Erases the search bar and creates a new bar, consisting of a button for each city */
const populatePrevSearches = () => {
    let prevSearchBar = $(".prev-searches");

    // first erase the search bar
    prevSearchBar.empty();
    // then add a button for each city in the prevSearches array
    for (let i = 0, j = prevCities.length; i < j; i++) {
        let prevSearchBtn = $("<btn>");
        prevSearchBtn.attr("class", "list-group-item list-group-item-action prev-search-btn").text(prevCities[i]);
        prevSearchBtn.attr("id", "btn-" + i);
        prevSearchBtn.on("click", function() {
            let cityName = prevSearchBtn.text();
            searchForecast(cityName);
        })
        if (i === 0) {
            prevSearchBtn.addClass("active");
        }
        prevSearchBar.append(prevSearchBtn);
    }
}


/** makes ajax call */
const makeCall = (queryURL) => {
    return $.ajax({
        url: queryURL,
        method: "GET"
    });
}


const displayUVIndex = (uvValue) => {
    $(".uv-index").text(uvValue);
    // change color of uv-index badge depending on conditions
    if (uvValue >= 3 && uvValue < 5) {
        $("#uv-index").attr("class", "uv-index badge badge-warning");
        $(".suntan").text("Always protect your skin from the sun!");
    }
    else if (uvValue >= 5) {
        $("#uv-index").attr("class", "uv-index badge badge-danger");
        $(".suntan").text("Remember to wear suntan lotion!");

    }
    else {
        $("#uv-index").attr("class", "uv-index badge badge-success");
        $(".suntan").text("Enjoy the outdoors!");
    }
}

const displayCurrentWeather = (response) => {
    console.log(response);
    const weatherTemp = response.main.temp;
    const humidity = response.main.humidity;
    const windSpeed = response.wind.speed;
    const iconCode = response.weather[0].icon;
    let iconURL = "http://openweathermap.org/img/wn/" + iconCode + "@2x.png";

    $(".current-temp").text(`Temperature: ${weatherTemp} °F`);
    $(".current-humidity").text(`Humidity: ${humidity}%`);
    $(".current-windspeed").text(`Wind speed: ${windSpeed} mph`);

    $(".current-weather-icon").attr("src", iconURL);
}

const displayForecastCards = (response) => {
    $(".currentCityTitle").text(response.city.name)

    // weatherTime corresponds to the index of the weather array, with increasing indices corresponding to future dates
    let weatherTime = 0;

    // clear out old weather cards, then make a new set of five cards.
    $(".weather-list").empty();

    // Append list of 5 cards for 5 future forecasts
    let future = 1;
    while (weatherTime < 40) {
        // first get the weather icon picture
        const weatherIconCode = response.list[weatherTime].weather[0].icon;
        let iconURL = "http://openweathermap.org/img/wn/" + weatherIconCode + "@2x.png";
        let newIcon = $(`<img src=${iconURL} class='card-img-top' alt='forecast for ${future} days out'>`);

        // next get temperature in Fahrenheit and other relevant statistics
        const weatherTemp = response.list[weatherTime].main.temp;
        const humidity = response.list[weatherTime].main.humidity;
        const weatherDescription = response.list[weatherTime].weather[0].description;

        // create the main weather card body
        let cardBody = $("<div class='card-body'>")

        // add on the day:
        let futureDate = moment().add(future, 'd').format("dddd, MMMM Do")
        // Note: the text in the div must be set separately from creating the div element.
        let cardDateText = $('<div>').html("<strong>" + futureDate + "</strong>").attr("class", "card-header");
        // let cardDateText = $('<div>').append("<strong>").text(`${futureDate}`).attr("class", "card-header");

        // Create new paragraphs to put onto each weather card
        let cardText1 = $("<p>").attr("class", "card-text");
        let cardText2 = $("<p>").attr("class", "card-text");
        let cardText3 = $("<p>").attr("class", "card-text");
        cardText1.text("Temp: " + weatherTemp + " °F")
        cardText2.text("Humidity: " + humidity + "%");
        cardText3.text("Forecast: " + weatherDescription)

        cardBody.append(cardText1).append(cardText2).append(cardText3);

        let weatherCard = $("<div class='card col-xl-2' style='width:18rem;'>").append(cardDateText).append(newIcon).append(cardBody);
        $(".weather-list").append(weatherCard)

        // increment weatherTime by 8 to get the next day's weather. Last day index will be 39, rather than 40.
        weatherTime += 8;
        future++;
    }
}


/** adds a listener to the submit button and to make an api call. Stores city name. */
const weatherListener = () => {
    document.getElementById("location-form").addEventListener("submit", function() {
        // The form, not the button, reloads the page. So for the submit event, the event must be on the form.
        event.preventDefault();

        // Store the input city.
        let cityName = $("#city-name").val();
        if (cityName === "") {
            alert("You must enter a city!");
            return;
        }
        localStorage.setItem("cityName", cityName);
        searchForecast(cityName);
    });
}


/** Makes API call. After response is returned, add the searched city to the search list. 
 * Call displayForecastCards() to display results. */
function searchForecast(cityName) {
    // Search forecast using input city. Imperial units for Fahrenheit
    let queryURL = "https://cors-anywhere.herokuapp.com/api.openweathermap.org/data/2.5/forecast?q="
        + cityName + "&units=imperial&appid=" + API_KEY;

    // display loading spinner while making api call
    $(".loading-weather").attr("style", "visibility:visible");
    makeCall(queryURL).then(function (response) {
        $(".loading-weather").attr("style", "visibility:hidden");

        cityName = response.city.name;
        let cityIndex = prevCities.indexOf(cityName);

        // if city has not been previously searched, add it to search list
        if (cityIndex === -1) {
            prevCities.unshift(cityName);
        }
        // else set the city to the first element in the array.
        else {
            prevCities.splice(cityIndex, 1);
            prevCities.unshift(cityName);
        }

        // store city name and populate the previously searched list.
        localStorage.setItem("prevCities", JSON.stringify(prevCities));
        localStorage.setItem("lastForecast", JSON.stringify(response));
        console.log(response);
        populatePrevSearches();
        displayForecastCards(response);
    }).catch(function(error) {
        console.log("ERROR ERROR ERROR " + error.statusText);
        console.log(error);
        $(".loading-weather").attr("style", "visibility:hidden");
        alert("That city's forecast could not be found!");
    });

    queryURL = `https://cors-anywhere.herokuapp.com/api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&appid=${API_KEY}`
    makeCall(queryURL).then(response => {
        console.log(response);
        displayCurrentWeather(response);
        localStorage.setItem("currentWeather", JSON.stringify(response));

        // get uv conditions using returned latitude and longitude
        let lat = response.coord.lat;
        let lon = response.coord.lon;
        queryURL = `https://cors-anywhere.herokuapp.com/http://api.openweathermap.org/data/2.5/uvi?appid=${API_KEY}&lat=${lat}&lon=${lon}`;
        makeCall(queryURL).then(function(response) {
            console.log("uv conditions");
            console.log(response);
            localStorage.setItem("uvIndex", response.value);
            displayUVIndex(response.value);
        }).catch(error => {
            console.log("uv index error");
            console.log(error);
        })
    }).catch(error => {
        console.log("Current weather error");
        console.log(error);
    });
}

// could calculate average weather instead