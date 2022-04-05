import React, { useEffect, useState, useCallback, useMemo } from "react";
import Page from "components/Page";
import PageHeader from "components/PageHeader";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import VotingBooth from "components/VotingBooth";
import { getDeployedVotingContracts } from "utils/voting";
import Typography from "@mui/material/Typography";
import { useWallet } from "use-wallet";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Grid from "@mui/material/Grid";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CancelIcon from "@mui/icons-material/Cancel";

const SmallCheck = () => {
  return <CheckBoxIcon fontSize="small" />;
};

const SmallCancel = () => {
  return <CancelIcon fontSize="small" />;
};

const VoteSources = () => {
  return (
    <>
      <Grid sx={{ display: "flex", justifyContent: "center" }} container direction="row">
        <Grid item>
          <Typography sx={{ mt: "10px" }} variant="h6">
            Weight currently includes:
          </Typography>
          <List sx={{ justifyContent: "center" }} dense={true}>
            <ListItem>
              <SmallCheck />
              INK holdings
            </ListItem>
            <ListItem>
              <SmallCheck />
              INK held in farming contracts
            </ListItem>
            <ListItem>
              <SmallCheck />
              INK provided as LP
            </ListItem>
          </List>
        </Grid>
        <Grid sx={{ marginLeft: "80px" }} item>
          <Typography sx={{ mt: "10px" }} variant="h6">
            Weight <u>DOES NOT</u> include:
          </Typography>
          <List>
            <ListItem>
              <SmallCancel />
              Un-harvested farmed INK
            </ListItem>
          </List>
        </Grid>
      </Grid>
    </>
  );
};

const Instructions = () => {
  return (
    <>
      <Typography variant="h4">How does it work?</Typography>

      <Typography sx={{ width: "80%", mt: "5px" }}>
        After connecting your wallet you will see ballots populated on this page; these ballots are from the Ubiq blockchain. Each ballot is a
        separate smart contract and that contract contains the details of the ballot (description, summary, vote options, etc...). Those details are
        read from the contract and displayed on the frontend. Voting weight is calculated based on the "start_block" value in the ballot contract. It
        works similar to a snapshot in that everyone's weight is calculated from the same block, and that block is known to everyone. This way, users
        aren't able to manipulate their voting weight during the course of the vote.
      </Typography>
      <VoteSources />
    </>
  );
};

const Governance: React.FC = () => {
  const { status } = useWallet();

  const [invalidBallots, setInvalidBallots] = useState<Array<string>>();
  const [allBallots, setAllBallots] = useState<Array<string>>();
  const [validBallots, setValidBallots] = useState<Array<string>>();

  const fetchInvalidVoteList = useCallback(async () => {
    // list of invalid ballots that should not be voted on.
    // either they had the wrong params deployed or some other error that causes them to be unwanted.
    // the voting contract doesn't have a way to 'destroy' or invalidate a vote contract.
    // this is by design.
    const GITHUB_URL =
      "https://raw.githubusercontent.com/tentacle-fi/tge-www/master/src/views/Governance/invalidBallots.json?r=" + Math.random().toFixed(6);

    try {
      let tmp = [] as string[];
      await fetch(GITHUB_URL)
        .then((res) => res.json())
        .then((data) => (tmp = data));

      setInvalidBallots(tmp?.map((f) => f.toLowerCase()));
    } catch (e) {
      console.error("failed to load", e);
    }
  }, []);

  const fetchAllVotes = useCallback(async () => {
    const tmp = await getDeployedVotingContracts();
    setAllBallots(tmp);
  }, []);

  useEffect(() => {
    fetchInvalidVoteList();
    fetchAllVotes();
  }, [fetchAllVotes, fetchInvalidVoteList]);

  useEffect(() => {
    if (invalidBallots === undefined || allBallots === undefined) {
      return;
    }
    setValidBallots(allBallots.filter((f) => invalidBallots.indexOf(f) < 0));
  }, [invalidBallots, allBallots]);

  const Votes = useMemo(() => {
    return validBallots?.map((v, i) => {
      return <VotingBooth key={i} voteAddress={v} />;
    });
  }, [validBallots]);

  if (status === "disconnected") {
    return (
      <Page>
        <PageHeader
          icon={<HowToVoteIcon sx={{ fontSize: "96px" }} />}
          title="Tentacle.Finance Vote"
          subtitle="On-chain voting via smart contracts!"
        />
        <Instructions />
        <hr style={{ width: "60%", marginTop: "25px" }} />
        <Typography variant="h5">Please connect your wallet to vote.</Typography>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader icon={<HowToVoteIcon sx={{ fontSize: "96px" }} />} title="Tentacle.Finance Vote" subtitle="On-chain voting via smart contracts!" />
      <Instructions />
      {Votes}
    </Page>
  );
};

export default React.memo(Governance);
