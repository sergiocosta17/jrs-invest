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
* npm ou Yarn
* Uma instância do PostgreSQL rodando.

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/jrs-invest.git](https://github.com/seu-usuario/jrs-invest.git)
    cd jrs-invest
    ```

2.  **Instale as dependências do Backend:**
    ```bash
    cd jrs-invest-backend
    npm install
    ```

3.  **Instale as dependências do Frontend:**
    ```bash
    cd jrs-invest(raiz)
    npm install
    ```

4.  **Configuração do Ambiente:**
    * No diretório `backend`, renomeie o arquivo `.env.example` para `.env`.
    * Preencha as variáveis de ambiente no arquivo `.env` com as suas credenciais do banco de dados e a chave secreta para o JWT.
    ```env
    DATABASE_URL="postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO"
    JWT_SECRET="SUA_CHAVE_SECRETA_AQUI"
    PORT=3001
    ```

### Execução

1.  **Inicie o servidor Backend:**
    ```bash
    # no diretório /jrs-invest-backend
    node index.js
    ```

2.  **Inicie a aplicação Frontend:**
    ```bash
    # no diretório /jrs-invest(raiz do projeto)
    npm run dev
    ```
    Acesse `http://localhost:5173` (ou a porta indicada no terminal) no seu navegador.

---

## 👤 Autor

-- @sgneto_

* LinkedIn: (https://www.linkedin.com/in/s%C3%A9rgio-costa-498a25278/)
* GitHub: (https://github.com/sergiocosta17)
* Email: [sergiocostaaraujoneto@gmail.com)
