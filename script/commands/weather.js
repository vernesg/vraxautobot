module.exports.config = {
        name: "weather",
        version: "1.0.1",
        permission: 0,
        credits: "vrax",
        prefix: false,
        premium: false,
        description: "See weather information in the area",
        category: "without prefix",
        usages: "[location]",
        cooldowns: 5,
        dependencies: {
                "moment-timezone": "",
                "request": ""
        },
        envConfig: {
                "OPEN_WEATHER": "b7f1db5959a1f5b2a079912b03f0cd96"
        }
};

module.exports.languages = {
        "english": {
                "locationNotExist": "Can't find %1.",
                "returnResult": "Temp: %1℃\nFeels like: %2℃\nSky: %3\nHumidity: %4%%\nWind speed: %5 km/h\nSun rises: %6\nSun sets: %7"
        },
        "bangla": {
                "locationNotExist": "%1 খুঁজে পাওয়া যায়নি।",
                "returnResult": "তাপমাত্রা: %1℃\nঅনুভূত তাপমাত্রা: %2℃\nআকাশ: %3\nআর্দ্রতা: %4%%\nবাতাসের গতি: %5 কিমি/ঘণ্টা\nসূর্যোদয়: %6\nসূর্যাস্ত: %7"
        }
};

module.exports.run = async ({ api, event, args, getText }) => {
        const request = global.nodemodule["request"];
        const moment = global.nodemodule["moment-timezone"];
        const { throwError } = global.utils;
        const { threadID, messageID } = event;
        const apiKey = global.configModule[this.config.name].OPEN_WEATHER;

        const city = args.join(" ");
        if (!city) return throwError(this.config.name, threadID, messageID);

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=${global.config.language}`;

        request(url, (err, response, body) => {
                if (err) return api.sendMessage("An error occurred while fetching the weather.", threadID, messageID);

                let weatherData;
                try {
                        weatherData = JSON.parse(body);
                } catch (e) {
                        return api.sendMessage("Failed to parse weather data.", threadID, messageID);
                }

                if (weatherData.cod !== 200) {
                        return api.sendMessage(getText("locationNotExist", city), threadID, messageID);
                }

                const sunrise = moment.unix(weatherData.sys.sunrise).tz("Asia/Manila").format('HH:mm:ss');
                const sunset = moment.unix(weatherData.sys.sunset).tz("Asia/Manila").format('HH:mm:ss');

                const msg = getText(
                        "returnResult",
                        weatherData.main.temp,
                        weatherData.main.feels_like,
                        weatherData.weather[0].description,
                        weatherData.main.humidity,
                        weatherData.wind.speed,
                        sunrise,
                        sunset
                );

                api.sendMessage({
                        body: msg,
                        location: {
                                latitude: weatherData.coord.lat,
                                longitude: weatherData.coord.lon,
                                current: true
                        }
                }, threadID, messageID);
        });
};