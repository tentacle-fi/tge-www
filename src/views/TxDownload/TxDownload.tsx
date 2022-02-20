import React, { useCallback, useState } from "react";
import Page from "components/Page";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { useWallet } from "use-wallet";
import { scanStart, getAllTxDetails, resultsToCSV } from "tx-download";

interface TxDownloadProps {}

const TxDownload: React.FC<TxDownloadProps> = () => {
  const { account } = useWallet();

  const [scanResults, setScanResults] = useState("");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanProgressTotal, setScanProgressTotal] = useState(0);

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

    // console.log("results", "total", results?.length);

    if (results !== undefined) {
      // setScanResults(JSON.stringify(results, null, 2));
      // return

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
            // ...results.tg,
            // ...results.farm
          ])
      );
    }
  }, [account]);

  return (
    <Page>
      <Button variant="outlined" onClick={handleStart}>
        Start Scan
      </Button>

      <Typography variant="body1">
        Progress: {scanProgress} / {scanProgressTotal}
      </Typography>

      <div style={{ overflow: "scroll", width: "90%", height: "80vh", border: "1px solid #fff" }}>
        <pre>{scanResults}</pre>
      </div>
    </Page>
  );
};

export default React.memo(TxDownload);
