# Weather Forecaster
A simple app that forecasts the weather for the next five days.

The deployed app can be found at https://koldenblue.github.io/weather-forecaster/. Simply type a city name into the search bar, and the current weather conditions will be displayed on the main display. Forecasts for the next 5 days are clearly marked. Click on the previous searches to search that city again.

![image](https://user-images.githubusercontent.com/64618290/90313767-fd6d2900-dec3-11ea-9a85-b41ab88cff7b.png)

## Code Discussion

The app retrieves weather data from openweathermap.org using asynchronous API calls. Moment.js is used to parse retrieved datetime data. Due to the asynchronous nature of the API calls, care must be taken to wait for promised returned responses before running certain code. For example, a call to the UV index API must only take place once latitude and longitude data is returned from another API. Further work has also been done to ensure that the user can see data from previous browser sessions, using local storage. Finally, care must be taken to ensure previous searches are in the proper order. This is simply done through standard array manipulation methods.

The app is fairly basic at the moment, but there is potential for growth. For example, the Moment.js library is already included, and can be used to add on additional functionality - such as a current clock time function. Styling and CSS design could be improved with addtional work. Search options could include additional options, such as search by city and country, or a metric units toggle. Finally, the way that forecast data is calculated could be changed. As of now, forecast data is taken every 24 hours apart. But since forecast data is offered every 3 hours, averages of the forecast values could be instead displayed. To go even further, it could be left up to the user to decide the level of forecast detail.

Overall the app is simple, yet functional. It offers a good demonstration of the importance of asynchronous coding methods, especially given interaction with remote databases. The app offers an excellent demonstration of how vast amounts of information can be gathered and used to program an app in a relatively quick timeframe.
