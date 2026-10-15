// 1. Mapeia as salas de cada bloco
const salasPorBloco = {
    blocoA: ["Sala 101", "Sala 102", "Sala 201", "Sala 202", "Laboratório A"],
    blocoB: ["Sala 103", "Sala 104", "Sala 203", "Sala 204"],
    blocoC: ["Sala 105", "Sala 106", "Sala 205", "Sala 206"],
    blocoD: ["Sala 107", "Sala 108", "Sala 207", "Sala 208"],
    blocoE: ["Sala 109", "Sala 110", "Sala 209", "Sala 210"],
    RU: ["Refeitório", "Área de Fila", "Catracas"],
    bosque: ["Mesas de Redes", "Trilha Principal", "Área de Convivência"]
};

const selectBloco = document.getElementById('local');
const selectSala = document.getElementById('sala');

// Altera as salas dinamicamente
selectBloco.addEventListener('change', function() {
    const blocoSelecionado = this.value;
    selectSala.innerHTML = '<option value="" disabled selected>Selecione a sala...</option>';
    
    if (salasPorBloco[blocoSelecionado]) {
        selectSala.disabled = false;
        salasPorBloco[blocoSelecionado].forEach(function(sala) {
            const option = document.createElement('option');
            option.value = sala.toLowerCase().replace(" ", "-");
            option.textContent = sala;
            selectSala.appendChild(option);
        });
    } else {
        selectSala.disabled = true;
        const optionErro = document.createElement("option");
        optionErro.value = "";
        optionErro.textContent = "Selecione primeiro o bloco...";
        selectSala.appendChild(optionErro);
    }
});

// AJUSTE DE IHC: Movido para fora do submit para funcionar em tempo real na tela!
document.getElementById("na_guarita").addEventListener("change", function() {
    const campoContato = document.getElementById("contato");
    const campoEmail = document.getElementById("E-mail");

    if (this.checked) {
        campoContato.disabled = true;
        campoEmail.disabled = true;
        campoContato.placeholder = "Não necessário (Deixado na Guarita)";
        campoEmail.placeholder = "Não necessário (Deixado na Guarita)";
        campoContato.value = "";
        campoEmail.value = "";
    } else {
        campoContato.disabled = false;
        campoEmail.disabled = false;
        campoContato.placeholder = "Ex: 92999991111";
        campoEmail.placeholder = "Ex: fulano.silva@ufam.edu.br";
    }
});

// Envio do formulário
const formulario = document.querySelector("form");
formulario.addEventListener("submit", async function(event) {
    event.preventDefault(); 

    const checkGuarita = document.getElementById("na_guarita").checked;
    let telefoneValue = document.getElementById("contato").value.trim();
    let emailValue = document.getElementById("E-mail").value.trim();

    if (!checkGuarita) {
        if (!telefoneValue || !emailValue) {
            alert("❌ Erro: Como o item está com você, preencha seu celular e e-mail para que o dono te encontre!");
            return;
        }

        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const regexTelefone = /^[1-9]{2}9[0-9]{8}$/;

        if (!regexTelefone.test(telefoneValue)) {
            alert("❌ Formato de celular inválido! Insira o DDD + 9 dígitos (Apenas números).");
            return;
        }

        if (!regexEmail.test(emailValue)) {
            alert("❌ Formato de e-mail inválido! Verifique o '@' e o domínio.");
            return;
        }
    } else {
        if (!telefoneValue) telefoneValue = "Tratar na Guarita";
        if (!emailValue) emailValue = "guarita@ufam.edu.br";
    }

    const dadosFormulario = {
        item: document.getElementById("item").value,
        categoria: document.getElementById("categoria").value,
        descricao: document.getElementById("descricao").value,
        local: document.getElementById("local").value,
        sala: document.getElementById("sala").value,
        telefone: telefoneValue,
        email: emailValue,
        na_guarita: checkGuarita
    };

    try {
        const resposta = await fetch("http://localhost:3000/cadastrar-item", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dadosFormulario)
        });

        // Procure esse trecho dentro do submit do formulário no seu script.js e ajuste:
       const resultado = await resposta.json();

        if (resultado.success) {
            // Pega o token que o servidor gerou e nos enviou de volta
            const token = resultado.token_seguranca;
            
            // Dispara o download automático do recibo do aluno com o token real!
            baixarComprovanteSeguranca(dadosFormulario.item, token);

            alert(`🎉 Item cadastrado com sucesso!\n\n🔑 SEU CÓDIGO DE DEVOLUÇÃO É: ${token}\n\nGuarde o arquivo .txt baixado para dar baixa depois!`);
            
            formulario.reset();
            if (typeof selectSala !== 'undefined') selectSala.disabled = true;
            // ===================================================================
            // 🛠️ CORREÇÃO IHC AQUI: Força os campos a voltarem ao estado padrão ativado    | oh coisa chata meu
            // ===================================================================
            const campoContato = document.getElementById("contato");
            const campoEmail = document.getElementById("E-mail");
            
            campoContato.disabled = false;
            campoEmail.disabled = false;
            campoContato.placeholder = "Ex: 92999991111";
            campoEmail.placeholder = "Ex: fulano.silva@ufam.edu.br";
            // ===================================================================

            carregarItensDoBanco(); 
        } else {
            alert("❌ Erro ao cadastrar o item.");
        }
    } catch (error) {
                console.error("Erro na requisição:", error);
                alert("❌ Não foi possível conectar ao servidor Back-end. Ele está ligado?");
            }
        });

// Função auxiliar de IHC para criar o arquivo e baixar
function baixarComprovanteSeguranca(nomeItem, token) {
    const textoComprovante = `
===================================================
   UFAM - SISTEMA DE ACHADOS E PERDIDOS
===================================================
ITEM CADASTRADO: ${nomeItem}
DATA: ${new Date().toLocaleDateString('pt-BR')}

🔑 SEU CÓDIGO DE SEGURANÇA: ${token}

---------------------------------------------------
INSTRUÇÕES DE SEGURANÇA (IHC):
Quando o dono legítimo vier buscar o objeto, peça 
para ele confirmar as características do item. 

Após a entrega, utilize o código acima clicando no 
botão "Dar Baixa" no card correspondente do site 
para excluir o item do banco de dados.
===================================================
    `;
    
    const blob = new Blob([textoComprovante], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `comprovante-${nomeItem.toLowerCase().replace(/[^a-z0-9]/g, "-")}.txt`;
    link.click();
}

// Carrega os itens do banco e injeta o botão de DELETE em cada card
async function carregarItensDoBanco() {
    const grid = document.getElementById("grid-produtos-dinamico");
    if (!grid) return;

    try {
        const resposta = await fetch("http://localhost:3000/listar-itens");
        const resultado = await resposta.json();

        if (resultado.success) {
            grid.innerHTML = "";

            if (resultado.itens.length === 0) {
                grid.innerHTML = "<p>Nenhum item cadastrado no momento.</p>";
                return;
            }

            resultado.itens.forEach(itemBanco => {
                const card = document.createElement("div");
                card.className = 'card-item card-' + itemBanco.categoria;

                // Modifica a cor de fundo do aviso caso seja guarita (Estilo visual diferenciado)
                const avisoGuarita = itemBanco.na_guarita 
                    ? '<div class="alerta-guarita" style="background: #fef3c7; color: #d97706; padding: 8px; border-radius: 5px; margin-bottom: 10px; font-weight: bold; border: 1px solid #f59e0b;"><i class="fa-solid fa-person-shelter"></i> DISPONÍVEL NA GUARITA</div>' 
                    : '<div class="alerta-aluno" style="background: #e0f2fe; color: #0369a1; padding: 8px; border-radius: 5px; margin-bottom: 10px; font-weight: bold; border: 1px solid #38bdf8;"><i class="fa-solid fa-user"></i> ESTÁ COM UM ALUNO</div>';

                card.innerHTML = 
                    avisoGuarita + 
                    '<span class="tag-categoria">' + itemBanco.categoria.toUpperCase() + '</span>' +
                    '<h4 style="margin-top: 10px;">' + itemBanco.item + '</h4>' +
                    '<p>' + (itemBanco.descricao ? '<em>' + itemBanco.descricao + '</em>' : '') + '</p>' +
                    '<p><i class="fa-solid fa-location-dot"></i> <strong>Local:</strong> ' + itemBanco.local_bloco.toUpperCase() + ' - ' + (itemBanco.sala_ambiente || 'Geral') + '</p>' +
                    '<p><i class="fa-solid fa-phone"></i> <strong>Whats:</strong> ' + itemBanco.telefone + '</p>' +
                    '<p><i class="fa-solid fa-envelope"></i> <strong>E-mail:</strong> ' + itemBanco.email + '</p>' +
                    
                    // BOTÃO DE DELETAR DISPARADO DIRETAMENTE NO CARD
                    `<button onclick="darBaixaNoItem(${itemBanco.id})" style="background: #ef4444; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; margin-top: 10px; width: 100%; font-weight: bold;">` +
                        '<i class="fa-solid fa-trash-can"></i> Entregue ao Dono (Dar Baixa)' +
                    '</button>';
                    
                grid.appendChild(card);
            });
        }
    } catch (error) {
        console.error("Erro ao carregar itens:", error);
    }
}

// FUNÇÃO DA PONTE: Pede o token na tela e faz a chamada DELETE para o Node
async function darBaixaNoItem(idItem) {
    const tokenDigitado = prompt("🔑 Para confirmar a devolução e tirar o item do ar, insira o Código de Segurança de 6 dígitos enviado no comprovante:");
    
    // Se o usuário cancelou o prompt ou deixou vazio, interrompe
    if (tokenDigitado === null || tokenDigitado.trim() === "") return;

    try {
        const resposta = await fetch(`http://localhost:3000/deletar-item/${idItem}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: tokenDigitado })
        });

        const resultado = await resposta.json();

        if (resultado.success) {
            alert("✅ Item devolvido com sucesso e retirado do site!");
            carregarItensDoBanco(); // Atualiza a lista na tela na hora!
        } else {
            // CORRIGIDO: Agora com as crases corretas para o JavaScript funcionar
            alert(`❌ Falha: ${resultado.error}`);
        }

    } catch (error) {
        console.error("Erro na requisição de DELETE:", error);
        alert("❌ Erro ao conectar ao servidor para excluir o item.");
    }
}

// Executa a busca assim que a página carrega
window.addEventListener("DOMContentLoaded", carregarItensDoBanco);
