// import { theme, BreakpointKey } from "@trade-invest/theme";
// import { BreakPointToStyle } from "../types/cssProperties";
// import type * as CSS from 'csstype';

// export const handleBreakpoints = (
//   breakpointProp: BreakPointToStyle,
//   propValue: (prop: string) => { [key in keyof CSS.Properties]: string }
// ) => {
//   if (typeof breakpointProp === 'string') return propValue(breakpointProp);

//   const { breakpoint } = theme[0];

//   const stylePerBreakpoint = Object.entries(breakpointProp).map(
//     ([bp, value]) => {
//       return {
//         [breakpoint.up(bp as BreakpointKey)]: {
//           ...propValue(value),
//         },
//       };
//     }
//   );

//   return Object.assign({}, ...stylePerBreakpoint);
// };

import { theme, BreakpointKey, Spacing } from '@trade-invest/theme';
import { BreakPointToStyle, WithBreakpoint } from '../types/cssProperties';
import type * as CSS from 'csstype';

type ExtractGeneric<Type> = Type extends WithBreakpoint<infer X> ? X : Type;

export const handleBreakpoints = <T>(
  breakpointProp: WithBreakpoint<T> | T,
  propValue: (prop: ExtractGeneric<T>) => object
) => {
  if (!(typeof breakpointProp === 'object'))
    return propValue(breakpointProp as any);

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
