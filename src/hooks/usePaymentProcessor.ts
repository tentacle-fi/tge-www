import { useContext } from "react";
import { PaymentProcessorContext } from "../contexts/PaymentProcessor";

const usePaymentProcessor = () => {
  return { ...useContext(PaymentProcessorContext) };
};

export default usePaymentProcessor;
