import {
  Box,
  Chip,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";

import {
  mdiBadminton,
  mdiCardsOutline,
  mdiDiceMultiple,
  mdiFerrisWheel,
  mdiNumeric,
  mdiPodium,
  mdiSwordCross,
} from "@mdi/js";
import Icon from "@mdi/react";

import useTexts from "../../languages";

export type SectionId = "wheel" | "versus" | "badminton" | "badmintonStats" | "dice" | "cards" | "number";

type NavSection = {
  id: SectionId;
  icon: string;
  labelKey:
    | "wheelTitle"
    | "sectionVersus"
    | "sectionBadminton"
    | "sectionStats"
    | "sectionDice"
    | "sectionCards"
    | "sectionNumber";
  available: boolean;
};

// Sekce aplikace. Hotové nástroje jsou označené available, ostatní jsou připravené pro budoucí rozšíření.
const sections: NavSection[] = [
  { id: "wheel", icon: mdiFerrisWheel, labelKey: "wheelTitle", available: true },
  { id: "versus", icon: mdiSwordCross, labelKey: "sectionVersus", available: true },
  { id: "badminton", icon: mdiBadminton, labelKey: "sectionBadminton", available: true },
  { id: "badmintonStats", icon: mdiPodium, labelKey: "sectionStats", available: true },
  { id: "dice", icon: mdiDiceMultiple, labelKey: "sectionDice", available: false },
  { id: "cards", icon: mdiCardsOutline, labelKey: "sectionCards", available: false },
  { id: "number", icon: mdiNumeric, labelKey: "sectionNumber", available: false },
];

type Props = {
  open: boolean;
  onClose: () => void;
  active: SectionId;
  onSelect?: (id: SectionId) => void;
};

const NavDrawer = ({ open, onClose, active, onSelect }: Props) => {
  const texts = useTexts();

  const handleSelect = (section: NavSection) => {
    if (!section.available) return;
    onSelect?.(section.id);
    onClose();
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 280, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Hlavička s názvem aplikace */}
        <Stack
          spacing={0.25}
          sx={{
            px: 2.5,
            py: 2.5,
            color: "primary.contrastText",
            bgcolor: "primary.main",
          }}
        >
          <Typography variant="h6" fontWeight={800} noWrap>
            {texts.appName}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.85 }}>
            {texts.appTagline}
          </Typography>
        </Stack>

        <Divider />

        <List sx={{ flex: 1, py: 1 }}>
          {sections.map(section => (
            <ListItemButton
              key={section.id}
              selected={section.id === active}
              disabled={!section.available}
              onClick={() => handleSelect(section)}
              sx={{ mx: 1, borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Icon path={section.icon} size={1} />
              </ListItemIcon>
              <ListItemText primary={texts[section.labelKey]} />
              {!section.available && (
                <Chip label={texts.comingSoon} size="small" variant="outlined" sx={{ ml: 1 }} />
              )}
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default NavDrawer;
