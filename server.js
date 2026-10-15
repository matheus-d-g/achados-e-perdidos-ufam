const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'postgres',
    password: '', // Colocar a senhaaaaaa
    port: 5432,
});

// Função auxiliar para gerar um Token de 6 caracteres maiúsculos/números
function gerarTokenSeguranca() {
    const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sem '0', 'O', '1', 'I' para evitar confusão de IHC
    let token = '';
    for (let i = 0; i < 6; i++) {
        token += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return token;
}

// ROTA ATUALIZADA: Gera o token, salva no banco e devolve para o Front-end
app.post('/cadastrar-item', async (req, res) => {
    const { item, categoria, descricao, local, sala, telefone, email, na_guarita } = req.body;
    const tokenSeguranca = gerarTokenSeguranca(); 

        try {
        const queryText = `
            INSERT INTO itens (item, categoria, descricao, local_bloco, sala_ambiente, telefone, email, na_guarita, token_seguranca) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
        `;
        const values = [item, categoria, descricao, local, sala, telefone, email, na_guarita, tokenSeguranca];
        
        const resultado = await pool.query(queryText, values);
        
        //  Enviamos os dados da linha recém inserida (rows[0])
        res.status(201).json({ 
            success: true, 
            token_seguranca: tokenSeguranca, 
            dados: resultado.rows[0] 
        });
    } catch (error) {
        console.error("Erro interno no servidor ao tentar salvar:", error);
        res.status(500).json({ success: false, error: "Erro interno no servidor" });
    }
});

// ROTA DE DELETE CORRIGIDA (Buscando rows[0])
app.delete('/deletar-item/:id', async (req, res) => {
    const idItem = req.params.id;
    const { token } = req.body; 

    try {
        const buscarItem = await pool.query('SELECT token_seguranca FROM itens WHERE id = \$1', [idItem]);

        if (buscarItem.rows.length === 0) {
            return res.status(404).json({ success: false, error: "Item não encontrado." });
        }
        const tokenBanco = buscarItem.rows[0].token_seguranca;

        // Se o item no banco não tiver token por algum motivo antigo  - tiver dor de cabeça com esse token
        if (!tokenBanco) {
            return res.status(400).json({ success: false, error: "Este item antigo não possui código de segurança." });
        }

        if (token.trim().toUpperCase() !== tokenBanco.toUpperCase()) {
            return res.status(401).json({ success: false, error: "Código de segurança incorreto! Baixa recusada." });
        }

        await pool.query('DELETE FROM itens WHERE id = \$1', [idItem]);
        res.status(200).json({ success: true, message: "Item removido com sucesso!" });

    } catch (error) {
        console.error("Erro ao tentar deletar o item:", error);
        res.status(500).json({ success: false, error: "Erro interno ao deletar" });
    }
});


app.get('/listar-itens', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM itens ORDER BY data_cadastro DESC;');
        res.status(200).json({ success: true, itens: resultado.rows });
    } catch (error) {
        console.error("Erro ao buscar no banco:", error);
        res.status(500).json({ success: false, error: "Erro ao buscar itens" });
    }
});

app.listen(3000, () => {
    console.log("Servidor do Achados e Perdidos rodando na porta 3000!");
});
