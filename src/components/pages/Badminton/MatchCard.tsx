import { FocusEvent } from "react";

import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import { mdiClose, mdiPlus, mdiTrashCanOutline } from "@mdi/js";
import Icon from "@mdi/react";

import { Match, WheelItem } from "../../../hooks/useWheelStore";

import useTexts from "../../../languages";

// po kliknutí do pole se hodnota označí, aby ji první napsaná číslice přepsala (jinak vznikne „021")
const selectOnFocus = (event: FocusEvent<HTMLInputElement>) => event.currentTarget.select();

type Props = {
  match: Match;
  players: WheelItem[];
  onSetPlayer: (side: "a" | "b", id: string | null) => void;
  onAddSet: () => void;
  onUpdateSet: (index: number, side: "a" | "b", value: number) => void;
  onRemoveSet: (index: number) => void;
  onRemove: () => void;
};

const MatchCard = ({ match, players, onSetPlayer, onAddSet, onUpdateSet, onRemoveSet, onRemove }: Props) => {
  const texts = useTexts();

  const nameOf = (id: string | null) => players.find(p => p.id === id)?.label ?? "";

  // počet vyhraných setů (jen rozhodnuté sety, remíza se nepočítá)
  const wonA = match.sets.filter(s => s.a > s.b).length;
  const wonB = match.sets.filter(s => s.b > s.a).length;

  const playerSelect = (side: "a" | "b") => {
    const value = side === "a" ? match.aId : match.bId;
    const otherValue = side === "a" ? match.bId : match.aId;
    return (
      <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
        <InputLabel>{side === "a" ? texts.playerA : texts.playerB}</InputLabel>
        <Select
          label={side === "a" ? texts.playerA : texts.playerB}
          value={value ?? ""}
          onChange={event => onSetPlayer(side, event.target.value || null)}
        >
          {players.map(player => (
            <MenuItem key={player.id} value={player.id} disabled={player.id === otherValue}>
              {player.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      {/* Hráči zápasu */}
      <Stack direction="row" spacing={1} alignItems="center">
        {playerSelect("a")}
        <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ flexShrink: 0 }}>
          {texts.versus.toUpperCase()}
        </Typography>
        {playerSelect("b")}
        <Tooltip title={texts.removeMatch}>
          <IconButton color="error" size="small" onClick={onRemove} aria-label={texts.removeMatch}>
            <Icon path={mdiTrashCanOutline} size={0.9} />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Stav zápasu (vyhrané sety) */}
      <Stack direction="row" spacing={1} alignItems="baseline" justifyContent="center" sx={{ mt: 1.5 }}>
        <Typography variant="body2" noWrap sx={{ flex: 1, textAlign: "right" }} fontWeight={wonA > wonB ? 800 : 400}>
          {nameOf(match.aId) || "—"}
        </Typography>
        <Typography variant="h6" fontWeight={800} sx={{ flexShrink: 0 }}>
          {wonA} : {wonB}
        </Typography>
        <Typography variant="body2" noWrap sx={{ flex: 1 }} fontWeight={wonB > wonA ? 800 : 400}>
          {nameOf(match.bId) || "—"}
        </Typography>
      </Stack>

      {/* Sety */}
      <Stack spacing={1} sx={{ mt: 1.5 }}>
        {match.sets.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {texts.noSets}
          </Typography>
        ) : (
          match.sets.map((gameSet, index) => {
            const aWins = gameSet.a > gameSet.b;
            const bWins = gameSet.b > gameSet.a;
            return (
              <Stack key={index} direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" color="text.secondary" sx={{ width: 20, flexShrink: 0 }}>
                  {index + 1}.
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  value={gameSet.a}
                  onChange={event => onUpdateSet(index, "a", Math.max(0, Number(event.target.value) || 0))}
                  onFocus={selectOnFocus}
                  slotProps={{ htmlInput: { min: 0, style: { textAlign: "center" } } }}
                  sx={{ width: 72 }}
                  focused={aWins || undefined}
                  color={aWins ? "success" : undefined}
                />
                <Typography sx={{ flexShrink: 0 }}>:</Typography>
                <TextField
                  size="small"
                  type="number"
                  value={gameSet.b}
                  onChange={event => onUpdateSet(index, "b", Math.max(0, Number(event.target.value) || 0))}
                  onFocus={selectOnFocus}
                  slotProps={{ htmlInput: { min: 0, style: { textAlign: "center" } } }}
                  sx={{ width: 72 }}
                  focused={bWins || undefined}
                  color={bWins ? "success" : undefined}
                />
                <Box sx={{ flex: 1 }} />
                <IconButton size="small" onClick={() => onRemoveSet(index)} aria-label={texts.delete}>
                  <Icon path={mdiClose} size={0.8} />
                </IconButton>
              </Stack>
            );
          })
        )}

        <Button
          size="small"
          variant="text"
          onClick={onAddSet}
          startIcon={<Icon path={mdiPlus} size={0.9} />}
          sx={{ alignSelf: "flex-start" }}
        >
          {texts.addSet}
        </Button>
      </Stack>
    </Paper>
  );
};

export default MatchCard;
