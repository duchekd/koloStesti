import { KeyboardEvent, ReactNode, useState } from "react";

import {
  AppBar,
  Box,
  Button,
  Chip,
  Drawer,
  IconButton,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { mdiClose, mdiMenu, mdiPlaylistEdit, mdiPlus, mdiTrashCanOutline } from "@mdi/js";
import Icon from "@mdi/react";

import useWheelStore from "../../hooks/useWheelStore";

import useTexts from "../../languages";

import LanguageToggle from "./LanguageToggle";
import SetManager from "./SetManager";
import ThemeToggle from "./ThemeToggle";

type Props = {
  /** Hra, jejíž sady se používají (každá hra má vlastní oddělené sady). */
  scope: string;
  /** Název sekce zobrazený v horní liště. */
  title: string;
  /** Probíhá-li losování, ovládací prvky pro úpravu položek se zamknou. */
  busy?: boolean;
  /** Otevře levé navigační menu. */
  onOpenNav: () => void;
  /** Hlavní vizuál nástroje (kolo, souboj…). */
  stage: ReactNode;
  /** Primární akční tlačítko (mělo by být fullWidth). */
  action: ReactNode;
};

// Sdílený rámec pro nástroje pracující se sadami jmen (kolo štěstí, souboj…).
// Stará se o responzivní rozvržení, výběr sady a úpravu položek; nástroj dodá jen vizuál a hlavní akci.
const ToolLayout = ({ scope, title, busy = false, onOpenNav, stage, action }: Props) => {
  const texts = useTexts();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { active, addItem, removeItem, clearAll } = useWheelStore(scope);
  const items = active?.items ?? [];

  const [draft, setDraft] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleAdd = () => {
    if (draft.trim() === "") return;
    addItem(draft);
    setDraft("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAdd();
    }
  };

  // Ovládání položek – přidání, seznam a vymazání. Na mobilu se zobrazuje v draweru.
  const itemControls = (
    <>
      <Stack direction="row" spacing={1}>
        <TextField
          fullWidth
          size="small"
          value={draft}
          onChange={event => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          label={texts.addItemPlaceholder}
          disabled={busy}
        />
        <Button
          variant="contained"
          onClick={handleAdd}
          disabled={busy || draft.trim() === ""}
          startIcon={<Icon path={mdiPlus} size={1} />}
        >
          {texts.add}
        </Button>
      </Stack>

      <Box
        sx={{
          flex: 1,
          minHeight: 80,
          overflowY: "auto",
          display: "flex",
          flexWrap: "wrap",
          alignContent: "flex-start",
          gap: 1,
          p: 1,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
        }}
      >
        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {texts.noItems}
          </Typography>
        ) : (
          items.map(item => (
            <Chip key={item.id} label={item.label} onDelete={busy ? undefined : () => removeItem(item.id)} />
          ))
        )}
      </Box>

      <Button
        color="error"
        variant="outlined"
        onClick={clearAll}
        disabled={busy || items.length === 0}
        startIcon={<Icon path={mdiTrashCanOutline} size={1} />}
      >
        {texts.clearAll}
      </Button>
    </>
  );

  if (isMobile) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100dvh", boxSizing: "border-box" }}>
        {/* Horní lišta aplikace – levé menu, název sekce a přepínač motivu */}
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
          </Toolbar>
        </AppBar>

        {/* Obsah sekce */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            p: 2,
            boxSizing: "border-box",
          }}
        >
          {/* Sjednocená lišta pro výběr a správu sady */}
          <Paper variant="outlined" sx={{ p: 1.5 }}>
            <SetManager scope={scope} disabled={busy} />
          </Paper>

          {/* Vizuál nástroje */}
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}>
            {stage}
          </Box>

          {/* Spodní akce – úprava položek a hlavní akce */}
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              onClick={() => setDrawerOpen(true)}
              disabled={busy}
              startIcon={<Icon path={mdiPlaylistEdit} size={1} />}
              sx={{ flexShrink: 0 }}
            >
              {texts.items}
              {items.length > 0 ? ` · ${items.length}` : ""}
            </Button>
            <Box sx={{ flex: 1 }}>{action}</Box>
          </Stack>
        </Box>

        {/* Drawer s nastavením položek */}
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Stack
            spacing={2}
            sx={{
              width: { xs: "85vw", sm: 360 },
              maxWidth: 420,
              height: "100%",
              minHeight: 0,
              boxSizing: "border-box",
              p: 2,
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" fontWeight={700} noWrap>
                {active?.name ?? texts.items}
              </Typography>
              <IconButton onClick={() => setDrawerOpen(false)} aria-label={texts.close}>
                <Icon path={mdiClose} size={1} />
              </IconButton>
            </Stack>

            {itemControls}
          </Stack>
        </Drawer>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        height: "100vh",
        boxSizing: "border-box",
        gap: 3,
        p: 3,
      }}
    >
      {/* Vizuál nástroje – většina obrazovky */}
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}>{stage}</Box>

      {/* Pravý panel – sada, položky a ovládání */}
      <Stack spacing={2} sx={{ width: 340, flexShrink: 0, height: "100%", minHeight: 0 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton edge="start" onClick={onOpenNav} aria-label={texts.menu}>
            <Icon path={mdiMenu} size={1} />
          </IconButton>
          <Typography variant="h5" fontWeight={700} noWrap sx={{ flex: 1 }}>
            {title}
          </Typography>
          <LanguageToggle />
          <ThemeToggle />
        </Stack>

        <SetManager scope={scope} disabled={busy} />

        {itemControls}

        {action}
      </Stack>
    </Box>
  );
};

export default ToolLayout;
