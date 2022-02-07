import React, { useCallback, useState } from "react";
import Page from "components/Page";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { useWallet } from "use-wallet";
import { scanStart, filterLogs, getAllTxDetails } from "tx-download";

interface TxDownloadProps {}

const TxDownload: React.FC<TxDownloadProps> = () => {
  const { account } = useWallet();

  const [scanResults, setScanResults] = useState("");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanProgressTotal, setScanProgressTotal] = useState(0);

  const handleStart = useCallback(async () => {
    if(account === null){
      return
    }
    setScanProgress(0);
    setScanProgressTotal(0);
    setScanResults("");

    const results = await scanStart(account, (current: number, total: number) => {
      setScanProgress(current);
      setScanProgressTotal(total);
    });

    console.log("results", "total", results?.length);

    if (results !== undefined) {
      setScanResults(JSON.stringify(results, null, 2));
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
