import { KeyboardEvent, useRef, useState } from "react";

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { mdiClose, mdiPlus, mdiTrashCanOutline, mdiTrophyVariant, mdiTune } from "@mdi/js";
import Icon from "@mdi/react";

import useWheelStore, { WheelItem } from "../../../hooks/useWheelStore";

import useTexts from "../../../languages";

import SetManager from "./SetManager";
import ThemeToggle from "./ThemeToggle";
import Wheel, { WheelHandle } from "./Wheel";

const WheelPage = () => {
  const texts = useTexts();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { wheels, activeWheelId, addItem, removeItem, clearAll } = useWheelStore();

  const activeWheel = wheels.find(wheel => wheel.id === activeWheelId);
  const items = activeWheel?.items ?? [];

  const [draft, setDraft] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<WheelItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const wheelRef = useRef<WheelHandle>(null);

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

  const handleSpin = () => wheelRef.current?.spin();

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
          disabled={spinning}
        />
        <Button
          variant="contained"
          onClick={handleAdd}
          disabled={spinning || draft.trim() === ""}
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
            <Chip key={item.id} label={item.label} onDelete={spinning ? undefined : () => removeItem(item.id)} />
          ))
        )}
      </Box>

      <Button
        color="error"
        variant="outlined"
        onClick={clearAll}
        disabled={spinning || items.length === 0}
        startIcon={<Icon path={mdiTrashCanOutline} size={1} />}
      >
        {texts.clearAll}
      </Button>
    </>
  );

  const wheel = (
    <Wheel
      ref={wheelRef}
      items={items}
      emptyLabel={texts.emptyWheel}
      onSpinStart={() => setSpinning(true)}
      onResult={item => {
        setSpinning(false);
        setWinner(item);
      }}
    />
  );

  const spinButton = (
    <Button size="large" variant="contained" onClick={handleSpin} disabled={spinning || items.length === 0}>
      {texts.spin}
    </Button>
  );

  return (
    <>
      {isMobile ? (
        /* ---------- Mobilní rozvržení ---------- */
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100dvh",
            boxSizing: "border-box",
            gap: 2,
            p: 2,
          }}
        >
          {/* Horní lišta – přepínač sad, tlačítka k sadám a otevření draweru */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <SetManager disabled={spinning} />
            </Box>
            <ThemeToggle />
            <Tooltip title={texts.itemSettings}>
              <span>
                <IconButton
                  color="primary"
                  onClick={() => setDrawerOpen(true)}
                  disabled={spinning}
                  aria-label={texts.itemSettings}
                >
                  <Icon path={mdiTune} size={1} />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>

          {/* Kolo štěstí */}
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}>
            {wheel}
          </Box>

          {spinButton}

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
                  {activeWheel?.name ?? texts.items}
                </Typography>
                <IconButton onClick={() => setDrawerOpen(false)} aria-label={texts.close}>
                  <Icon path={mdiClose} size={1} />
                </IconButton>
              </Stack>

              {itemControls}
            </Stack>
          </Drawer>
        </Box>
      ) : (
        /* ---------- Rozvržení pro desktop ---------- */
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
          {/* Kolo štěstí – většina obrazovky */}
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}>
            {wheel}
          </Box>

          {/* Pravý panel – položky a ovládání */}
          <Stack
            spacing={2}
            sx={{
              width: 340,
              flexShrink: 0,
              height: "100%",
              minHeight: 0,
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
              <Typography variant="h5" fontWeight={700} noWrap>
                {activeWheel?.name ?? texts.wheelTitle}
              </Typography>
              <ThemeToggle />
            </Stack>

            <SetManager disabled={spinning} />

            {itemControls}

            {spinButton}
          </Stack>
        </Box>
      )}

      <Dialog open={winner !== null} onClose={() => setWinner(null)}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Icon path={mdiTrophyVariant} size={1.2} color="#f9a825" />
          {texts.winner}
        </DialogTitle>
        <DialogContent>
          <Typography variant="h4" fontWeight={700} textAlign="center" sx={{ py: 2, wordBreak: "break-word" }}>
            {winner?.label}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWinner(null)}>{texts.close}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WheelPage;
