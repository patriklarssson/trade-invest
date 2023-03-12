import { ThemeProvider } from '@emotion/react';
import { addDecorator } from '@storybook/react';
import { withThemes } from '@react-theming/storybook-addon';
// @ts-ignore
import { theme } from '@trade-invest/theme';
// // pass ThemeProvider and array of your themes to decorator
// @ts-ignore
addDecorator(withThemes(ThemeProvider, theme));