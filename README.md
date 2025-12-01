# JRS Invest: Plataforma de Gerenciamento de Investimentos

[![Licença](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2.0-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.17.0-green?logo=node.js)](https://nodejs.org/)

## 📖 Sobre o Projeto

JRS Invest é uma aplicação web completa e intuitiva, desenhada para auxiliar investidores a consolidar e monitorar suas carteiras de ativos de forma eficiente. A plataforma oferece uma visão clara e detalhada sobre o desempenho dos investimentos, permitindo que os usuários tomem decisões mais informadas e estratégicas.

Com uma interface moderna e responsiva, o usuário pode cadastrar suas operações de compra e venda de ativos, visualizar a rentabilidade da carteira em tempo real e acompanhar a evolução de indicadores importantes do mercado.

---

## ✨ Funcionalidades Principais

* **Dashboard Analítico:** Visão consolidada da performance da carteira com indicadores chave e gráficos interativos.
* **Gestão de Carteira Detalhada:** Visualize todos os seus ativos em um só lugar, com informações como quantidade, preço médio e cotação atual.
* **Registro de Operações:** Adicione, edite e remova operações de compra e venda de ativos de forma simples.
* **Autenticação Segura:** Sistema de login e registro de usuários com autenticação baseada em tokens (JWT) para garantir a privacidade dos dados.
* **Perfil de Usuário:** Página dedicada para os usuários gerenciarem suas informações pessoais.
* **Design Responsivo:** Interface adaptável para uma ótima experiência em desktops, tablets e celulares.

---

## 🚀 Tecnologias Utilizadas

Este projeto foi construído utilizando as seguintes tecnologias:

**Frontend:**
* **React**
* **TypeScript**
* **Vite**
* **Axios**
* **Recharts** (para gráficos)
* **React Router DOM**

**Backend:**
* **Node.js**
* **Express.js**
* **PostgreSQL**
* **JWT (JSON Web Tokens)**
* **Bcrypt.js**

---

## 🛠️ Como Executar o Projeto

Siga os passos abaixo para executar o projeto em seu ambiente local.

### Pré-requisitos

* Node.js (versão 18.x ou superior)
* npm
* Uma instância do PostgreSQL rodando.

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/jrs-invest.git](https://github.com/seu-usuario/jrs-invest.git)
    cd jrs-invest
    ```

2.  **Instale as dependências do Backend:**
    ```bash
    cd backend
    npm i
    ```

3.  **Instale as dependências do Frontend:**
    ```bash
    # no diretório /jrs-invest(raiz)
    npm i
    ```

4.  **Configuração do Ambiente:**
    * Preencha as variáveis de ambiente no arquivo `.env` com as suas credenciais do banco de dados.
    ```env
    DATABASE_URL="postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO"
    ```
5.  **Criação das tabelas no postgreSQL:**
    * Após criar seu database, vá em query tool e rode esse script para criar as tabelas e os processos de login e operações funcionem normalmente.

        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            birth_date DATE,
            phone VARCHAR(50)
        );

        CREATE TABLE operations (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            date TIMESTAMP WITH TIME ZONE,
            type VARCHAR(50),
            asset VARCHAR(50),
            quantity NUMERIC,
            price NUMERIC,
            total NUMERIC
        );

### Execução

1.  **Inicie o servidor Backend:**
    ```bash
    # no diretório /backend
    node index.js
    ```

2.  **Inicie a aplicação Frontend:**
    ```bash
    # no diretório /jrs-invest(raiz)
    npm run dev
    ```
    Acesse `http://localhost:5173` (ou a porta indicada no terminal) no seu navegador.

---

## 👤 Autor

-- @sgneto_

* LinkedIn: (https://www.linkedin.com/in/s%C3%A9rgio-costa-498a25278/)
* GitHub: (https://github.com/sergiocosta17)
* Email: [sergiocostaaraujoneto@gmail.com)
