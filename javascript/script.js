const apiKey = '2005b67d807785cf653edaa6';

const convertBtn   = document.getElementById('convertBtn');
const swapBtn      = document.getElementById('swapBtn');
const amountInput  = document.getElementById('amount');
const fromCurrency = document.getElementById('fromCurrency');
const toCurrency   = document.getElementById('toCurrency');
const resultValue  = document.getElementById('resultValue');
const lastUpdate   = document.getElementById('lastUpdate');

async function convertCurrency() {
    const amount = amountInput.value;
    const from   = fromCurrency.value;
    const to     = toCurrency.value;

    if (!amount || amount <= 0) {
        resultValue.innerText = '—';
        lastUpdate.innerText  = 'Aguardando operação...';
        return;
    }

    resultValue.classList.add('loading');
    resultValue.innerText = '···';

    try {
        const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
        const data = await response.json();

        if (data.result === 'success') {
            const rates  = data.conversion_rates;
            const result = (amount / rates[from]) * rates[to];

            const formatted = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: to
            }).format(result);

            resultValue.classList.remove('loading');
            resultValue.innerText = formatted;
            lastUpdate.innerText  = `Atualizado às ${new Date().toLocaleTimeString('pt-BR')}`;
        } else {
            resultValue.classList.remove('loading');
            resultValue.innerText = 'Erro ao buscar taxas.';
        }
    } catch (err) {
        resultValue.classList.remove('loading');
        resultValue.innerText = 'Erro de conexão.';
    }
}

// Inverter moedas
swapBtn.addEventListener('click', () => {
    const temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value   = temp;
    if (amountInput.value) convertCurrency();
});

// Eventos
convertBtn.addEventListener('click', convertCurrency);
amountInput.addEventListener('input', convertCurrency);
fromCurrency.addEventListener('change', convertCurrency);
toCurrency.addEventListener('change', convertCurrency);
amountInput.addEventListener('keypress', e => { if (e.key === 'Enter') convertCurrency(); });