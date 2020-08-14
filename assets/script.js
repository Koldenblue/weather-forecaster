"use strict";
const APIKEY = "546e9995ce8b4a04d00449aab5bc5222";
let prevSearches = [];  // of list of the objects returned by previous searches
let prevCities = [];    // a list of the names of previously searched cities

console.log("page loaded")
// api.openweathermap.org/data/2.5/forecast?q={city name},{state code}&appid={your api key}
// api.openweathermap.org/data/2.5/forecast?q={city name},{state code},{country code}&appid={your api key}
function main() {
    getLocalStorage();
    addListeners();
    populatePrevSearches();
}

$(document).ready(main);


let getLocalStorage = () => {
    document.getElementById("city-name").value = localStorage.getItem("cityName");

    prevSearches = JSON.parse(localStorage.getItem("prevSearches"));
    prevSearches === null ? prevSearches = [] : prevSearches = prevSearches;

    prevCities = JSON.parse(localStorage.getItem("prevCities"));
    prevCities === null ? prevCities = [] : prevCities = prevCities;
}


let populatePrevSearches = () => {
    let prevSearchBar = $(".prev-searches");
    prevSearchBar.html("")
    for (let i = 0, j = prevSearches.length; i < j; i++) {
        let prevSearchBtn = $("<btn>");
        prevSearchBtn.attr("class", "list-group-item list-group-item-action prev-search-btn").text(prevSearches[i].city.name);
        // prevSearchBtn.on("hover").addClass("active");
        prevSearchBar.append(prevSearchBtn);
    }
}

let makeCall = (queryURL) => {
    
    return $.ajax({
        url: queryURL,
        method: "GET"
    });
}


let addListeners = () => {
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
            + cityName + "&units=imperial&appid=" + APIKEY;

        // display loading spinner while waiting for api call
        $(".loading-weather").attr("style", "display:flex");
        makeCall(queryURL).then(function (response) {
            $(".loading-weather").attr("style", "display:none");

            cityName = response.city.name;
            let cityIndex = prevCities.indexOf(cityName);

            // if city has not been previously searched, add it to search list
            if (cityIndex === -1) {
                prevCities.push(cityName);
                prevSearches.unshift(response);
            }
            // else set the city to the first element in the array by splicing it out.
            else {
                prevCities.splice(cityIndex, 1);
                prevCities.push(cityName);
                prevSearches
            }
            
            localStorage.setItem("prevSearches", JSON.stringify(prevSearches));
            console.log(response);
            populatePrevSearches();
        }).catch(function(error) {
            console.log("ERROR ERROR ERROR " + error.statusText);
            console.log(error);
        });
    });
}


// bug: always searches and adds city when page is reloaded
// bug: searches every time even if already searched