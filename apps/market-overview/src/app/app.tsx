import styled from '@emotion/styled';
import { Stack } from '@trade-invest/components-ui';

const StyledApp = styled.h1(({theme}) => ({
  color: theme.palette.primary.main
}))

export function App() {
  return (
    <Stack spacing={6} direction="row">
      <StyledApp>YEET1</StyledApp>
      <StyledApp>123</StyledApp>
    </Stack>
  );
}

export default App;
