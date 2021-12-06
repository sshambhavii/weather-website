const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const currentWeatherItemsEl = document.getElementById('current-weather-items');
const timezone = document.getElementById('time-zone');
const countryEl = document.getElementById('country');
const weatherForecastEl = document.getElementById('weather-forecast');
const currentTempEl = document.getElementById('current-temp');
const chemicalEl = document.getElementById('components');
const aqiValEl = document.getElementById('aqi-value');

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const API_KEY = '49cc8c821cd2aff9af04c9f98c36eb74';

setInterval(() => {
    const time = new Date();
    const month = time.getMonth();
    const date = time.getDate();
    const day = time.getDay();
    const hour = time.getHours();
    const hoursIn12HrFormat = hour >= 13 ? hour % 12 : hour
    const minutes = time.getMinutes();
    const ampm = hour >= 12 ? 'PM' : 'AM'

    timeEl.innerHTML = (hoursIn12HrFormat < 10 ? '0' + hoursIn12HrFormat : hoursIn12HrFormat) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ' ' + `<span id="am-pm">${ampm}</span>`

    dateEl.innerHTML = days[day] + ', ' + date + ' ' + months[month]

}, 1000);

getWeatherData();

function getWeatherData() {
    navigator.geolocation.getCurrentPosition((success) => {

        let { latitude, longitude } = success.coords;
        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`).then(res => res.json()).then(data => {

            console.log(data)
            showWeatherData(data);
            getAirIndexData(latitude, longitude);
            ChartIt(latitude, longitude);
        })
    })
}

function showWeatherData(data) {
    let { humidity, pressure, sunrise, sunset, wind_speed } = data.current;

    timezone.innerHTML = data.timezone;
    countryEl.innerHTML = data.lat + 'N ' + data.lon + 'E'

    currentWeatherItemsEl.innerHTML =
        `<div class="weather-item">
        <div>Humidity</div>
        <div>${humidity}%</div>
    </div>
    <div class="weather-item">
        <div>Pressure</div>
        <div>${pressure}</div>
    </div>
    <div class="weather-item">
        <div>Wind Speed</div>
        <div>${wind_speed}</div>
    </div>
    <div class="weather-item">
        <div>Sunrise</div>
        <div>${window.moment(sunrise * 1000).format('HH:mm a')}</div>
    </div>
    <div class="weather-item">
        <div>Sunset</div>
        <div>${window.moment(sunset*1000).format('HH:mm a')}</div>
    </div>   
    
    `;

    let otherDayForcast = ''
    data.daily.forEach((day, idx) => {
        if (idx == 0) {
            currentTempEl.innerHTML = `
            <img src="https://openweathermap.org/img/wn//${day.weather[0].icon}@4x.png" alt="weather icon" class="w-icon">
            <div class="other">
                <div class="day">${window.moment(day.dt*1000).format('dddd')}</div>
                <div class="temp">Night - ${day.temp.night}&#176;C</div>
                <div class="temp">Day - ${day.temp.day}&#176;C</div>
            </div>
            
            `
        } else {
            otherDayForcast += `
            <div class="weather-forecast-item">
                <div class="day">${window.moment(day.dt*1000).format('ddd')}</div>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
                <div class="temp">Night - ${day.temp.night}&#176;C</div>
                <div class="temp">Day - ${day.temp.day}&#176;C</div>
            </div>            
            `
        }
    })
    weatherForecastEl.innerHTML = otherDayForcast;
}
let weather = {
    fetchWeather: function(city) {
        fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
            )
            .then((response) => {
                if (!response.ok) {
                    alert("No weather found.");
                    throw new Error("No weather found.");
                }
                return response.json();
            })
            .then((data) => this.displayWeather(data));

    },
    displayWeather: function(data) {
        let { lon, lat } = data.coord;
        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`).then(res => res.json()).then(data => {
            showWeatherData(data)
            getAirIndexData(lat, lon);
            ChartIt(lat, lon);
        })
        const { name } = data;
        document.querySelector(".city").innerText = "Weather in " + name;
        document.querySelector(".main").style.backgroundImage =
            "url('https://source.unsplash.com/1600x900/?" + name + "')";
    },
    search: function() {
        this.fetchWeather(document.querySelector(".search-bar").value);
    },
};

document.querySelector(".search button").addEventListener("click", function() {
    weather.search();
});

document.querySelector(".search-bar").addEventListener("keyup", function(event) {
    if (event.key == "Enter") {
        weather.search();
    }
});

function getAirIndexData(lat, lon) {
    let latitude = lat;
    let longitude = lon;
    fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`).
    then(res => res.json()).then(data => {
        console.log(data)
        displayAirIndex(data);
    })
}

function displayAirIndex(data) {
    const aqiEl = data.list[0].main.aqi;
    aqiValEl.innerHTML = aqiEl;
    let { co, nh3, no, no2, o3, pm2_5, pm10, so2 } = data.list[0].components;
    chemicalEl.innerHTML =
        `<div class="component-item">
    <div class="chemical">CO<sub></sub>&nbsp&nbsp</div>
    <div class="percentage">${co}&nbsp&nbsp</div>
    </div>
    <div class="component-item">
        <div class="chemical">NH<sub>3</sub>&nbsp&nbsp</div>
        <div class="percentage">${nh3}&nbsp&nbsp</div>
    </div>
    <div class="component-item">
        <div class="chemical">NO<sub></sub>&nbsp&nbsp</div>
        <div class="percentage">${no}&nbsp&nbsp</div>
    </div>
    <div class="component-item">
        <div class="chemical">NO<sub>2<sub>&nbsp&nbsp</div>
        <div class="percentage">${no2}&nbsp&nbsp</div>
    </div>
    <div class="component-item">
        <div class="chemical">O<sub>3</sub>&nbsp&nbsp</div>
        <div class="percentage">${o3}&nbsp&nbsp</div>
    </div>
    <div class="component-item">
        <div class="chemical">PM<sub>2.5</sub>&nbsp&nbsp</div>
        <div class="percentage">${pm2_5}&nbsp&nbsp</div>
    </div>
    <div class="component-item">
        <div class="chemical">PM<sub>10</sub>&nbsp&nbsp</div>
        <div class="percentage">${pm10}&nbsp&nbsp</div>
    </div>
    <div class="component-item">
        <div class="chemical">SO<sub>2</sub>&nbsp&nbsp</div>
        <div class="percentage">${so2}&nbsp&nbsp</div>
    </div>`

}
async function getHumidityData(lat, lon) {
    const xlabels = [];
    const ylabels = [];
    let latitude = lat;
    let longitude = lon;
    let response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`);
    let json = await response.json();
    console.log(json);

    for (let i = 7; i <= 40; i += 8) {
        let x = await window.moment(parseInt(json.list[i].dt) * 1000).format('DD/MM/YYYY');
        let y = await json.list[i].main.humidity
        xlabels.push(x);
        ylabels.push(y);
        console.log(i);
    }
    console.log(xlabels);
    console.log(ylabels);
    return { xlabels, ylabels };

}

async function ChartIt(lat, lon) {
    const d = await getHumidityData(lat, lon);
    console.log("in chart it");
    const ctx = document.getElementById('myChart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: d.xlabels,
            datasets: [{
                label: 'Humidity',
                data: d.ylabels,
                backgroundColor: 'rgba(24, 24, 27, 0.8)',
                borderColor: 'white',
                borderWidth: 1
            }]
        }
    });
}
