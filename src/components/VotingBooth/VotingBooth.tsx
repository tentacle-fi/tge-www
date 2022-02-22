import React, { useEffect, useCallback, useState } from "react";
import Typography from "@mui/material/Typography";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { AvailableFarms } from "farms/AvailableFarms";
import useUbiq from "hooks/useUbiq";
import { useWallet } from "use-wallet";
import { submitVote, getVotingPower, getVotes, getVoteDetails, getWalletVote, IVoteDetails } from "utils/voting";
import LinearProgress, { LinearProgressProps } from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import useFarming from "hooks/useFarming";
import Alert from "@mui/material/Alert";

const LinearProgressWithLabel = (props: LinearProgressProps & { value: number }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="white">{`${isNaN(props?.value) ? 0 : props.value.toFixed(2)}%`}</Typography>
      </Box>
    </Box>
  );
};

interface IVotingBoothProps {
  // vote: IVoteDetails;
  voteAddress: string;
}

const VotingBooth: React.FC<IVotingBoothProps> = ({ voteAddress }) => {
  const { account, ethereum } = useWallet();
  const { setConfirmModal } = useFarming();
  const { BlockNum } = useUbiq();

  const [votingPower, setVotingPower] = useState("0");
  const [myWalletVote, setMyWalletVote] = useState(1);
  const [vote, setVote] = useState<IVoteDetails>();
  const [voteResults, setVoteResults] = useState<Array<number>>();
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteError, setVoteError] = useState("");

  const fetchVotingPower = useCallback(async () => {
    if (!ethereum || !account || AvailableFarms.length < 1 || vote === undefined) {
      return;
    }

    setVotingPower((await getVotingPower(ethereum, account, AvailableFarms, vote)).toFixed(0));
  }, [account, ethereum, vote]);

  const fetchVotes = useCallback(async () => {
    if (!ethereum || !account || !vote) {
      return;
    }
    const listOfVotes = await getVotes(ethereum, vote.contractAddress);

    let results = vote.options.map((v, i) => {
      return 0;
    });

    for (let i = 0; i < listOfVotes.length; i++) {
      results[listOfVotes[i].option - 1] += await getVotingPower(ethereum, listOfVotes[i].address, AvailableFarms, vote);
    }

    setVoteResults(results);
  }, [ethereum, vote, account]);

  const fetchVoteDetails = useCallback(async () => {
    if (!ethereum || !voteAddress) {
      return;
    }

    const results = (await getVoteDetails(ethereum, voteAddress)) as IVoteDetails;

    if (results === undefined) {
      return;
    }

    // setVote({startBlock: results.startBlock, endBlock:results.endBlock, desc:results.desc, title: results.title, options:results.options, contractAddress: voteAddress} as IVoteDetails);
    setVote({ ...results, contractAddress: voteAddress });
  }, [ethereum, voteAddress]);

  const fetchMyVote = useCallback(async () => {
    if (!ethereum || !account || !voteAddress) {
      return;
    }
    const myVote = await getWalletVote(account, ethereum, voteAddress);

    if (myVote > 0) {
      setHasVoted(true);
    }

    setMyWalletVote(myVote);
  }, [ethereum, voteAddress, account]);

  const submitSelection = useCallback(
    async (voteOption: number) => {
      if (voteOption === 0) {
        setVoteError("Select a candidate first!");
        return;
      }

      if (!ethereum || !account) {
        return;
      }
      setVoteError("");

      setConfirmModal(true);
      setIsVoting(true);
      await submitVote(ethereum, account, voteOption, voteAddress);
      setIsVoting(false);
      setConfirmModal(false);
    },
    [ethereum, account, voteAddress, setConfirmModal]
  );

  useEffect(() => {
    fetchVoteDetails();
  }, [fetchVoteDetails]);

  useEffect(() => {
    fetchVotingPower();
  }, [fetchVotingPower]);

  useEffect(() => {
    fetchVotes();
  }, [fetchVotes, BlockNum]);

  useEffect(() => {
    fetchMyVote();
  }, [fetchMyVote]);

  if (vote === undefined) {
    return <></>;
  }

  return (
    <>
      <hr style={{ width: "60%", margin: "40px 10px", borderColor: "#555" }} />

      <Typography variant="h4">{vote.title}</Typography>

      <Typography variant="body1" sx={{ minWidth: "320px", width: "90%", maxWidth: "900px" }}>
        {vote.desc}
      </Typography>

      <VoteFormComponent
        voteError={voteError}
        hasVoted={hasVoted}
        isVoting={isVoting}
        results={voteResults}
        myWalletVote={myWalletVote}
        votingPower={votingPower}
        vote={vote}
        submitFn={submitSelection}
      />
    </>
  );
};

interface IVoteFormProps {
  myWalletVote: number;
  votingPower: string;
  // optionList: Array<string>;
  vote: IVoteDetails | undefined;
  submitFn: Function;
  results?: Array<number>;
  isVoting: boolean;
  hasVoted: boolean;
  voteError: string;
}

const VoteFormComponent: React.FC<IVoteFormProps> = ({ voteError, hasVoted, isVoting, results, vote, myWalletVote, votingPower, submitFn }) => {
  const [selectedValue, setSelectedValue] = useState(0);
  const { BlockNum } = useUbiq();

  const handleSelectionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(parseInt((event.target as HTMLInputElement).value)); // index + 1, contract rejects 0 votes
  };

  useEffect(() => {
    setSelectedValue(myWalletVote - 1);
  }, [myWalletVote]);

  const Radios = () => {
    // style the leading voted candidate (option)
    let winningResultIndex = -1;
    let winningResultTally = 0;
    let weightTotal = 0;

    if (results !== undefined) {
      for (let i = 0; i < results.length; i++) {
        weightTotal += results[i];
        if (results[i] > winningResultTally) {
          winningResultTally = results[i];
          winningResultIndex = i;
        }
      }
    }

    const RBButtons = vote?.options.map((option, i) => {
      let tally = 0;
      if (results !== undefined) {
        tally = results[i];
      }

      return (
        <React.Fragment key={i}>
          <Grid item xs={4}>
            <Typography variant="body1" sx={{ textAlign: "right", lineHeight: "42px" }}>
              {tally.toFixed(0)}
            </Typography>
          </Grid>

          <Grid item xs={4}>
            <Box sx={{ padding: "10px" }}>
              <LinearProgressWithLabel color={i === winningResultIndex ? "primary" : "warning"} value={(tally / weightTotal) * 100} />
            </Box>
          </Grid>

          <Grid item xs={4}>
            <FormControlLabel value={i} control={<Radio />} label={option} />
          </Grid>
        </React.Fragment>
      );
    });

    if (RBButtons === undefined) {
      return <></>;
    }

    return (
      <Grid container justifyContent="center" alignItems="center" spacing={2}>
        {RBButtons}
      </Grid>
    );
  };

  const VoteStatus = () => {
    if (vote === undefined) {
      return <></>;
    }
    return (
      <div style={{ marginLeft: "20px", width: "200px", position: "absolute", right: "20px" }}>
        {vote.startBlock > BlockNum && <Chip color="primary" label={`Voting starts in ${vote.startBlock - BlockNum} blocks!`} variant="filled" />}

        {vote.startBlock <= BlockNum && vote.endBlock > BlockNum && (
          <Chip color="primary" label={`Voting ends in ${vote.endBlock - BlockNum} blocks!`} variant="outlined" />
        )}

        {vote.endBlock <= BlockNum && <Chip color="warning" label={`Voting Finished!`} variant="filled" />}
      </div>
    );
  };

  return (
    <FormControl sx={{ background: "#333", margin: "20px", padding: "15px", borderRadius: "20px", minWidth: "320px" }}>
      <VoteStatus />
      <Typography variant="h4">Vote</Typography>
      <hr style={{ width: "95%", borderColor: "#888" }} />

      <RadioGroup defaultValue={0} value={selectedValue} onChange={handleSelectionChange}>
        <div style={{ minWidth: "320px", width: "100%" }}>
          <Radios />
        </div>
      </RadioGroup>
      {vote !== undefined && BlockNum >= vote.startBlock && BlockNum < vote.endBlock && (
        <Button sx={{ marginTop: "20px" }} variant="contained" onClick={() => submitFn(selectedValue + 1)}>
          Vote with {votingPower}!
        </Button>
      )}

      {isVoting === false && hasVoted === false && (
        <Typography variant="h5" sx={{ textAlign: "center", padding: "15px" }}>
          Don't forget to cast your vote!
        </Typography>
      )}

      {hasVoted === true && (
        <Typography variant="body1">Thank you for voting! Check back after the vote has finished to get the final results.</Typography>
      )}

      {voteError !== "" && <Alert severity="error">{voteError}</Alert>}
    </FormControl>
  );
};

export default React.memo(VotingBooth);
