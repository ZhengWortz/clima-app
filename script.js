// 🔑 Substitua pela sua chave do OpenWeatherMap
const API_KEY = '68da5fc847d596ac98dc8399a80c3a71'; // 👈 COLE SUA CHAVE AQUI!

// Mapeamento de estados para capitais
const correcoes = {
  'acre': 'Rio Branco',
  'alagoas': 'Maceió',
  'amapá': 'Macapá',
  'amazonas': 'Manaus',
  'bahia': 'Salvador',
  'ceará': 'Fortaleza',
  'distrito federal': 'Brasília',
  'espírito santo': 'Vitória',
  'goiás': 'Goiânia',
  'maranhão': 'São Luís',
  'mato grosso': 'Cuiabá',
  'mato grosso do sul': 'Campo Grande',
  'minas gerais': 'Belo Horizonte',
  'pará': 'Belém',
  'paraíba': 'João Pessoa',
  'paraná': 'Curitiba',
  'pernambuco': 'Recife',
  'piauí': 'Teresina',
  'rio de janeiro': 'Rio de Janeiro',
  'rio grande do norte': 'Natal',
  'rio grande do sul': 'Porto Alegre',
  'rondônia': 'Porto Velho',
  'roraima': 'Boa Vista',
  'santa catarina': 'Florianópolis',
  'são paulo': 'São Paulo',
  'sergipe': 'Aracaju',
  'tocantins': 'Palmas'
};

async function obterClima() {
  const input = document.getElementById('cidade');
  const cidade = input.value.trim();
  const resultado = document.getElementById('resultado');

  if (!cidade) {
    mostrarErro('Por favor, digite uma cidade.');
    return;
  }

  let cidadeBusca = cidade.toLowerCase();
  if (correcoes[cidadeBusca]) {
    cidadeBusca = correcoes[cidadeBusca];
  } else {
    // Remove siglas como "BR", "SP", etc.
    cidadeBusca = cidade.split(',')[0].trim().toLowerCase();
  }

  try {
    const resAtual = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cidadeBusca}&appid=${API_KEY}&lang=pt_br&units=metric`
    );

    if (!resAtual.ok) {
      throw new Error('Cidade não encontrada. Tente outra.');
    }

    const dadosAtual = await resAtual.json();
    exibirClimaAtual(dadosAtual);

    // Previsão de 5 dias
    const resPrevisao = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${cidadeBusca}&appid=${API_KEY}&lang=pt_br&units=metric`
    );
    const dadosPrevisao = await resPrevisao.json();
    exibirPrevisao(dadosPrevisao);

  } catch (error) {
    mostrarErro(error.message);
  }
}

function exibirClimaAtual(dados) {
  const { name, sys, main, weather, wind } = dados;
  const iconeUrl = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;

  const resultado = document.getElementById('resultado');
  resultado.style.display = 'block';
  resultado.innerHTML = `
    <h2>${name}, ${sys.country}</h2>
    <img src="${iconeUrl}" alt="Tempo" />
    <p><strong>🌡️ Temperatura:</strong> ${Math.round(main.temp)}°C</p>
    <p><strong>😶‍🌫️ Sensação:</strong> ${Math.round(main.feels_like)}°C</p>
    <p><strong>☁️ Condição:</strong> ${capitalize(weather[0].description)}</p>
    <p><strong>💧 Umidade:</strong> ${main.humidity}%</p>
    <p><strong>💨 Vento:</strong> ${wind.speed} m/s</p>
  `;
}

function exibirPrevisao(dados) {
  const previsao = document.getElementById('previsao');
  previsao.style.display = 'block';
  previsao.innerHTML = '<h2>📅 Previsão (5 dias)</h2>';

  const dias = dados.list.filter(item => item.dt_txt.includes("12:00"));
  const lista = document.createElement('div');

  dias.forEach(dia => {
    const data = new Date(dia.dt * 1000).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });
    const iconeUrl = `https://openweathermap.org/img/wn/${dia.weather[0].icon}.png`;
    const temp = Math.round(dia.main.temp);

    const item = document.createElement('div');
    item.className = 'previsao-item';
    item.innerHTML = `
      <span>${data}</span>
      <img src="${iconeUrl}" alt="tempo" />
      <span>${temp}°C</span>
    `;
    lista.appendChild(item);
  });

  previsao.appendChild(lista);
}

async function obterClimaPorLocalizacao() {
  if (!navigator.geolocation) {
    mostrarErro('Geolocalização não suportada.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&lang=pt_br&units=metric`
        );
        const dados = await res.json();
        exibirClimaAtual(dados);
      } catch (err) {
        mostrarErro('Erro ao obter localização.');
      }
    },
    (err) => {
      if (err.code === err.PERMISSION_DENIED) {
        mostrarErro('Permissão negada.');
      } else {
        mostrarErro('Erro ao obter localização.');
      }
    }
  );
}

function alternarTema() {
  const body = document.body;
  const btn = document.querySelector('.btn-theme');

  if (body.classList.contains('light-mode')) {
    body.className = 'dark-mode';
  } else {
    body.className = 'light-mode';
  }
}

function mostrarErro(mensagem) {
  const resultado = document.getElementById('resultado');
  resultado.style.display = 'block';
  resultado.innerHTML = `<p style="color: red;">❌ ${mensagem}</p>`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Carrega favoritos
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('search-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    obterClima();
  });
});
