import { useContext } from "react";
import PracticePlayerContext from "../context/PracticePlayerContext";

const usePracticePlayer = () => {
  const context = useContext(PracticePlayerContext);

  if (!context) {
    throw new Error(
      "usePracticePlayer must be used inside PracticePlayerProvider",
    );
  }

  return context;
};

export default usePracticePlayer;
