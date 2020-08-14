"use strict";
const API_KEY = "546e9995ce8b4a04d00449aab5bc5222";
let prevCities = [];    // a list of the names of previously searched cities

console.log("page loaded");
// api.openweathermap.org/data/2.5/forecast?q={city name},{state code}&appid={your api key}
// api.openweathermap.org/data/2.5/forecast?q={city name},{state code},{country code}&appid={your api key}

/** Main controller function. Gets items from storage, adds event listeners, and fills out the search bar. */
function main() {
    getLocalStorage();
    addListeners();
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
        // prevSearchBtn.on("hover").addClass("active");
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


const addListeners = () => {
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

        // Search forecast using input city.
        let queryURL = "https://cors-anywhere.herokuapp.com/api.openweathermap.org/data/2.5/forecast?q="
            + cityName + "&units=imperial&appid=" + API_KEY;

        // display loading spinner while waiting for api call
        $(".loading-weather").attr("style", "display:flex");
        makeCall(queryURL).then(function (response) {
            $(".loading-weather").attr("style", "display:none");

            cityName = response.city.name;
            let cityIndex = prevCities.indexOf(cityName);

            // if city has not been previously searched, add it to search list
            if (cityIndex === -1) {
                prevCities.unshift(cityName);
            }
            // else set the city to the first element in the array by splicing it out.
            else {
                prevCities.splice(cityIndex, 1);
                prevCities.unshift(cityName);
            }

            localStorage.setItem("prevCities", JSON.stringify(prevCities));
            console.log(response);
            populatePrevSearches();
        }).catch(function(error) {
            console.log("ERROR ERROR ERROR " + error.statusText);
            console.log(error);
        });
    });
}
