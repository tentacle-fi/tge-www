import React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Typography from "@mui/material/Typography";
import usePaymentProcessorProvider from "hooks/usePaymentProcessor";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import { IOnboardingProgressProps } from "./";
import { styled } from "@mui/material/styles";
import { StepIconProps } from "@mui/material/StepIcon";
import StepConnector, { stepConnectorClasses } from "@mui/material/StepConnector";
import ElectricalServicesIcon from "@mui/icons-material/ElectricalServices";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DownloadIcon from "@mui/icons-material/Download";
import FlagIcon from "@mui/icons-material/Flag";
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";

import { TxConfirmationBlocks } from "utils";

interface ConfirmationProgressProps {
  progress: number;
}

const ConfirmationProgress: React.FC<ConfirmationProgressProps> = ({ progress }) => {
  return (
    <Stack spacing={2} direction="row">
      <CircularProgress variant="determinate" value={progress} />
    </Stack>
  );
};

const OnboardingProgress: React.FC<IOnboardingProgressProps> = ({ steps }) => {
  const [activeStep, setActiveStep] = React.useState(0);
  const { confirmCount } = usePaymentProcessorProvider();

  if (confirmCount === undefined) {
    return <></>;
  }

  const handleNext = (currentStep: number) => {
    if (steps[currentStep] === undefined) {
      console.error("Invalid step", currentStep);
      return;
    }

    try {
      // Execute the step's run function
      const isValid = steps[currentStep].validate();
      if (isValid !== true) {
        console.log("step not complete, isValid !== true");
        steps[currentStep].runFn();
        return;
      }
      steps[currentStep + 1].runFn();
    } catch (e) {
      console.log("OnboardingProgress() threw error while calling the steps runFn:", e);
      return;
    }

    setActiveStep(currentStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const ColorlibStepIconRoot = styled("div")<{
    ownerState: { completed?: boolean; active?: boolean };
  }>(({ theme, ownerState }) => ({
    backgroundColor: theme.palette.mode === "dark" ? theme.palette.grey[700] : "#ccc",
    zIndex: 1,
    color: "#000",
    width: 50,
    height: 50,
    display: "flex",
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
    ...(ownerState.active && {
      background: "#9f7ef7", // light purple
      // backgroundImage:'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',
      boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
    }),
    ...(ownerState.completed && {
      background: "#06d6a0", // green
      // backgroundImage:        'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',
    }),
  }));

  function ColorlibStepIcon(props: StepIconProps) {
    const { active, completed, className } = props;

    const icons: { [index: string]: React.ReactElement } = {
      1: <ElectricalServicesIcon />,
      2: <PriceCheckIcon />,
      3: <QueryBuilderIcon />,
      4: <PlayArrowIcon />,
      5: <DownloadIcon />,
      6: <FlagIcon />,
    };

    return (
      <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
        {icons[String(props.icon)]}
      </ColorlibStepIconRoot>
    );
  }

  const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
      top: 22,
    },
    [`&.${stepConnectorClasses.active}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        background: "#784af4", // purple
        //backgroundImage:'linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)',
      },
    },
    [`&.${stepConnectorClasses.completed}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        background: "#06d6a0", // green
        // backgroundImage:          'linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)',
      },
    },
    [`& .${stepConnectorClasses.line}`]: {
      height: 3,
      border: 0,
      backgroundColor: theme.palette.mode === "dark" ? theme.palette.grey[800] : "#eaeaf0",
      borderRadius: 1,
    },
  }));

  let isNullReceipt = false;
  if (confirmCount === -1) {
    isNullReceipt = true;
  }

  return (
    <Box sx={{ width: "80%", margin: "40px 20px" }}>
      <Stepper alternativeLabel sx={{ width: "100%", margin: "auto" }} activeStep={activeStep} connector={<ColorlibConnector />}>
        {steps.map((label, index) => {
          const stepProps: { executeStep?: () => void } = {};
          const labelProps: {
            optional?: React.ReactNode;
          } = {};
          return (
            <Step key={label.text} {...stepProps}>
              <StepLabel StepIconComponent={ColorlibStepIcon} {...labelProps}>
                {label.text}
              </StepLabel>
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
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <ButtonGroup variant="outlined" sx={{ margin: "10px" }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>

            <Button onClick={() => handleNext(activeStep)}>{activeStep === steps.length - 1 ? "Finish" : "Next"}</Button>
          </ButtonGroup>
          <ConfirmationProgress progress={isNullReceipt ? 1 : (confirmCount / TxConfirmationBlocks) * 100} />
        </Box>
      )}
    </Box>
  );
};

export default OnboardingProgress;
