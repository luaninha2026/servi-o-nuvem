// script.js - lógica de requisição e DOM para a "Estação Meteorológica Pessoal" 
// funções: buscarClima, mostrarClima, salvarClima, carregarClimaSalvo

const apiKey = 'bdc014366d19ce5f5cae9ce84d251045'; // <----- INSIRA SUA API KEY AQUI
const baseURL = 'https://api.openweathermap.org/data/2.5/weather';

const cidadeInput = document.getElementById('cidade-input');
const buscarBtn = document.getElementById('buscar-btn');
const resultadoDiv = document.getElementById('resultado');
const cardElement = document.getElementById('weather-card');
const themeToggle = document.getElementById('dark-mode-toggle');
const localBtn = document.getElementById('local-btn');

// evento de clique no botão de busca
buscarBtn.addEventListener('click', () => {
    const cidade = cidadeInput.value.trim();
    if (cidade) {
        buscarClima(cidade);
    }
});

// carrega clima salvo no localStorage quando a página é aberta
window.onload = () => {
    carregarClimaSalvo();
    carregarPreferenciaTema();
    carregarHistorico();
    renderizarHistorico();
    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            setTheme(themeToggle.checked);
        });
    }
    // botão limpar histórico
    const limparBtn = document.getElementById('limpar-historico-btn');
    if (limparBtn) {
        limparBtn.addEventListener('click', () => {
            localStorage.removeItem('historico_cidades');
            renderizarHistorico(); // renderiza vazio
        });
    }
    // botão local
    if (localBtn) {
        localBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;
                        buscarClimaPorCoordenadas(lat, lon);
                    },
                    (error) => {
                        let msg = 'Erro ao obter localização.';
                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                msg = 'Usuário negou a solicitação de localização.';
                                break;
                            case error.POSITION_UNAVAILABLE:
                                msg = 'Localização indisponível.';
                                break;
                            case error.TIMEOUT:
                                msg = 'Tempo limite para obter localização.';
                                break;
                        }
                        resultadoDiv.innerHTML = `<p>Erro: ${msg}</p>`;
                        resultadoDiv.classList.add('visible');
                    }
                );
            } else {
                resultadoDiv.innerHTML = '<p>Geolocalização não é suportada pelo navegador.</p>';
                resultadoDiv.classList.add('visible');
            }
        });
    }
};

// faz a requisição à API usando fetch
async function buscarClima(cidade) {
    try {
        const url = `${baseURL}?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Cidade não encontrada');
        }
        const dados = await response.json();
        mostrarClima(dados);
        salvarClima(dados);
        salvarCidadeHistorico(cidade);
    } catch (erro) {
        resultadoDiv.innerHTML = `<p>Erro: ${erro.message}</p>`;
        resultadoDiv.classList.add('visible');
    }
}

// busca clima por coordenadas
async function buscarClimaPorCoordenadas(lat, lon) {
    try {
        const url = `${baseURL}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Não foi possível obter o clima para sua localização');
        }
        const dados = await response.json();
        mostrarClima(dados);
        salvarClima(dados);
        salvarCidadeHistorico(dados.name); // salva o nome da cidade retornado
    } catch (erro) {
        resultadoDiv.innerHTML = `<p>Erro: ${erro.message}</p>`;
        resultadoDiv.classList.add('visible');
    }
}

// exibe os dados de clima no DOM
function mostrarClima(dados) {
    const { name, main, weather } = dados;
    const temp = main.temp.toFixed(1);
    const desc = weather[0].description;
    const icon = weather[0].icon;
    
    // animação suave: remover visibilidade antes de atualizar
    resultadoDiv.classList.remove('visible');
    cardElement.classList.remove('glow');

    setTimeout(() => {
        resultadoDiv.innerHTML = `
            <h2>${name}</h2>
            <p><strong>${temp}°C</strong></p>
            <p style="text-transform: capitalize;">${desc}</p>
            <div class="icon-wrapper">
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}">
            </div>
        `;
        resultadoDiv.classList.add('visible');
        // nova animação: brilho no card
        cardElement.classList.add('glow');
        setTimeout(() => cardElement.classList.remove('glow'), 1000); // remove após 1s
    }, 100); // pequeno atraso para forçar transição
}

// salva o resultado do fetch no localStorage
function salvarClima(dados) {
    localStorage.setItem('clima_salvo', JSON.stringify(dados));
}

// carrega dados salvos, se existirem
function carregarClimaSalvo() {
    const salvo = localStorage.getItem('clima_salvo');
    if (salvo) {
        const dados = JSON.parse(salvo);
        mostrarClima(dados);
    }
}

// temas escuro/claro
function setTheme(isDark) {
    if (isDark) {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
    localStorage.setItem('tema', isDark ? 'dark' : 'light');
}

function carregarPreferenciaTema() {
    const saved = localStorage.getItem('tema');
    let isDark = false;
    if (saved) {
        isDark = saved === 'dark';
    } else {
        // preferência do sistema
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    setTheme(isDark);
    if (themeToggle) {
        themeToggle.checked = isDark;
    }
}

// funções do histórico de cidades
function salvarCidadeHistorico(cidade) {
    let historico = carregarHistorico();
    // remover se já existir
    historico = historico.filter(c => c !== cidade);
    // adicionar no início
    historico.unshift(cidade);
    // limitar a 10
    if (historico.length > 10) {
        historico = historico.slice(0, 10);
    }
    localStorage.setItem('historico_cidades', JSON.stringify(historico));
    renderizarHistorico();
}

function carregarHistorico() {
    const historico = localStorage.getItem('historico_cidades');
    return historico ? JSON.parse(historico) : [];
}

function renderizarHistorico() {
    const historico = carregarHistorico();
    const listaDiv = document.getElementById('historico-lista');
    listaDiv.innerHTML = '';
    // mostrar no máximo 9 cidades para não poluir
    const cidadesParaMostrar = historico.slice(0, 9);
    cidadesParaMostrar.forEach(cidade => {
        const btn = document.createElement('button');
        btn.textContent = cidade;
        btn.addEventListener('click', () => {
            document.getElementById('cidade-input').value = cidade;
            buscarClima(cidade);
        });
        listaDiv.appendChild(btn);
    });
}
