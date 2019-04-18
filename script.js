"strict mode";

(function() {
	function makeCorsRequest(callback, city, state = 'CA') {
		// Creates the XHR object.
		function createCORSRequest(command, url) {
			const xhr = new XMLHttpRequest();
			xhr.open(command, url, true);
			return xhr;
		}

		const key = '1ff6310d33bfcceffb6d171ded195e70';
		const url = `http://api.openweathermap.org/data/2.5/forecast/hourly?q=${city},${state},US&units=imperial&APPID=${key}`;
		const xhr = createCORSRequest('GET', url);

		if (!xhr) throw 'CORS not supported';

		xhr.onload = function() {
				const data = JSON.parse(xhr.responseText);
				callback(data);
		};

		xhr.onerror = function() {
			throw 'Woops, there was an error making the request.';
		};

		xhr.send();
	}

	function renderWeather(data) {
		function formatTime(date, offset = 0, compress = false) {
			let hour = Number(date.split(' ')[1].split(':')[0]) + offset;
			if (hour < 0) hour += 24;
			let time = '';

			if (compress) {
				time = hour > 11 ? `${hour - 12}PM`: `${hour}AM`;
			} else {
				time = hour > 11 ? `${hour - 12}:00 pm`: `${hour}:00 am`;
			}

			return time;
		}

		const offset = -7;
		const currentTime = document.getElementById('current-time');
		const currentTemp = document.getElementById('current-temp');

		currentTime.textContent = formatTime(data.list[0].dt_txt, offset, true);
		currentTemp.textContent = data.list[0].main.temp.toFixed(0);

		for (const [i, nextHour] of Array.from(document.getElementsByClassName('hour')).entries()) {
			nextHour.children[0].textContent = formatTime(data.list[i + 1].dt_txt, offset);
		}
	}

	let city = 'Davis';

	makeCorsRequest(renderWeather, city);
})();