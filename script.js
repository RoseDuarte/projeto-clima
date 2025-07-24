const input = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherInfo = document.getElementById("weatherInfo");
const weatherSection = document.querySelector(".weather-section");
const toggleBtn = document.querySelector(".unit-toggle")

let unit = "metric";
let currentCity = "";

const placeholderDefault = "Pesquisar uma cidade...";
const placeholderLoading = "Buscando...";

const getUnitLabel = () => (unit === "metric" ? "°C" : "°F");
const getToggleText = () => `${getUnitLabel()} <span class="change">Clique para mudar</span>`;

const skeletonMarkup = `
    <div class="skeleton-title"></div>
    <div class="skeleton-icon"></div>
    <div class="skeleton-line"></div>
    <div class="skeleton-line short"></div>
`;

async function fetchWeather(city) {
    setLoading(true);

    try {
        const url = `/api/weather?city=${encodeURIComponent(city)}&unit=${unit}`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Cidade não encontrada");

        currentCity = data.name;
        renderWeather(data)
        weatherSection.classList.add("show")
    } catch (error) {
        showError(error.message);
    } finally {
        setLoading(false)
    }
}

function renderWeather(data) {
    const {name} = data;
    const {icon, description} = data.weather[0];
    const {temp, feels_like, humidity} = data.main;
    const unitSymbol = getUnitLabel()

    weatherSection.classList.remove("fade-in")
    weatherSection.classList.add("fade-out")

    weatherSection.addEventListener("transitionend", () => {
        weatherInfo.classList.remove("error");
        weatherInfo.innerHTML = `
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
            <p><strong>${Math.round(temp)}${unitSymbol}</strong> ‑ ${description}</p>
            <p>Sensação térmica: ${Math.round(feels_like)}${unitSymbol}</p>
            <p>Umidade: ${humidity}%</p>
        `;
        weatherSection.classList.remove("fade-out");
        weatherSection.classList.add("fade-in")
    }, {once: true} );
}

function setLoading(isLoading) {
    if(isLoading) {
        input.placeholder = placeholderLoading;
        input.disabled = true;
        weatherInfo.innerHTML = skeletonMarkup;
        weatherInfo.classList.remove("error")
        weatherSection.classList.add("show")
    } else {
        input.placeholder = placeholderDefault;
        input.disabled = false;
    }
}

function showError(msg) {
    weatherInfo.classList.add("error")
    weatherInfo.innerHTML = `<p>${msg}</p>`
    weatherSection.classList.add("show");
}

searchBtn.addEventListener("click", () => {
    const city = input.value.trim();
    if(city) fetchWeather(city)
});

input.addEventListener("keypress", (e) => {
    if(e.key === "Enter") {
        e.preventDefault();
        searchBtn.click();
    }
});

toggleBtn.addEventListener("click", () => {
    unit = unit === "metric" ? "imperial" : "metric";
    toggleBtn.innerHTML = getToggleText();
    if(currentCity) fetchWeather(currentCity)
});

window.addEventListener("load", () => {
    if("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            async ({coords: {latitude, longitude}}) => {
                try {
                    setLoading(true);
                    const url = `/api/weather?lat=${latitude}&lon=${longitude}&unit=${unit}`;
                    const res = await fetch(url);
                    const data = await res.json();
                    
                    if (!res.ok) throw new Error(data.error || "Erro ao buscar o clima");

                    currentCity = data.name;
                    renderWeather(data);
                    weatherSection.classList.add("show")
                } catch (error) {
                    showError(error.message);
                } finally {
                    setLoading(false)
                }
            },
            (error) => console.warn("Localização negada/erro:", error.message)
        );
    } else {
        console.warn("Geolocalização não suportada");
    }
})
