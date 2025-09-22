import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  :root {
    /* Paleta de Cores Principal */
    --brand-dark: #1a222e;
    --brand-dark-hover: #344054;
    --brand-light-gray: #f5f8fa;
    --white: #fff;

    /* Cores de Texto */
    --text-primary: #1a222e;
    --text-secondary: #667085;
    --text-light: #888;

    /* Cores de Feedback */
    --success: #00a23b;
    --danger: #f44336;

    /* Outros */
    --border-color: #e0e6ed;

    /* Fontes */
    --font-family-main: 'Inter', sans-serif; /* (Exemplo, certifique-se de importar a fonte no seu index.html se necessário) */
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    background: var(--brand-light-gray);
    color: var(--text-primary);
    font-family: var(--font-family-main);
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
  }

  button {
    cursor: pointer;
    font-family: var(--font-family-main);
  }
`;