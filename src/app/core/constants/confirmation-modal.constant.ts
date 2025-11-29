export const CONFIRMATION_MODAL = {
  SI: 'SI',
  NO: 'NO',
  CANCELAR: 'CANCELAR'
} as const;

export type ConfirmationModalOption = typeof CONFIRMATION_MODAL[keyof typeof CONFIRMATION_MODAL];
