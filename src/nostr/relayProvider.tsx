import { RelayContext } from "./relayContext";
import { relayInit } from "nostr-tools";
import { useEffect, useRef, PropsWithChildren } from "react";

const RelayProvider: React.FC<PropsWithChildren & { url: string }> = ({
  children,
  url,
}) => {
  const { current: relay } = useRef(relayInit(url));

  relay.on("connect", () => {
    console.log(`connected to ${relay.url}`);
  });
  relay.on("error", () => {
    console.log(`failed to connect to ${relay.url}`);
  });

  useEffect(() => {
    relay.connect();

    return () => {
      relay.close();
    };
  }, []);

  return (
    <RelayContext.Provider value={{ relay }}>{children}</RelayContext.Provider>
  );
};

export default RelayProvider;
