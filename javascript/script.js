function buscarCEP() {
            const cep = document.getElementById("cep").value;
            const resultado = document.getElementById("resultado");

            if (cep.length !== 8 || isNaN(cep)) {
                resultado.innerHTML = "<p class='erro'>CEP inválido!</p>";
                return;
            }

            fetch(`https://viacep.com.br/ws/${cep}/json/`)
                .then(response => response.json())
                .then(data => {
                    if (data.erro) {
                        resultado.innerHTML = "CEP não encontrado!";
                    } else {
                        resultado.innerHTML = `
                            <p><strong>CEP:</strong> ${data.cep}</p>
                            <p><strong>Logradouro:</strong> ${data.logradouro}</p>
                            <p><strong>Bairro:</strong> ${data.bairro}</p>
                            <p><strong>Cidade:</strong> ${data.localidade}</p>
                            <p><strong>Estado:</strong> ${data.uf}</p>
                        `;
                    }
                })
                .catch(error => {
                    resultado.innerHTML = "Erro ao buscar CEP!";
                });
        }