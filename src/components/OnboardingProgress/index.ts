export interface IOnboardingProgressProps {
  steps: Array<IOnboardingSteps>;
  resetCb: Function;
}

export interface IOnboardingSteps {
  text: string;
  runFn: Function;
  validate: Function;
  msg: string;
}

export { default } from "./OnboardingProgress";
