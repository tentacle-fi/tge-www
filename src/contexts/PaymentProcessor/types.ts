export interface ContextValues {
  paymentTx?: string;
  isConfirmed?: boolean;
  handlePayment?: (paymentSymbol: string, paymentValue: number) => void;
  confirmCount?: number;
  handleReset?: Function;
}
