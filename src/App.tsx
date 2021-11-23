import React, { useCallback, useMemo, useState } from "react";
import { createTheme, ThemeProvider } from "react-neu";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { UseWalletProvider } from "use-wallet";

import MobileMenu from "components/MobileMenu";
import TopBar from "components/TopBar";

import { BalancesProvider } from "contexts/Balances";
import { FarmingProvider } from "contexts/Farming";
import UbiqProvider from "contexts/UbiqProvider";

import Farm from "views/Farm";
import Home from "views/Home";
import Addresses from "views/Addresses";
import Help from "views/Help";

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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/farm" element={<Farm />} />
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/help" element={<Help />} />
        </Routes>
      </Providers>
    </Router>
  );
};

const Providers: React.FC = ({ children }) => {
  // const [darkModeSetting] = useLocalStorage("darkMode", false);
  const { dark: darkTheme, light: lightTheme } = useMemo(() => {
    return createTheme({
      // baseColor: { h: 338, s: 100, l: 41 },
      baseColor: { h: 240, s: 39, l: 36 },
      baseColorDark: { h: 222, s: 82, l: 21 },
      borderRadius: 24,
    });
  }, []);
  return (
    <ThemeProvider darkModeEnabled={true} darkTheme={darkTheme} lightTheme={lightTheme}>
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
  );
};

export default App;
