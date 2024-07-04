document.addEventListener('DOMContentLoaded', () => {
    const apiKey = 'YOUR_API_KEY_HERE';
    const cityForm = document.getElementById('city-form');
    const cityInput = document.getElementById('city-input');
    const currentWeather = document.getElementById('current-weather');
    const forecast = document.getElementById('forecast');
    const searchHistory = document.getElementById('search-history');
    let history = JSON.parse(localStorage.getItem('history')) || [];

    cityForm.addEventListener('submit', event => {
        event.preventDefault();
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
            cityInput.value = '';
        }
    });

    function getWeatherData(city) {
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        fetch(currentWeatherUrl)
            .then(response => response.json())
            .then(data => {
                displayCurrentWeather(data);
                getForecast(data.coord.lat, data.coord.lon);
                addToHistory(city);
            })
            .catch(error => console.error('Error fetching current weather:', error));
    }

    function getForecast(lat, lon) {
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        fetch(forecastUrl)
            .then(response => response.json())
            .then(data => {
                displayForecast(data);
            })
            .catch(error => console.error('Error fetching forecast:', error));
    }

    function displayCurrentWeather(data) {
        const { name, dt, weather, main, wind } = data;
        const date = new Date(dt * 1000).toLocaleDateString();
        currentWeather.innerHTML = `
            <div class="weather-card">
                <h2>${name} (${date})</h2>
                <img src="https://openweathermap.org/img/wn/${weather[0].icon}.png" alt="${weather[0].description}">
                <p>Temperature: ${main.temp} °C</p>
                <p>Humidity: ${main.humidity} %</p>
                <p>Wind Speed: ${wind.speed} m/s</p>
            </div>
        `;
    }

    function displayForecast(data) {
        forecast.innerHTML = '<h2>5-Day Forecast</h2>';
        const forecastList = data.list.filter(item => item.dt_txt.includes('12:00:00'));
        forecastList.forEach(item => {
            const date = new Date(item.dt * 1000).toLocaleDateString();
            forecast.innerHTML += `
                <div class="weather-card">
                    <h3>${date}</h3>
                    <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}">
                    <p>Temperature: ${item.main.temp} °C</p>
                    <p>Humidity: ${item.main.humidity} %</p>
                    <p>Wind Speed: ${item.wind.speed} m/s</p>
                </div>
            `;
        });
    }

    function addToHistory(city) {
        if (!history.includes(city)) {
            history.push(city);
            localStorage.setItem('history', JSON.stringify(history));
            displayHistory();
        }
    }

    function displayHistory() {
        searchHistory.innerHTML = '<h2>Search History</h2>';
        history.forEach(city => {
            searchHistory.innerHTML += `<button class="history-btn">${city}</button>`;
        });
        document.querySelectorAll('.history-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                getWeatherData(btn.textContent);
            });
        });
    }

    displayHistory();
});
