const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "eda11f59e32c4697f1e6759b4c1d436a"; // Replace with your actual API key

const createWeatherCard = (cityName, weatherItem, index) => {
    const date = weatherItem.dt_txt.split(" ")[0];
    const temperature = (weatherItem.main.temp - 273.15).toFixed(2);
    const wind = weatherItem.wind.speed;
    const humidity = weatherItem.main.humidity;
    const iconUrl = `https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png`;
    const description = weatherItem.weather[0].description;

    if (index === 0) {
        return `<div class="details">
                    <h2>${cityName} (${date})</h2>
                    <h6>Temperature: ${temperature}°C</h6>
                    <h6>Wind: ${wind} M/S</h6>
                    <h6>Humidity: ${humidity}%</h6>
                </div>
                <div class="icon">
                    <img src="${iconUrl}" alt="weather-icon">
                    <h6>${description}</h6>
                </div>`;
    } else {
        return `<li class="card">
                    <h3>(${date})</h3>
                    <img src="${iconUrl}" alt="weather-icon">
                    <h6>Temp: ${temperature}°C</h6>
                    <h6>Wind: ${wind} M/S</h6>
                    <h6>Humidity: ${humidity}%</h6>
                </li>`;
    }
};

const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (!data.list) throw new Error('Invalid data received');
            
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    uniqueForecastDays.push(forecastDate);
                    return true;
                }
                return false;
            });

            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardsDiv.innerHTML = "";

            fiveDaysForecast.forEach((weatherItem, index) => {
                const html = createWeatherCard(cityName, weatherItem, index);
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", html);
                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", html);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching weather details:', error);
            alert("An error occurred while fetching the weather forecast!");
        });
};

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;
    const GEO_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(GEO_API_URL)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (data.length === 0) return alert(`No coordinates found for ${cityName}`);
            const { lat, lon, name } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(error => {
            console.error('Error fetching city coordinates:', error);
            alert("An error occurred while fetching the coordinates!");
        });
};

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const GEO_API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            fetch(GEO_API_URL)
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                })
                .then(data => {
                    if (data.length === 0) return alert("Unable to determine city from coordinates.");
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);
                })
                .catch(error => {
                    console.error('Error fetching city name from coordinates:', error);
                    alert("An error occurred while fetching the city name!");
                });
        },
        error => {
            console.error('Geolocation error:', error);
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        }
    );
};

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
