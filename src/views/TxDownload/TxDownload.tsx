import React, { useCallback, useState } from "react";
import Page from "components/Page";
import TxTable from "components/TxTable";
import OnboardingProgress, { IOnboardingSteps } from "components/OnboardingProgress";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useWallet } from "use-wallet";
import { scanStart, resultsToCSV } from "tx-download";
import usePaymentProcessorProvider from "hooks/usePaymentProcessor";
import { IDatagridResults } from "tx-download/interfaces";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import LinearProgress from "@mui/material/LinearProgress";

// Price to download a dataset, in UBQ for now
const DownloadPrice = 200;

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
            Connect the address you wish to scan
          </ListItem>
          <ListItem>
            <SmallCheck />
            Pay {DownloadPrice} UBQ
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
  progress1: number;
  progress2: number;
}

const ScanProgressBar: React.FC<ScanProgressBarProps> = ({ progress1, progress2 }) => {
  return (
    <Box sx={{ width: "80%", marginTop: "10px", marginBottom: "10px" }}>
      <LinearProgress
        sx={{
          "& .MuiLinearProgress-bar2Buffer": { background: "#784af4" /* purple */ },
          "& .MuiLinearProgress-bar1Buffer": { background: "#06d6a0" /* green */ },
        }}
        variant="buffer"
        value={progress2}
        valueBuffer={progress1}
      />
    </Box>
  );
};

const TxDownload: React.FC = () => {
  const { account } = useWallet();
  const { handlePayment } = usePaymentProcessorProvider();
  const [scanResults, setScanResults] = useState("");
  const [scanResultsObject, setScanResultsObject] = useState<Array<IDatagridResults>>();

  const [enumerationProgress, setEnumerationProgress] = useState(0);
  const [enumerationProgressTotal, setEnumerationProgressTotal] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanProgressTotal, setScanProgressTotal] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentProgressTotal, setCurrentProgressTotal] = useState(0);

  const onboardingSteps: Array<IOnboardingSteps> = [
    {
      text: account !== null ? account : "Connect your wallet",
      runFn: () => {
        if (account === null) {
          console.log("account is not connected");
          return;
        }
      },
    },
    {
      text: `Pay ${DownloadPrice} Ubiq`,
      runFn: () => {
        if (handlePayment !== undefined) {
          handlePayment("UBQ", DownloadPrice);
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
    setEnumerationProgressTotal(0);
    setEnumerationProgress(0);
    setScanResults("");

    const results = await scanStart(
      account,
      2021,
      (current: number, total: number) => {
        // progress1
        setEnumerationProgress(current);
        setCurrentProgress(current);
        setEnumerationProgressTotal(total);
        setScanProgressTotal(total);
        setCurrentProgressTotal(total);
      },
      (current: number, total: number) => {
        // progress2
        setScanProgress(current);
        setCurrentProgress(current);

        setScanProgressTotal(total);
        setEnumerationProgress(total);
        setEnumerationProgressTotal(total);
        setCurrentProgressTotal(total);
      }
    );

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

      const csv = headerCSV.join(",") + "\n" + resultsToCSV(headerCSV, results.results);

      const blob = new Blob([csv], { type: "text/csv" });
      const downloadUrl = window.URL.createObjectURL(blob);

      setScanResults(downloadUrl);

      setScanResultsObject(
        results.results.map((element, index) => {
          //return { id: index, ...element, txHash: trimHex(element.txHash), from: trimHex(element.from), to: trimHex(element.to) };
          return { id: index, ...element };
        })
      );
    }
  }, [account]);

  const displaySelectedRow = useCallback(
    (id: number) => {
      if (scanResultsObject === undefined) {
        return;
      }

      const found = scanResultsObject.filter((row) => row.id === id);
      console.log("found", found[0]);
    },
    [scanResultsObject]
  );

  return (
    <Page>
      <Introduction />

      <OnboardingProgress steps={onboardingSteps} />

      <ScanProgressBar progress1={(enumerationProgress / enumerationProgressTotal) * 100} progress2={(scanProgress / scanProgressTotal) * 100} />

      <Typography variant="body1">
        Current Progress: {currentProgress} / {currentProgressTotal}
      </Typography>

      <div style={{ overflow: "scroll", width: "90%", height: "10vh", border: "1px solid #fff" }}>
        <pre>{scanResults}</pre>
        <a href={scanResults} download="ubiq_transactions.csv">
          Download
        </a>
      </div>
      <TxTable transactions={scanResultsObject} displaySelectedRow={displaySelectedRow} />
    </Page>
  );
};

export default React.memo(TxDownload);
