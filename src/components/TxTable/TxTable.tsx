import React from "react";
import styled from "styled-components";
import {
  DataGrid,
  GridRowsProp,
  GridColDef,
  GridColumnMenu,
  GridColumnMenuProps,
  GridCellParams,
  MuiEvent,
  gridPageCountSelector,
  gridPageSelector,
  gridPageSizeSelector,
  useGridApiContext,
  useGridSelector,
} from "@mui/x-data-grid";
import { IDatagridResults } from "tx-download/interfaces";
import TablePagination from "@mui/material/TablePagination";

// Sets datagrid's default column width when not specified per-column
const DefaultColumnWidth = 100;
const DefaultFlex = 0.5;

export const OutputColumns = [
  { short: "id", long: "Row" },
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
  const itemsPerPage = 25;

  return (
    <>
      <div style={{ height: "50vh", width: "95%", padding: "10px" }}>
        <DataGrid
          pageSize={itemsPerPage}
          rowHeight={38}
          rows={transactions === undefined ? [] : (transactions as GridRowsProp)}
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
            // console.log('on click', params)
            // TODO: here is where a popup or other UI element can show the specific details highlighted
          }}
        />
      </div>
    </>
  );
};

export default React.memo(TxTable);
