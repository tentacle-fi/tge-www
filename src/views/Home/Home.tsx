import React from "react";
import { useTheme } from "react-neu";

import Page from "components/Page";
import PageHeader from "components/PageHeader";

const Home: React.FC = () => {
  const { darkMode } = useTheme();
  return (
    <Page>
      <PageHeader
        icon={darkMode ? "🌚" : "🌞"}
        subtitle={darkMode ? "🤫 shhh... the squids are sleeping." : "It's a great day to farm INK!"}
        title="Welcome to Ubiq TGE Framework."
      />
    </Page>
  );
};

export default Home;
