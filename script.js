const input = document.querySelector("#cityInput");
const searchBtn = document.querySelector("#searchBtn");
const weatherInfo = document.querySelector("#weatherInfo");
const weatherSection = document.querySelector(".weather-section");
const toggleBtn = document.querySelector(".unit-toggle")

let unit = "metric";
let currentCity = "";

function getUnitLabel() {
    return unit === "metric" ? "°C" : "°F";
  }

function getToggleText() {
    return unit === "metric"
    ? "°C <span class='change'>Clique para mudar</span>"
    : "°F <span class='change'>Clique para mudar</span>"
}

async function fetchWeather(city) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${unit}&lang=pt_br`;

        const res = await fetch(url);

        if(!res.ok) {
            throw new Error("Cidade não encontrada")
        }

        const data = await res.json();
        renderWeather(data);
        weatherSection.classList.add("show");
        currentCity = city;
    } catch (error) {
        weatherInfo.classList.add("error");
        weatherInfo.innerHTML = `<p>${error.message}</p>`;
        weatherSection.classList.remove("show");
    }
}

function renderWeather(data) {
    const {name} = data;
    const {icon, description} = data.weather[0];
    const {temp, feels_like, humidity} = data.main;

    const unitSymbol = getUnitLabel();

    weatherSection.classList.remove("fade-in")
    weatherSection.classList.add("fade-out")

    setTimeout(() => {
        weatherInfo.classList.remove("error");
    weatherInfo.innerHTML = `
        <h2>${name}</h2>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
        <p><strong>${Math.round(temp)}${unitSymbol}</strong> - ${description}</p>
        <p>Sensação térmica: ${Math.round(feels_like)}${unitSymbol}</p>
        <p>Umidade: ${humidity}%</p>

    `;

    weatherSection.classList.remove("fade-out")
    weatherSection.classList.add("fade-in")
    }, 300)
}

searchBtn.addEventListener("click", () => {
    const city = input.value.trim();

    if(city !== "") {
        fetchWeather(city)
    }
})

input.addEventListener("keypress", (e) => {
    if(e.key === "Enter") {
        e.preventDefault();
        searchBtn.click();
    }
});

toggleBtn.addEventListener("click", () => {
    unit = unit === "metric" ? "imperial" : "metric";
    toggleBtn.innerHTML = getToggleText();

    if(currentCity) {
        fetchWeather(currentCity)
    }
})

toggleBtn.innerHTML = getToggleText();

window.addEventListener("load", () => {
    if("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const {latitude, longitude} = position.coords;

                const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${unit}&lang=pt_br`;

                try {
                    const res = await fetch(url);
                    if(!res.ok) throw new Error("Erro ao buscar o clima");

                    const data = await res.json();
                    currentCity = data.name;
                    renderWeather(data)
                    weatherSection.classList.add("show")
                } catch (error) {
                    console.error("Erro ao buscar clima pela localização:", error.message);
                }
            },
            (error) => {
                console.warn("Usuário negou ou ocorreu erro de localização:", error.message);
            }
        );
    } else {
        console.warn("Geolocalização não é suportada pelo navegador.");
    }
})