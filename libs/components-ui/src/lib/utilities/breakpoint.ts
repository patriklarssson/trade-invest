import { theme } from '@trade-invest/theme';
import { WithBreakpoint } from '../types/cssProperties';
import type * as CSS from 'csstype';

type ExtractGeneric<Type> = Type extends WithBreakpoint<infer X> ? X : Type;

export const handleBreakpoints = <T>(
  breakpointProp: WithBreakpoint<T> | T,
  propValue: (prop: ExtractGeneric<T> | T) => { [key in keyof CSS.Properties]: unknown }
) => {
  if (!(typeof breakpointProp === 'object'))
    return propValue(breakpointProp);

  const { breakpoint } = theme[0];

  const stylePerBreakpoint = Object.entries(breakpointProp as object).map(
    ([bp, value]: [any, ExtractGeneric<T>]) => {
      return {
        [breakpoint.up(bp)]: {
          ...propValue(value),
        },
      };
    }
  );

  return Object.assign({}, ...stylePerBreakpoint);
};
