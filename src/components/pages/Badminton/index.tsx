import { Box, Button, Stack, Typography } from "@mui/material";

import { mdiBadminton, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";

import useWheelStore from "../../../hooks/useWheelStore";

import useTexts from "../../../languages";
import ToolLayout from "../../layout/ToolLayout";

import MatchCard from "./MatchCard";

type Props = {
  onOpenNav: () => void;
};

const BadmintonPage = ({ onOpenNav }: Props) => {
  const texts = useTexts();

  const { active, addMatch, removeMatch, setMatchPlayer, addMatchSet, updateMatchSet, removeMatchSet } =
    useWheelStore("badminton");

  const players = active?.items ?? [];
  const matches = active?.matches ?? [];
  const setId = active?.id ?? null;
  const canPlay = players.length >= 2;

  // Tahle hra nic nelosuje – uživatel jen zadává výsledky. Stage = seznam zápasů.
  const stage = !canPlay ? (
    <Stack spacing={2} alignItems="center" sx={{ color: "text.secondary", px: 2, textAlign: "center" }}>
      <Icon path={mdiBadminton} size={3} />
      <Typography variant="body1">{texts.needTwoPlayers}</Typography>
    </Stack>
  ) : (
    <Box sx={{ width: "100%", height: "100%", overflowY: "auto" }}>
      <Stack spacing={2} sx={{ py: 1 }}>
        {matches.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
            {texts.noMatches}
          </Typography>
        ) : (
          matches.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              players={players}
              onSetPlayer={(side, id) => setId && setMatchPlayer(setId, match.id, side, id)}
              onAddSet={() => setId && addMatchSet(setId, match.id)}
              onUpdateSet={(index, side, value) => setId && updateMatchSet(setId, match.id, index, side, value)}
              onRemoveSet={index => setId && removeMatchSet(setId, match.id, index)}
              onRemove={() => setId && removeMatch(setId, match.id)}
            />
          ))
        )}
      </Stack>
    </Box>
  );

  const action = (
    <Button
      fullWidth
      size="large"
      variant="contained"
      onClick={() => setId && addMatch(setId)}
      disabled={!canPlay}
      startIcon={<Icon path={mdiPlus} size={1} />}
    >
      {texts.newMatch}
    </Button>
  );

  return (
    <ToolLayout
      scope="badminton"
      setNameMode="date"
      title={texts.sectionBadminton}
      onOpenNav={onOpenNav}
      stage={stage}
      action={action}
    />
  );
};

export default BadmintonPage;
