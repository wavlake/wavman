import { useEffect, useRef, PropsWithChildren } from "react";
import { relayInit } from 'nostr-tools'
import { RelayContext } from "./relayContext";

const RelayProvider: React.FC<PropsWithChildren & { url: string }> = ({ children, url }) => {
  const { current: relay } = useRef(relayInit(url));

  relay.on('connect', () => {
    console.log(`connected to ${relay.url}`)
  })
  relay.on('error', () => {
    console.log(`failed to connect to ${relay.url}`)
  });

  useEffect(() => {
    relay.connect();

    return () => {
      relay.close();
    }
  }, []);

  return (
    <RelayContext.Provider value={{ relay }}>{children}</RelayContext.Provider>
  );
};

export default RelayProvider;
