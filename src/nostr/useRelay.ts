import { RelayContext } from "./relayProvider";
import { useContext } from "react";

export const useRelay = () => {
  const context = useContext(RelayContext);

  if (context === undefined) {
    throw new Error("useRelay was used outside of its Provider");
  }

  return context;
};
