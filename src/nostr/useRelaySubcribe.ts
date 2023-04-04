import { Filter, SubscriptionOptions, Event } from "nostr-tools";
import { useContext, useState } from "react";
import { RelayContext } from "./relayContext";
import useSWRSubscription from 'swr/subscription';
import type { SWRSubscriptionOptions } from 'swr/subscription';

export const useRelaySubscription = (filter: Filter[], opts?: SubscriptionOptions) => {
	const { relay } = useContext(RelayContext);
  const subKey = JSON.stringify(filter);
  const { data, error } = useSWRSubscription(subKey,
    (key, { next }: SWRSubscriptionOptions<Event, Error>) => {
      if (relay) {
        const sub = relay.sub(filter, opts)
        sub.on('event', (event) => next(null, event))
        sub.on('eose', () => {
          console.log('End of Stored Events Notice', filter);
          // unsub and won't recieve any more events
          // sub.unsub()
          // control a loading component?
        })
        // cleanup function
        return () => {
          console.log('removed sub: ', filter);
          sub.unsub();
        };
      } else {
        next(new Error('useRelaySubscription: relay is null'));
      }
    }
  );
  return { data, error };
};
