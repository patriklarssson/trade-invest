import styled from '@emotion/styled';
import { Spacing } from '@trade-invest/theme';
import { HTMLAttributes } from 'react';
import {
  FlexDirection,
  FlexWrap,
  GridColumns,
  WithBreakpoint,
} from '../types/cssProperties';
import { handleBreakpoints } from '../utilities/breakpoint';

interface IGridProps extends HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  // columnSpacing
  // rowSpacing
  component?: React.ElementType;
  container?: boolean;
  direction?: FlexDirection;
  item?: boolean;
  columns?: WithBreakpoint<GridColumns>;
  spacing?: Spacing;
  wrap?: FlexWrap;
  zeroMinWidth?: boolean;
}
const columnWidth = (columnValue: number) =>
  `${Math.round((columnValue / 12) * 10e7) / 10e5}%`;

const GridRoot = styled.div<{ ownerState: IGridProps }>(
  ({ theme, ownerState }) => ({
    boxSizing: 'border-box',

    ...(ownerState.container && {
      display: 'flex',
      flexWrap: ownerState.wrap,
      flexDirection: ownerState.direction,
      ...(ownerState.spacing && {
        marginLeft: `-${theme.spacing(ownerState.spacing)}px`,
        marginTop: `-${theme.spacing(ownerState.spacing)}px`,
        width: `calc(100% + ${theme.spacing(ownerState.spacing)}px)`,
        '>*': {
          paddingLeft: theme.spacing(ownerState.spacing),
          paddingTop: theme.spacing(ownerState.spacing),
          margin: 0,
          flexDirection: ownerState.direction,
          WebkitBoxFlex: 0,
          flexGrow: 0,
        },
      }),
    }),

    ...(ownerState.item && {
      margin: 0,
    }),
    ...(ownerState.zeroMinWidth && {
      minWidth: 0,
    }),
    ...(ownerState.columns &&
      !ownerState.container && {
        ...handleBreakpoints(ownerState.columns, (propValue) => ({
          ...(propValue === 'auto' && {
            flexBasis: 'auto',
            flexGrow: '0',
            flexShrink: '0',
            maxWidth: 'none',
            width: 'auto',
          }),
          ...(propValue !== 'auto' && {
            flexBasis: columnWidth(Number(propValue)),
            maxWidth: columnWidth(Number(propValue)),
          }),
        })),
      }),
  })
);

export function Grid(props: IGridProps) {
  const {
    children,
    component = 'div',
    container = false,
    direction = 'row',
    item = false,
    columns = { xs: 12 },
    spacing = 0,
    wrap = 'wrap',
    zeroMinWidth = false,
    ...other
  } = props;

  const ownerState = {
    ...props,
    container,
    direction,
    item,
    wrap,
    zeroMinWidth,
    spacing,
    columns,
  };
console.log();

  return (
    <GridRoot ownerState={ownerState} as={component} {...other}>
      {children}
    </GridRoot>
  );
}

export default Grid;
