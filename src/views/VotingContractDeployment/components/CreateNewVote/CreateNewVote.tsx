import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, styled, TextareaAutosize, TextField, Typography } from "@mui/material";
import useEvm from "hooks/useEvmProvider";
import { ethers } from "ethers";

const ApproxBlocksPerDay = Math.floor((24 * 60 * 60) / 22);
const DefaultStartBlocks = 2 * ApproxBlocksPerDay; // suggested number of blocks from now until the start
const DefaultEndBlocks = 7 * ApproxBlocksPerDay; // suggested number of blocks for the voting window to be open

async function sha256(message: string) {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join(""); // convert bytes to hex string
  return hashHex;
}

const CreateNewVote: React.FC = () => {
  const { BlockNum, evmProvider } = useEvm();

  const [startBlock, setStartBlock] = useState(DefaultStartBlocks);
  const [endBlock, setEndBlock] = useState(DefaultEndBlocks);
  const [title, setTitle] = useState<string>();
  const [desc, setDesc] = useState<string>();
  const [options, setOptions] = useState<Array<string>>(["", "", "", "", "", "", "", ""]);
  const [abi, setAbi] = useState<string>();
  const [bytecode, setBytecode] = useState<string>();

  const [validationComplete, setValidationComplete] = useState(0);
  const [validationErrors, setValidationErrors] = useState("");

  const fetchAbiBytecode = useCallback(async () => {
    const GITHUB_URL = "https://raw.githubusercontent.com/tentacle-fi/smart-contracts/main/Voting/compiled/";

    const load = [
      {
        // confirmed with: shasum -a 256
        hash: "ec6921ebfd253c9735349c515b3f49ceab6470c5e1adcbc352105e59c8dd282a",
        url: "abi.json",
        setFn: setAbi,
      },
      {
        hash: "c91688b99422781ad1dacba6d868bce72f6374fdf7c009edc25f7ca9ceb747f7",
        url: "bytecode.bin",
        setFn: setBytecode,
      },
    ];

    try {
      for (let i = 0; i < load.length; i++) {
        const l = load[i];

        let tmp = "";
        await fetch(`${GITHUB_URL}${l.url}?r=${Math.random().toFixed(6)}`)
          .then((res) => res.text())
          .then((data) => (tmp = data));

        // test it's valid json, will throw error if invaid
        if (l.hash !== (await sha256(tmp))) {
          throw new Error(`${l.url} sha256 did not load properly and then match!`);
        }
        l.setFn(tmp);
      }
    } catch (e) {
      console.error("failed to load", e);
    }
  }, []);

  const handleUpdate = useCallback((reason: "startBlock" | "endBlock" | "desc" | "title" | "option[]", value: string, index?: number) => {
    // console.log("updating:", reason, "with", value);

    switch (reason) {
      case "startBlock":
        setStartBlock(parseInt(value));
        break;
      case "endBlock":
        setEndBlock(parseInt(value));
        break;
      case "desc":
        console.log("value", value.indexOf("\n"));
        setDesc(value);
        break;
      case "title":
        setTitle(value);
        break;
      case "option[]":
        if (index === undefined) {
          console.error("index is expected to be set");
          return;
        }
        setOptions((prev) => {
          let tmp = [...prev];
          if (index < prev.length) {
            // update at index
            tmp[index] = value;

            return tmp;
          }
          return prev;
        });
        break;
      default:
        console.log("handleUpdate uknown option:", reason);
    }
  }, []);

  const handleValidate = useCallback(() => {
    // validates that the contract should accept these params
    // even if they are not suggested values
    //
    // must have:
    // start > blockheight (auto)
    // end > start (check)
    // title >= 15 chars (check)
    // desc >= 200 chars (check)
    // options.length >= 2 (check)
    // option[n] >= 2 chars (check)
    // wallet connected (check)
    let error = "";

    if (startBlock <= 0) {
      error = "Start Block cannot be less than zero.";
    }
    if (endBlock <= 0) {
      error = "End Block cannot be less than zero.";
    }
    if (title === undefined || title.length < 15) {
      error = "Title must contain at least 15 characters.";
    }
    if (desc === undefined || desc.length < 200) {
      error = "Description must contain at least 200 characters.";
    }
    let validOptions = options.filter((f) => f.length >= 2);
    if (validOptions.length < 2) {
      error = "Must have 2 or more voting options. Each Option must have 2 or more characters.";
    }
    if (evmProvider === undefined) {
      error = "Must have a wallet connected, such as MetaMask or Sparrow";
    }
    if (abi === undefined || bytecode === undefined) {
      error = "Refresh page and try again, unable to load voting contract abi and bytecode";
    }

    if (error === "") {
      setValidationComplete(2); // success
    } else {
      setValidationComplete(1); // error
    }
    setValidationErrors(error);
  }, [startBlock, endBlock, title, desc, options, evmProvider, abi, bytecode]);

  const handleDeployContract = useCallback(async () => {
    console.log("handleDeployContract");
    if (abi === undefined || bytecode === undefined) {
      return;
    }

    const signer = evmProvider.getSigner();
    const contract = new ethers.ContractFactory(abi, bytecode, signer);

    const startBlockHeight = BlockNum + startBlock;
    const endBlockHeight = startBlockHeight + endBlock;
    const validOptions = options.filter((f) => f.length >= 2);
    const constructorArgs = [startBlockHeight, endBlockHeight, title, desc, validOptions];

    try {
      await contract.deploy(...constructorArgs);
    } catch (e) {
      console.error("failed to deploy contract", e);
    }
  }, [evmProvider, BlockNum, startBlock, endBlock, title, desc, options, abi, bytecode]);

  const AllOptions = useMemo(() => {
    const totalOptions = 8;

    // return options?.map((option, i) => {
    let ret = [];
    for (let i = 0; i < totalOptions; i++) {
      ret.push(
        <Box key={i}>
          <StyledTextField
            defaultValue={""}
            variant="outlined"
            color="primary"
            label={`Option #${i + 1}`}
            onChange={(e) => handleUpdate("option[]", e.target.value, i)}
          />
        </Box>
      );
    }

    return ret;
  }, [handleUpdate]);

  const VotingWindowLengthAlert = useMemo(() => {
    let ret = [];
    const ErrorAlert = (
      <Alert variant="filled" color="error">
        Error: voting Start and End needs to be greater than zero. Start Block should be more than 1 day in the future. Duration of vote should be
        more than 1 day.
      </Alert>
    );

    if (startBlock < ApproxBlocksPerDay || endBlock < ApproxBlocksPerDay) {
      return ErrorAlert;
    }

    try {
      const votingStartDays = Math.floor(startBlock / ApproxBlocksPerDay);

      if (votingStartDays < 2 || votingStartDays > 7) {
        ret.push(
          <Alert
            key="warn-window-start-short-long"
            variant="filled"
            color="warning"
          >{`Warning: voting window is approx ${votingStartDays} days into the future. Consider changing the Start Block!`}</Alert>
        );
      } else {
        ret.push(
          <Alert
            key="info-window-start-good"
            variant="filled"
            color="info"
          >{`Info: voting would start in approx ${votingStartDays} days from now`}</Alert>
        );
      }

      const votingDuration = Math.floor(Math.abs(endBlock - startBlock) / ApproxBlocksPerDay);

      if (votingDuration < 2 || votingDuration > 7) {
        ret.push(
          <Alert
            key="warn-window-duration-short-long"
            variant="filled"
            color="warning"
          >{`Warning: voting window is approx ${votingDuration} days long. Consider changing the End Block!`}</Alert>
        );
      } else {
        ret.push(
          <Alert key="info-window-duration-good" variant="filled" color="info">{`Info: voting window is approx ${votingDuration} days long`}</Alert>
        );
      }
    } catch (e) {
      return ErrorAlert;
    }

    return ret;
  }, [startBlock, endBlock]);

  useEffect(() => {
    fetchAbiBytecode();
  }, [fetchAbiBytecode]);

  return (
    <FlexBox sx={{ maxWidth: "90%" }}>
      <FlexBox>
        <Button onClick={() => handleValidate()} variant="outlined">
          Validate
        </Button>
        <Button disabled={validationComplete !== 2} onClick={() => handleDeployContract()} variant="outlined">
          Deploy
        </Button>

        {validationComplete === 1 && (
          <Alert sx={{ width: "100%" }} variant="filled" color="error">
            {validationErrors}
          </Alert>
        )}
        {validationComplete === 2 && (
          <Alert sx={{ width: "100%" }} variant="filled" color="success">
            Settings appear valid, deploy!
          </Alert>
        )}
      </FlexBox>

      <Typography>
        Voting Start and End Blocks: Must be in the future. Start must be less than the End. The gap between them is the number of blocks when a vote
        is open. Votes should be open for a reasonably long amount of time for voters to get their ballots cast. The Start block is the height at
        which all voting power is calculated. Suggesting {DefaultStartBlocks} blocks (from the current block) for a Start block. Suggesting{" "}
        {DefaultEndBlocks} blocks (after the Start block) for the End block. All block numbers relative to current block height.
      </Typography>

      <FlexBox>
        <StyledTextField
          defaultValue={startBlock}
          inputProps={{ type: "number" }}
          variant="outlined"
          color="primary"
          label={"Start in Blocks"}
          onChange={(e) => handleUpdate("startBlock", e.target.value)}
        />
        <StyledTextField
          defaultValue={endBlock}
          inputProps={{ type: "number" }}
          variant="outlined"
          color="primary"
          label={"End after Blocks"}
          onChange={(e) => handleUpdate("endBlock", e.target.value)}
        />
        {VotingWindowLengthAlert}
      </FlexBox>

      <Typography>Voting Title: Must contain at least 15 characters.</Typography>
      <StyledTextField
        sx={{ width: "400px" }}
        variant="outlined"
        color="primary"
        label={"Title"}
        onChange={(e) => handleUpdate("title", e.target.value)}
      />

      <Typography>
        Voting Description: Must contain at least 200 characters and can have a maximum limit based on the gas limit for the chain (up to several
        thousand characters). Expect to write several paragraphs to describe the vote, implications and options.
      </Typography>
      <StyledTextareaAutosize color="primary" minRows={5} placeholder="Description" onChange={(e) => handleUpdate("desc", e.target.value)} />

      <Typography>
        Voting Options: Must offer at least 2 options, with each option having at least 2 characters describing the option (eg, 'no' and 'yes' are
        valid options)
      </Typography>
      <FlexBox sx={{ minWidth: "200px", maxWidth: "460px", gap: "0" }}>{AllOptions}</FlexBox>
    </FlexBox>
  );
};

const FlexBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: "20px",
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  input: {
    color: "#fff",
  },
  background: "#444",
  padding: "5px",
  borderRadius: "10px",
  margin: "10px",
}));

const StyledTextareaAutosize = styled(TextareaAutosize)(({ theme }) => ({
  background: "#444",
  color: "#fff",
  minWidth: "400px",
  margin: "15px",
}));

export default CreateNewVote;
