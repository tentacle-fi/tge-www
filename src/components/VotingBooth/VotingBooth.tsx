import React, { useEffect, useCallback, useState } from "react";
import Typography from "@mui/material/Typography";
import { IVoteDetails } from "./index";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import { AvailableFarms } from "farms/AvailableFarms";
import { useWallet } from "use-wallet";
import { submitVote, getVotingPower, getVoteDetails, getWalletVote } from "utils/voting";

interface IVotingBoothProps {
  // vote: IVoteDetails;
  voteAddress: string;
}

const VotingBooth: React.FC<IVotingBoothProps> = ({ voteAddress }) => {
  const { account, ethereum } = useWallet();
  const [votingPower, setVotingPower] = useState("0");
  const [myWalletVote, setMyWalletVote] = useState(1);
  const [vote, setVote] = useState<IVoteDetails>();

  const fetchVotingPower = useCallback(async () => {
    if (!ethereum || !account || AvailableFarms.length < 1) {
      return;
    }

    setVotingPower((await getVotingPower(ethereum, account, AvailableFarms, voteAddress)).toFixed(0));
  }, [account, ethereum, voteAddress]);

  // const fetchVotes = useCallback(async () => {
  //   if (!ethereum) {
  //     return;
  //   }
  //   console.log("fetchVotes", await getVotes(ethereum, voteAddress));
  // }, [ethereum, voteAddress]);

  const fetchVoteDetails = useCallback(async () => {
    console.log("getVoteDetails", await getVoteDetails(ethereum, voteAddress));
  }, []);

  const fetchMyVote = useCallback(async () => {
    if (!ethereum || !account) {
      return;
    }
    setMyWalletVote(await getWalletVote(account, ethereum, voteAddress));
  }, [ethereum, voteAddress, account]);

  const submitSelection = useCallback(
    (voteOption: number) => {
      console.log("voteOption", voteOption);
      if (!ethereum || !account || voteOption === 0) {
        return;
      }

      submitVote(ethereum, account, voteOption, voteAddress);
    },
    [ethereum, account, voteAddress]
  );

  useEffect(() => {
    fetchVoteDetails();
  }, [fetchVoteDetails]);

  useEffect(() => {
    fetchVotingPower();
  }, [fetchVotingPower]);

  // useEffect(() => {
  //   fetchVotes();
  // }, [fetchVotes]);

  useEffect(() => {
    fetchMyVote();
  }, [fetchMyVote]);

  if (vote === undefined) {
    return <></>;
  }

  return (
    <>
      <Typography variant="h4">{vote.name}</Typography>
      <Typography variant="body1">{vote.shortDesc}</Typography>

      <VoteFormComponent myWalletVote={myWalletVote} votingPower={votingPower} optionList={vote.options} submitFn={submitSelection} />
    </>
  );
};

interface IVoteFormProps {
  myWalletVote: number;
  votingPower: string;
  optionList: Array<string>;
  submitFn: Function;
}

const VoteFormComponent: React.FC<IVoteFormProps> = ({ myWalletVote, votingPower, optionList, submitFn }) => {
  const [selectedValue, setSelectedValue] = useState(0);

  useEffect(() => {
    console.log("myWalletVote", myWalletVote);
    setSelectedValue(myWalletVote - 1);
  }, [myWalletVote]);

  const handleSelectionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(parseInt((event.target as HTMLInputElement).value)); // index + 1, contract rejects 0 votes
  };

  const Radios = optionList.map((option, i) => {
    return <FormControlLabel key={i} value={i} control={<Radio />} label={option} />;
  });

  return (
    <FormControl sx={{ background: "#333", margin: "20px", padding: "15px", borderRadius: "20px" }}>
      <RadioGroup defaultValue={0} value={selectedValue} onChange={handleSelectionChange}>
        {Radios}
      </RadioGroup>
      <Button variant="contained" onClick={() => submitFn(selectedValue + 1)}>
        Vote with {votingPower}!
      </Button>
    </FormControl>
  );
};

export default React.memo(VotingBooth);
