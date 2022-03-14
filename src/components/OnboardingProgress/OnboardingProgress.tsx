import React, { useState, useCallback, useEffect } from "react";
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
  confirmCount: number;
}

const ConfirmationProgress: React.FC<ConfirmationProgressProps> = ({ confirmCount }) => {
  const progress = confirmCount > 0 ? (confirmCount / TxConfirmationBlocks) * 100 : 0;

  return (
    <Stack spacing={2} direction="row" sx={{ justifyContent: "center", margin: "10px" }}>
      <CircularProgress variant="determinate" value={progress} />
      <Typography variant="body1" sx={{ lineHeight: "40px" }}>
        {confirmCount} of {TxConfirmationBlocks} confirmations, please wait
      </Typography>
    </Stack>
  );
};

const OnboardingProgress: React.FC<IOnboardingProgressProps> = ({ resetCb, steps }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [activeStepMsg, setActiveStepMsg] = useState("");
  const [activeStepError, setActiveStepError] = useState("");
  const { confirmCount, paymentTx, handleReset } = usePaymentProcessorProvider();

  const onReset = () => {
    // reset all state
    setActiveStep(0);
    setActiveStepMsg("");
    setActiveStepError("");

    if (handleReset !== undefined) {
      handleReset();
    }

    resetCb();
  };

  const handleNext = useCallback(() => {
    if (steps[activeStep] === undefined) {
      console.warn("Invalid step", activeStep);
      return;
    }

    try {
      // Execute the step's run function
      setActiveStepError(""); //reset
      const isValid = steps[activeStep].validate();
      if (isValid !== true) {
        // console.log("handleNext() step not complete");
        if (typeof isValid === "string") {
          setActiveStepError(isValid);
        }
        steps[activeStep].runFn();
        return;
      }

      if (activeStep + 1 < steps.length) {
        steps[activeStep + 1].runFn();
      }
    } catch (e) {
      console.error("handleNext() threw error while calling the steps runFn:", e);
      return;
    }

    setActiveStep(activeStep + 1);
  }, [activeStep, steps]);

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  useEffect(() => {
    if (paymentTx === undefined || paymentTx === "" || handleNext === undefined) {
      return;
    }
    handleNext();
  }, [paymentTx, handleNext]);

  useEffect(() => {
    if (activeStep < steps.length) {
      setActiveStepMsg(steps[activeStep].msg);
    }
  }, [activeStep, steps]);

  const infoMsgStyle = {
    fontStyle: "italic",
    padding: "20px",
    margin: "20px auto",
    minWidth: "400px",
    width: "70%",
    borderRadius: "10px",
  };

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

      {activeStepError !== "" && (
        <Box
          sx={{
            ...infoMsgStyle,
            border: "1px dashed #c90000",
          }}
        >
          {activeStepError}
        </Box>
      )}

      <Box
        sx={{
          ...infoMsgStyle,
          border: "1px dashed #06d6a0",
        }}
      >
        <Typography variant="h6">{activeStepMsg}</Typography>

        {confirmCount !== undefined && confirmCount > -1 && <ConfirmationProgress confirmCount={confirmCount} />}
      </Box>
      {activeStep === steps.length ? (
        <>
          <Typography sx={{ mt: 2, mb: 1 }}>All steps completed - you're finished</Typography>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button variant="contained" onClick={onReset}>
              Reset
            </Button>
          </Box>
        </>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <ButtonGroup variant="outlined" sx={{ margin: "10px" }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>

            <Button onClick={() => handleNext()}>{activeStep === steps.length - 1 ? "Finish" : "Next"}</Button>
          </ButtonGroup>
        </Box>
      )}
    </Box>
  );
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

export default OnboardingProgress;
