import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  :root {
    /* Espelhando as variáveis do CSS para uso inline se necessário */
    --brand-dark: #111111; 
    --brand-dark-hover: #222222;
    --white: #ffffff;
  }

  body {
    background: var(--background-light);
    color: var(--text-primary);
    font-family: 'Inter', sans-serif;
  }
  
  /* Sobrescreve estilos padrão de botões em styled-components */
  button {
    border-radius: 9999px !important; /* Pill shape forçado */
  }
`;