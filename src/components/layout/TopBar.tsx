import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";

import { mdiMenu } from "@mdi/js";
import Icon from "@mdi/react";

import useTexts from "../../languages";

import AuthButton from "./AuthButton";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";

type Props = {
  title: string;
  onOpenNav: () => void;
};

// Horní lišta aplikace – levé menu, název sekce a přepínače jazyka/motivu.
const TopBar = ({ title, onOpenNav }: Props) => {
  const texts = useTexts();

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{ bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider" }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <IconButton edge="start" onClick={onOpenNav} aria-label={texts.menu}>
          <Icon path={mdiMenu} size={1} />
        </IconButton>
        <Typography variant="h6" fontWeight={800} noWrap sx={{ flex: 1 }}>
          {title}
        </Typography>
        <LanguageToggle />
        <ThemeToggle />
        <AuthButton />
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
