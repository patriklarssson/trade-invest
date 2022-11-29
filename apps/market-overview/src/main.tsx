import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@emotion/react';
import { theme } from '@trade-invest/theme';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import App from './app/app';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

console.log(theme[0]);


root.render(
  <StrictMode>
    <ThemeProvider theme={theme[0]}>
        <App />
    </ThemeProvider>
  </StrictMode>
);
