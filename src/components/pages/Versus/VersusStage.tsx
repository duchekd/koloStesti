import { Box, Paper, Stack, Typography } from "@mui/material";

import { mdiSwordCross } from "@mdi/js";
import Icon from "@mdi/react";

import useTexts from "../../../languages";

type FighterProps = {
  label: string;
  color: "primary" | "secondary";
  rolling: boolean;
};

// Karta jednoho soupeře. Levý je v primární, pravý v sekundární barvě motivu.
const Fighter = ({ label, color, rolling }: FighterProps) => (
  <Paper
    elevation={3}
    sx={{
      flex: 1,
      width: "100%",
      minWidth: 0,
      maxWidth: { xs: "100%", md: 240 },
      px: 2,
      py: 3,
      textAlign: "center",
      borderTop: "4px solid",
      borderColor: `${color}.main`,
      opacity: rolling ? 0.65 : 1,
      transition: "opacity 120ms linear",
    }}
  >
    <Typography
      variant="h5"
      fontWeight={800}
      sx={{ color: `${color}.main`, wordBreak: "break-word", lineHeight: 1.2 }}
    >
      {label}
    </Typography>
  </Paper>
);

type Props = {
  left?: string;
  right?: string;
  rolling: boolean;
};

const VersusStage = ({ left, right, rolling }: Props) => {
  const texts = useTexts();

  // Výchozí stav – ještě se nelosovalo.
  if (!left || !right) {
    return (
      <Stack spacing={2} alignItems="center" sx={{ color: "text.secondary", px: 2, textAlign: "center" }}>
        <Icon path={mdiSwordCross} size={3} />
        <Typography variant="body1">{texts.emptyVersus}</Typography>
      </Stack>
    );
  }

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
      alignItems="center"
      justifyContent="center"
      sx={{ width: "100%" }}
    >
      <Fighter label={left} color="primary" rolling={rolling} />

      {/* Odznak VS s překříženými meči */}
      <Box
        sx={{
          flexShrink: 0,
          width: 72,
          height: 72,
          borderRadius: "50%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "secondary.contrastText",
          bgcolor: "secondary.main",
          boxShadow: 3,
        }}
      >
        <Icon path={mdiSwordCross} size={1.1} />
        <Typography variant="caption" fontWeight={800} sx={{ mt: -0.25, letterSpacing: 1 }}>
          {texts.versus.toUpperCase()}
        </Typography>
      </Box>

      <Fighter label={right} color="secondary" rolling={rolling} />
    </Stack>
  );
};

export default VersusStage;
