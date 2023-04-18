import { useRelay } from "@/nostr";
import { Filter, SubscriptionOptions, Event } from "nostr-tools";
import { useState } from "react";
import useSWRSubscription from "swr/subscription";
import type { SWRSubscriptionOptions } from "swr/subscription";
import { RelayStatus } from "./relayProvider";

export const useEventSubscription = (
  filter: Filter[],
  skip = false,
  opts?: SubscriptionOptions,
  subKeyModifier?: string,
) => {
  const { relay, reconnect } = useRelay();
  const [loading, setLoading] = useState(false);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const subKey = JSON.stringify(filter);
  const { data, error } = useSWRSubscription(
    subKey + subKeyModifier || "",
    (_key, { next }: SWRSubscriptionOptions<Event, Error>) => {
      const subHandler = () => {
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
      };

      if (!relay) return
      if (relay.status === RelayStatus.Open || relay.status === RelayStatus.Connecting) {
        return subHandler();
      } else {
        reconnect().then(res => {
          subHandler();
        });
        return () => {
          setAllEvents([]);
          setLoading(false);
        };
      }
    }
  );
  return { lastEvent: data, allEvents, error, loading };
};
