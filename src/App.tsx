import React, { useCallback, useMemo, useState } from "react";
import { createTheme as neuCreateTheme, ThemeProvider as NEUThemeProvider } from "react-neu";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { UseWalletProvider } from "use-wallet";

import type {} from "@mui/x-data-grid/themeAugmentation";
import MobileMenu from "components/MobileMenu";
import TopBar from "components/TopBar";

import { BalancesProvider } from "contexts/Balances";
import { FarmingProvider } from "contexts/Farming";
import UbiqProvider from "contexts/UbiqProvider";

import Farm from "views/Farm";
import Home from "views/Home";
import Addresses from "views/Addresses";
import Help from "views/Help";
import DaoInfo from "views/DaoInfo";
import TxDownload from "views/TxDownload";

const App: React.FC = () => {
  const [mobileMenu, setMobileMenu] = useState(false);

  const handleDismissMobileMenu = useCallback(() => {
    setMobileMenu(false);
  }, [setMobileMenu]);

  const handlePresentMobileMenu = useCallback(() => {
    setMobileMenu(true);
  }, [setMobileMenu]);

  return (
    <Router>
      <Providers>
        <TopBar onPresentMobileMenu={handlePresentMobileMenu} />
        <MobileMenu onDismiss={handleDismissMobileMenu} visible={mobileMenu} />
        <div style={{ marginTop: "50px" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/farm" element={<Farm />} />
            <Route path="/addresses" element={<Addresses />} />
            <Route path="/help" element={<Help />} />
            <Route path="/daoinfo" element={<DaoInfo />} />
            <Route path="/tx-download" element={<TxDownload />} />
          </Routes>
        </div>
      </Providers>
    </Router>
  );
};

const Providers: React.FC = ({ children }) => {
  // const [darkModeSetting] = useLocalStorage("darkMode", false);
  const { dark: darkTheme, light: lightTheme } = useMemo(() => {
    return neuCreateTheme({
      // baseColor: { h: 338, s: 100, l: 41 },
      baseColor: { h: 240, s: 39, l: 36 },
      baseColorDark: { h: 222, s: 82, l: 21 },
      borderRadius: 24,
    });
  }, []);

  // DOCS: https://mui.com/customization/palette/#palette-colors
  const muiTheme = createTheme({
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            background: "#001c2b",
            color: "#fff",
            borderRadius: "10px",
          },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          overlay: {
            backgroundColor: "#222",
            color: "#fff",
          },
          columnHeader: {
            color: "#fff",
          },
          sortIcon: {
            color: "#fff",
          },
          menuIcon: {
            "*": { color: "#fff" },
          },
          cell: {
            color: "#fff",
          },
          selectedRowCount: {
            color: "#fff",
          },
        },
      },
      MuiTablePagination: {
        styleOverrides: {
          root: {
            color: "#fff",
          },
          selectIcon: {
            color: "#fff",
          },
          actions: {
            "& .MuiSvgIcon-root": {
              color: "#fff",
            },
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            "&:hover": {
              background: "#000",
            },
          },
        },
      },
    },
    palette: {
      primary: {
        main: "#06d6a0",
        light: "#ff3300",
      },
      secondary: {
        dark: "#053b06", // dark green
        main: "#0b5d1e", // neutral green
        light: "#06d6a0", // light green
      },
      success: {
        main: "#3acf14", // light green
      },
      info: {
        main: "#247ba0", // blue/teal
      },
      warning: {
        main: "#bf610a", // dark orange
      },
      error: {
        main: "#bf1212", // dark red
      },
    },
    typography: {
      // fontFamily: "Charlemagne STD", // INK's font, looks sort of weird on the site now
      subtitle1: {
        fontSize: 12,
      },
      body1: {
        fontWeight: 500,
        color: "#ffffff",
      },
      button: {
        fontStyle: "italic",
      },
      h3: {
        color: "#ffffff",
      },
      h4: {
        color: "#ffffff",
      },
      h5: {
        color: "#ffffff",
      },
      overline: {
        color: "#fff",
      },
    },
    shape: {
      borderRadius: 12,
    },
  });

  return (
    <NEUThemeProvider darkModeEnabled={true} darkTheme={darkTheme} lightTheme={lightTheme}>
      <ThemeProvider theme={muiTheme}>
        <UseWalletProvider
          connectors={{
            injected: {
              //allows you to connect and switch between mainnet and rinkeby within Metamask.
              chainId: [8],
            },
          }}
        >
          <UbiqProvider>
            <BalancesProvider>
              <FarmingProvider>{children}</FarmingProvider>
            </BalancesProvider>
          </UbiqProvider>
        </UseWalletProvider>
      </ThemeProvider>
    </NEUThemeProvider>
  );
};

export default App;
