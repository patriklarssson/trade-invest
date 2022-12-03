import { ComponentMeta } from '@storybook/react';
import { Grid } from './Grid';

export default {
  component: Grid,
  title: 'Grid',
} as ComponentMeta<typeof Grid>;

export const GridLayout = () => {
  return (
    <Grid container spacing={5}>
        <Grid item columns={{xs: 3, xl: 6}}>
            <div style={{height: "100%", width: "100%", backgroundColor: "red"}}>Yes</div>
        </Grid>
        <Grid columns={{xs: 6, xl: 6}}>
            <div style={{height: "100%", width: "100%", backgroundColor: "blue"}}>Yes</div>
        </Grid>
        <Grid item columns={{xs: 3, xl: 12}}>
            <div style={{height: "100%", width: "100%", backgroundColor: "orange"}}>Yes</div>
        </Grid>
    </Grid>
  );
};
