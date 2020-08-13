"use strict";
const APIKEY = "546e9995ce8b4a04d00449aab5bc5222";
let prevSearches = [];

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
}


let populatePrevSearches = () => {
    let prevSearchBar = $(".prev-searches");
    for (let i = 0, j = prevSearches.length; i < j; i++) {
        let prevSearchBtn = $("<btn>");
        prevSearchBtn.attr("class", "list-group-item list-group-item-action prev-search-btn").text(prevSearches[i].city.name);
        // prevSearchBtn.on("hover").addClass("active");
        prevSearchBar.prepend(prevSearchBtn);
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
        let queryURL = "https://cors-anywhere.herokuapp.com/api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&units=imperial&appid=" + APIKEY;
        makeCall(queryURL).then(function (response) {
            prevSearches.push(response);
            localStorage.setItem("prevSearches", JSON.stringify(prevSearches));
            console.log(response);
        }).catch(function(error) {
            console.log("ERROR ERROR ERROR " + error.statusText);
            console.log(error);
        });
    });
}