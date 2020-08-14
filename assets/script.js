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

    // Storing the previous search objects isn't necessary, since we want new data each time.
    // Instead, store only the search parameters.
    prevCities = JSON.parse(localStorage.getItem("prevCities"));
    prevCities === null ? prevCities = [] : prevCities = prevCities;
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


const displayWeather = (response) => {
    console.log("getting icons...")
    // first get icons

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
        // let firstLetter = weatherDescription[0];
        // firstLetter = firstLetter.toUpperCase;
        // console.log(firstLetter); 
        cardText3.text("Forecast: " + weatherDescription)

        cardBody.append(cardText1).append(cardText2).append(cardText3);

        let weatherCard = $("<div class='card col-md-2' style='width:18rem;'>").append(cardDateText).append(newIcon).append(cardBody);
        $(".weather-list").append(weatherCard)

        // increment weatherTime by 8 to get the next day's weather. Last day index will be 39, rather than 40.
        weatherTime += 8;
        // weatherTime === 40 ? weatherTime = 39 : weatherTime = weatherTime;
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
 * Call displayWeather() to display results. */
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
        console.log(response);
        populatePrevSearches();
        displayWeather(response);
    }).catch(function(error) {
        console.log("ERROR ERROR ERROR " + error.statusText);
        console.log(error);
    });
}

// could calculate average weather instead