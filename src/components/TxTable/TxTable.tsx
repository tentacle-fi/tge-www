import React, { useEffect, useState } from "react";
import { DataGrid, GridRowsProp, GridColDef, GridCellParams, MuiEvent } from "@mui/x-data-grid";
import { IDatagridResults } from "tx-download/interfaces";

// Sets datagrid's default column width when not specified per-column
const DefaultFlex = 0.5;

export const OutputColumns = [
  { short: "id", long: "Row" },
  { short: "nonce", long: "nonce" },
  { short: "txHash", long: "Tx Hash" },
  { short: "timestamp", long: "Timestamp" },
  { short: "date", long: "Date" },
  { short: "block", long: "Block" },
  { short: "fee", long: "Fee" },
  { short: "feeSymbol", long: "Symbol" },
  { short: "from", long: "From" },
  { short: "to", long: "To" },
  { short: "value", long: "Value" },
  { short: "tokenPrice", long: "Token USD" },
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
  // console.log(columns);
  return columns;
}

function trimHex(hexString: string) {
  return hexString.substring(0, 5) + "..." + hexString.substring(hexString.length - 4);
}

const columns: GridColDef[] = makeColumns(OutputColumns);

interface TxTableProps {
  transactions?: Array<IDatagridResults>;
  displaySelectedRow: Function;
}

const TxTable: React.FC<TxTableProps> = ({ transactions, displaySelectedRow }) => {
  const [rows, setRows] = useState<Array<IDatagridResults>>();
  const itemsPerPage = 25;

  useEffect(() => {
    if (transactions === undefined) {
      return;
    }

    setRows(
      transactions.map((element, index) => {
        return { ...element, txHash: trimHex(element.txHash), from: trimHex(element.from), to: trimHex(element.to) };
        //return { id: index, ...element };
      })
    );
  }, [transactions]);

  return (
    <>
      <div style={{ height: "50vh", width: "95%", padding: "10px" }}>
        <DataGrid
          pageSize={itemsPerPage}
          rowHeight={38}
          rows={rows === undefined ? [] : (rows as GridRowsProp)}
          columns={columns}
          // components={{
          //   ColumnMenu: CustomColumnMenuComponent,
          //   Pagination: CustomPagination,
          // }}
          onCellDoubleClick={(params, event) => {
            // disable double click to edit field
            event.defaultMuiPrevented = true;
          }}
          onCellClick={(params: GridCellParams, event: MuiEvent<React.MouseEvent>) => {
            event.defaultMuiPrevented = true;
            // console.log("on click", params);

            displaySelectedRow(params.row.id);
            // TODO: here is where a popup or other UI element can show the specific details highlighted
          }}
        />
      </div>
    </>
  );
};

export default React.memo(TxTable);
