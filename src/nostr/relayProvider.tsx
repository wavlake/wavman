import { useEventSubscription } from "./useEventSubscription";
import { useListEvents } from "./useListEvents";
import { usePublishEvent } from "./usePublishEvent";
import { relayInit, Relay } from "nostr-tools";
import { useEffect, useRef, PropsWithChildren, createContext } from "react";

type UsePublishEvent = typeof usePublishEvent;
type UseListEvents = typeof useListEvents;
type UseEventSubscription = typeof useEventSubscription;

export const RelayContext = createContext<{
  relay: Relay | null;
  usePublishEvent: UsePublishEvent;
  useListEvents: UseListEvents;
  useEventSubscription: UseEventSubscription;
  reconnect: () => Promise<void>;
}>({
  relay: null,
  usePublishEvent,
  useListEvents,
  useEventSubscription,
  reconnect: async () => {},
});

export enum RelayStatus {
  Connecting = 0,
  Open = 1,
  Closing = 2,
  Closed = 3,
};

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
    console.log(`connecting to ${relay.url}`);
    relay.connect();
    return () => {
      console.log(`closing connection to ${relay.url}`);
      relay.close();
    };
  }, [relay]);

  const reconnect = async () => {
    if(relay.status === RelayStatus.Closed) {
      console.log(`reconnecting to ${relay.url}`)
      await relay.connect();
    }
    return;
  };

  return (
    <RelayContext.Provider
      value={{
        relay,
        usePublishEvent,
        useEventSubscription,
        useListEvents,
        reconnect,
      }}
    >
      {children}
    </RelayContext.Provider>
  );
};

export default RelayProvider;
