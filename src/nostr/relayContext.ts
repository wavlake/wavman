import { useEventSubscription } from "./useEventSubscription";
import { useListEvents } from "./useListEvents";
import { usePublishEvent } from "./usePublishEvent";
import { Relay } from "nostr-tools";
import { createContext } from "react";

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
