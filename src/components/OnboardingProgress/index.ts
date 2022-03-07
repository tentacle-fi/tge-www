export interface IOnboardingProgressProps {
  steps: Array<IOnboardingSteps>;
}

export interface IOnboardingSteps {
  text: string;
  runFn: Function;
}

export { default } from "./OnboardingProgress";
