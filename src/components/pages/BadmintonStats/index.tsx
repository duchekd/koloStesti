import { useMemo } from "react";

import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { computeBadmintonStats } from "../../../utils/badmintonStats";

import useWheelStore from "../../../hooks/useWheelStore";

import useTexts from "../../../languages";
import TopBar from "../../layout/TopBar";

type Props = {
  onOpenNav: () => void;
};

const BadmintonStatsPage = ({ onOpenNav }: Props) => {
  const texts = useTexts();

  const { sets, items } = useWheelStore("badminton");

  // statistika ze všech zápasů napříč všemi daty (sadami)
  const stats = useMemo(() => {
    const matches = sets.flatMap(set => set.matches ?? []);
    return computeBadmintonStats(matches, items);
  }, [sets, items]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100dvh", boxSizing: "border-box" }}>
      <TopBar title={texts.sectionStats} onOpenNav={onOpenNav} />

      <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", p: 2, boxSizing: "border-box" }}>
        {stats.length === 0 ? (
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
            {texts.statsEmpty}
          </Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{texts.colPlayer}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {texts.colWins}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {texts.colSets}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {texts.colPointsFor}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {texts.colPointsAgainst}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {texts.colDiff}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.map((row, index) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ color: "text.secondary" }}>{index + 1}.</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                    <TableCell align="right">{row.wins}</TableCell>
                    <TableCell align="right">{row.setsWon}</TableCell>
                    <TableCell align="right">{row.pointsFor}</TableCell>
                    <TableCell align="right">{row.pointsAgainst}</TableCell>
                    <TableCell align="right" sx={{ color: row.diff > 0 ? "success.main" : row.diff < 0 ? "error.main" : "text.secondary" }}>
                      {row.diff > 0 ? `+${row.diff}` : row.diff}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
};

export default BadmintonStatsPage;
