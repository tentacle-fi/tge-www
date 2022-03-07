import React, { useCallback, useState } from "react";
import Page from "components/Page";
import TxTable from "components/TxTable";
import PayButton from "components/PayButton";
import OnboardingProgress, { IOnboardingSteps } from "components/OnboardingProgress";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useWallet } from "use-wallet";
import usePaymentProcessorProvider from "hooks/usePaymentProcessor";
import { scanStart, getAllTxDetails, resultsToCSV } from "tx-download";
import { IDatagridResults } from "tx-download/interfaces";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import LinearProgress from "@mui/material/LinearProgress";

const SmallCheck = () => {
  return <CheckBoxIcon fontSize="small" />;
};

const Introduction = () => {
  return (
    <>
      <Typography variant="h4">Welcome to Tx Download!</Typography>
      <Typography sx={{ width: "80%" }} variant="h5">
        Tx Download will help you download transaction history to aid with recordkeeping, tax reporting, and more. To get started, connect the wallet
        account you wish to download history for.
      </Typography>
      <OnboardingSteps />
    </>
  );
};

const OnboardingSteps = () => {
  return (
    <Grid sx={{ display: "flex", justifyContent: "center" }} container direction="row">
      <Grid item>
        <Typography sx={{ mt: "10px", textAlign: "center" }} variant="h6">
          Process
        </Typography>
        <List sx={{ justifyContent: "center" }} dense={true}>
          <ListItem>
            <SmallCheck />
            Pay 100 UBQ
          </ListItem>
          <ListItem>
            <SmallCheck />
            Click Scan button to initiate a scan of the connected address
          </ListItem>
          <ListItem>
            <SmallCheck />
            When the scan completes, review the results below
          </ListItem>
          <ListItem>
            <SmallCheck />
            Click the download button to save your data
          </ListItem>
        </List>
      </Grid>
    </Grid>
  );
};

interface ScanProgressBarProps {
  progress: number;
}

const ScanProgressBar: React.FC<ScanProgressBarProps> = ({ progress }) => {
  return (
    <Box sx={{ width: "80%", marginTop: "10px", marginBottom: "10px" }}>
      <LinearProgress variant="determinate" value={progress} />
    </Box>
  );
};

const TxDownload: React.FC = () => {
  const { account } = useWallet();
  const { handlePayment } = usePaymentProcessorProvider();
  const [scanResults, setScanResults] = useState("");
  const [scanResultsObject, setScanResultsObject] = useState<Array<IDatagridResults>>();
  const [scanProgress, setScanProgress] = useState(0);
  const [scanProgressTotal, setScanProgressTotal] = useState(0);

  const onboardingSteps: Array<IOnboardingSteps> = [
    {
      text: "Connect your wallet",
      runFn: () => {
        console.log("implement runFn for connect step");
      },
    },
    {
      text: "Pay XXX Ubiq",
      runFn: () => {
        if (handlePayment !== undefined) {
          handlePayment("UBQ", 0.001);
        }
      },
    },
    {
      text: "Start a Scan",
      runFn: () => handleStart(),
    },
    {
      text: "Download Transaction",
      runFn: () => {
        console.log("implement runFn for download step");
      },
    },
  ];

  const handleStart = useCallback(async () => {
    if (account === null) {
      return;
    }
    setScanProgress(0);
    setScanProgressTotal(0);
    setScanResults("");

    const results = await scanStart(account, (current: number, total: number) => {
      setScanProgress(current);
      setScanProgressTotal(total);
    });

    if (results !== undefined) {
      // DEBUG: show JSON output of the results object
      // setScanResults(JSON.stringify(results, null, 2));
      // return;

      // DEBUG: show CSV output
      console.log(
        "unprocessed results",
        results.raw.filter((tx) => tx.processed !== true)
      );
      console.log("results", "processed:", results.raw.filter((tx) => tx.processed === true).length, "out of", results.raw.length);

      // TODO: find a better way to pull the names from the ICSVRow interface at compile time (DRY the code)
      // const headerCSV = ["date", "action", "total", "currency", "volume", "symbol", "account", "price", "fee", "feeCurrency", "txHash"];
      const headerCSV = [
        "txHash",
        "timestamp",
        "date",
        "block",
        "fee",
        "feeSymbol",
        "from",
        "to",
        "value",
        "valueUSD",
        "tokenSymbol",
        "tokenAddress",
        "reason",
      ];

      setScanResults(
        headerCSV.join(",") +
          "\n" +
          resultsToCSV(headerCSV, [
            ...results.swap,
            ...results.tg,
            // ...results.farm
          ])
      );

      setScanResultsObject(
        results.swap.map((element, index) => {
          return { id: index, ...element, txHash: trimHex(element.txHash), from: trimHex(element.from), to: trimHex(element.to) };
        })
      );
    }
  }, [account]);

  function trimHex(hexString: string) {
    return hexString.substring(0, 5) + "..." + hexString.substring(hexString.length - 4);
  }

  return (
    <Page>
      <Introduction />
      <OnboardingProgress steps={onboardingSteps} />
      <PayButton paymentValue={0.001} paymentSymbol={"UBQ"} />
      <Button variant="outlined" onClick={handleStart}>
        Start Scan
      </Button>

      <ScanProgressBar progress={(scanProgress / scanProgressTotal) * 100} />

      <Typography variant="body1">
        Progress: {scanProgress} / {scanProgressTotal}
      </Typography>

      <div style={{ overflow: "scroll", width: "90%", height: "10vh", border: "1px solid #fff" }}>
        <pre>{scanResults}</pre>
      </div>
      <TxTable transactions={scanResultsObject} />
    </Page>
  );
};

export default React.memo(TxDownload);
