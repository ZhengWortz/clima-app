/* =========================================
   CLIMAVISION
   Weather Experience
========================================= */


/* =========================================
   ELEMENTOS
========================================= */

const form = document.getElementById("search-form");
const input = document.getElementById("cidade");

const weatherContent =
    document.getElementById("weather-content");

const loading =
    document.getElementById("loading");

const errorMessage =
    document.getElementById("error-message");

const locationButton =
    document.getElementById("location-button");

const clearButton =
    document.getElementById("clear-button");

const themeButton =
    document.getElementById("theme-button");

const forecast =
    document.getElementById("forecast");

const favorites =
    document.getElementById("favorites");


/* =========================================
   CÓDIGOS METEOROLÓGICOS
   WMO WEATHER CODES
========================================= */

const weatherCodes = {

    0: {
        description: "Céu limpo",
        icon: "☀️",
        theme: "weather-sunny"
    },

    1: {
        description: "Principalmente limpo",
        icon: "🌤️",
        theme: "weather-sunny"
    },

    2: {
        description: "Parcialmente nublado",
        icon: "⛅",
        theme: "weather-cloudy"
    },

    3: {
        description: "Nublado",
        icon: "☁️",
        theme: "weather-cloudy"
    },

    45: {
        description: "Neblina",
        icon: "🌫️",
        theme: "weather-cloudy"
    },

    48: {
        description: "Neblina congelante",
        icon: "🌫️",
        theme: "weather-cloudy"
    },

    51: {
        description: "Chuvisco leve",
        icon: "🌦️",
        theme: "weather-rain"
    },

    53: {
        description: "Chuvisco",
        icon: "🌦️",
        theme: "weather-rain"
    },

    55: {
        description: "Chuvisco intenso",
        icon: "🌧️",
        theme: "weather-rain"
    },

    61: {
        description: "Chuva leve",
        icon: "🌦️",
        theme: "weather-rain"
    },

    63: {
        description: "Chuva",
        icon: "🌧️",
        theme: "weather-rain"
    },

    65: {
        description: "Chuva forte",
        icon: "🌧️",
        theme: "weather-rain"
    },

    71: {
        description: "Neve leve",
        icon: "🌨️",
        theme: "weather-cloudy"
    },

    73: {
        description: "Neve",
        icon: "🌨️",
        theme: "weather-cloudy"
    },

    75: {
        description: "Neve forte",
        icon: "❄️",
        theme: "weather-cloudy"
    },

    80: {
        description: "Pancadas de chuva",
        icon: "🌦️",
        theme: "weather-rain"
    },

    81: {
        description: "Pancadas de chuva",
        icon: "🌧️",
        theme: "weather-rain"
    },

    82: {
        description: "Pancadas fortes",
        icon: "⛈️",
        theme: "weather-rain"
    },

    95: {
        description: "Trovoada",
        icon: "⛈️",
        theme: "weather-rain"
    },

    96: {
        description: "Trovoada com granizo",
        icon: "⛈️",
        theme: "weather-rain"
    },

    99: {
        description: "Trovoada forte",
        icon: "⛈️",
        theme: "weather-rain"
    }

};


/* =========================================
   BUSCAR CIDADE
========================================= */

async function buscarCidade(nome) {

    const url =
        `https://geocoding-api.open-meteo.com/v1/search?` +
        `name=${encodeURIComponent(nome)}` +
        `&count=1` +
        `&language=pt` +
        `&format=json`;

    const response = await fetch(url);

    if (!response.ok) {

        throw new Error(
            "Não foi possível localizar a cidade."
        );
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {

        throw new Error(
            "Cidade não encontrada. Tente outro nome."
        );
    }

    return data.results[0];
}


/* =========================================
   BUSCAR CLIMA
========================================= */

async function buscarClima(latitude, longitude) {

    const url =
        `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,` +
        `apparent_temperature,precipitation,weather_code,` +
        `wind_speed_10m,cloud_cover,is_day` +
        `&daily=weather_code,temperature_2m_max,` +
        `temperature_2m_min,sunrise,sunset,` +
        `precipitation_probability_max` +
        `&timezone=auto` +
        `&forecast_days=6`;

    const response = await fetch(url);

    if (!response.ok) {

        throw new Error(
            "Não foi possível obter os dados do clima."
        );
    }

    return await response.json();
}


/* =========================================
   PESQUISA POR NOME
========================================= */

async function pesquisarCidade(nome) {

    try {

        mostrarLoading(true);

        esconderErro();

        const cidade =
            await buscarCidade(nome);

        const clima =
            await buscarClima(
                cidade.latitude,
                cidade.longitude
            );

        renderizarClima(
            clima,
            cidade.name,
            cidade.country
        );

        salvarUltimaCidade(nome);

    } catch (error) {

        mostrarErro(error.message);

    } finally {

        mostrarLoading(false);
    }
}


/* =========================================
   LOCALIZAÇÃO
========================================= */

function obterLocalizacao() {

    if (!navigator.geolocation) {

        mostrarErro(
            "Seu navegador não suporta geolocalização."
        );

        return;
    }

    mostrarLoading(true);

    esconderErro();

    navigator.geolocation.getCurrentPosition(

        async (position) => {

            try {

                const {
                    latitude,
                    longitude
                } = position.coords;

                const clima =
                    await buscarClima(
                        latitude,
                        longitude
                    );

                renderizarClima(
                    clima,
                    "Minha localização",
                    ""
                );

            } catch (error) {

                mostrarErro(
                    "Não foi possível obter o clima da sua localização."
                );

            } finally {

                mostrarLoading(false);
            }
        },

        () => {

            mostrarLoading(false);

            mostrarErro(
                "Permissão de localização negada."
            );
        }
    );
}


/* =========================================
   RENDERIZAR CLIMA
========================================= */

function renderizarClima(
    data,
    cityName,
    country
) {

    const current =
        data.current;

    const weather =
        weatherCodes[current.weather_code]
        || weatherCodes[0];


    /* Local */

    document.getElementById(
        "location-name"
    ).textContent =
        country
            ? `${cityName}, ${country}`
            : cityName;


    /* Atualizar botão de favorito */

    atualizarBotaoFavorito(cityName);


    /* Data */

    document.getElementById(
        "current-date"
    ).textContent =
        formatarData(
            data.current.time
        );


    /* Temperatura */

    document.getElementById(
        "temperature"
    ).textContent =
        `${Math.round(
            current.temperature_2m
        )}°`;


    document.getElementById(
        "feels-like"
    ).textContent =
        `Sensação de ${Math.round(
            current.apparent_temperature
        )}°`;


    /* Condição */

    document.getElementById(
        "weather-description"
    ).textContent =
        weather.description;


    /* Ícone */

    document.getElementById(
        "weather-icon"
    ).textContent =
        weather.icon;


    /* Informações */

    document.getElementById(
        "humidity"
    ).textContent =
        `${current.relative_humidity_2m}%`;


    document.getElementById(
        "wind"
    ).textContent =
        `${Math.round(
            current.wind_speed_10m
        )} km/h`;


    document.getElementById(
        "clouds"
    ).textContent =
        `${current.cloud_cover}%`;


    document.getElementById(
        "rain"
    ).textContent =
        `${data.daily.precipitation_probability_max[0]}%`;


    /* Tema */

    alterarTemaClimatico(
        weather.theme,
        current.is_day
    );


    /* Previsão */

    renderizarPrevisao(
        data.daily
    );


    weatherContent.classList.remove(
        "hidden"
    );


    /* Atualizar favoritos */

    renderizarFavoritos();
}


/* =========================================
   PREVISÃO
========================================= */

function renderizarPrevisao(daily) {

    forecast.innerHTML = "";

    daily.time.forEach(
        (date, index) => {

            const weather =
                weatherCodes[
                    daily.weather_code[index]
                ] || weatherCodes[0];


            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "forecast-card";


            const day =
                new Date(
                    `${date}T12:00:00`
                ).toLocaleDateString(
                    "pt-BR",
                    {
                        weekday: "short"
                    }
                );


            card.innerHTML = `

                <span class="forecast-day">
                    ${index === 0
                        ? "Hoje"
                        : day}
                </span>

                <div class="forecast-icon">
                    ${weather.icon}
                </div>

                <strong class="forecast-temp">
                    ${Math.round(
                        daily.temperature_2m_max[index]
                    )}°
                </strong>

                <div class="forecast-min">
                    mín. ${Math.round(
                        daily.temperature_2m_min[index]
                    )}°
                </div>

            `;


            forecast.appendChild(card);
        }
    );
}


/* =========================================
   TEMA DINÂMICO
========================================= */

function alterarTemaClimatico(
    theme,
    isDay
) {

    document.body.classList.remove(
        "weather-sunny",
        "weather-rain",
        "weather-cloudy",
        "weather-night",
        "weather-default"
    );


    if (!isDay) {

        document.body.classList.add(
            "weather-night"
        );

        return;
    }


    document.body.classList.add(
        theme
    );
}


/* =========================================
   TEMA CLARO/ESCURO
========================================= */

function alternarTema() {

    document.body.classList.toggle(
        "light-theme"
    );


    const light =
        document.body.classList.contains(
            "light-theme"
        );


    localStorage.setItem(
        "theme",
        light ? "light" : "dark"
    );
}


function carregarTema() {

    const theme =
        localStorage.getItem(
            "theme"
        );


    if (theme === "light") {

        document.body.classList.add(
            "light-theme"
        );
    }
}


/* =========================================
   FAVORITOS
========================================= */

function obterFavoritos() {

    return JSON.parse(
        localStorage.getItem(
            "weather-favorites"
        )
    ) || [];
}


function salvarFavorito(city) {

    const favoritos =
        obterFavoritos();


    const jaExiste =
        favoritos.some(
            item =>
                item.toLowerCase() ===
                city.toLowerCase()
        );


    if (!jaExiste) {

        favoritos.push(city);

        localStorage.setItem(
            "weather-favorites",
            JSON.stringify(
                favoritos
            )
        );
    }


    renderizarFavoritos();

    atualizarBotaoFavorito(
        city
    );
}


function removerFavorito(city) {

    const favoritos =
        obterFavoritos()
            .filter(
                item =>
                    item.toLowerCase() !==
                    city.toLowerCase()
            );


    localStorage.setItem(
        "weather-favorites",
        JSON.stringify(
            favoritos
        )
    );


    renderizarFavoritos();

    atualizarBotaoFavorito(
        city
    );
}


function renderizarFavoritos() {

    const favoritos =
        obterFavoritos();


    favorites.innerHTML = "";


    if (favoritos.length === 0) {

        favorites.innerHTML = `
            <p class="empty-state">
                Nenhuma cidade favorita.
            </p>
        `;

        return;
    }


    favoritos.forEach(
        city => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "favorite";


            item.innerHTML = `

                <span
                    class="favorite-city"
                >
                    ${city}
                </span>

                <button
                    class="favorite-remove"
                    type="button"
                    aria-label="Remover ${city}"
                >
                    ×
                </button>

            `;


            item
                .querySelector(
                    ".favorite-city"
                )
                .addEventListener(
                    "click",
                    () => pesquisarCidade(city)
                );


            item
                .querySelector(
                    ".favorite-remove"
                )
                .addEventListener(
                    "click",
                    () => removerFavorito(city)
                );


            favorites.appendChild(
                item
            );
        }
    );
}


/* =========================================
   BOTÃO DE FAVORITO
========================================= */

function criarBotaoFavorito() {

    const currentCard =
        document.getElementById(
            "current-weather"
        );


    if (!currentCard) {
        return;
    }


    if (
        document.getElementById(
            "favorite-current-button"
        )
    ) {
        return;
    }


    const button =
        document.createElement(
            "button"
        );


    button.id =
        "favorite-current-button";


    button.className =
        "secondary-button ripple";


    button.type =
        "button";


    button.textContent =
        "☆ Adicionar aos favoritos";


    button.addEventListener(
        "click",
        adicionarCidadeAtualAosFavoritos
    );


    const stats =
        currentCard.querySelector(
            ".weather-stats"
        );


    if (stats) {

        stats.insertAdjacentElement(
            "afterend",
            button
        );

    } else {

        currentCard.appendChild(
            button
        );
    }
}


function adicionarCidadeAtualAosFavoritos() {

    const location =
        document.getElementById(
            "location-name"
        ).textContent
            .split(",")[0]
            .trim();


    if (
        !location ||
        location === "Minha localização"
    ) {
        return;
    }


    const favoritos =
        obterFavoritos();


    const jaExiste =
        favoritos.some(
            city =>
                city.toLowerCase() ===
                location.toLowerCase()
        );


    if (jaExiste) {

        removerFavorito(
            location
        );

    } else {

        salvarFavorito(
            location
        );
    }
}


function atualizarBotaoFavorito(
    cityName
) {

    const button =
        document.getElementById(
            "favorite-current-button"
        );


    if (!button) {
        return;
    }


    const favoritos =
        obterFavoritos();


    const jaExiste =
        favoritos.some(
            city =>
                city.toLowerCase() ===
                cityName.toLowerCase()
        );


    if (jaExiste) {

        button.textContent =
            "⭐ Remover dos favoritos";

    } else {

        button.textContent =
            "☆ Adicionar aos favoritos";
    }
}


/* =========================================
   ÚLTIMA CIDADE
========================================= */

function salvarUltimaCidade(city) {

    localStorage.setItem(
        "last-city",
        city
    );
}


/* =========================================
   DATA
========================================= */

function formatarData(
    dateString
) {

    const date =
        new Date(
            dateString
        );


    return date.toLocaleDateString(
        "pt-BR",
        {
            weekday: "long",
            day: "2-digit",
            month: "long"
        }
    );
}


/* =========================================
   LOADING
========================================= */

function mostrarLoading(show) {

    loading.classList.toggle(
        "hidden",
        !show
    );
}


/* =========================================
   ERRO
========================================= */

function mostrarErro(message) {

    errorMessage.textContent =
        `⚠ ${message}`;


    errorMessage.classList.remove(
        "hidden"
    );


    weatherContent.classList.add(
        "hidden"
    );
}


function esconderErro() {

    errorMessage.classList.add(
        "hidden"
    );
}


/* =========================================
   LIMPAR
========================================= */

function limparTela() {

    weatherContent.classList.add(
        "hidden"
    );


    esconderErro();


    input.value = "";


    document.body.classList.remove(
        "weather-sunny",
        "weather-rain",
        "weather-cloudy",
        "weather-night"
    );


    document.body.classList.add(
        "weather-default"
    );
}


/* =========================================
   RIPPLE EFFECT
========================================= */

document
    .querySelectorAll(".ripple")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function (event) {

                    const ripple =
                        document.createElement(
                            "span"
                        );


                    ripple.className =
                        "ripple-effect";


                    const rect =
                        this.getBoundingClientRect();


                    ripple.style.left =
                        `${event.clientX - rect.left}px`;


                    ripple.style.top =
                        `${event.clientY - rect.top}px`;


                    this.appendChild(
                        ripple
                    );


                    setTimeout(
                        () => ripple.remove(),
                        600
                    );
                }
            );
        }
    );


/* =========================================
   PARALLAX DO CARD
========================================= */

const currentCard =
    document.getElementById(
        "current-weather"
    );


currentCard.addEventListener(
    "mousemove",
    event => {

        if (
            window.innerWidth < 800
        ) {
            return;
        }


        const rect =
            currentCard.getBoundingClientRect();


        const x =
            event.clientX -
            rect.left;


        const y =
            event.clientY -
            rect.top;


        const rotateY =
            ((x / rect.width) - .5) * 5;


        const rotateX =
            ((y / rect.height) - .5) * -5;


        currentCard.style.transform =
            `perspective(1000px)
             rotateX(${rotateX}deg)
             rotateY(${rotateY}deg)`;
    }
);


currentCard.addEventListener(
    "mouseleave",
    () => {

        currentCard.style.transform =
            "perspective(1000px) rotateX(0) rotateY(0)";
    }
);


/* =========================================
   EVENTOS
========================================= */

form.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const city =
            input.value.trim();


        if (!city) {

            mostrarErro(
                "Digite o nome de uma cidade."
            );

            return;
        }


        pesquisarCidade(
            city
        );
    }
);


locationButton.addEventListener(
    "click",
    obterLocalizacao
);


clearButton.addEventListener(
    "click",
    limparTela
);


themeButton.addEventListener(
    "click",
    alternarTema
);


/* =========================================
   INICIALIZAÇÃO
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        carregarTema();

        criarBotaoFavorito();

        renderizarFavoritos();


        const lastCity =
            localStorage.getItem(
                "last-city"
            );


        if (lastCity) {

            input.value =
                lastCity;


            pesquisarCidade(
                lastCity
            );

        } else {

            pesquisarCidade(
                "Salvador"
            );
        }
    }
);