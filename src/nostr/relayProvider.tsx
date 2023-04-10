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
}>({
  relay: null,
  usePublishEvent,
  useListEvents,
  useEventSubscription,
});


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
  }, [relay]);

  return (
    <RelayContext.Provider
      value={{
        relay,
        usePublishEvent,
        useEventSubscription,
        useListEvents,
      }}
    >
      {children}
    </RelayContext.Provider>
  );
};

export default RelayProvider;
