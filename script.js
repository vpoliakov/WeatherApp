"strict mode";

(function() {
	function makeCorsRequest(callback, city, state = 'CA') {
		function createCORSRequest(command, url) {
			const xhr = new XMLHttpRequest();
			xhr.open(command, url, true);
			return xhr;
		}

		const zip = parseInt(city);
		const cityId = zip ? `zip=${zip}` : `q=${city},${state},US`;
		const key = '1ff6310d33bfcceffb6d171ded195e70';
		const url = `http://api.openweathermap.org/data/2.5/forecast/hourly?${cityId}&units=imperial&APPID=${key}`;
		const xhr = createCORSRequest('GET', url);

		if (!xhr) throw 'CORS not supported';

		xhr.onload = function() {
			const data = JSON.parse(xhr.responseText);
			if (data.cod == '200') {
				callback(data);
			}
		};

		xhr.onerror = function() {
			throw 'Woops, there was an error making the request.';
		};

		xhr.send();
	}

	function renderWeather(data) {
		function formatTime(date, utcOffset = 0, compress = false) {
			let hour = Number(date.split(' ')[1].split(':')[0]) + utcOffset;
			if (hour < 0) hour += 24;
			const ampm = hour < 12 ? 'am' : 'pm';
			if (hour == 0) hour = 12;

			if (compress) {
				return `${hour > 12 ? hour - 12 : hour}${ampm.toUpperCase()}`;
			} else {
				return `${hour > 12 ? hour - 12 : hour}:00 ${ampm}`;
			}
		}

		function getImagePath(index, utcOffset = 0) {
			let hour = Number(data.list[index].dt_txt.split(' ')[1].split(':')[0]) + utcOffset;
			if (hour < 0) hour += 24;
			
			let name = data.list[index].weather[0].description.split(' ').join('');
			if ((hour < 6 || hour > 20) && ['clearsky', 'fewclouds', 'lightrain', 'rain'].includes(name)) {
				name = name + '-night';
			}
			return `./assets/${name}.svg`;
		}

		const utcOffset = -7;
		const currentTime = document.getElementById('current-time');
		const currentWeatherIcon = document.getElementById('current-weather-icon');
		const currentTemp = document.getElementById('current-temp');

		currentTime.textContent = formatTime(data.list[0].dt_txt, utcOffset, true);
		currentWeatherIcon.src = getImagePath(0, utcOffset);
		currentTemp.textContent = `${data.list[0].main.temp.toFixed(0)}°`;

		for (const [i, nextHour] of Array.from(document.getElementsByClassName('next-hour')).entries()) {
			nextHour.children[0].textContent = formatTime(data.list[i + 1].dt_txt, utcOffset);
			nextHour.children[1].src = getImagePath(i + 1, utcOffset);
			nextHour.children[2].textContent = `${data.list[i + 1].main.temp.toFixed(0)}°`;
		}
	}

	function search() {
		const [city, state] = searchbar.value.split(',', 2).map(x => x.trim());

		try {
			makeCorsRequest(renderWeather, city, state);
		} catch (error) {
			alert(error);
		}
	}

	document.getElementById('submit-button').addEventListener('click', search);
	document.getElementById('searchbar').addEventListener('keyup', function (event) {
		if (event.keyCode == 13) search(); // search on enter
	});
	makeCorsRequest(renderWeather, 'Davis');

	function getImages(num, images, callback) {	
		function tryToGetImage(date, reqNum) {
			const year = date.getUTCFullYear();
			const month = String(date.getUTCMonth() + 1).padStart(2, '0');
			const day = String(date.getUTCDate()).padStart(2, '0');
			const hour = String(date.getUTCHours()).padStart(2, '0')
			const minute = String(date.getUTCMinutes()).padStart(2, '0');
	
			const image = new Image();
			image.src = `http://radar.weather.gov/ridge/RadarImg/N0R/DAX/DAX_${year}${month}${day}_${hour}${minute}_N0R.gif`;
			image.onload = function () {
				image.style.display = 'none';
				image.style.position = 'absolute';
				images.push(image);

				console.log(images.length);
				if (images.length == num || reqNum == 0) callback();
			}
		}

		const requestDivisor = 7; // every 7 requests return an image
		const date = new Date();

		date.setMinutes(date.getMinutes() - 3);
		for (let i = num * requestDivisor; i >= 0; i--) {
			image = tryToGetImage(date, i);
			date.setMinutes(date.getMinutes() - 1); // back in time one minute
		}
		return images;
	}

	const radars = document.getElementById('map-radars');
	const images = [];
	getImages(10, images, function () {
		console.log('callback');
		images.sort(function (a, b) { return a.src.localeCompare(b.src); });
		images.forEach(function (image, index) {
			image.id = `doppler_${index}`;
			radars.appendChild(image);
		})
	});

	function animateRadars () {
		let i = 0;
		setInterval(function() { 
			radarsChildren[i].style.display = 'inline';
			if (i != 0) {
				radarsChildren[i - 1].style.display = 'none';
			} else {
				radarsChildren[radarsChildren.length - 1].display = 'none';
			}

			if (i < radarsChildren.length - 1) i++;
			else i = 0;
		}, 1000);
	}

	const radarsChildren = document.getElementById('map-radars').children;
	animateRadars();
})();
