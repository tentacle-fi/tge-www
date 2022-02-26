import React from "react";
import styled from "styled-components";
import { DataGrid, GridRowsProp, GridColDef, GridColumnMenu, GridColumnMenuProps } from "@mui/x-data-grid";
import { IDatagridResults } from "tx-download/interfaces";

// Sets datagrid's default column width when not specified per-column
const DefaultColumnWidth = 100;
const DefaultFlex = 0.5;

export const OutputColumns = [
  { short: "id", long: "id" },
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

export function CustomColumnMenuComponent(props: GridColumnMenuProps & { color: string }) {
  const { hideMenu, currentColumn, color, ...other } = props;
  return <StyledGridColumnMenu hideMenu={hideMenu} currentColumn={currentColumn} ownerState={{ color }} {...other} />;
}

const TxTable: React.FC<TxTableProps> = ({ transactions }) => {
  const itemsPerPage = 10;

  return (
    <>
      <div style={{ height: "50vh", width: "95%", padding: "10px" }}>
        <StyledDataGrid
          pageSize={itemsPerPage}
          rowHeight={38}
          rows={transactions as GridRowsProp}
          columns={columns}
          components={{
            ColumnMenu: CustomColumnMenuComponent,
          }}
        />
      </div>
    </>
  );
};

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  ".MuiDataGrid-cell": {
    color: "#fff",
  },

  ".MuiDataGrid-columnHeader": {
    color: "#fff",
  },
  ".MuiSvgIcon-root": { color: "#fff" },

  ".MuiTablePagination-root": { color: "#fff" },

  ".MuiDataGrid-overlay": {
    backgroundColor: "#333",
    color: "#fff",
  },
}));

const StyledGridColumnMenu = styled(GridColumnMenu)<{
  ownerState: { color: string };
}>(({ theme, ownerState }) => ({
  background: "#001c2b",

  borderRadius: "10px",

  ".MuiMenuItem-root": { color: "#fff" },
}));

export default React.memo(TxTable);
