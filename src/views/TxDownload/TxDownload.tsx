import React, { useCallback, useState } from "react";
import Page from "components/Page";
import TxTable from "components/TxTable";
import OnboardingProgress, { IOnboardingSteps } from "components/OnboardingProgress";
import Typography from "@mui/material/Typography";
import { useWallet } from "use-wallet";
import { scanStart, resultsToCSV } from "tx-download";
import usePaymentProcessorProvider from "hooks/usePaymentProcessor";
import { IDatagridResults } from "tx-download/interfaces";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import DownloadIcon from "@mui/icons-material/Download";

// Price to download a dataset, in UBQ for now
const DownloadPrice = 0.001;

const Introduction = () => {
  return (
    <>
      <Typography variant="h4">Welcome to Tx Download!</Typography>
      <Typography sx={{ width: "80%" }} variant="h5">
        Tx Download will help you download transaction history to aid with recordkeeping, tax reporting, and more. To get started, connect the wallet
        account you wish to download history for.
      </Typography>
    </>
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
  const { handlePayment, isConfirmed, paymentTx } = usePaymentProcessorProvider();
  const [scanResults, setScanResults] = useState("");
  const [scanResultsObject, setScanResultsObject] = useState<Array<IDatagridResults>>();

  const [enumerationProgress, setEnumerationProgress] = useState(0);
  const [enumerationProgressTotal, setEnumerationProgressTotal] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanProgressTotal, setScanProgressTotal] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentProgressTotal, setCurrentProgressTotal] = useState(0);
  const [downloadedCsv, setDownloadedCsv] = useState(false);

  const handleReset = useCallback(() => {
    setScanResults("");
    setScanResultsObject(undefined);
    setEnumerationProgress(0);
    setEnumerationProgressTotal(0);
    setScanProgress(0);
    setScanProgressTotal(0);
    setCurrentProgress(0);
    setCurrentProgressTotal(0);
    setDownloadedCsv(false);
  }, []);

  const onboardingSteps: Array<IOnboardingSteps> = [
    {
      text: account !== null ? "Connected!" : "Connect your wallet",
      msg: "Start by connecting the wallet which you want to download transactions for. Click the Next button to continue to payment.",
      runFn: () => {},
      validate: () => {
        if (account === null) {
          console.log("account is not connected");
          return "Wallet is not connected! Click Connect Wallet button in top right of window to resolve.";
        }
        return true;
      },
    },
    {
      text: `Pay ${DownloadPrice} Ubiq`,
      msg: "Send payment to continue. Click next to proceed.",
      runFn: () => {
        if (handlePayment !== undefined) {
          handlePayment("UBQ", DownloadPrice);
        }
      },
      validate: () => {
        if (paymentTx === undefined || paymentTx === "") {
          return "Payment must be sent to proceed.";
        }
        return paymentTx?.length > 0;
      },
    },
    {
      text: "Await Confirmation",
      msg: "Please wait for transaction confirmations",
      runFn: () => {},
      validate: () => {
        return isConfirmed === true;
      },
    },
    {
      text: "Start a Scan",
      msg: "Start scanning for transactions, this can take a while.",
      runFn: () => {
        handleStart();
      },
      validate: () => {
        return true;
      },
    },
    {
      text: "Download Transaction",
      msg: "Click the Download button below to save as a CSV",
      runFn: () => {},
      validate: () => {
        if (downloadedCsv === false) {
          return "Click the download button to save your results as a CSV file";
        }
        return downloadedCsv;
      },
    },
    {
      text: "Finish",
      msg: "Thank you for using this service!",
      runFn: () => {},
      validate: () => {
        return true;
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
      2021, // year
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
      const headerCSV = [
        "nonce",
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

  const userDownloadedCsv = useCallback(() => {
    setDownloadedCsv(true);
  }, []);

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

      <OnboardingProgress resetCb={handleReset} steps={onboardingSteps} />

      {scanResults !== "" && (
        <a
          href={scanResults}
          onClick={() => {
            userDownloadedCsv();
          }}
          download="ubiq_transactions.csv"
          style={{ lineHeight: "36px", fontSize: "36px", border: "1px solid #06d6a0", padding: "25px", borderRadius: "10px" }}
        >
          Download
          <DownloadIcon sx={{ fontSize: "36px", lineHeight: "36px" }} />
        </a>
      )}
      <ScanProgressBar progress1={(enumerationProgress / enumerationProgressTotal) * 100} progress2={(scanProgress / scanProgressTotal) * 100} />

      <Typography variant="body1">
        Current Progress: {currentProgress} / {currentProgressTotal}
      </Typography>

      {scanResultsObject !== undefined && <TxTable transactions={scanResultsObject} displaySelectedRow={displaySelectedRow} />}
    </Page>
  );
};

export default React.memo(TxDownload);
