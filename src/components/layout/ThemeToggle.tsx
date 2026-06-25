import { IconButton, Tooltip } from "@mui/material";

import { mdiWeatherNight, mdiWeatherSunny } from "@mdi/js";
import Icon from "@mdi/react";

import useThemeMode from "../../hooks/useThemeMode";

import useTexts from "../../languages";

const ThemeToggle = () => {
  const texts = useTexts();
  const { mode, toggle } = useThemeMode();

  const isDark = mode === "dark";
  const label = isDark ? texts.lightMode : texts.darkMode;

  return (
    <Tooltip title={label}>
      <IconButton onClick={toggle} aria-label={label}>
        <Icon path={isDark ? mdiWeatherSunny : mdiWeatherNight} size={1} />
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
