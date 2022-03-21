export interface ContextValues {
  paymentTx?: string;
  isConfirmed?: boolean;
  handlePayment?: Function;
  confirmCount?: number;
  handleReset?: Function;
}
