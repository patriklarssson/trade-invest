import { theme, BreakpointKey } from "@trade-invest/theme";
import { BreakPointToStyle } from "../types/cssProperties";
import type * as CSS from 'csstype';

export const handleBreakpoints = (
  breakpointProp: BreakPointToStyle,
  propValue: (prop: string) => { [key in keyof CSS.Properties]: string }
) => {
  if (typeof breakpointProp === 'string') return propValue(breakpointProp);

  const { breakpoint } = theme[0];

  const stylePerBreakpoint = Object.entries(breakpointProp).map(
    ([bp, value]) => {
      return {
        [breakpoint.up(bp as BreakpointKey)]: {
          ...propValue(value),
        },
      };
    }
  );

  return Object.assign({}, ...stylePerBreakpoint);
};
