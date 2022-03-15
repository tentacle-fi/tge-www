import React, { useCallback, useState } from "react";
import Page from "components/Page";
import TxTable from "components/TxTable";
import OnboardingProgress, { IOnboardingSteps } from "components/OnboardingProgress";
import Typography from "@mui/material/Typography";
import { useWallet } from "use-wallet";
import { scanStart, resultsToCSV, rawToCSV } from "tx-download";
import usePaymentProcessorProvider from "hooks/usePaymentProcessor";
import { IDatagridResults, IRawCSVRow } from "tx-download/interfaces";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import LinearProgress from "@mui/material/LinearProgress";
import DownloadIcon from "@mui/icons-material/Download";
import { tsFormat } from "tx-download/probes/tools";
import useJsonLoader from "hooks/useJsonLoader";
import SLink from "components/SLink";
import InfoIcon from "@mui/icons-material/Info";

// Price to download a dataset, in UBQ for now
const DownloadPrice = 100;

const SmallInfo = () => {
  return <InfoIcon fontSize="small" sx={{ marginRight: "10px" }} />;
};

const Introduction = () => {
  return (
    <>
      <Typography variant="h4">Welcome to Tx Download!</Typography>
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
  const [rawScanResults, setRawScanResults] = useState("");

  const [enumerationProgress, setEnumerationProgress] = useState(0);
  const [enumerationProgressTotal, setEnumerationProgressTotal] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanProgressTotal, setScanProgressTotal] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentProgressTotal, setCurrentProgressTotal] = useState(0);
  const [downloadedCsv, setDownloadedCsv] = useState(false);

  const { lookupPriceForTime } = useJsonLoader();

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
      msg: 'Start by connecting the wallet which you want to download transactions for. Read the "About" section on the bottom of this page before paying. Click the Next button to continue to payment.',
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
      text: "Download Transactions",
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
      },
      lookupPriceForTime
    );

    if (results !== undefined && results?.results?.length > 0) {
      // DEBUG: show JSON output of the results object
      // setScanResults(JSON.stringify(results, null, 2));
      // return;

      // DEBUG: show CSV output
      // console.log(
      //   "unprocessed results",
      //   results.raw.filter((tx) => tx.processed !== true)
      // );
      // console.log("results", "processed:", results.raw.filter((tx) => tx.processed === true).length, "out of", results.raw.length);

      // TODO: find a better way to pull the names from the ITransferCSVRow interface at compile time (DRY the code)
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
        "tokenPrice",
        "tokenSymbol",
        "tokenAddress",
        "reason",
      ];

      const csv = headerCSV.join(",") + "\n" + resultsToCSV(headerCSV, results.results);
      const downloadUrl = window.URL.createObjectURL(new Blob([csv], { type: "text/csv" }));

      setScanResults(downloadUrl);
      setScanResultsObject(
        results.results.map((element, index) => {
          //return { id: index, ...element, txHash: trimHex(element.txHash), from: trimHex(element.from), to: trimHex(element.to) };
          return { id: index, ...element };
        })
      );

      // setup the RAW csv download
      const rawHeaderCSV = ["nonce", "txHash", "date", "timestamp", "processed"];

      const rawCsv =
        rawHeaderCSV.join(",") +
        "\n" +
        rawToCSV(
          rawHeaderCSV,
          results.raw.map((row) => {
            return {
              nonce: row.tx.nonce,
              txHash: row.tx.hash,
              date: tsFormat(row.block.timestamp),
              timestamp: row.block.timestamp,
              processed: row.processed,
            } as IRawCSVRow;
          })
        );
      const rawDownloadUrl = window.URL.createObjectURL(new Blob([rawCsv], { type: "text/csv" }));
      setRawScanResults(rawDownloadUrl);
    }
  }, [account, lookupPriceForTime]);

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
        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "20px" }}>
          <a
            href={scanResults}
            onClick={() => {
              userDownloadedCsv();
            }}
            download={`${account}_ubiq_transactions.csv`}
            style={{ lineHeight: "36px", fontSize: "36px", border: "1px solid #06d6a0", padding: "25px", borderRadius: "10px" }}
          >
            Download Processed
            <DownloadIcon sx={{ fontSize: "36px", lineHeight: "36px" }} />
          </a>
          <a
            href={rawScanResults}
            download={`${account}_ubiq_raw.csv`}
            style={{ lineHeight: "36px", fontSize: "36px", border: "1px solid #06d6a0", padding: "25px", borderRadius: "10px" }}
          >
            Download Raw
            <DownloadIcon sx={{ fontSize: "36px", lineHeight: "36px" }} />
          </a>
        </div>
      )}
      <ScanProgressBar progress1={(enumerationProgress / enumerationProgressTotal) * 100} progress2={(scanProgress / scanProgressTotal) * 100} />

      <Typography variant="body1">
        Current Progress: {currentProgress} / {currentProgressTotal}
      </Typography>

      {scanResultsObject !== undefined && <TxTable transactions={scanResultsObject} displaySelectedRow={displaySelectedRow} />}

      <div style={{ border: "2px solid black", borderRadius: "10px", marginTop: "25px" }}>
        <Typography sx={{ marginTop: "10px", textAlign: "center" }} variant="h4">
          Transaction Download: About
        </Typography>

        <div style={{ margin: "10px 20px" }}>
          <List>
            <ListItem>
              <SmallInfo />
              <Typography variant="body1">Currently only data from 2021 can be downloaded. More years will be added!</Typography>
            </ListItem>

            <ListItem>
              <SmallInfo />

              <Typography variant="body1">
                Historical prices are estimated for the following tokens: UBQ, INK, ESCH, GRANS, wETH, GEO, SPHR, CAUL2. Any other token, LP or
                otherwise, not on this list is not expected to be estimated.
              </Typography>
            </ListItem>

            <ListItem>
              <SmallInfo />

              <Typography variant="body1">Currently Enmaku payments are not found with this tool.</Typography>
            </ListItem>

            <ListItem>
              <SmallInfo />

              <Typography variant="body1">
                If you encounter any issues, please contact a developer via{" "}
                <SLink external href="https://discord.gg/CbTa6Z2JYM">
                  Discord
                </SLink>
                .
              </Typography>
            </ListItem>
            <ListItem>
              <SmallInfo />

              <Typography variant="body1">
                If you find any missing NONCE in your Raw or Processed CSV download, the most common reason is the lack of on-chain log events being
                recorded. One common example is when a transaction fails to execute.
              </Typography>
            </ListItem>
          </List>
          <Typography sx={{ marginTop: "10px" }} variant="h5">
            When processing completes users are presented with two CSV download options:
          </Typography>

          <List sx={{ justifyContent: "center" }}>
            <ListItem>
              1. Raw - Only minimal, unprocessed, data is returned. If we don't currently process a particular contract's methods, this is where you
              will find those transactions.
            </ListItem>
            <ListItem>
              2. Processed - methodIds are retrieved, prices are looked up, transfers are recorded. This contains the most thorough information.
            </ListItem>
          </List>
        </div>
      </div>
    </Page>
  );
};

export default React.memo(TxDownload);
