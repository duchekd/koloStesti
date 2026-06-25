import { useRef, useState } from "react";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

import { mdiTrophyVariant } from "@mdi/js";
import Icon from "@mdi/react";

import useWheelStore, { WheelItem } from "../../../hooks/useWheelStore";

import useTexts from "../../../languages";
import ToolLayout from "../../layout/ToolLayout";

import Wheel, { WheelHandle } from "./Wheel";

type Props = {
  onOpenNav: () => void;
};

const WheelPage = ({ onOpenNav }: Props) => {
  const texts = useTexts();

  const { items } = useWheelStore("wheel");

  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<WheelItem | null>(null);

  const wheelRef = useRef<WheelHandle>(null);

  const handleSpin = () => wheelRef.current?.spin();

  const stage = (
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

  const action = (
    <Button
      fullWidth
      size="large"
      variant="contained"
      onClick={handleSpin}
      disabled={spinning || items.length === 0}
    >
      {texts.spin}
    </Button>
  );

  return (
    <>
      <ToolLayout scope="wheel" title={texts.wheelTitle} busy={spinning} onOpenNav={onOpenNav} stage={stage} action={action} />

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
