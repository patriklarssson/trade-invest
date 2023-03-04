const zIndexProps = {
  mobileStepper: 1000,
  fab: 1050,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
} as const;

export type ZIndex = keyof typeof zIndexProps
export const zIndex = (index: ZIndex | undefined) => index ? zIndexProps[index] : undefined