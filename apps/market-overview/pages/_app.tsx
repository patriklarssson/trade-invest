import { Global, ThemeProvider } from '@emotion/react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { theme } from '@trade-invest/theme';
import { Container } from '@trade-invest/components-ui';
import styled from '@emotion/styled';

const PageWrapper = styled.main(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
  overflow: 'hidden',
}));

function CustomApp({ Component, pageProps }: AppProps) {

  return (
    <ThemeProvider theme={theme[1]}>
      <Global styles={{ body: { margin: 0, backgroundColor: '#f6f6f6' } }} />
      <Head>
        <title>Welcome to market-overview!</title>
      </Head>
      <PageWrapper className="app">
        <Container maxWidth="xl">
          <Component {...pageProps} />
        </Container>
      </PageWrapper>
    </ThemeProvider>
  );
}

export default CustomApp;
