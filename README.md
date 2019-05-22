# WeatherApp
View the demo: https://vpoliakov.github.io/WeatherApp (optimized for Chrome)
## What does it do?
- Uses `openweathermap.org api` to retrieve weather data for the next 12 hours.
  - The city can be searched by city name and state (separated by a comma), just the city name, or its zip-code.
![greenSearch](https://user-images.githubusercontent.com/10080683/56843040-d44d0300-6850-11e9-9855-d5207a81e0e3.png)
![image](https://user-images.githubusercontent.com/10080683/56843353-46731700-6854-11e9-9e53-fce5f0cfc80e.png)
  - Only cities located within the area covered by the map will be shown.
  - On a successful request, the searchbar will flash green:
![greenSearch](https://user-images.githubusercontent.com/10080683/56843040-d44d0300-6850-11e9-9855-d5207a81e0e3.png)
  - On a city located outside the supported region, the searchbar will flash orange:
![orangeSearch](https://user-images.githubusercontent.com/10080683/56843067-2ee65f00-6851-11e9-8d2a-5b4064b414a5.png)
  - On a city not supported by `openweathermap.org`, the searchbar will flash red:
![redSearch](https://user-images.githubusercontent.com/10080683/56843039-d44d0300-6850-11e9-92f9-a61d346227b0.png)

- Uses layered maps from `radar.weather.gov` including a cyclone radar animation.
  - Current city will be marked on the map:

![image](https://user-images.githubusercontent.com/10080683/56843085-6c4aec80-6851-11e9-9808-88687cd82764.png)
- Works in different view modes with adaptive layout:
  - Full:
![image](https://user-images.githubusercontent.com/10080683/56843024-b97a8e80-6850-11e9-9389-f94c06fb1158.png)
  - Tablet:

![image](https://user-images.githubusercontent.com/10080683/56843281-6a822880-6853-11e9-92f8-1e37968d44f0.png)
  - Mobile:

![image](https://user-images.githubusercontent.com/10080683/56843220-c5ffe680-6852-11e9-8669-879e765875cf.png)

which splits into two views navigable via the arrow button

![image](https://user-images.githubusercontent.com/10080683/56843234-e9c32c80-6852-11e9-8835-35d8e9a9dd36.png)

