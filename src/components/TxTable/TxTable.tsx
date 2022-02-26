import React from "react";
import styled from "styled-components";
import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";
import { IDatagridResults } from "tx-download/interfaces";

// Sets datagrid's default column width when not specified per-column
const DefaultColumnWidth = 100;
const DefaultFlex = 0.5;

export const OutputColumns = [
  { short: "txHash", long: "Tx Hash" },
  { short: "timestamp", long: "Timestamp" },
  { short: "date", long: "Date" },
  { short: "block", long: "Block" },
  { short: "fee", long: "Fee" },
  { short: "feeSymbol", long: "Symbol" },
  { short: "from", long: "From" },
  { short: "to", long: "To" },
  { short: "value", long: "Value" },
  { short: "valueUSD", long: "USD" },
  { short: "tokenSymbol", long: "Token Symbol" },
  { short: "tokenAddress", long: "Token Address" },
  { short: "reason", long: "Reason" },
];

function makeColumns(columnObj: any) {
  let columns;

  try {
    columns = columnObj.map((element: any) => {
      return { field: element.short, headerName: element.long, flex: element.flex || DefaultFlex };
    });
  } catch (e) {
    console.error("makeColumns() threw error:", e);
  }
  console.log(columns);
  return columns;
}

const columns: GridColDef[] = makeColumns(OutputColumns);

interface TxTableProps {
  transactions?: Array<IDatagridResults>;
}

const TxTable: React.FC<TxTableProps> = ({ transactions }) => {
  const itemsPerPage = 10;

  return (
    <>
      <div style={{ height: "520px", width: "90%", padding: "10px" }}>
        <StyledDataGrid sx={{ color: "white" }} pageSize={itemsPerPage} rowHeight={38} rows={transactions as GridRowsProp} columns={columns} />
      </div>
    </>
  );
};

const StyledDataGrid = styled(DataGrid)``;

export default React.memo(TxTable);
