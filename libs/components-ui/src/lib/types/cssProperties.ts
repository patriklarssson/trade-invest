import { Breakpoint } from '@trade-invest/theme';
import type * as CSS from 'csstype';

export type WithBreakpoint<T> = { [breakpoint in keyof Breakpoint]?: T };

export type FlexDirection = Exclude<CSS.Property.FlexDirection, CSS.Globals>;

export type JustifyContent =
  | Exclude<CSS.DataType.ContentDistribution, 'stretch'>
  | Exclude<CSS.DataType.ContentPosition, 'start' | 'end'>;

export type AlignItems =
  | Exclude<
      CSS.DataType.SelfPosition,
      'end' | 'start' | 'self-end' | 'self-start'
    >
  | 'baseline'
  | 'stretch';

export type BasicTextAlign = 'center' | 'left' | 'right';

export type Orientation = 'horizontal' | 'vertical';

export type ColorTypes =
  | 'inherit'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'info'
  | 'warning';

export type BaseSize = 'small' | 'medium' | 'large';

type AllCombined =
  | FlexDirection
  | JustifyContent
  | AlignItems
  | BasicTextAlign
  | Orientation
  | ColorTypes
  | BaseSize;

export type BreakPointToStyle = WithBreakpoint<AllCombined> | AllCombined;
