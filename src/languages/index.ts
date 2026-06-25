import useStore from "../hooks/useStore";

import csCZ from "./csCZ";
import enUS from "./enUS";

const useTexts = () => {
  const { culture } = useStore();
  if (culture === "cs-CZ") return csCZ;
  return enUS;
};

export default useTexts;
