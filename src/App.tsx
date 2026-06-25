import { useMemo, useState } from "react";

import { CssBaseline, ThemeProvider } from "@mui/material";

import useThemeMode from "./hooks/useThemeMode";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";

import NavDrawer, { SectionId } from "./components/layout/NavDrawer";
import BadmintonPage from "./components/pages/Badminton";
import BadmintonStatsPage from "./components/pages/BadmintonStats";
import VersusPage from "./components/pages/Versus";
import WheelPage from "./components/pages/Wheel";
import createAppTheme from "./theme";

const cache = createCache({ key: "css", prepend: true });

const App = () => {
  const mode = useThemeMode(state => state.mode);
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const [section, setSection] = useState<SectionId>("wheel");
  const [navOpen, setNavOpen] = useState(false);

  const openNav = () => setNavOpen(true);

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        {section === "wheel" && <WheelPage onOpenNav={openNav} />}
        {section === "versus" && <VersusPage onOpenNav={openNav} />}
        {section === "badminton" && <BadmintonPage onOpenNav={openNav} />}
        {section === "badmintonStats" && <BadmintonStatsPage onOpenNav={openNav} />}

        <NavDrawer open={navOpen} onClose={() => setNavOpen(false)} active={section} onSelect={setSection} />
      </ThemeProvider>
    </CacheProvider>
  );
};

export default App;
