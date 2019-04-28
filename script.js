"use strict";

const searchbar = document.getElementById('searchbar');

// Handles everything search-related
function search() {
    // Retrieves the weather data object for the specified @city and executes @callback on it
    function makeCorsRequest(callback, city, state = 'CA') {
        function createCORSRequest(command, url) {
            const xhr = new XMLHttpRequest();
            xhr.open(command, url, true);
            return xhr;
        }

        const zip = parseInt(city); // check if a zip code instead of a city name was input
        const cityId = zip ? `zip=${zip}` : `q=${city},${state},US`;
        const key = '1ff6310d33bfcceffb6d171ded195e70'; // accounted-associated key to use the api
        const url = `https://api.openweathermap.org/data/2.5/forecast?${cityId}&units=imperial&APPID=${key}`;
        const xhr = createCORSRequest('GET', url);

        if (!xhr) throw 'CORS not supported';

        xhr.onload = function () {
            const data = JSON.parse(xhr.responseText);

            if (data.cod == '200') { // successfull data retrieval
                callback(data);
            } else {
                searchbar.classList.add('animation-flash-red'); // signal failure
            }
        };

        xhr.onerror = function () {
            throw 'Woops, there was an error making the request.';
        };

        xhr.send();
    }

    // @data is an object containing weather data from the openweathermap api
    function renderWeather(data) {
        function formatTime(date, compress = false) {
            const localDate = new Date(`${date} GMT+0`);
            const hour = localDate.getHours();

            const ampm = hour < 12 ? 'am' : 'pm';
            if (hour == 0) hour = 12;

            if (compress) {
                return `${hour > 12 ? hour - 12 : hour}${ampm.toUpperCase()}`;
            } else {
                return `${hour > 12 ? hour - 12 : hour}:00 ${ampm}`;
            }
        }

        function getImagePath(index, date) {
            const localDate = new Date(`${date} GMT+0`);
            const hour = localDate.getHours();

            let name = data.list[index].weather[0].description.split(' ').join('');

            if ((hour < 6 || hour > 20) && ['clearsky', 'fewclouds', 'lightrain', 'rain'].includes(name)) {
                name = name + '-night';
            }

            return `./assets/${name}.svg`;
        }

        // Returns whether the specified coords are within @maxDistance miles from Davis
        function isNearDavis(lat, lon, maxDistance) {
            const davisLat = 38.557455;
            const davisLon = -121.720868;

            if (lat == davisLat && lon == davisLon) return true;

            const radLat = Math.PI * lat / 180;
            const radSacLat = Math.PI * davisLat / 180;
            const theta = lon - davisLon;
            const radTheta = Math.PI * theta / 180;
            let dist = Math.sin(radLat) * Math.sin(radSacLat) +
                    Math.cos(radLat) * Math.cos(radSacLat) * Math.cos(radTheta);

            dist = Math.min(1, dist);
            dist = Math.acos(dist);
            dist = dist * 180 / Math.PI;
            dist = dist * 60 * 1.1515;

            return dist <= maxDistance;
        }

        // limit searches to the ones within the map
        if (!isNearDavis(data.city.coord.lat, data.city.coord.lon, 150)) {
            searchbar.classList.add('animation-flash-orange');
            return;
        }

        searchbar.classList.add('animation-flash-green');
        moveLocation(data.city.coord.lat, data.city.coord.lon);

        const date = new Date();
        const currentDate = document.getElementById('current-date');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Jul', 'Jun', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        currentDate.textContent = `${months[date.getMonth()]}. ${date.getDate()}`;

        const currentTime = document.getElementById('current-time');
        const currentWeatherIcon = document.getElementById('current-weather-icon');
        const currentTemp = document.getElementById('current-temp');

        // set weather times, icons, and temperatures
        currentTime.textContent = formatTime(data.list[0].dt_txt, true);
        currentWeatherIcon.src = getImagePath(0, data.list[0].dt_txt);
        currentTemp.textContent = `${data.list[0].main.temp.toFixed(0)}°`;

        for (const [i, nextHour] of Array.from(document.getElementsByClassName('next-hour')).entries()) {
            nextHour.children[0].textContent = formatTime(data.list[i + 1].dt_txt);
            nextHour.children[1].src = getImagePath(i + 1, data.list[i + 1].dt_txt);
            nextHour.children[2].textContent = `${data.list[i + 1].main.temp.toFixed(0)}°`;
        }
    }

    // get input city
    const [city, state] = searchbar.value.split(',', 2).map(x => x.trim());

    searchbar.classList.remove('animation-flash-green');
    searchbar.classList.remove('animation-flash-orange');
    searchbar.classList.remove('animation-flash-red');

    try {
        makeCorsRequest(renderWeather, city, state);
    } catch (error) {
        alert(error);
    }
}

search(); // search the default city before user input

// Add listeners for activating city search
document.getElementById('submit-button').addEventListener('click', () => {
    search();
    searchbar.focus();
});

document.getElementById('searchbar').addEventListener('keyup', (event) => {
    if (event.keyCode == 13) search(); // search on enter
});

// Gets radar specified @num of radar images and executes the @callback
function getImages(num, callback) {
    const images = [];

    // since not all potential image urls have content, does not guarantee to get an image
    function tryToGetImage(date) {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hour = String(date.getUTCHours()).padStart(2, '0')
        const minute = String(date.getUTCMinutes()).padStart(2, '0');

        const image = new Image();
        image.src = `https://radar.weather.gov/ridge/RadarImg/N0R/DAX/DAX_${year}${month}${day}_${hour}${minute}_N0R.gif`;

        image.onload = function () {
            if (images.length > num) return; // for extra images from extra requests

            image.style.display = images.length == 0 ? 'initial' : 'none';
            image.classList.add('map-radar');
            images.push(image);

            if (images.length == num) { // after retrieving @num images, execute the @callback
                images[0].style.display = 'none';
                callback(images);
            }
        }
    }

    const requestMultiplier = 10; // ~ 1 in 10 requests are successful
    const date = new Date();

    date.setMinutes(date.getMinutes() - 3); // images from the last 3 min are never available

    for (let i = 0; i < num * requestMultiplier; i++) {
        tryToGetImage(date);
        date.setMinutes(date.getMinutes() - 1);
    }

    return images;
}

getImages(10, function (images) {
    const radars = document.getElementById('map-radars');

    images.sort(function (a, b) { return a.src.localeCompare(b.src); }); // to achieve temporal order

    images.forEach(function (image) {
        radars.appendChild(image);
    });

    (function animateRadars() { // change the visible image every .2 sec
        const len = images.length;
        let i = 1;

        setInterval(function () {
            const image = images[i % len];
            const lastImage = images[(i - 1) % len];

            image.style.display = 'initial';
            lastImage.style.display = 'none';
            i++;
        }, 200);
    })();
});

// mobile view screen toggle animations
document.getElementById('arrow-up').onclick = function () {
    document.body.style.animation = 'slide-up 1s forwards ease-in';
};

document.getElementById('arrow-down').onclick = function () {
    document.body.style.animation = 'slide-down 1s forwards ease-in';
};

function moveLocation(lat, lon) {
    const loc = document.getElementById('location');
    const minLat = 41.024067882190998;
    const minLon = -124.429858037775010;
    const maxLat = 35.9687395130505;
    const maxLon = -118.91495436234901;
    
    loc.style.top = ((lat - minLat) / (maxLat - minLat)) * 100 + '%';
    loc.style.left = ((lon - minLon) / (maxLon - minLon)) * 100 + '%';
}

let viewMode = 'mobile';

// Restructures the page hmtl depenging on the view mode
function restructure() {
    function getViewMode() {
        return document.body.clientWidth >= 1368 ? 'full'
                : document.body.clientWidth >= 600 ? 'tablet'
                : 'mobile';
    }

    const oldMode = viewMode;
    const newMode = getViewMode();

    if (newMode == oldMode) return; // no change in view mode

    const forecastFor = document.getElementById('forecast-for');
    const searchDiv = document.getElementById('search');
    const currentWeather = document.getElementById('current-weather');
    const currentTemp = document.getElementById('current-temp');
    const currentWeatherIcon = document.getElementById('current-weather-icon');
    const header = document.getElementsByTagName('header')[0];
    const map = document.getElementById('map');

    if (oldMode == 'mobile') { // leaving mobile view mode
        searchbar.parentNode.insertBefore(forecastFor, searchbar);
        document.body.style.animation = 'none';
    } else if (newMode == 'mobile') { // entering mobile view mode
        searchDiv.parentNode.insertBefore(forecastFor, searchDiv);
    }

    if (oldMode == 'full') { // leaving full desktop view
        currentWeather.insertBefore(currentWeatherIcon, currentWeather.firstChild);
        currentWeather.parentNode.appendChild(map);
    } else if (newMode == 'full') { // entering full view
        currentTemp.parentNode.insertBefore(currentWeatherIcon, currentTemp);
        header.insertBefore(map, header.firstChild);
    }

    viewMode = getViewMode();
}

restructure();
window.addEventListener('resize', restructure);