# 🔍 Achados e Perdidos | UFAM

Um sistema web focado em Interação Humano-Computador (IHC) para gerenciamento de objetos achados e perdidos na **Universidade Federal do Amazonas (UFAM)**. 

---

### ⚠️ Nota de Escopo Acadêmico & Estudo
Este projeto foi desenvolvido **exclusivamente para fins didáticos e laboratoriais** como um dos meus primeiros experimentos full-stack. O objetivo principal foi consolidar conceitos práticos de arquitetura de software, compreendendo o fluxo de comunicação entre o Front-end, o Back-end (API local) e um Banco de Dados Relacional. 

*O sistema foi projetado para rodar em ambiente de desenvolvimento local (localhost) e serve como base de portfólio para registrar minha evolução na programação.*

---

## 🎨 O Conceito de IHC & UX

A aplicação prática dos conceitos de **IHC (Interação Humano-Computador)** guiou o design do projeto, especificamente focando na redução dos **Golfos de Execução e Avaliação** de Donald Norman:

- **Sem Barreiras de Cadastro:** Para incentivar a colaboração, o aluno que encontrou um objeto não precisa criar uma conta, confirmar e-mail ou fazer login. Ele vai direto ao ponto, reduzindo o Golfo de Execução.
- **Mecanismo Seguro de Baixa (Token de Segurança):** Para evitar exclusões indevidas, o sistema gera um **Token de Segurança único de 6 dígitos** no momento do cadastro. O navegador força o download automático de um arquivo `.txt` contendo o token. Na hora da devolução física, o dono informa o código para que o item seja removido do banco.
- **Opção Integrada para Guarita/Portaria:** O formulário adapta-se em tempo real se o usuário marcar que deixou o objeto na portaria, desabilitando campos de contato pessoal e inserindo um alerta visual específico no card para o dono saber onde buscar.
- **Interface Nostálgica (Frutiger Aero):** O design de fundo utiliza o estilo clássico dos anos 2000 (Frutiger Aero), com bolhas flutuantes translúcidas tridimensionais geradas via CSS puro que carregam as **cores oficiais dos cursos da UFAM** (como o Azul Safira das Engenharias e o Verde Esmeralda das Ciências Biológicas).

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando uma arquitetura full-stack monolítica local:

- **Front-end:** HTML5, CSS3 (com propriedades tridimensionais, gradientes radiais e `backdrop-filter`), JavaScript Moderno (ES6+) assíncrono (`Async/Await` e `Fetch API`).
- **Back-end:** Node.js com o framework Express.
- **Banco de Dados:** PostgreSQL (Banco Relacional) utilizando a biblioteca nativa `pg` para queries seguras.

---

## 🚀 Estrutura do Banco de Dados

A tabela `itens` no PostgreSQL foi projetada para armazenar de forma de desenvolvimento os seguintes campos:

- `id`: Serial/Integer (Chave Primária)
- `item`: Varchar
- `categoria`: Varchar (Chaves, Eletrônicos, Documentos, Outros)
- `descricao`: Text (Opcional)
- `local_bloco`: Varchar
- `sala_ambiente`: Varchar
- `telefone`: Varchar
- `email`: Varchar
- `na_guarita`: Boolean
- `token_seguranca`: Varchar(6) (Código de validação para o `DELETE`)
- `data_cadastro`: Timestamp

---

## 💻 Como Rodar o Projeto Localmente

### Pré-requisitos
Você precisará do [Node.js](https://nodejs.org) e do [PostgreSQL](https://postgresql.org) instalados em sua máquina.

### 1. Configurar o Banco de Dados
No seu terminal do PostgreSQL, crie a tabela utilizando o seguinte comando:
```sql
CREATE TABLE itens (
    id SERIAL PRIMARY KEY,
    item VARCHAR(255) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    descricao TEXT,
    local_bloco VARCHAR(100) NOT NULL,
    sala_ambiente VARCHAR(100),
    telefone VARCHAR(50),
    email VARCHAR(100),
    na_guarita BOOLEAN DEFAULT FALSE,
    token_seguranca VARCHAR(6),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Configurar o Back-end
Navegue até a pasta do servidor pelo terminal e instale as dependências:
```bash
npm install express pg cors
```

Insira suas credenciais locais do banco no arquivo `server.js` e ligue o servidor:
```bash
node server.js
```

### 3. Abrir o Front-end
Basta abrir o arquivo `my_index.html` diretamente no seu navegador de preferência e começar a testar!

---

## 🧠 Aprendizados Adquiridos

- Construção e consumo de APIs REST nativas utilizando os métodos HTTP `GET`, `POST` e `DELETE`.
- Manipulação e higienização de dados dinâmicos no Banco de Dados PostgreSQL para evitar SQL Injection usando parâmetros preparados (`$1, $2`).
- Manipulação dinâmica do DOM em JavaScript para renderizar elementos na tela sem atualizar a página.
- Gerenciamento de estados de formulários e acessibilidade visual em IHC.

---

## 🔮 Próximos Passos & Futuras Atualizações (Roadmap)

Como parte do meu plano de estudos contínuos, pretendo implementar as seguintes melhorias técnicas e de regras de negócio em versões futuras:

- [ ] **Segurança de Credenciais:** Migrar as chaves de acesso ao banco do código do servidor (`server.js`) para um arquivo de variáveis de ambiente escondido (`.env`).
- [ ] **Refatoração de Regras de Negócio:** Ajustar fluxos lógicos de validação de formulários detectados durante a fase de testes.
- [ ] **Hospedagem em Produção:** Adaptar as URLs estáticas de `localhost` para endpoints dinâmicos, visando publicar a API e o banco de dados em servidores em nuvem (como Render e Railway).
- [ ] **Upload de Imagens:** Permitir anexar fotos reais dos objetos achados usando serviços de armazenamento de arquivos.
