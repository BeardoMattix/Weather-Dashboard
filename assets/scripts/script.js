function initPage() {
  const inputEl = document.getElementById("city-search");
  // This will display the current time in the header div.
  const currentDay = document.querySelector(".currentDay");
  const searchEl = document.getElementById("search-button");
  const clearEl = document.getElementById("clear-history");
  const nameEl = document.getElementById("city-name");
  // This is to add a picture from openweathermap in the forecast
  const currentPictureEl = document.getElementById("current-picture");
  const currentTempEl = document.getElementById("temperature");
  const currentHumidityEl = document.getElementById("humidity");
  4;
  const currentWindEl = document.getElementById("wind-speed");
  const currentUVEl = document.getElementById("UV-index");
  const historyEl = document.getElementById("history");
  let searchHistory = JSON.parse(localStorage.getItem("search")) || [];

  const API_KEY = "e833b750544d242dcfab03294f768f62";

  // Function to display the current day and time on the main header.
  var update = function () {
    today = moment();
    $("#currentDay").text(today.format("dddd MMM Do YYYY h:mm a"));
  };
  $(document).ready(function () {
    today = $("#currentDay");
    update();
    setInterval(update);
  }, 1000);

  // This will display the day, month, and year for the forecast.
  setInterval(() => {
    const time = new Date();
    const month = time.getMonth();
    const date = time.getDate();
    const day = time.getDay();
    const hour = time.getHours();
    const hoursIn12HrFormat = hour >= 13 ? hour % 12 : hour;
    const minutes = time.getMinutes();
    const ampm = hour >= 12 ? "PM" : "AM";

    timeEl.innerHTML =
      (hoursIn12HrFormat < 10 ? "0" + hoursIn12HrFormat : hoursIn12HrFormat) +
      ":" +
      (minutes < 10 ? "0" + minutes : minutes) +
      " " +
      `<span id="am-pm>${ampm}</span>`;

    dateEl.innerHTML = days[day] + ", " + months[month] + " " + date;
  }, 1000);

  // Function to find the current weather based on the user city input.
  function findWeather(cityName) {
    let queryURL =
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      cityName +
      "&appid=" +
      API_KEY;
    axios.get(queryURL).then(function (response) {
      const currentDate = new Date(response.data.dt * 1000);
      const day = currentDate.getDate();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      nameEl.innerHTML =
        response.data.name + " (" + month + "/" + day + "/" + year + ") ";
      let weatherPic = response.data.weather[0].icon;
      // Grab the weather icon from openweathermap and add it to the html.
      currentPictureEl.setAttribute(
        "src",
        "https://openweathermap.org/img/wn/" + weatherPic + "@2x.png"
      );
      currentPictureEl.setAttribute(
        "alt",
        response.data.weather[0].description
      );
      currentTempEl.innerHTML =
        "Temperature: " + kelvin2farenheit(response.data.main.temp) + " &#176F";
      currentHumidityEl.innerHTML =
        "Humidity: " + response.data.main.humidity + "%";
      currentWindEl.innerHTML =
        "Wind Speed: " + response.data.wind.speed + " MPH";
        // this records the latitude and longitude and adds them to the api url.
      let lat = response.data.coord.lat;
      let lon = response.data.coord.lon;
      let UVQueryURL =
        "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" +
        lat +
        "&lon=" +
        lon +
        "&appid=" +
        API_KEY +
        "&cnt=1";
      axios.get(UVQueryURL).then(function (response) {
        let UVIndex = document.createElement("span");
        UVIndex.setAttribute("class", "badge badge-danger");
        UVIndex.innerHTML = response.data[0].value;
        currentUVEl.innerHTML = "UV Index: ";
        currentUVEl.append(UVIndex);
      });
      // This will return a 5 day forecast using the saved city name and by making a call to the API
      let cityID = response.data.id;
      let forecastQueryURL =
        "https://api.openweathermap.org/data/2.5/forecast?id=" +
        cityID +
        "&appid=" +
        API_KEY;
      axios.get(forecastQueryURL).then(function (response) {
        console.log(response);
        const forecastEls = document.querySelectorAll(".forecast");
        for (i = 0; i < forecastEls.length; i++) {
          forecastEls[i].innerHTML = "";
          const forecastIndex = i * 8 + 4;
          const forecastDate = new Date(
            response.data.list[forecastIndex].dt * 1000
          );
          const forecastDay = forecastDate.getDate();
          const forecastMonth = forecastDate.getMonth() + 1;
          const forecastYear = forecastDate.getFullYear();
          const forecastDateEl = document.createElement("p");
          forecastDateEl.setAttribute("class", "mt-3 mb-0 forecast-date");
          forecastDateEl.innerHTML =
            forecastMonth + "/" + forecastDay + "/" + forecastYear;
          forecastEls[i].append(forecastDateEl);
          const forecastWeatherEl = document.createElement("img");
          forecastWeatherEl.setAttribute(
            "src",
            "https://openweathermap.org/img/wn/" +
              response.data.list[forecastIndex].weather[0].icon +
              "@2x.png"
          );
          forecastWeatherEl.setAttribute(
            "alt",
            response.data.list[forecastIndex].weather[0].description
          );
          forecastEls[i].append(forecastWeatherEl);
          const forecastTempEl = document.createElement("p");
          forecastTempEl.innerHTML =
            "Temp: " +
            kelvin2farenheit(response.data.list[forecastIndex].main.temp) +
            " &#176F";
          forecastEls[i].append(forecastTempEl);
          const forecastHumidityEl = document.createElement("p");
          forecastHumidityEl.innerHTML =
            "Humidity: " +
            response.data.list[forecastIndex].main.humidity +
            "%";
          forecastEls[i].append(forecastHumidityEl);
        }
      });
    });
  }
  // Takes the user search input and uses it to find the weather, then adds the search to local storage.
  searchEl.addEventListener("click", function () {
    const searchTerm = inputEl.value;
    findWeather(searchTerm);
    searchHistory.push(searchTerm);
    localStorage.setItem("search", JSON.stringify(searchHistory));
    showSearchHist();
  });

  clearEl.addEventListener("click", function () {
    searchHistory = [];
    showSearchHist();
  });
  // This will convert the temperature from kelvin to farenheit. Later realized that the onecall api will convert based on units. I hate math. SMH.
  function kelvin2farenheit(K) {
    return Math.floor((K - 273.15) * 1.8 + 32);
  }
  /* Shows the search history below the search bar (using the class of "form-control d-block...""). 
It stays after you reload the page, even if you click the clear history button, which is not what I wanted. */
  function showSearchHist() {
    historyEl.innerHTML = "";
    for (let i = 0; i < searchHistory.length; i++) {
      const historyItem = document.createElement("input");
      historyItem.setAttribute("type");
      historyItem.setAttribute("text");
      historyItem.setAttribute("readonly", true);
      historyItem.setAttribute("class", "form-control d-block bg-white");
      historyItem.setAttribute("value", searchHistory[i]);
      historyItem.addEventListener("click", function () {
        findWeather(historyItem.value);
      });
      historyEl.append(historyItem);
    }
  }

  showSearchHist();
  if (searchHistory.length > 0) {
    findWeather(searchHistory[searchHistory.length - 1]);
  }
}
initPage();
