JRS Invest: Plataforma de Gerenciamento de Investimentos
📖 Sobre o Projeto
JRS Invest é uma aplicação web completa e intuitiva, desenhada para auxiliar investidores a consolidar e monitorar suas carteiras de ativos de forma eficiente. A plataforma oferece uma visão clara e detalhada sobre o desempenho dos investimentos, permitindo que os usuários tomem decisões mais informadas e estratégicas.

Com uma interface moderna e responsiva, o usuário pode cadastrar suas operações de compra e venda de ativos, visualizar a rentabilidade da carteira em tempo real, acompanhar a evolução de indicadores importantes do mercado, como o Ibovespa, e gerar relatórios detalhados.

✨ Funcionalidades Principais
Dashboard Analítico: Uma visão geral e consolidada da performance da carteira, com indicadores chave como valor investido, valor atual e rentabilidade. Inclui um gráfico interativo com a performance histórica do Ibovespa.

Gestão de Carteira Detalhada: Visualize todos os seus ativos em um só lugar, com informações como quantidade, preço médio, cotação atual, variação diária e resultado financeiro.

Registro de Operações: Adicione, edite e remova operações de compra e venda de ativos de forma simples e rápida.

Autenticação Segura: Sistema de login e registro de usuários com autenticação baseada em tokens (JWT) para garantir a segurança e a privacidade dos dados.

Perfil de Usuário: Página dedicada onde os usuários podem visualizar e atualizar suas informações pessoais.

Design Responsivo: A interface se adapta perfeitamente a diferentes tamanhos de tela, proporcionando uma ótima experiência tanto em desktops quanto em dispositivos móveis.

Geração de Relatórios: Exporte o histórico de operações em formatos PDF ou CSV para análises mais aprofundadas ou para declarações.

🚀 Tecnologias Utilizadas
Este projeto foi construído utilizando as seguintes tecnologias:

Frontend:

React: Biblioteca para construção da interface de usuário.

TypeScript: Superset do JavaScript que adiciona tipagem estática.

Vite: Ferramenta de build para um desenvolvimento frontend mais rápido.

Axios: Cliente HTTP para realizar requisições à API.

Framer Motion: Para animações fluidas e modernas.

Recharts: Para a criação de gráficos interativos.

React Router DOM: Para gerenciamento de rotas na aplicação.

Formik & Yup: Para construção e validação de formulários.

Backend:

Node.js: Ambiente de execução para o JavaScript no servidor.

Express.js: Framework para a construção da API REST.

PostgreSQL: Banco de dados relacional para armazenamento dos dados.

JWT (JSON Web Tokens): Para a implementação de autenticação segura.

Bcrypt.js: Para a criptografia de senhas.

🛠️ Como Executar o Projeto
Siga os passos abaixo para executar o projeto em seu ambiente local.

Pré-requisitos
Node.js (versão 18.x ou superior)

npm ou Yarn

Uma instância do PostgreSQL rodando.

Instalação
Clone o repositório:

Bash

git clone https://github.com/seu-usuario/jrs-invest.git
cd jrs-invest

Instale as dependências do Backend:

Bash

cd jrs-invest-backend
npm install

Instale as dependências do Frontend:

Bash

cd jrs-invest
npm install
Configuração do Ambiente:

No diretório backend, renomeie o arquivo .env.example para .env.

Preencha as variáveis de ambiente no arquivo .env com as suas credenciais do banco de dados e a chave secreta para o JWT.

Snippet de código

DATABASE_URL="postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO"
JWT_SECRET="SUA_CHAVE_SECRETA_AQUI"
PORT=3001
Rode as Migrações do Banco de Dados:

Execute o script SQL fornecido no projeto para criar as tabelas users e operations.

Execução
Inicie o servidor Backend:

Bash

cd backend
npm run dev
O servidor estará rodando em http://localhost:3001.

Inicie a aplicação Frontend:

Bash

cd frontend
npm run dev
A aplicação estará acessível em http://localhost:5173 (ou outra porta indicada pelo Vite).

👤 Autor
Sérgio Costa

LinkedIn: https://www.linkedin.com/in/s%C3%A9rgio-costa-498a25278/

GitHub: https://github.com/sergiocosta17
