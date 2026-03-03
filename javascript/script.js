document.getElementById('btnConsultar').addEventListener('click', consultarCNPJ);

async function consultarCNPJ() {
    const input = document.getElementById('cnpjInput');
    const resultCard = document.getElementById('resultCard');
    const loader = document.getElementById('loader');
    const errorMsg = document.getElementById('errorMsg');

    const cnpj = input.value.replace(/\D/g, '');

    if (cnpj.length !== 14) {
        alert("Amiguinha, digite os 14 números! ✨");
        return;
    }

    errorMsg.classList.add('hidden');
    resultCard.classList.add('hidden');
    loader.classList.remove('hidden');

    try {
        const proxy = "https://cors-anywhere.herokuapp.com/";
        const url = `https://receitaws.com.br/v1/cnpj/${cnpj}`;

        const response = await fetch(proxy + url);

        if (response.status === 429) {
            throw new Error("Limite atingido! Espere um pouquinho. 🎀");
        }

        const data = await response.json();

        if (data.status === "ERROR") {
            throw new Error(data.message || "CNPJ não encontrado!");
        }

        // Preenchendo os campos
        document.getElementById('res-nome').innerText = data.nome;
        document.getElementById('res-situacao').innerText = data.situacao;
        document.getElementById('res-abertura').innerText = data.abertura;
        document.getElementById('res-atividade').innerText = data.atividade_principal[0].text;
        document.getElementById('res-endereco').innerText = `${data.logradouro}, ${data.numero}`;
        document.getElementById('res-bairro').innerText = data.bairro || "Não informado";
        document.getElementById('res-cidade-uf').innerText = `${data.municipio} / ${data.uf}`;

        // Mostra a caixinha da direita
        resultCard.classList.remove('hidden');

    } catch (error) {
        errorMsg.innerText = "Ops! " + error.message;
        errorMsg.classList.remove('hidden');
    } finally {
        loader.classList.add('hidden');
    }
}