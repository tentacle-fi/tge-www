import React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { IOnboardingProgressProps } from "./";

const OnboardingProgress: React.FC<IOnboardingProgressProps> = ({ steps }) => {
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = (currentStep: number) => {
    if (steps[currentStep] === undefined) {
      console.error("Invalid step", currentStep);
      return;
    }

    try {
      // Execute the step's run function
      steps[currentStep].runFn();
    } catch (e) {
      console.log("OnboardingProgress() threw error while calling the steps runFn:", e);
      return;
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Box sx={{ width: "80%" }}>
      <Stepper sx={{ width: "80%" }} activeStep={activeStep}>
        {steps.map((label, index) => {
          // console.log(label.text + label.runFn);
          const stepProps: { executeStep?: () => void } = {};
          const labelProps: {
            optional?: React.ReactNode;
          } = {};
          return (
            <Step key={label.text} {...stepProps}>
              <StepLabel {...labelProps}>{label.text}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === steps.length ? (
        <>
          <Typography sx={{ mt: 2, mb: 1 }}>All steps completed - you're finished</Typography>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button onClick={handleReset}>Reset</Button>
          </Box>
        </>
      ) : (
        <>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
              Back
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />

            <Button onClick={() => handleNext(activeStep)}>{activeStep === steps.length - 1 ? "Finish" : "Next"}</Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default OnboardingProgress;
