import { RelayContext } from "./relayContext";
import { Filter, SubscriptionOptions, Event } from "nostr-tools";
import { useContext, useState } from "react";
import useSWRSubscription from "swr/subscription";
import type { SWRSubscriptionOptions } from "swr/subscription";

export const useCommentSubscription = (
  filter: Filter[],
  skip = false,
  opts?: SubscriptionOptions
) => {
  const { relay } = useContext(RelayContext);
  const [loading, setLoading] = useState(false);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const subKey = JSON.stringify(filter);
  const { data, error } = useSWRSubscription(
    subKey,
    (_key, { next }: SWRSubscriptionOptions<Event, Error>) => {
      setLoading(true);
      if (relay && !skip) {
        const sub = relay.sub(filter, opts);
        sub.on("event", (event) => {
          setAllEvents((allEvents) => [...allEvents, event]);
          next(null, event);
        });
        sub.on("eose", () => {
          setLoading(false);
        });
        // cleanup function
        return () => {
          sub.unsub();
          setLoading(false);
        };
      }
      setLoading(false);
      return () => {};
    }
  );
  return { lastEvent: data, allEvents, error, loading };
};
