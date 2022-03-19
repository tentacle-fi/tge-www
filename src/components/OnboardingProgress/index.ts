import { ReactNode } from "react";

export interface IOnboardingProgressProps {
  steps: Array<IOnboardingSteps>;
  resetCb: Function;
  RetryScanComponent: ReactNode;
  retryAttempt: number;
}

export interface IOnboardingSteps {
  text: string;
  runFn: Function;
  validate: Function;
  msg: string;
}

export { default } from "./OnboardingProgress";
