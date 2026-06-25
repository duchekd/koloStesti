import { useEffect, useRef, useState } from "react";

import { Button } from "@mui/material";

import { mdiSwordCross } from "@mdi/js";
import Icon from "@mdi/react";

import useWheelStore, { WheelItem } from "../../../hooks/useWheelStore";

import useTexts from "../../../languages";
import ToolLayout from "../../layout/ToolLayout";

import VersusStage from "./VersusStage";

type Props = {
  onOpenNav: () => void;
};

const VersusPage = ({ onOpenNav }: Props) => {
  const texts = useTexts();

  const { active } = useWheelStore("versus");
  const items = active?.items ?? [];

  const [rolling, setRolling] = useState(false);
  const [pair, setPair] = useState<[WheelItem, WheelItem] | null>(null);

  const intervalRef = useRef<number>(0);
  const timeoutRef = useRef<number>(0);

  // Vybere dvě různá jména z aktivní sady.
  const pickPair = (): [WheelItem, WheelItem] => {
    const n = items.length;
    const a = Math.floor(Math.random() * n);
    let b = Math.floor(Math.random() * (n - 1));
    if (b >= a) b += 1;
    return [items[a], items[b]];
  };

  const handleDraw = () => {
    if (items.length < 2 || rolling) return;
    setRolling(true);

    // krátká „losovací" animace – jména rychle blikají, pak se ustálí
    intervalRef.current = window.setInterval(() => setPair(pickPair()), 80);
    timeoutRef.current = window.setTimeout(() => {
      window.clearInterval(intervalRef.current);
      setPair(pickPair());
      setRolling(false);
    }, 1100);
  };

  // úklid časovačů při odchodu ze sekce
  useEffect(
    () => () => {
      window.clearInterval(intervalRef.current);
      window.clearTimeout(timeoutRef.current);
    },
    []
  );

  const canDraw = items.length >= 2;

  const stage = <VersusStage left={pair?.[0].label} right={pair?.[1].label} rolling={rolling} />;

  const action = (
    <Button
      fullWidth
      size="large"
      variant="contained"
      color="secondary"
      onClick={handleDraw}
      disabled={!canDraw || rolling}
      startIcon={<Icon path={mdiSwordCross} size={1} />}
    >
      {pair ? texts.drawAgain : texts.draw}
    </Button>
  );

  return (
    <ToolLayout
      scope="versus"
      title={texts.sectionVersus}
      busy={rolling}
      onOpenNav={onOpenNav}
      stage={stage}
      action={action}
    />
  );
};

export default VersusPage;
