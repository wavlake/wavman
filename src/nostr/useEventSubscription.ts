import { useRelay } from "@/nostr";
import { Filter, SubscriptionOptions, Event } from "nostr-tools";
import { useState } from "react";
import useSWRSubscription from "swr/subscription";
import type { SWRSubscriptionOptions } from "swr/subscription";

export const useEventSubscription = (
  filter: Filter[],
  skip = false,
  opts?: SubscriptionOptions
) => {
  const { relay } = useRelay();
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
          setAllEvents([]);
          setLoading(false);
        };
      }
      setLoading(false);
      return () => {
        setAllEvents([]);
        setLoading(false);
      };
    }
  );
  return { lastEvent: data, allEvents, error, loading };
};
