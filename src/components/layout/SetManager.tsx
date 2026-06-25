import { KeyboardEvent, useState } from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";

import { mdiPencilOutline, mdiPlaylistPlus, mdiTrashCanOutline } from "@mdi/js";
import Icon from "@mdi/react";

import useStore from "../../hooks/useStore";
import useWheelStore from "../../hooks/useWheelStore";

import useTexts from "../../languages";

type Props = {
  /** Hra, jejíž sady se spravují (každá hra má vlastní oddělené sady). */
  scope: string;
  /** Jak se zadává název sady – textem, nebo datem (badminton). */
  nameMode?: "text" | "date";
  disabled?: boolean;
};

type NameDialog = { open: boolean; mode: "create" | "rename"; value: string };

const closedDialog: NameDialog = { open: false, mode: "create", value: "" };

// dnešní datum ve formátu YYYY-MM-DD (v lokálním čase)
const todayISO = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const SetManager = ({ scope, nameMode = "text", disabled = false }: Props) => {
  const texts = useTexts();
  const culture = useStore(state => state.culture);
  const { sets, activeId, active, createSet, renameSet, deleteSet, selectSet } = useWheelStore(scope);

  const [nameDialog, setNameDialog] = useState<NameDialog>(closedDialog);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isDate = nameMode === "date";
  const fieldLabel = isDate ? texts.date : texts.setName;
  const selectLabel = isDate ? texts.date : texts.set;

  // datum (YYYY-MM-DD) zobrazí v lokálním formátu, jinak vrátí název beze změny
  const formatName = (name: string) => {
    if (!isDate) return name;
    const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(name);
    if (!parts) return name;
    return new Date(+parts[1], +parts[2] - 1, +parts[3]).toLocaleDateString(culture);
  };

  const openCreate = () =>
    setNameDialog({ open: true, mode: "create", value: isDate ? todayISO() : "" });
  const openRename = () => setNameDialog({ open: true, mode: "rename", value: active?.name ?? "" });
  const closeNameDialog = () => setNameDialog(closedDialog);

  const handleNameSave = () => {
    const value = nameDialog.value.trim();
    if (value === "") return;
    if (nameDialog.mode === "create") {
      createSet(value);
    } else if (activeId) {
      renameSet(activeId, value);
    }
    closeNameDialog();
  };

  const handleNameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleNameSave();
    }
  };

  const handleDelete = () => {
    if (activeId) deleteSet(activeId);
    setDeleteOpen(false);
  };

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center">
        <FormControl fullWidth size="small" disabled={disabled}>
          <InputLabel id="set-select-label">{selectLabel}</InputLabel>
          <Select
            labelId="set-select-label"
            label={selectLabel}
            value={activeId ?? ""}
            onChange={event => selectSet(event.target.value)}
          >
            {sets.map(set => (
              <MenuItem key={set.id} value={set.id}>
                {formatName(set.name)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Tooltip title={texts.newSet}>
          <span>
            <IconButton color="primary" onClick={openCreate} disabled={disabled}>
              <Icon path={mdiPlaylistPlus} size={1} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={texts.rename}>
          <span>
            <IconButton onClick={openRename} disabled={disabled || !active}>
              <Icon path={mdiPencilOutline} size={1} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={texts.delete}>
          <span>
            <IconButton
              color="error"
              onClick={() => setDeleteOpen(true)}
              disabled={disabled || !active || sets.length <= 1}
            >
              <Icon path={mdiTrashCanOutline} size={1} />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      {/* dialog pro vytvoření / přejmenování sady */}
      <Dialog open={nameDialog.open} onClose={closeNameDialog} fullWidth maxWidth="xs">
        <DialogTitle>{nameDialog.mode === "create" ? texts.newSet : texts.rename}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            type={isDate ? "date" : "text"}
            label={fieldLabel}
            value={nameDialog.value}
            onChange={event => setNameDialog(prev => ({ ...prev, value: event.target.value }))}
            onKeyDown={handleNameKeyDown}
            slotProps={isDate ? { inputLabel: { shrink: true } } : undefined}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeNameDialog}>{texts.cancel}</Button>
          <Button variant="contained" onClick={handleNameSave} disabled={nameDialog.value.trim() === ""}>
            {texts.save}
          </Button>
        </DialogActions>
      </Dialog>

      {/* potvrzení smazání sady */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{texts.delete}</DialogTitle>
        <DialogContent>
          {texts.deleteSetConfirm} „{active ? formatName(active.name) : ""}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>{texts.cancel}</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            {texts.delete}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SetManager;
