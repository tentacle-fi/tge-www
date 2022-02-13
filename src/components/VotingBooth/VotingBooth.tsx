import React, { useEffect, useCallback, useState } from "react";
import Typography from "@mui/material/Typography";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { AvailableFarms } from "farms/AvailableFarms";
import StarIcon from "@mui/icons-material/Star";
import Tooltip from "@mui/material/Tooltip";
import useUbiq from "hooks/useUbiq";
import { useWallet } from "use-wallet";
import { submitVote, getVotingPower, getVotes, getVoteDetails, getWalletVote, IVoteDetails } from "utils/voting";

interface IVotingBoothProps {
  // vote: IVoteDetails;
  voteAddress: string;
}

const VotingBooth: React.FC<IVotingBoothProps> = ({ voteAddress }) => {
  const { account, ethereum } = useWallet();

  const [votingPower, setVotingPower] = useState("0");
  const [myWalletVote, setMyWalletVote] = useState(1);
  const [vote, setVote] = useState<IVoteDetails>();
  const [voteResults, setVoteResults] = useState<Array<number>>();

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
    // console.log("listOfVotes", listOfVotes);

    let results = vote.options.map((v, i) => {
      return 0;
    });

    for (let i = 0; i < listOfVotes.length; i++) {
      results[listOfVotes[i].option - 1] += await getVotingPower(ethereum, account, AvailableFarms, vote);
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

  useEffect(() => {
    fetchVotes();
  }, [fetchVotes]);

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

      <VoteFormComponent results={voteResults} myWalletVote={myWalletVote} votingPower={votingPower} vote={vote} submitFn={submitSelection} />
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
}

const VoteFormComponent: React.FC<IVoteFormProps> = ({ results, vote, myWalletVote, votingPower, submitFn }) => {
  const [selectedValue, setSelectedValue] = useState(0);
  const { BlockNum } = useUbiq();

  useEffect(() => {
    setSelectedValue(myWalletVote - 1);
  }, [myWalletVote]);

  const handleSelectionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(parseInt((event.target as HTMLInputElement).value)); // index + 1, contract rejects 0 votes
  };

  const Radios = () => {
    // style the leading voted candidate (option)
    let winningResultIndex = -1;
    let winningResultTally = 0;

    if (results !== undefined) {
      for (let i = 0; i < results.length; i++) {
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
        <div key={i} style={{ display: "flex", flexDirection: "row", gap: "25px" }}>
          <Typography variant="body1" sx={{ width: "100px", textAlign: "right", lineHeight: "42px" }}>
            {winningResultIndex === i && (
              <Tooltip title={`Leading option`}>
                <StarIcon sx={{ lineHeight: "42px", fontSize: "18px", margin: "8px 8px 0 0" }} />
              </Tooltip>
            )}
            {tally.toFixed(0)}
          </Typography>
          <FormControlLabel value={i} control={<Radio />} label={option} />
        </div>
      );
    });

    if (RBButtons === undefined) {
      return <></>;
    }

    return <>{RBButtons}</>;
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
    <FormControl sx={{ background: "#333", margin: "20px", padding: "15px", borderRadius: "20px" }}>
      <VoteStatus />
      <Typography variant="h4">Vote</Typography>
      <hr style={{ width: "95%", borderColor: "#888" }} />

      <RadioGroup defaultValue={0} value={selectedValue} onChange={handleSelectionChange}>
        <Radios />
      </RadioGroup>
      {vote !== undefined && BlockNum >= vote.startBlock && BlockNum < vote.endBlock && (
        <Button sx={{ marginTop: "20px" }} variant="contained" onClick={() => submitFn(selectedValue + 1)}>
          Vote with {votingPower}!
        </Button>
      )}
    </FormControl>
  );
};

export default React.memo(VotingBooth);
