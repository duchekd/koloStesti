import { useMemo } from "react";

import { CssBaseline, ThemeProvider } from "@mui/material";

import useThemeMode from "./hooks/useThemeMode";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";

import WheelPage from "./components/pages/Wheel";
import createAppTheme from "./theme";

const cache = createCache({ key: "css", prepend: true });

const App = () => {
  const mode = useThemeMode(state => state.mode);
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <WheelPage />
      </ThemeProvider>
    </CacheProvider>
  );
};

export default App;
